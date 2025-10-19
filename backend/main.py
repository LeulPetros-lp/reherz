import os
import wave
import speech_recognition as sr
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import tempfile

# Initialize recognizer
recognizer = sr.Recognizer()

# Initialize FastAPI app
app = FastAPI(title="Reherz Speak Coach Backend", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Response ---

class ScoreItem(BaseModel):
    metric: str
    value: float
    max_value: float

class SessionAnalysisResponse(BaseModel):
    transcript: str
    summary: str
    overall_score: float
    scores: List[ScoreItem]

# --- Helper Function ---

def convert_audio(input_path: str, output_path: str) -> bool:
    """
    Convert audio file to WAV format (1 channel, 16kHz, PCM S16LE) using ffmpeg.
    
    NOTE: Requires 'python-ffmpeg' installed via pip and the 'ffmpeg' 
    executable installed on the operating system.
    """
    try:
        import ffmpeg
        print(f"Converting audio from {input_path} to {output_path}...")
        (
            ffmpeg
            .input(input_path)
            .output(output_path, ac=1, ar=16000, acodec='pcm_s16le', loglevel='error')
            .run(overwrite_output=True, capture_stdout=True, capture_stderr=True)
        )
        return True
    except ImportError:
        print("Error: python-ffmpeg not installed. Please run: pip install python-ffmpeg")
        return False
    except Exception as e:
        print(f"Error converting audio: {str(e)}")
        # If the file format is already compatible, conversion might fail but be unnecessary
        # You might add a check here, but for safety, we'll return False on error.
        return False

# --- Endpoints ---

@app.post("/api/process-audio")
async def process_audio(file: UploadFile = File(...)):
    """Process uploaded audio file and return transcription."""
    print(f"Received file: {file.filename}, content type: {file.content_type}")
    
    # Create a temporary directory for processing
    with tempfile.TemporaryDirectory() as temp_dir:
        # Use a generic name for the input and converted file paths
        input_path = os.path.join(temp_dir, "input_file_raw")
        wav_path = os.path.join(temp_dir, "output.wav")
        
        try:
            # 1. Save the uploaded file (which might be webm/opus/wav, etc.)
            content = await file.read()
            with open(input_path, 'wb') as f:
                f.write(content)
            
            print(f"Saved input file to: {input_path} ({len(content)} bytes)")
            
            # 2. Convert to WAV format (16kHz mono) required by SpeechRecognition
            if not convert_audio(input_path, wav_path):
                # If conversion fails, try to use the original file path as a fallback 
                # if it's already a WAV or a compatible format
                if file.content_type in ["audio/wav", "audio/x-wav"]:
                    wav_path = input_path
                    print("FFmpeg conversion skipped, attempting to use original file as WAV.")
                else:
                    return {"status": "error", "message": "Failed to convert audio format. Check server logs for ffmpeg error."}
            
            print(f"Audio ready for recognition at: {wav_path}")
            
            # 3. Read the WAV file and transcribe
            with sr.AudioFile(wav_path) as source:
                # Adjust for ambient noise and then read the entire audio file
                recognizer.adjust_for_ambient_noise(source)
                audio_data = recognizer.record(source)
            
            print("Audio loaded, recognizing speech using Google Speech Recognition...")
            
            transcript = recognizer.recognize_google(audio_data)
            print(f"Speech recognition successful: '{transcript[:50]}...'")
            
            return {"status": "success", "transcript": transcript}
                 
        except sr.UnknownValueError:
            print("Speech recognition could not understand audio.")
            return {"status": "error", "message": "Could not understand audio. Try speaking more clearly."}
            
        except sr.RequestError as e:
            print(f"Speech recognition request failed: {str(e)}")
            return {"status": "error", "message": f"Could not request results from Google Speech Recognition; {e}"}
            
        except Exception as e:
            print(f"Unexpected error during speech recognition: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"status": "error", "message": f"An error occurred during processing: {str(e)}"}

# Keep the existing analysis endpoint for backward compatibility
@app.post("/api/analysis", response_model=SessionAnalysisResponse)
async def get_session_analysis():
    """Return mocked analysis data after a recording session has finished."""
    return SessionAnalysisResponse(
        transcript="Hello everyone, today I'm going to talk about our quarterly performance...",
        summary="Speaker maintained a confident tone with occasional filler words. Pace was steady.",
        overall_score=72.0,
        scores=[
            ScoreItem(metric="Clarity", value=90, max_value=100),
            ScoreItem(metric="Pace", value=80, max_value=100),
            ScoreItem(metric="Filler Words", value=70, max_value=100),
        ],
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)