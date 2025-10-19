import os
import json
import librosa
import numpy as np
import torch
import warnings
import soundfile as sf
from typing import Dict, Any
from transformers import (
    AutoModelForAudioClassification, 
    AutoFeatureExtractor, 
    AutoProcessor,
    AutoModelForSpeechSeq2Seq
)

warnings.filterwarnings("ignore", category=UserWarning)

class AudioAnalyzer:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.filler_words = {
            # Single word fillers
            'uh', 'er', 'ah', 'um', 'eh', 'oh', 'hmm', 'huh', 'hm', 'mm',
            # Common filler words
            'like', 'so', 'well', 'you know', 'right', 'okay', 'anyway', 'basically',
            'actually', 'literally', 'really', 'very', 'essentially', 'honestly',
            'just', 'sort of', 'kind of', 'i mean', 'i guess', 'needless to say'
        }
        self._load_models()
    
    def _load_models(self):
        """Load all required models and processors"""
        # Emotion classification model
        self.emotion_extractor = AutoFeatureExtractor.from_pretrained("superb/wav2vec2-base-superb-er")
        self.emotion_model = AutoModelForAudioClassification.from_pretrained("superb/wav2vec2-base-superb-er").to(self.device)
        
        # Improved speech recognition model - Using a larger, more accurate model
        model_name = "openai/whisper-small"  # Can be upgraded to medium or large for better accuracy
        self.asr_processor = AutoProcessor.from_pretrained(model_name)
        self.asr_model = AutoModelForSpeechSeq2Seq.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            low_cpu_mem_usage=True,
            use_safetensors=True
        ).to(self.device)
        
        # Enable better decoding strategy
        self.asr_model.config.forced_decoder_ids = None
        self.asr_model.config.suppress_tokens = []
    
    def analyze_audio(self, audio_path: str) -> Dict[str, Any]:
        """
        Analyze audio file and return comprehensive analysis
        
        Args:
            audio_path: Path to the audio file to analyze
            
        Returns:
            Dictionary containing analysis results
        """
        try:
            # Load and preprocess audio
            y, sr = librosa.load(audio_path, sr=16000)
            duration_sec = librosa.get_duration(y=y, sr=sr)
            
            # 1. Speech Recognition
            transcript = self._transcribe_audio(y, sr)
            
            # 2. Filler word analysis
            filler_analysis = self._analyze_fillers(transcript)
            
            # 3. Tempo and pause analysis
            tempo, pause_metrics = self._analyze_tempo_and_pauses(y, sr, duration_sec)
            
            # 4. Tone/Emotion Analysis
            tone_analysis = self._analyze_tone(y, sr)
            
            # Combine all results
            results = {
                "transcript": transcript,
                "duration_sec": round(duration_sec, 2),
                "word_count": len(transcript.split()),
                **tempo,
                **pause_metrics,
                **tone_analysis,
                **filler_analysis
            }
            
            return {"status": "success", "analysis": results}
            
        except Exception as e:
            return {"status": "error", "message": f"Analysis failed: {str(e)}"}
    
    def _preprocess_audio(self, y: np.ndarray, sr: int, target_sr: int = 16000) -> np.ndarray:
        """Preprocess audio for better recognition"""
        # Resample if needed
        if sr != target_sr:
            y = librosa.resample(y, orig_sr=sr, target_sr=target_sr)
            sr = target_sr
            
        # Normalize audio
        y = librosa.util.normalize(y)
        
        # Noise reduction (simple approach)
        y = librosa.effects.preemphasis(y)
        
        return y
    
    def _transcribe_audio(self, y: np.ndarray, sr: int) -> str:
        """Transcribe audio using Whisper model with better preprocessing"""
        try:
            # Preprocess audio
            y = self._preprocess_audio(y, sr)
            
            # Prepare input features
            input_features = self.asr_processor(
                y, 
                sampling_rate=16000, 
                return_tensors="pt"
            ).input_features.to(self.device)
            
            # Generate transcription with better parameters
            with torch.no_grad():
                predicted_ids = self.asr_model.generate(
                    input_features,
                    max_length=448,  # Increased max length for longer sentences
                    num_beams=5,     # Beam search for better accuracy
                    temperature=0.7,  # Balance between randomness and determinism
                    do_sample=True,   # Enable sampling for better results
                    top_p=0.95,       # Nucleus sampling
                    top_k=50,         # Top-k sampling
                    return_dict_in_generate=True,
                    output_scores=True
                )
            
            # Decode the generated tokens
            transcript = self.asr_processor.batch_decode(
                predicted_ids.sequences, 
                skip_special_tokens=True
            )[0]
            
            return transcript.strip()
            
        except Exception as e:
            print(f"Error in transcription: {str(e)}")
            return ""
        
    def _analyze_fillers(self, text: str) -> dict:
        """
        Analyze the transcript for filler words and phrases.
        Returns a dictionary with filler word counts and statistics.
        """
        if not text:
            return {
                "filler_words": {},
                "total_fillers": 0,
                "filler_rate_per_minute": 0.0,
                "unique_fillers": 0
            }
            
        # Convert to lowercase and split into words
        words = text.lower().split()
        word_count = len(words)
        
        # Initialize filler counts
        filler_counts = {filler: 0 for filler in self.filler_words}
        
        # Count filler words and phrases
        for i in range(len(words)):
            # Check single word fillers
            word = words[i].strip('.,!?;:"\'()[]{}')
            if word in self.filler_words:
                filler_counts[word] = filler_counts.get(word, 0) + 1
                
            # Check multi-word phrases (up to 3 words)
            for phrase_length in range(2, 4):
                if i + phrase_length <= len(words):
                    phrase = ' '.join(words[i:i+phrase_length])
                    if phrase in self.filler_words:
                        filler_counts[phrase] = filler_counts.get(phrase, 0) + 1
        
        # Remove fillers with zero count
        filler_counts = {k: v for k, v in filler_counts.items() if v > 0}
        total_fillers = sum(filler_counts.values())
        
        return {
            "filler_words": filler_counts,
            "total_fillers": total_fillers,
            "filler_rate_per_minute": (total_fillers / (word_count / 100)) if word_count > 0 else 0.0,
            "unique_fillers": len(filler_counts)
        }
    
    def _analyze_tempo_and_pauses(self, y: np.ndarray, sr: int, duration_sec: float) -> tuple:
        """Analyze tempo and pauses in audio"""
        # Tempo analysis
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # Pause analysis
        energy = librosa.feature.rms(y=y)[0]
        frames = range(len(energy))
        times = librosa.frames_to_time(frames, sr=sr)
        silence_threshold = np.percentile(energy, 10)
        pause_indices = np.where(energy < silence_threshold)[0]
        
        pause_durations = []
        if len(pause_indices) > 1:
            pause_times = times[pause_indices]
            pause_gaps = np.diff(pause_times)
            pause_durations = pause_gaps[pause_gaps > 0.2]
            
        pause_count = len(pause_durations)
        avg_pause_sec = float(np.mean(pause_durations)) if pause_count > 0 else 0.0
        pauses_per_min = (pause_count / (duration_sec / 60)) if duration_sec > 0 else 0.0
        energy_var = float(np.var(energy)) if len(energy) > 0 else 0.0
        
        return (
            {"tempo_bpm": float(tempo)},
            {
                "pause_count": int(pause_count),
                "pauses_per_min": round(pauses_per_min, 2),
                "avg_pause_sec": round(avg_pause_sec, 3),
                "energy_variation": round(energy_var, 6)
            }
        )
    
    def _analyze_tone(self, y: np.ndarray, sr: int) -> Dict[str, Any]:
        """Analyze tone and emotion of speech"""
        try:
            inputs = self.emotion_extractor(
                y, 
                sampling_rate=sr, 
                return_tensors="pt", 
                padding=True
            ).to(self.device)
            
            with torch.no_grad():
                logits = self.emotion_model(**inputs).logits
                probs = torch.nn.functional.softmax(logits, dim=-1)
                pred_idx = torch.argmax(probs, dim=-1).item()
                confidence = probs[0, pred_idx].item()
            
            emotion_raw = self.emotion_model.config.id2label[pred_idx]
            
            tone_map = {
                "angry": "tense",
                "sad": "calm",
                "neutral": "confident",
                "happy": "confident",
                "excited": "energetic",
                "fearful": "nervous",
                "disgust": "tense",
                "surprise": "energetic",
            }
            
            return {
                "tone": tone_map.get(emotion_raw.lower(), "neutral"),
                "emotion": emotion_raw,
                "confidence": round(confidence, 3)
            }
            
        except Exception as e:
            print(f"Tone analysis failed: {e}")
            return {
                "tone": "unknown",
                "emotion": "unknown",
                "confidence": 0.0
            }

# Global instance for the audio analyzer
audio_analyzer = AudioAnalyzer()
