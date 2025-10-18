from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Reherz Speak Coach Backend", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Your frontend URL
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



@app.post("/api/analysis", response_model=SessionAnalysisResponse)
async def get_session_analysis():
    """Return mocked analysis data after a recording session has finished."""
    # In the future, this handler will receive audio or a session identifier,
    # process the recording, and return real analysis data.
    return SessionAnalysisResponse(
        transcript="Hello everyone, today I'm going to talk about our quarterly performance...",
        summary="Speaker maintained a confident tone with occasional filler words. Pace was steady.",
        overall_score=72.0,
        scores=[
            ScoreItem(metric="Clarity", value=90, max_value=100),
            ScoreItem(metric="Pace", value=80, max_value=100),
            ScoreItem(metric="Filler Words", value=70, max_value=100),
            # ScoreItem(metric="Confidence", value=88, max_value=100),
        ],
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
