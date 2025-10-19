import requests
import json

# URL of your API endpoint
url = "http://localhost:8000/api/process-audio"

# Path to your test audio file
audio_file_path = "test.wav"  # Make sure this file exists

# Send the request
with open(audio_file_path, 'rb') as f:
    files = {'file': (audio_file_path, f, 'audio/wav')}
    response = requests.post(url, files=files)

# Print the response
print(f"Status Code: {response.status_code}")
print("Response:")
print(json.dumps(response.json(), indent=2))
