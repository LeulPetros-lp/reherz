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
import { Mic } from 'lucide-react';

const SpeechPreferences = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(5);
  const [defaultDuration, setDefaultDuration] = useLocalStorage('default-duration', 5);
  const [contextUploaded, setContextUploaded] = useState(false);
  const { isLoading } = useLoadingState({ minDuration: 700, delay: 250 });
  const [speechTitle, setSpeechTitle] = useState('');
  const [speechType, setSpeechType] = useState('prepared');

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const handleStartSpeech = () => {
    setDefaultDuration(duration);
    localStorage.setItem('speech-title', speechTitle);
    localStorage.setItem('speech-type', speechType);
    // Navigate to audio recording view
    navigate('/audio-recording', { 
      state: { 
        mode: 'speech',
        title: speechTitle,
        type: speechType,
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
              <Mic className="w-8 h-8" />
              Speech Mode
            </h1>
            <p className="text-muted-foreground mt-2">
              Configure your speech session settings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Speech Settings</CardTitle>
              <CardDescription>
                Set up your speech details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Speech Title</Label>
                <input
                  id="title"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter speech title"
                  value={speechTitle}
                  onChange={(e) => setSpeechTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Speech Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={speechType}
                  onChange={(e) => setSpeechType(e.target.value)}
                >
                  <option value="prepared">Prepared</option>
                  <option value="impromptu">Impromptu</option>
                  <option value="toast">Toast</option>
                  <option value="keynote">Keynote</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Time Limit: {duration} minutes</Label>
                </div>
                <Slider
                  value={[duration]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={handleDurationChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Speech Notes (Optional)</Label>
                <ContextUpload onUploadComplete={handleContextUpload} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button onClick={handleStartSpeech} disabled={!speechTitle}>
                Start Speech
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeechPreferences;
