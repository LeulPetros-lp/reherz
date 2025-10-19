import os
import io
import wave
import speech_recognition as sr
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from main import get_session_analysis
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import tempfile
import subprocess
import os
import wave
import speech_recognition as sr
import uuid
import json
import requests
from datetime import datetime
from audio_analysis import audio_analyzer
from services.debate_service import debate_service
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client for OpenRouter
from openai import OpenAI

openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Reherz Speak Coach"
    }
)

# Initialize recognizer
recognizer = sr.Recognizer()

# Models
class DebateStartRequest(BaseModel):
    topic: str
    user_side: str  # 'affirmative' or 'negative'
    total_rounds: int = 3  # Default to 3 rounds

class DebateRoundRequest(BaseModel):
    session_id: str
    transcript: Optional[str] = None
    audio_file: Optional[UploadFile] = None

class DebateAnalysisResponse(BaseModel):
    status: str
    round_number: int
    feedback: Dict[str, Any]
    next_round_prompt: Optional[str] = None
    session_complete: bool = False
    overall_score: Optional[Dict[str, Any]] = None

app = FastAPI(title="Reherz Speak Coach Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreItem(BaseModel):
    metric: str
    value: float
    max_value: float

class SessionAnalysisResponse(BaseModel):
    transcript: str
    summary: str
    overall_score: float
    scores: List[ScoreItem]

class AIResponseRequest(BaseModel):
    transcript: str
    mode: str = 'general'
    type: str = 'speech'

class AIResponse(BaseModel):
    status: str
    response: Optional[Dict[str, Any]] = None
    message: Optional[str] = None

def convert_audio(input_path: str, output_path: str) -> bool:
    """Convert audio file to WAV format using ffmpeg."""
    try:
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-ac', '1',
            '-ar', '16000',
            '-acodec', 'pcm_s16le',
            '-y',  # Overwrite output file if it exists
            output_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error converting audio: {e.stderr.decode()}")
        return False
    except Exception as e:
        print(f"Unexpected error in convert_audio: {str(e)}")
        return False

@app.post("/api/process-audio")
async def process_audio(file: UploadFile = File(...)):
    """Process uploaded audio file and return transcription."""
    print(f"Received file: {file.filename}, content type: {file.content_type}")
    
    # Create a temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        input_path = os.path.join(temp_dir, "input.opus")
        wav_path = os.path.join(temp_dir, "output.wav")
        
        try:
            # Save the uploaded file
            with open(input_path, 'wb') as f:
                content = await file.read()
                f.write(content)
            
            print(f"Saved input file to: {input_path} ({len(content)} bytes)")
            
            # Convert to WAV format
            if not convert_audio(input_path, wav_path):
                return {"status": "error", "message": "Failed to convert audio format"}
            
            print(f"Converted audio to WAV format: {wav_path}")
            
            # Perform comprehensive audio analysis
            analysis_result = audio_analyzer.analyze_audio(wav_path)
            
            if analysis_result["status"] == "success":
                print("Audio analysis completed successfully")
                # Extract transcript and word count before removing them from analysis
                transcript = analysis_result["analysis"].pop("transcript", "")
                word_count = analysis_result["analysis"].pop("word_count", 0)
                
                return {
                    "status": "success",
                    "transcript": transcript,
                    "word_count": word_count,
                    "analysis": analysis_result["analysis"]
                }
            else:
                return analysis_result
                
        except Exception as e:
            print(f"Error in process_audio: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"status": "error", "message": f"An error occurred: {str(e)}"}

@app.get("/")
async def root():
    return {
        "message": "Reherz Speak Coach Backend is running",
        "version": "1.0.0",
        "endpoints": [
            "POST /api/process-audio - Process audio and return transcript with analysis",
            "POST /api/analysis - Get session analysis (legacy)",
            "POST /api/debate/start - Start a new debate session",
            "POST /api/debate/round - Submit a debate round"
        ]
    }

# Analysis Endpoint
app.add_api_route("/api/analysis", get_session_analysis, methods=["POST"])

# Debate Endpoints
@app.post("/api/debate/start", response_model=Dict[str, str])
async def start_debate(request: DebateStartRequest):
    """Start a new debate session"""
    try:
        session_id = debate_service.start_debate_session(
            topic=request.topic,
            user_side=request.user_side,
            total_rounds=request.total_rounds
        )
        return {
            "status": "success",
            "session_id": session_id,
            "round_number": 1,
            "total_rounds": request.total_rounds,
            "message": "Debate session started. You can now submit your opening statement."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/debate/round", response_model=DebateAnalysisResponse)
async def process_debate_round(request: Request, round_request: DebateRoundRequest = None, audio_file: UploadFile = None):
    """Process a debate round with either text transcript or audio file"""
    try:
        # Handle form data (for file uploads)
        if not round_request:
            form_data = await request.form()
            round_request = DebateRoundRequest(
                session_id=form_data.get("session_id"),
                transcript=form_data.get("transcript")
            )
            audio_file = form_data.get("audio_file")
        
        # If audio file is provided, transcribe it
        if audio_file and hasattr(audio_file, 'file'):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_audio:
                content = await audio_file.read()
                temp_audio.write(content)
                temp_audio_path = temp_audio.name
            
            try:
                # Use existing audio analysis to get transcript
                analysis = audio_analyzer.analyze_audio(temp_audio_path)
                if analysis["status"] == "success":
                    round_request.transcript = analysis["analysis"].get("transcript", "")
            except Exception as e:
                print(f"Error in audio analysis: {str(e)}")
            finally:
                os.unlink(temp_audio_path)
        
        if not round_request.transcript:
            raise HTTPException(status_code=400, detail="No transcript provided and could not transcribe audio")
        
        # Process the round with the debate service
        result = await debate_service.process_round(
            round_request.session_id,
            round_request.transcript
        )
        
        return {
            "status": "success",
            "round_number": result['round'],
            "feedback": result['feedback'],
            "next_round_prompt": result.get('next_round_prompt'),
            "session_complete": result.get('session_complete', False),
            "overall_score": result.get('overall_score')
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Error in process_debate_round: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_ai_feedback(transcript: str, mode: str, speech_type: str, 
                            round_number: int, total_rounds: int, 
                            analysis_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Generate AI feedback using OpenRouter with debate context."""
    try:
        # Prepare analysis metrics for the prompt
        metrics = ""
        if analysis_data:
            metrics = "\n\nAnalysis Metrics:\n"
            if 'wpm' in analysis_data:
                metrics += f"- Speaking Rate: {analysis_data.get('wpm')} words per minute\n"
            if 'filler_word_count' in analysis_data:
                metrics += f"- Filler Words Used: {analysis_data.get('filler_word_count')}\n"
            if 'pauses' in analysis_data:
                metrics += f"- Pause Frequency: {analysis_data.get('pauses', {}).get('frequency', 'N/A')} per minute\n"

        # Define the prompt based on the mode and type
        if mode == 'debate':
            system_prompt = """You are an expert debate coach analyzing a debate performance. 
            Provide constructive feedback focusing on argument structure, evidence usage, 
            logical consistency, and delivery. Include specific suggestions for improvement 
            and provide a performance score out of 100."""
            
            round_info = f"(Round {round_number} of {total_rounds})"
            
            user_prompt = f"""Please analyze this debate performance {round_info} and provide detailed feedback:
            
            Transcript:
            {transcript}
            {metrics}
            
            Your response must be a valid JSON object with these exact fields:
            - suggestions: List of 3-5 specific, actionable suggestions for improvement
            - feedback: A detailed paragraph of feedback focusing on both content and delivery
            - score: A score from 0-100
            - counter_arguments: List of 2-3 strong opposing arguments the speaker should prepare for
            - delivery_tips: Specific tips for improving speech delivery and tone
            - evidence_suggestions: Suggestions for stronger evidence or examples
            
            Be specific, constructive, and focus on areas for improvement while acknowledging strengths.
            """
        else:
            system_prompt = """You are a speech coach analyzing a student's speech performance. 
            Provide constructive feedback on their delivery, clarity, and engagement. 
            Include specific suggestions for improvement and rate their performance out of 100."""
            
            user_prompt = f"""Please analyze this {speech_type} speech transcript and provide feedback:
            
            {transcript}
            
            Your response should be a JSON object with these fields:
            - suggestions: List of 3-5 specific suggestions for improvement
            - feedback: A detailed paragraph of feedback
            - score: A score from 0-100
            """
        
        # Call the OpenRouter API
        response = openai_client.chat.completions.create(
            model="openai/gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        feedback_data = json.loads(content)
        
        # Ensure all required fields are present
        if not all(key in feedback_data for key in ['suggestions', 'feedback', 'score']):
            raise ValueError("Invalid response format from AI model")
            
        return {
            "status": "success",
            "response": {
                "suggestions": feedback_data["suggestions"],
                "feedback": feedback_data["feedback"],
                "score": feedback_data["score"]
            }
        }
        
    except Exception as e:
        print(f"Error generating AI feedback: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to generate AI feedback: {str(e)}"
        }

@app.post("/api/generate-ai-response", response_model=AIResponse)
async def generate_ai_response(request: AIResponseRequest):
    """Generate AI-powered feedback for the given transcript."""
    try:
        result = await generate_ai_feedback(
            transcript=request.transcript,
            mode=request.mode,
            speech_type=request.type,
            round_number=1,  # Default to round 1 if not specified
            total_rounds=3   # Default to 3 rounds if not specified
        )
        
        if result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result["message"]
            )
            
        return {
            "status": "success",
            "response": result["response"]
        }
        
    except Exception as e:
        print(f"Error in generate-ai-response: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI response: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
