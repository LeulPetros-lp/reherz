import numpy as np
import soundfile as sf

# Create a simple tone
def create_tone(duration=5, sample_rate=16000, frequency=440):
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    tone = np.sin(2 * np.pi * frequency * t) * 0.5  # 50% volume
    return tone.astype(np.float32)

# Create a small audio file with a simple tone
tone = create_tone(duration=5, frequency=440)

# Save as WAV file
sf.write('test.wav', tone, 16000)
print("Created test.wav with a 440Hz tone for 5 seconds")
