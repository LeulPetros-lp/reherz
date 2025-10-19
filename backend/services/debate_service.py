import json
from typing import Dict, List, Optional, Tuple
from openai import OpenAI
import os
import random
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class DebateService:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=os.getenv("OPENROUTER_API_KEY"),
            default_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Reherz Debate Coach"
            }
        )
        self.debate_sessions = {}
        
    def start_debate_session(self, topic: str, user_side: str, total_rounds: int = 3) -> str:
        """Initialize a new debate session
        
        Args:
            topic: The debate topic
            user_side: 'affirmative' or 'negative'
            total_rounds: Number of debate rounds (default: 3)
            
        Returns:
            str: Session ID for the new debate
        """
        import uuid
        session_id = str(uuid.uuid4())
        self.debate_sessions[session_id] = {
            'topic': topic,
            'user_side': user_side,
            'total_rounds': total_rounds,
            'rounds': {},
            'current_round': 1,
            'opponent_arguments': [],
            'created_at': datetime.utcnow().isoformat(),
            'status': 'in_progress'
        }
        return session_id
    
    async def process_round(self, session_id: str, transcript: str, audio_metrics: Optional[Dict] = None) -> Dict:
        """Process a debate round and return analysis
        
        Args:
            session_id: The debate session ID
            transcript: User's speech transcript
            audio_metrics: Optional audio analysis metrics (tone, tempo, etc.)
            
        Returns:
            Dict: Analysis of the round and instructions for next steps
        """
        if session_id not in self.debate_sessions:
            raise ValueError("Invalid session ID")
            
        session = self.debate_sessions[session_id]
        current_round = session['current_round']
        
        # Process the round based on its type
        if current_round == 1:
            return await self._process_opening_round(session, transcript, audio_metrics)
        elif current_round < session['total_rounds']:
            return await self._process_middle_round(session, transcript, audio_metrics)
        else:
            return await self._process_final_round(session, transcript, audio_metrics)
    
    async def _process_opening_round(self, session: Dict, transcript: str, audio_metrics: Optional[Dict] = None) -> Dict:
        """Process the opening round of the debate
        
        Args:
            session: The debate session data
            transcript: User's speech transcript
            audio_metrics: Audio analysis metrics (tone, tempo, etc.)
            
        Returns:
            Dict: Analysis of the opening round
        """
        # Prepare audio metrics for the prompt
        audio_analysis = self._format_audio_metrics(audio_metrics) if audio_metrics else {}
        
        prompt = f"""
        You are an expert debate coach analyzing an opening statement. Provide structured feedback in valid JSON format.
        
        TOPIC: {session['topic']}
        USER'S POSITION: {session['user_side']}
        
        SPEECH TRANSCRIPT:
        {transcript}
        
        SPEECH METRICS:
        {json.dumps(audio_analysis, indent=2) if audio_analysis else 'No audio metrics available'}
        
        YOUR TASK:
        1. Analyze the opening statement for structure, clarity, and argument strength
        2. Evaluate the delivery based on the provided speech metrics
        3. Provide specific, actionable feedback
        4. Rate each aspect on a scale of 0-100
        
        RESPONSE FORMAT (must be valid JSON):
        {{
            "content_analysis": {{
                "structure_score": 0-100,
                "clarity_score": 0-100,
                "argument_strength": 0-100,
                "key_points_identified": ["point 1", "point 2", "point 3"],
                "missing_elements": ["element 1", "element 2"]
            }},
            "delivery_analysis": {{
                "pace_score": 0-100,
                "tone_score": 0-100,
                "pauses_score": 0-100,
                "filler_word_count": 0,
                "wpm": 0,
                "tone_analysis": "Analysis of speaker's tone and emotion",
                "pace_analysis": "Analysis of speaking rate and rhythm"
            }},
            "feedback_summary": "Overall feedback on the opening statement",
            "suggested_improvements": ["suggestion 1", "suggestion 2"],
            "opponent_argument": "Generate a strong counter-argument (3-4 sentences) to use in the next round"
        }}
        """
        
        response = self._get_ai_response(prompt)
        analysis = json.loads(response)
        
        # Extract and store the opponent's argument
        opponent_argument = analysis.pop('opponent_argument', "No counter-argument generated.")
        session['opponent_arguments'].append(opponent_argument)
        
        # Store round data
        current_round = session['current_round']
        session['rounds'][current_round] = {
            'type': 'opening',
            'transcript': transcript,
            'analysis': analysis,
            'audio_metrics': audio_metrics,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Move to next round
        session['current_round'] += 1
        
        return {
            'round': current_round,
            'total_rounds': session['total_rounds'],
            'feedback': analysis,
            'next_round_prompt': f"Prepare your response to the following argument: {opponent_argument}",
            'session_complete': False,
            'opponent_argument': opponent_argument
        }
    
    async def _process_middle_round(self, session: Dict, transcript: str, audio_metrics: Optional[Dict] = None) -> Dict:
        """Process a middle round of the debate (not first or last)
        
        Args:
            session: The debate session data
            transcript: User's speech transcript
            audio_metrics: Audio analysis metrics (tone, tempo, etc.)
            
        Returns:
            Dict: Analysis of the round
        """
        current_round = session['current_round']
        opponent_argument = session['opponent_arguments'][-1] if session['opponent_arguments'] else "No previous argument"
        
        # Prepare audio metrics and previous round context
        audio_analysis = self._format_audio_metrics(audio_metrics) if audio_metrics else {}
        previous_rounds = self._get_rounds_summary(session)
        
        prompt = f"""
        You are an expert debate coach analyzing a debate round. Provide structured feedback in valid JSON format.
        
        DEBATE TOPIC: {session['topic']}
        USER'S POSITION: {session['user_side']}
        CURRENT ROUND: {current_round} of {session['total_rounds']}
        
        PREVIOUS ARGUMENT TO RESPOND TO:
        {opponent_argument}
        
        USER'S RESPONSE TRANSCRIPT:
        {transcript}
        
        SPEECH METRICS:
        {json.dumps(audio_analysis, indent=2) if audio_analysis else 'No audio metrics available'}
        
        PREVIOUS ROUNDS SUMMARY:
        {previous_rounds}
        
        YOUR TASK:
        1. Analyze how well the user addressed the opponent's points
        2. Evaluate the logical consistency and persuasiveness
        3. Provide feedback on delivery (tone, pace, clarity)
        4. Identify any logical fallacies or weak points
        5. Suggest specific improvements
        
        RESPONSE FORMAT (must be valid JSON):
        {{
            "content_analysis": {{
                "relevance_score": 0-100,
                "logical_consistency": 0-100,
                "persuasiveness": 0-100,
                "fallacies_identified": ["fallacy 1", "fallacy 2"],
                "points_addressed": ["point 1", "point 2"],
                "points_missed": ["missed point 1", "missed point 2"]
            }},
            "delivery_analysis": {{
                "pace_score": 0-100,
                "tone_score": 0-100,
                "clarity_score": 0-100,
                "filler_word_count": 0,
                "wpm": 0,
                "tone_analysis": "Analysis of speaker's tone and emotion",
                "pace_analysis": "Analysis of speaking rate and rhythm",
                "clarity_analysis": "Analysis of speech clarity and enunciation"
            }},
            "feedback_summary": "Overall feedback on the rebuttal",
            "suggested_improvements": ["suggestion 1", "suggestion 2"],
            "opponent_counter": "Generate a strong counter-argument (3-4 sentences) to use in the next round"
        }}
        """
        
        try:
            response = self._get_ai_response(prompt)
            analysis = json.loads(response)
            
            # Extract and store the opponent's counter-argument
            opponent_counter = analysis.pop('opponent_counter', "No counter-argument generated.")
            session['opponent_arguments'].append(opponent_counter)
            
            # Store round data
            session['rounds'][current_round] = {
                'type': f'rebuttal_{current_round}',
                'transcript': transcript,
                'analysis': analysis,
                'audio_metrics': audio_metrics,
                'opponent_argument': opponent_argument,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Check if this is the last round
            is_last_round = current_round >= session['total_rounds'] - 1
            
            # Move to next round if not the last one
            if not is_last_round:
                session['current_round'] += 1
            
            return {
                'round': current_round,
                'total_rounds': session['total_rounds'],
                'feedback': analysis,
                'next_round_prompt': f"Prepare your response to the following argument: {opponent_counter}" if not is_last_round 
                                   else "Prepare your closing statement, summarizing your main points and addressing the counter-arguments.",
                'session_complete': is_last_round,
                'opponent_argument': opponent_counter if not is_last_round else None
            }
            
        except json.JSONDecodeError as e:
            # Fallback response if JSON parsing fails
            return {
                'round': current_round,
                'total_rounds': session['total_rounds'],
                'feedback': {
                    'error': 'Failed to process response',
                    'details': str(e),
                    'raw_response': response[:500] if 'response' in locals() else 'No response generated'
                },
                'next_round_prompt': "Let's continue with the debate. Please proceed to the next round.",
                'session_complete': False
            }
    
    async def _process_final_round(self, session: Dict, transcript: str, audio_metrics: Optional[Dict] = None) -> Dict:
        """Process the final round of the debate
        
        Args:
            session: The debate session data
            transcript: User's speech transcript
            audio_metrics: Audio analysis metrics (tone, tempo, etc.)
            
        Returns:
            Dict: Final analysis and overall debate results
        """
        # Prepare audio metrics and debate summary
        audio_analysis = self._format_audio_metrics(audio_metrics) if audio_metrics else {}
        debate_summary = self._get_debate_summary(session)
        
        prompt = f"""
        You are an expert debate judge analyzing the final statement of a debate. 
        Provide comprehensive feedback in valid JSON format.
        
        DEBATE TOPIC: {session['topic']}
        USER'S POSITION: {session['user_side']}
        
        DEBATE SUMMARY:
        {debate_summary}
        
        FINAL STATEMENT TRANSCRIPT:
        {transcript}
        
        SPEECH METRICS:
        {json.dumps(audio_analysis, indent=2) if audio_metrics else 'No audio metrics available'}
        
        YOUR TASK:
        1. Evaluate how well the final statement summarizes the user's position
        2. Assess how effectively it addresses previous counter-arguments
        3. Analyze the overall persuasiveness and impact
        4. Provide feedback on delivery, tone, and rhetoric
        5. Offer a comprehensive evaluation of the entire debate performance
        
        RESPONSE FORMAT (must be valid JSON):
        {{
            "content_analysis": {{
                "summary_quality": 0-100,
                "rebuttal_handling": 0-100,
                "argument_strength": 0-100,
                "persuasiveness": 0-100,
                "key_points_covered": ["point 1", "point 2"],
                "missed_opportunities": ["opportunity 1", "opportunity 2"]
            }},
            "delivery_analysis": {{
                "delivery_score": 0-100,
                "tone_score": 0-100,
                "pace_score": 0-100,
                "clarity_score": 0-100,
                "tone_analysis": "Analysis of speaker's tone and emotion",
                "pace_analysis": "Analysis of speaking rate and rhythm",
                "clarity_analysis": "Analysis of speech clarity and enunciation"
            }},
            "final_evaluation": {{
                "overall_score": 0-100,
                "key_strengths": ["strength 1", "strength 2"],
                "areas_for_improvement": ["area 1", "area 2"],
                "final_feedback": "Comprehensive final feedback on the entire debate performance"
            }}
        }}
        """
        
        try:
            response = self._get_ai_response(prompt)
            analysis = json.loads(response)
            
            # Store the final round data
            current_round = session['current_round']
            session['rounds'][current_round] = {
                'type': 'closing',
                'transcript': transcript,
                'analysis': analysis,
                'audio_metrics': audio_metrics,
                'timestamp': datetime.utcnow().isoformat()
            }
            
            # Mark session as complete
            session['status'] = 'completed'
            session['completed_at'] = datetime.utcnow().isoformat()
            
            # Calculate overall scores
            overall_score = self._calculate_overall_score(session)
            
            return {
                'round': current_round,
                'total_rounds': session['total_rounds'],
                'feedback': analysis,
                'overall_score': overall_score,
                'session_complete': True,
                'debate_summary': self._get_debate_summary(session, include_transcripts=False)
            }
            
        except json.JSONDecodeError as e:
            # Fallback response if JSON parsing fails
            return {
                'round': session['current_round'],
                'total_rounds': session['total_rounds'],
                'feedback': {
                    'error': 'Failed to process final round',
                    'details': str(e),
                    'raw_response': response[:500] if 'response' in locals() else 'No response generated'
                },
                'session_complete': True
            }
    
    def _calculate_overall_score(self, session: Dict) -> Dict:
        """Calculate overall debate performance metrics across all rounds
        
        Args:
            session: The debate session data
            
        Returns:
            Dict: Overall scores and analysis
        """
        rounds = session['rounds']
        total_rounds = len(rounds)
        
        if total_rounds == 0:
            return {
                'average_score': 0,
                'category_scores': {},
                'feedback': 'No rounds completed',
                'overall_assessment': 'Incomplete debate'
            }
        
        # Initialize score accumulators
        content_scores = []
        delivery_scores = []
        category_scores = {}
        
        # Calculate scores for each round
        for i, (round_num, round_data) in enumerate(rounds.items(), 1):
            analysis = round_data.get('analysis', {})
            
            # Extract content analysis scores
            content_analysis = analysis.get('content_analysis', {})
            if content_analysis:
                content_scores.extend([
                    content_analysis.get('structure_score', 0),
                    content_analysis.get('clarity_score', 0),
                    content_analysis.get('argument_strength', 0),
                    content_analysis.get('relevance_score', 0),
                    content_analysis.get('persuasiveness', 0)
                ])
            
            # Extract delivery analysis scores
            delivery_analysis = analysis.get('delivery_analysis', {})
            if delivery_analysis:
                delivery_scores.extend([
                    delivery_analysis.get('tone_score', 0),
                    delivery_analysis.get('pace_score', 0),
                    delivery_analysis.get('clarity_score', 0),
                    delivery_analysis.get('pauses_score', 0)
                ])
        
        # Calculate average scores (filter out 0s to not skew the average)
        avg_content = sum(score for score in content_scores if score > 0) / max(1, len([s for s in content_scores if s > 0]))
        avg_delivery = sum(score for score in delivery_scores if score > 0) / max(1, len([s for s in delivery_scores if s > 0]))
        overall_score = (avg_content * 0.7) + (avg_delivery * 0.3)  # Weighted average
        
        # Generate overall assessment
        assessment = self._generate_overall_assessment(session, overall_score)
        
        return {
            'average_score': round(overall_score, 1),
            'content_score': round(avg_content, 1),
            'delivery_score': round(avg_delivery, 1),
            'total_rounds': total_rounds,
            'rounds_completed': len(rounds),
            'overall_assessment': assessment
        }
    
    def _get_ai_response(self, prompt: str, model: str = "google/gemma-3-4b-it:free") -> str:
        """Get response from the AI model
        
        Args:
            prompt: The prompt to send to the AI
            model: The model to use (default: google/gemma-3-4b-it:free)
            
        Returns:
            str: The AI's response as a string
        """
        try:
            # Add system message to ensure JSON response
            messages = [
                {
                    "role": "system", 
                    "content": "You are a helpful assistant that always responds with valid JSON. Do not include any text before or after the JSON object."
                },
                {"role": "user", "content": prompt}
            ]
            
            completion = self.client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"},  # Force JSON response
                temperature=0.3,  # Lower temperature for more focused responses
                max_tokens=2000
            )
            
            response = completion.choices[0].message.content
            
            # Clean and validate the response
            response = response.strip()
            
            # If the response starts with markdown code block, extract the JSON
            if response.startswith('```json'):
                response = response[response.find('{') : response.rfind('}') + 1]
            elif response.startswith('```'):
                response = response[response.find('\n') + 1 : response.rfind('```')]
            
            # Ensure the response is a valid JSON string
            try:
                parsed = json.loads(response)
                return json.dumps(parsed, ensure_ascii=False)
            except json.JSONDecodeError as e:
                print(f"Failed to parse AI response as JSON: {str(e)}")
                print(f"Response content: {response[:500]}...")
                # Try to extract JSON from the response
                try:
                    start = response.find('{')
                    end = response.rfind('}') + 1
                    if start >= 0 and end > start:
                        parsed = json.loads(response[start:end])
                        return json.dumps(parsed, ensure_ascii=False)
                except:
                    pass
                
                # If all else fails, wrap the response in a JSON object
                return json.dumps({
                    "error": "Failed to parse AI response",
                    "raw_response": response[:1000]
                })
                
        except Exception as e:
            error_msg = f"Error getting AI response: {str(e)}"
            print(error_msg)
            # Fallback response if API fails
            return json.dumps({
                "error": "Failed to get AI analysis. Please try again.",
                "details": str(e)[:500]  # Truncate long error messages
            })

    def _format_audio_metrics(self, audio_metrics: Dict) -> Dict:
        """Format audio metrics for the AI prompt
        
        Args:
            audio_metrics: Raw audio analysis metrics
            
        Returns:
            Dict: Formatted metrics for the AI
        """
        if not audio_metrics:
            return {}
            
        return {
            "speech_rate": {
                "wpm": audio_metrics.get('wpm', 0),
                "assessment": "Optimal (150-160 wpm)" if 150 <= audio_metrics.get('wpm', 0) <= 160 
                             else "Too fast" if audio_metrics.get('wpm', 0) > 160 
                             else "Too slow"
            },
            "tone": {
                "pitch_variation": audio_metrics.get('pitch_variation', 0),
                "energy": audio_metrics.get('energy', 0),
                "assessment": "Good vocal variety" if audio_metrics.get('pitch_variation', 0) > 0.2 
                             else "Consider more vocal variety"
            },
            "pauses": {
                "total_pauses": audio_metrics.get('pause_count', 0),
                "avg_pause_duration": f"{audio_metrics.get('avg_pause_duration', 0):.2f}s",
                "assessment": "Good use of pauses" if 0.5 <= audio_metrics.get('avg_pause_duration', 0) <= 1.5 
                             else "Pauses too short" if audio_metrics.get('avg_pause_duration', 0) < 0.5 
                             else "Pauses too long"
            },
            "filler_words": {
                "count": audio_metrics.get('filler_word_count', 0),
                "per_minute": audio_metrics.get('filler_words_per_minute', 0),
                "assessment": "Minimal filler words (good)" if audio_metrics.get('filler_words_per_minute', 0) < 2 
                             else "Moderate filler words" if audio_metrics.get('filler_words_per_minute', 0) < 5 
                             else "Excessive filler words"
            },
            "clarity": {
                "articulation_rate": audio_metrics.get('articulation_rate', 0),
                "assessment": "Clear articulation" if audio_metrics.get('articulation_rate', 0) > 0.9 
                             else "Could improve articulation"
            }
        }

    def _get_rounds_summary(self, session: Dict, max_length: int = 1000) -> str:
        """Generate a summary of previous rounds
        
        Args:
            session: The debate session data
            max_length: Maximum length of the summary
            
        Returns:
            str: Concise summary of previous rounds
        """
        if not session.get('rounds'):
            return "No previous rounds completed."
            
        summary = []
        for round_num, round_data in sorted(session['rounds'].items()):
            if round_data['type'] == 'opening':
                summary.append(f"ROUND {round_num} (OPENING): {round_data.get('analysis', {}).get('feedback_summary', 'No summary')[:200]}...")
            elif 'rebuttal' in round_data['type']:
                summary.append(f"ROUND {round_num} (REBUTTAL): {round_data.get('analysis', {}).get('feedback_summary', 'No summary')[:200]}...")
        
        return "\n".join(summary)[:max_length]
    
    def _get_debate_summary(self, session: Dict, include_transcripts: bool = False) -> str:
        """Generate a comprehensive summary of the debate
        
        Args:
            session: The debate session data
            include_transcripts: Whether to include full transcripts
            
        Returns:
            str: Detailed debate summary
        """
        if not session.get('rounds'):
            return "No debate rounds completed."
            
        summary = [
            f"DEBATE TOPIC: {session['topic']}",
            f"USER'S POSITION: {session['user_side'].upper()}",
            f"TOTAL ROUNDS: {session.get('total_rounds', 3)}",
            "=" * 50
        ]
        
        for round_num, round_data in sorted(session['rounds'].items()):
            round_type = round_data['type'].upper()
            summary.append(f"\nROUND {round_num}: {round_type}")
            summary.append("-" * 50)
            
            if include_transcripts and 'transcript' in round_data:
                summary.append("\nUSER'S SPEECH:")
                summary.append(round_data['transcript'])
                summary.append("")
            
            if 'analysis' in round_data and round_data['analysis']:
                analysis = round_data['analysis']
                summary.append("ANALYSIS:")
                
                # Add content analysis
                if 'content_analysis' in analysis:
                    content = analysis['content_analysis']
                    summary.append("  Content:")
                    for key, value in content.items():
                        if isinstance(value, list):
                            if value:  # Only include non-empty lists
                                summary.append(f"    {key.replace('_', ' ').title()}: {', '.join(str(v) for v in value[:5])}" + 
                                             ("..." if len(value) > 5 else ""))
                        elif isinstance(value, dict):
                            pass  # Skip nested dicts for now
                        else:
                            summary.append(f"    {key.replace('_', ' ').title()}: {value}")
                
                # Add delivery analysis
                if 'delivery_analysis' in analysis:
                    delivery = analysis['delivery_analysis']
                    summary.append("\n  Delivery:")
                    for key, value in delivery.items():
                        if isinstance(value, dict) or isinstance(value, list):
                            continue
                        if 'score' in key or 'count' in key or 'wpm' in key:
                            summary.append(f"    {key.replace('_', ' ').title()}: {value}")
                
                # Add overall feedback
                if 'feedback_summary' in analysis:
                    summary.append("\n  Feedback:")
                    summary.append(f"    {analysis['feedback_summary']}")
                
                # Add suggestions if available
                if 'suggested_improvements' in analysis and analysis['suggested_improvements']:
                    summary.append("\n  Suggested Improvements:")
                    for i, suggestion in enumerate(analysis['suggested_improvements'][:3], 1):
                        summary.append(f"    {i}. {suggestion}")
        
        return "\n".join(summary)
    
    def _generate_overall_assessment(self, session: Dict, overall_score: float) -> str:
        """Generate an overall assessment of the debate performance
        
        Args:
            session: The debate session data
            overall_score: Calculated overall score (0-100)
            
        Returns:
            str: Human-readable assessment
        """
        if overall_score >= 85:
            return "Outstanding performance! You demonstrated excellent argumentation, clarity, and delivery throughout the debate."
        elif overall_score >= 70:
            return "Strong performance. You made compelling arguments and communicated effectively, with room for refinement."
        elif overall_score >= 50:
            return "Good effort. You presented your case adequately but could improve in several areas."
        else:
            return "Room for improvement. Focus on strengthening your arguments and delivery in future debates."

# Singleton instance
debate_service = DebateService()
