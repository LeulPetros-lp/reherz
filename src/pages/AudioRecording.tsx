import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mic, MicOff, Play, Pause, Square, Check, Loader2, Sparkles } from 'lucide-react';

// --- Utility Functions (Replaces External Imports) ---

// Function to convert time in seconds to minutes:seconds format
// NOTE: This replaces the import of formatTime from '@/lib/utils'
const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Function to convert ArrayBuffer to base64 (kept for completeness)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    // Corrected String.fromCharCode usage
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// --- Type Definitions ---

interface AIResponse {
  suggestions: string[];
  feedback: string;
  score: number;
  content_analysis?: Record<string, any>;
  delivery_analysis?: Record<string, any>;
  opponent_argument?: string;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded';

// --- UI Component Replacements (Styled with Tailwind CSS) ---

// Simple Button Replacement
const Button = ({ children, onClick, variant = 'default', size = 'lg', className = '', disabled = false }: any) => {
  const baseClasses = 'font-semibold rounded-lg shadow-md transition-all duration-150 flex items-center justify-center';
  const sizeClasses = size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2 text-base';

  let variantClasses = '';
  switch (variant) {
    case 'outline':
      variantClasses = 'bg-white border-2 border-gray-400 text-gray-700 hover:bg-gray-100';
      break;
    case 'destructive':
      variantClasses = 'bg-red-600 text-white hover:bg-red-700';
      break;
    case 'primary':
      variantClasses = 'bg-blue-600 hover:bg-blue-700 text-white';
      break;
    default:
      variantClasses = 'bg-gray-800 text-white hover:bg-gray-700';
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
};

// Simple Card Replacements
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl shadow-2xl p-6 ${className}`}>{children}</div>
);
const CardHeader = ({ children, className = '' }: any) => (
  <div className={`mb-4 pb-4 border-b border-gray-100 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = '' }: any) => (
  <h2 className={`text-3xl font-extrabold text-gray-900 ${className}`}>{children}</h2>
);
const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-lg text-gray-500 ${className}`}>{children}</p>
);
const CardContent = ({ children, className = '' }: any) => (
  <div className={`py-4 ${className}`}>{children}</div>
);
const CardFooter = ({ children, className = '' }: any) => (
  <div className={`pt-6 border-t border-gray-100 flex justify-center gap-4 ${className}`}>{children}</div>
);

// Simple Progress Replacement
const Progress = ({ value, className = '', indicatorClassName = '' }: { value: number, className?: string, indicatorClassName?: string }) => (
  <div className={`h-2 w-full rounded-full bg-gray-300 overflow-hidden ${className}`}>
    <div
      style={{ width: `${value}%` }}
      className={`h-full transition-all duration-300 ease-out ${indicatorClassName || 'bg-blue-500'}`}
    ></div>
  </div>
);

// Custom Notification/Toast System (Replaces External use-toast)
const Notification = ({ notification, setNotification }: any) => {
  if (!notification) return null;

  const { title, description, variant } = notification;
  const colorClasses = variant === 'destructive'
    ? 'bg-red-500 border-red-700'
    : 'bg-green-500 border-green-700';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white border-b-4 ${colorClasses} max-w-sm transition-all duration-300 animate-slideIn`}>
      <div className="font-bold">{title}</div>
      <div className="text-sm opacity-90">{description}</div>
      <button onClick={() => setNotification(null)} className="absolute top-2 right-2 text-white/80 hover:text-white">&times;</button>
    </div>
  );
};


// --- Main Component ---

const AudioRecording = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State for custom notification
  const [notification, setNotification] = useState<{ title: string; description: string; variant: 'default' | 'destructive' } | null>(null);

  const showNotification = useCallback(({ title, description, variant = 'default' }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
    setNotification({ title, description, variant });
    // Auto-clear after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, []); // Only needs to be created once

  // Destructure state with defaults for safety
  const { mode, title, type, duration } = location.state || {
    mode: 'speech',
    title: 'Untitled',
    type: 'general',
    duration: 5
  };

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [rounds, setRounds] = useState<Array<{
    transcript: string;
    audioAnalysis?: any;
    feedback?: AIResponse;
    timestamp: string;
  }>>([]);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request microphone access and set up media recorder
  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        // Request access to the microphone
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Get supported MIME types for the browser
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : MediaRecorder.isTypeSupported('audio/mp4')
            ? 'audio/mp4'
            : ''; // Let the browser decide if no specific type is supported
        
        const options = mimeType ? { mimeType } : undefined;
        
        // Initialize MediaRecorder with the stream and options
        mediaRecorder.current = new MediaRecorder(stream, options);
        
        mediaRecorder.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.current.push(event.data);
          }
        };

        mediaRecorder.current.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          showNotification({
            title: "Recording Error",
            description: "An error occurred while recording. Please try again.",
            variant: "destructive",
          });
        };

        mediaRecorder.current.onstop = () => {
          // Use the recorded MIME type or fallback to webm
          const recordedType = mediaRecorder?.current?.mimeType || 'audio/webm';
          const audioBlob = new Blob(audioChunks.current, { type: recordedType });
          setRecordedAudio(audioBlob);
          audioChunks.current = []; // Clear chunks for next recording
          
          // Stop all tracks in the stream
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (error) {
        console.error('Error accessing microphone:', error);
        showNotification({
          title: "Microphone Error",
          description: "Could not access microphone. Please check your permissions and try again.",
          variant: "destructive",
        });
      }
    };

    initializeRecorder();

    return () => {
      // Cleanup function
      if (mediaRecorder.current?.state === 'recording') {
        mediaRecorder.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Stop the media stream tracks to release the mic
      if (mediaRecorder.current?.stream) {
          mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showNotification]); // Dependency added for showNotification

  const startRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
      audioChunks.current = [];
      mediaRecorder.current.start();
      setRecordingState('recording');
      setElapsedTime(0);
      
      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(newElapsed);
        
        // Stop recording if we've reached the time limit (duration is in minutes)
        if (newElapsed >= duration * 60) {
          stopRecording();
        }
      }, 1000);
    } else {
      console.warn("MediaRecorder not ready or active.");
      showNotification({
          title: "Error",
          description: "Microphone is not initialized. Please refresh the page.",
          variant: "destructive",
        });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.pause();
      setRecordingState('paused');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current?.state === 'paused') {
      mediaRecorder.current.resume();
      setRecordingState('recording');
      
      // Resume timer from the elapsed time
      const startTime = Date.now() - (elapsedTime * 1000);
      timerRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(newElapsed);
        
        if (newElapsed >= duration * 60) {
          stopRecording();
        }
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setRecordingState('recorded');
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const saveRecording = async () => {
    if (!recordedAudio) return;
    
    setIsProcessing(true);
    
    try {
      // Convert the recorded audio blob to an ArrayBuffer
      const arrayBuffer = await recordedAudio.arrayBuffer();
      
      // Create FormData for the audio file
      const formData = new FormData();
      formData.append('file', new Blob([arrayBuffer], { type: recordedAudio.type }), 'recording.wav');

      console.log('Sending audio for analysis...');
      
      // Get real audio analysis
      const analysisResponse = await fetch('http://localhost:8000/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      if (!analysisResponse.ok) {
        const error = await analysisResponse.json().catch(() => ({}));
        throw new Error(`Analysis failed: ${error.detail || analysisResponse.statusText}`);
      }

      const analysisResult = await analysisResponse.json();
      console.log('Audio analysis:', analysisResult);

      // Calculate WPM (words per minute)
      const wordCount = analysisResult.transcript.split(/\s+/).length;
      const minutes = elapsedTime / 60;
      const wpm = Math.round(wordCount / minutes) || 0;

      // Create real audio analysis data
      const audioAnalysis = {
        wpm,
        filler_words: analysisResult.filler_words || [],
        pauses: analysisResult.pauses || { count: 0, frequency: 0 },
        tone_analysis: analysisResult.tone_analysis || { emotion: 'neutral', confidence: 0 }
      };

      // Mock feedback (AI part is still in demo mode)
      const mockFeedback = {
        score: 0,
        feedback: "AI analysis is currently disabled. This would show personalized feedback when enabled.",
        suggestions: [
          "Enable AI analysis to get personalized feedback",
          "Practice varying your tone and pace",
          "Try to reduce filler words"
        ],
        content_analysis: {
          clarity: 0,
          structure: 0,
          engagement: 0
        }
      };

      // Create new round with real analysis and mock feedback
      const newRound = {
        transcript: analysisResult.transcript,
        audioAnalysis,
        feedback: mockFeedback,
        timestamp: new Date().toISOString(),
      };

      setRounds(prev => [...prev, newRound]);
      setTranscript(analysisResult.transcript);
      
      showNotification({
        title: "Analysis Complete",
        description: "Audio analysis finished. AI feedback is in demo mode.",
        variant: "default",
      });
      
      // Navigate to feedback page with the analysis
      navigate('/feedback', {
        state: {
          feedback: {
            mode,
            title,
            type,
            currentRound: rounds.length + 1,
            totalRounds: mode === 'debate' ? 3 : 1,
            rounds: [...rounds, newRound],
          },
        },
        replace: true
      });
      
      // Reset recording state
      setRecordingState('idle');
      setRecordedAudio(null);
      setElapsedTime(0);
      setTranscript('');
    } catch (error) {
      console.error('Error processing audio:', error);
      showNotification({
        title: "Error",
        description: `Failed to process the recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }; 

  const progress = (elapsedTime / (duration * 60)) * 100;
  const remainingTime = (duration * 60) - elapsedTime;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Notification notification={notification} setNotification={setNotification} />
      <Card className="w-full max-w-2xl border-t-4 border-blue-500">
        <CardHeader>
          <CardTitle>
            {mode === 'debate' ? 'Debate Recording' : 'Speech Recording'}
          </CardTitle>
          <CardDescription>
            {title} • <span className="font-semibold">{formatTime(elapsedTime)}</span> / {duration}:00
          </CardDescription>
          {mode === 'debate' && (
            <div className="mt-2 text-sm font-medium text-blue-600">
              Round: {rounds.length + 1} of 3
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center justify-center py-8">
            {/* Recording Indicator */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${
                recordingState === 'recording' 
                  ? 'bg-red-200 shadow-xl animate-pulse scale-105' 
                  : 'bg-gray-200 shadow-lg'
              }`}></div>
              {recordingState === 'recording' ? (
                <MicOff className="w-16 h-16 text-red-700 relative z-10" />
              ) : (
                <Mic className="w-16 h-16 text-gray-700 relative z-10" />
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full max-w-lg mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-1 font-mono">
                <span>{formatTime(elapsedTime)}</span>
                <span>{formatTime(remainingTime > 0 ? remainingTime : 0)} remaining</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-2 bg-gray-300" indicatorClassName="bg-blue-500" />
            </div>
            
            {/* Status Text */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">
                {recordingState === 'recording' 
                  ? 'Recording in progress...'
                  : recordingState === 'paused'
                    ? 'Recording paused'
                    : recordingState === 'recorded'
                      ? 'Recording saved. Ready for analysis.'
                      : 'Press Start to begin recording'}
              </p>
              <p className="text-md text-gray-500 mt-2">
                {mode === 'debate' 
                  ? rounds.length === 0 ? 'Present your opening argument' : 'Respond to your opponent'
                  : `Deliver your ${type} speech`}
              </p>
            </div>
          </div>

          {/* Transcript and Debate Feedback */}
          {rounds.length > 0 && (
            <div className="mt-6 space-y-4 w-full">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Analysis History</h2>
              
              {rounds.map((round, index) => (
                <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg text-blue-700 mb-1">Round {index + 1} Summary</h3>
                  <div className="space-y-3">
                    {/* Opponent Argument (if available) */}
                    {round.feedback?.opponent_argument && (
                      <div className="bg-gray-100 p-3 rounded-md text-sm italic border-l-4 border-gray-400">
                          <span className="font-semibold text-gray-600">Opponent's Point:</span> {round.feedback.opponent_argument}
                      </div>
                    )}
                    {/* Brief Feedback */}
                    <div className="bg-blue-50 p-3 rounded-md text-sm border-l-4 border-blue-400">
                        <span className="font-semibold text-blue-800">AI Feedback:</span> {round.feedback?.feedback || 'Feedback loading...'}
                    </div>
                  </div>
                </div>
              ))}
              
              {mode === 'debate' && rounds.length < 3 && (
                <p className="text-md text-gray-500 text-center font-medium pt-2">
                  Ready for Round {rounds.length + 1}. Focus on the previous round's feedback!
                </p>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center gap-4 pt-6 border-t">
          {recordingState === 'idle' && (
            <Button 
              size="lg" 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              onClick={startRecording}
            >
              <Play className="w-5 h-5" />
              Start Recording
            </Button>
          )}
          
          {(recordingState === 'recording' || recordingState === 'paused') && (
            <>
              {/* Pause/Resume Button */}
              <Button 
                variant="outline" 
                size="lg"
                onClick={recordingState === 'recording' ? pauseRecording : resumeRecording}
                className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                {recordingState === 'recording' ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Resume
                  </>
                )}
              </Button>
              {/* Stop Button */}
              <Button 
                variant="destructive" 
                size="lg"
                onClick={stopRecording}
                className="gap-2 bg-red-600 hover:bg-red-700 shadow-md"
              >
                <Square className="w-5 h-5" />
                Stop
              </Button>
            </>
          )}
          
          {recordingState === 'recorded' && (
            <>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setRecordingState('idle');
                  setElapsedTime(0);
                  setRecordedAudio(null);
                  setTranscript('');
                }}
                className="gap-2 border-gray-400 text-gray-600 hover:bg-gray-100"
              >
                <Mic className="w-5 h-5" />
                Record Again
              </Button>
              
              <Button 
                size="lg"
                onClick={saveRecording}
                className="gap-2 bg-green-600 hover:bg-green-700 shadow-md"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    {mode === 'debate' && rounds.length < 2 ? 'Analyze & Next Round' : 'Analyze & Finish'}
                  </>
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
      {/* Required for Tailwind to recognize the new slideIn animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AudioRecording;
