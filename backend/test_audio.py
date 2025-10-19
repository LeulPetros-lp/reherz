import requests

# URL of the endpoint
url = "http://localhost:8000/api/process-audio"

# Path to your test audio file
audio_file_path = "test.wav"  # Make sure this file exists or provide the correct path

# Open the file in binary mode
with open(audio_file_path, 'rb') as f:
    # Create the multipart form data
    files = {'file': (audio_file_path, f, 'audio/wav')}
    
    # Send the POST request
    response = requests.post(url, files=files)

# Print the response
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
