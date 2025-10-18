import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CameraViewSkeleton } from '@/components/skeletons';
import Webcam from 'react-webcam';

const CameraView = () => {
  const navigate = useNavigate();
  // Retrieves the default duration for the session
  const [defaultDuration] = useLocalStorage('default-duration', 5);
  const [isRecording, setIsRecording] = useState(true);
  // Initialize time remaining in seconds (default duration is in minutes)
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 60);
  // State to track if the camera stream has successfully started
  const [cameraReady, setCameraReady] = useState(false); 
  
  const webcamRef = useRef<Webcam>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 1. Fullscreen Effect
  useEffect(() => {
    // Request fullscreen on mount
    const requestFullscreen = async () => {
      if (containerRef.current && !document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();
        } catch (err) {
          console.error('Error attempting to enable fullscreen:', err);
        }
      }
    };
    requestFullscreen();

    // Exit fullscreen on component unmount
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
    };
  }, []);
  
  // 2. Timer Effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRecording && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isRecording && timeRemaining === 0) {
      // Auto-stop recording and navigate when the timer hits zero
      setIsRecording(false);
      navigate('/');
    }
    
    // Cleanup the interval on unmount or dependency change
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, timeRemaining, navigate]);
  
  // Utility function for time formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handler for manually stopping the recording
  const handleStopRecording = () => {
    setIsRecording(false);
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    // Navigate to the analysis page
    navigate('/data-analysis');
  };
  
  return (
    <div className="min-h-screen w-full bg-black relative" ref={containerRef}>
      <div className="h-screen w-full flex flex-col">
        <div className="flex-1 relative">
          
          {/* FIX: The Webcam component must be rendered immediately so that 
            onUserMedia can fire and set cameraReady to true.
          */}
          <Webcam 
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            // Set cameraReady to true when the stream is successfully loaded or if an error occurs
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={() => setCameraReady(true)}
            videoConstraints={{ facingMode: 'user', width: 1920, height: 1080 }}
            className="w-full h-full object-cover"
          />
          
          {/* Skeleton/Loading Overlay */}
          {/* This overlay is shown until the camera is ready */}
          {!cameraReady && (
            <div className="absolute inset-0 z-10">
              <CameraViewSkeleton />
            </div>
          )}
          
          {/* Timer (Only show when camera is ready) */}
          {cameraReady && (
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-lg font-mono z-20">
              {formatTime(timeRemaining)}
            </div>
          )}
          
          {/* Stop Button (Only show when camera is ready and recording) */}
          {cameraReady && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
              {isRecording && (
                <Button 
                  onClick={handleStopRecording} 
                  className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700 rounded-full shadow-lg"
                  variant="destructive"
                >
                  Stop Recording
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraView;