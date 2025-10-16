import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppSidebar from '@/components/AppSidebar';
import ContextUpload from '@/components/ContextUpload';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const RecordingPreferences = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(5);
  const [defaultDuration, setDefaultDuration] = useLocalStorage('default-duration', 5);
  const [sessions] = useLocalStorage('speech-sessions', []);
  const [contextUploaded, setContextUploaded] = useState(false);

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const handleConfirm = () => {
    // Save the selected duration to local storage
    setDefaultDuration(duration);
    // Navigate to the camera view
    navigate('/camera-view');
  };

  const handleContextUpload = (context: string) => {
    setContextUploaded(true);
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar */}
      <AppSidebar
        sessions={sessions}
        onStartSession={() => {}}
        onSettingsClick={() => {}}
        selectedSessionId=""
        onSelectSession={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 space-y-8">

            <div>
              <h1 className="text-3xl font-bold">Recording Preferences</h1>
              <p className="text-muted-foreground mt-2">Configure your session settings before recording</p>
            </div>

          <ContextUpload onUpload={handleContextUpload} />

            
            <div className="space-y-6">
              <Card className="p-6 shadow-card border border-border">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Recording Duration</h2>
                    <p className="text-muted-foreground">
                      Select how long you want your recording session to be.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>1 minute</span>
                      <span>{duration} minutes</span>
                      <span>15 minutes</span>
                    </div>
                    <Slider
                      defaultValue={[defaultDuration]}
                      value={[duration]}
                      min={1}
                      max={15}
                      step={1}
                      onValueChange={handleDurationChange}
                    />
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleConfirm} 
                      className="w-full"
                    >
                      Continue to Camera View
                    </Button>
                  </div>
                </div>
              </Card>
              

            </div>

            {contextUploaded && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md">
                Context successfully uploaded! Your recording will use this context.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecordingPreferences;