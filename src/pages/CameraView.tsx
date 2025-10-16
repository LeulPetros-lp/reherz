import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card } from '@/components/ui/card';
import { Menu } from 'lucide-react';

const CameraView = () => {
  const navigate = useNavigate();
  const [defaultDuration] = useLocalStorage('default-duration', 5);
  const [isRecording, setIsRecording] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(defaultDuration * 60);
  const [sessions] = useLocalStorage('speech-sessions', []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Access the user's camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: 'user' 
        } 
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          // Start recording automatically when camera is ready
          setIsRecording(true);
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
        });
    }
    
    // Make full screen
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
    
    // Cleanup function to stop camera and exit fullscreen when component unmounts
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);
  
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRecording && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isRecording && timeRemaining === 0) {
      setIsRecording(false);
      // Simulate completion and return to dashboard
      navigate('/');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, timeRemaining, navigate]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    navigate('/');
  };
  
  return (
    <div className="min-h-screen w-full bg-black relative" ref={containerRef}>
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-border transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-sidebar-border flex justify-start">
          <div className="text-white text-xl font-bold">Reherz</div>
        </div>
        <div className="p-4">
          <div className="text-white text-center">Sessions will appear here</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-screen w-full flex flex-col">
        {/* Video Feed */}
        <div className="flex-1 relative">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          
          {/* Timer */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-lg font-mono">
            {formatTime(timeRemaining)}
          </div>
          
          {/* Stop Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
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
        </div>
      </div>
    </div>
  );
};

export default CameraView;