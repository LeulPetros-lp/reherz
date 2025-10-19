import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000"

def print_response(response, title):
    print(f"\n{'='*50}")
    print(f"{title.upper()}")
    print("-"*50)
    print(json.dumps(response, indent=2))
    print("="*50 + "\n")

def test_debate_workflow():
    # 1. Start a new debate session
    print("Starting new debate session...")
    response = requests.post(
        f"{BASE_URL}/api/debate/start",
        json={
            "topic": "Should AI be regulated?",
            "user_side": "affirmative"
        }
    )
    start_data = response.json()
    print_response(start_data, "Session Started")
    
    if response.status_code != 200:
        print("Failed to start session")
        return
        
    session_id = start_data.get("session_id")
    
    # 2. Round 1: Opening Statement
    print("\nSubmitting Round 1: Opening Statement...")
    round1_text = """
    Good afternoon, ladies and gentlemen. Today, I stand in strong affirmation of the motion that 
    artificial intelligence should be regulated. AI systems are becoming increasingly powerful 
    and integrated into our daily lives, from healthcare decisions to criminal justice. 
    Without proper regulation, we risk serious consequences including privacy violations, 
    algorithmic bias, and loss of human autonomy. Regulation will ensure that AI is developed 
    and deployed responsibly, with proper safeguards to protect society.
    """
    
    response = requests.post(
        f"{BASE_URL}/api/debate/round",
        data={"session_id": session_id, "transcript": round1_text}
    )
    round1_data = response.json()
    print_response(round1_data, "Round 1 Feedback")
    
    if response.status_code != 200:
        print("Round 1 failed")
        return
    
    # 3. Round 2: Rebuttal
    print("\nSubmitting Round 2: Rebuttal...")
    round2_text = """
    My opponent's argument about AI regulation fails to consider the chilling effect on innovation. 
    Over-regulation could stifle the very progress that makes AI valuable. Many of the concerns 
    about bias and privacy can be addressed through industry standards and self-regulation 
    without government interference. The technology is still evolving, and premature regulation 
    might lock us into suboptimal frameworks. We should focus on ethical guidelines first 
    before implementing strict regulations.
    """
    
    response = requests.post(
        f"{BASE_URL}/api/debate/round",
        data={"session_id": session_id, "transcript": round2_text}
    )
    round2_data = response.json()
    print_response(round2_data, "Round 2 Feedback")
    
    if response.status_code != 200:
        print("Round 2 failed")
        return
    
    # 4. Round 3: Closing Statement
    print("\nSubmitting Round 3: Closing Statement...")
    round3_text = """
    In conclusion, while my opponent raises valid concerns about innovation, the risks of 
    unregulated AI far outweigh the potential downsides of regulation. We're not calling for 
    excessive restrictions, but rather a balanced framework that ensures AI benefits everyone. 
    History has shown that self-regulation is often insufficient when powerful technologies 
    are involved. By implementing smart, flexible regulations now, we can prevent harm while 
    still fostering innovation. The time to act is before problems arise, not after.
    """
    
    response = requests.post(
        f"{BASE_URL}/api/debate/round",
        data={"session_id": session_id, "transcript": round3_text}
    )
    round3_data = response.json()
    print_response(round3_data, "Round 3 Feedback")
    
    print("\n" + "="*50)
    print("DEBATE SESSION COMPLETE")
    print("="*50)
    print(f"Session ID: {session_id}")
    print("Check the server logs for detailed analysis.")

if __name__ == "__main__":
    # Make sure the server is running first
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("Server is running. Starting test...")
            test_debate_workflow()
        else:
            print(f"Server returned status code {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("Could not connect to the server. Please make sure it's running on http://localhost:8000")
        print("You can start it with: uvicorn app:app --reload")
