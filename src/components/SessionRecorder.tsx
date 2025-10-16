import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Square, Trash2 } from 'lucide-react';

interface SessionRecorderProps {
  onStop: (blob: Blob) => void;
  onDelete: () => void;
  duration: number; // in minutes
}

export default function SessionRecorder({ onStop, onDelete, duration }: SessionRecorderProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    // Start camera when component mounts
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          
          // Set up media recorder
          const mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: 'video/webm;codecs=vp8,opus',
          });
          
          const chunks: BlobPart[] = [];
          
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            onStop(blob);
          };
          
          setRecorder(mediaRecorder);
        }
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };
    
    startCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onStop(blob);
      };
      
      // Start recording immediately
      mediaRecorder.start(1000);
      setRecorder(mediaRecorder);
      startTimeRef.current = Date.now();
      
      // Start timer
      timerRef.current = setInterval(() => {
        const secondsElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(secondsElapsed);
        
        // Auto-stop when duration is reached (duration is in minutes, convert to seconds)
        if (secondsElapsed >= duration * 60) {
          stopRecording();
        }
      }, 1000);
      
      return () => {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [stream, duration]);
  
  const stopRecording = () => {
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  

  
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeRemaining = (totalSeconds: number) => {
    const remaining = (duration * 60) - totalSeconds;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Timer and Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-6">
        <div className="bg-white/90 text-black px-4 py-2 rounded-md font-mono text-lg font-bold flex flex-col items-center">
          <div className="text-xs text-gray-600">Time Elapsed</div>
          <div>{formatTime(elapsedTime)}</div>
        </div>
        <div className="bg-white/90 text-black px-4 py-2 rounded-md font-mono text-lg font-bold flex flex-col items-center">
          <div className="text-xs text-gray-600">Time Remaining</div>
          <div>{formatTimeRemaining(elapsedTime)}</div>
        </div>
        
        <Button 
          onClick={stopRecording}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
        
        <Button 
          onClick={onDelete}
          variant="outline" 
          className="text-white border-white/50 hover:bg-white/10"
          size="sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
      
      {/* Video Preview */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
