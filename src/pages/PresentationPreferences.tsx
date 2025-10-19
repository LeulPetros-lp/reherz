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
import { Presentation } from 'lucide-react';

const PresentationPreferences = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(10);
  const [defaultDuration, setDefaultDuration] = useLocalStorage('default-duration', 10);
  const [contextUploaded, setContextUploaded] = useState(false);
  const { isLoading } = useLoadingState({ minDuration: 700, delay: 250 });
  const [presentationTitle, setPresentationTitle] = useState('');
  const [presentationType, setPresentationType] = useState('informative');

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const handleStartPresentation = () => {
    setDefaultDuration(duration);
    localStorage.setItem('presentation-title', presentationTitle);
    localStorage.setItem('presentation-type', presentationType);
    navigate('/camera-view');
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
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Presentation className="w-8 h-8" />
                Presentation Mode
              </h1>
              <span className="text-xs px-2 py-1 rounded-full bg-white text-primary border border-primary">
                Beta
              </span>
            </div>
            <p className="text-muted-foreground mt-2">
              Configure your presentation session settings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Presentation Settings</CardTitle>
              <CardDescription>
                Set up your presentation details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Presentation Title</Label>
                <input
                  id="title"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter presentation title"
                  value={presentationTitle}
                  onChange={(e) => setPresentationTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Presentation Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={presentationType}
                  onChange={(e) => setPresentationType(e.target.value)}
                >
                  <option value="informative">Informative</option>
                  <option value="persuasive">Persuasive</option>
                  <option value="demonstrative">Demonstrative</option>
                  <option value="inspirational">Inspirational</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Time Limit: {duration} minutes</Label>
                </div>
                <Slider
                  value={[duration]}
                  min={5}
                  max={60}
                  step={5}
                  onValueChange={handleDurationChange}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 min</span>
                  <span>60 min</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Slides or Notes (Optional)</Label>
                <ContextUpload onUploadComplete={handleContextUpload} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button onClick={handleStartPresentation} disabled={!presentationTitle}>
                Start Presentation
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PresentationPreferences;
