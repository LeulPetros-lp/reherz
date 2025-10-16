export interface SpeechSession {
  id: string;
  name: string;
  date: Date;
  duration: number; // in minutes
  score: SpeechScore;
  videoUrl?: string; // URL to the recorded video
}

export interface SpeechScore {
  overall: number; // 0-100
  clarity: number; // 0-100
  pacing: number; // 0-100
  confidence: number; // 0-100
}

export interface UserPreferences {
  defaultDuration: number; // in minutes
  theme: 'light' | 'dark';
}
