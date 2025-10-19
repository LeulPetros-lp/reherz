import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextUpload from '@/components/ContextUpload';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLoadingState } from '@/hooks/useLoadingState';
import { CardSkeleton } from '@/components/skeletons';
import { MessageSquare } from 'lucide-react';

const DebatePreferences = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(5);
  const [defaultDuration, setDefaultDuration] = useLocalStorage('default-duration', 5);
  const [contextUploaded, setContextUploaded] = useState(false);
  const { isLoading } = useLoadingState({ minDuration: 700, delay: 250 });
  const [debateTopic, setDebateTopic] = useState('');
  const [position, setPosition] = useState('affirmative');

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const handleStartDebate = () => {
    setDefaultDuration(duration);
    localStorage.setItem('debate-topic', debateTopic);
    localStorage.setItem('debate-position', position);
    // Navigate to audio recording view
    navigate('/audio-recording', { 
      state: { 
        mode: 'debate',
        title: debateTopic,
        duration: duration 
      } 
    });
  };

  const handleContextUpload = (context: string) => {
    setContextUploaded(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      <div className="flex-1 flex flex-col overflow-hidden p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageSquare className="w-8 h-8" />
              Debate Mode Preferences
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure your debate session settings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Debate Settings</CardTitle>
              <CardDescription>
                Set up your debate topic and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Debate Topic</Label>
                <input
                  id="topic"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter the debate topic"
                  value={debateTopic}
                  onChange={(e) => setDebateTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Your Position</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <option value="affirmative">Affirmative</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Time Limit: {duration} minutes</Label>
                </div>
                <Slider
                  value={[duration]}
                  min={1}
                  max={15}
                  step={1}
                  onValueChange={handleDurationChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 min</span>
                  <span>15 min</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Context (Optional)</Label>
                <ContextUpload onUploadComplete={handleContextUpload} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button onClick={handleStartDebate} disabled={!debateTopic}>
                Start Debate
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DebatePreferences;
