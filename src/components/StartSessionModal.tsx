import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, StopCircle } from 'lucide-react';


interface StartSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDuration: number;
  onStartSession: () => void;
}

const StartSessionModal = ({ 
  open, 
  onOpenChange, 
  defaultDuration,
  onStartSession 
}: StartSessionModalProps) => {
  const [sessionName, setSessionName] = useState('');
  const [duration, setDuration] = useState(defaultDuration);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setDuration(defaultDuration);
  }, [defaultDuration]);

  useEffect(() => {
    if (!isRecording || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleStopSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording, timeLeft]);

  const handleStartSession = () => {
    if (!sessionName.trim()) return;
    onStartSession();
    setIsRecording(true);
    setTimeLeft(duration * 60);
  };

  const handleStopSession = () => {
    setIsRecording(false);
    // Reset form
    setSessionName('');
    setDuration(defaultDuration);
    setTimeLeft(0);
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isRecording ? 'Session in Progress' : 'Start Speech Session'}
          </DialogTitle>
          <DialogDescription>
            {isRecording 
              ? 'Your session is being recorded. Stop when you\'re done.' 
              : 'Enter session details to begin tracking your speech performance'
            }
          </DialogDescription>
        </DialogHeader>

        {!isRecording ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                placeholder="e.g., Weekly Presentation"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="120"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              onClick={handleStartSession}
              disabled={!sessionName.trim()}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Session
            </Button>
          </div>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <div className="text-6xl font-bold text-primary animate-pulse-subtle">
                {formatTime(timeLeft)}
              </div>
              <p className="text-muted-foreground">Time Remaining</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Session: {sessionName}</p>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ 
                    width: `${((duration * 60 - timeLeft) / (duration * 60)) * 100}%` 
                  }}
                />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              variant="destructive"
              onClick={handleStopSession}
            >
              <StopCircle className="w-5 h-5 mr-2" />
              Stop Session
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StartSessionModal;
