import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContextUpload from '@/components/ContextUpload';
import ModeContextForm from '@/components/preferences/ModeContextForm';
import PreRecordingChecklist from '@/components/preferences/PreRecordingChecklist';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLoadingState } from '@/hooks/useLoadingState';
import { CardSkeleton } from '@/components/skeletons';
import { MessageSquare, Presentation, Mic, Upload, FileEdit, CheckSquare } from 'lucide-react';
import { SessionType } from '@/types/speech';

const RecordingPreferences = () => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(5);
  const [defaultDuration, setDefaultDuration] = useLocalStorage('default-duration', 5);
  const [sessions] = useLocalStorage('speech-sessions', []);
  const [contextUploaded, setContextUploaded] = useState(false);
  const [checklistComplete, setChecklistComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const { isLoading } = useLoadingState({ minDuration: 700, delay: 250 });
  const [sessionType, setSessionType] = useState<SessionType>('speech');

  useEffect(() => {
    // Get the selected session type from localStorage
    const storedType = localStorage.getItem('selected-session-type') as SessionType | null;
    if (storedType) {
      setSessionType(storedType);
    }
  }, []);

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
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 space-y-8">
            <div className="animate-slide-down space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">Recording Preferences</h1>
                {sessionType === 'debate' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--debate-muted))] border border-[hsl(var(--debate))] text-[hsl(var(--debate))] text-sm font-medium animate-pulse-subtle">
                    <MessageSquare className="w-4 h-4" /> Debate Mode
                  </div>
                )}
                {sessionType === 'presentation' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--presentation-muted))] border border-[hsl(var(--presentation))] text-[hsl(var(--presentation))] text-sm font-medium animate-pulse-subtle">
                    <Presentation className="w-4 h-4" /> Presentation Mode
                  </div>
                )}
                {sessionType === 'speech' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--speech-muted))] border border-[hsl(var(--speech))] text-[hsl(var(--speech))] text-sm font-medium animate-pulse-subtle">
                    <Mic className="w-4 h-4" /> Speech Mode
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">Configure your session settings before recording</p>
            </div>

            {isLoading ? (
              <>
                <CardSkeleton lines={3} hasButton={false} />
                <CardSkeleton lines={4} hasButton={true} />
              </>
            ) : (
              <div className="space-y-6">
                {/* Preparation Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up stagger-1">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="context" className="gap-2">
                      <FileEdit className="h-4 w-4" />
                      Context
                    </TabsTrigger>
                    <TabsTrigger value="checklist" className="gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Checklist
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-6 space-y-4">
                    <ContextUpload onUpload={handleContextUpload} mode={sessionType} />
                  </TabsContent>

                  <TabsContent value="context" className="mt-6">
                    <ModeContextForm mode={sessionType} />
                  </TabsContent>

                  <TabsContent value="checklist" className="mt-6">
                    <PreRecordingChecklist mode={sessionType} onComplete={setChecklistComplete} />
                  </TabsContent>
                </Tabs>

                {/* Duration Settings */}
                <Card className="p-6 shadow-card border border-border animate-slide-up stagger-2">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Recording Duration</h2>
                      <p className="text-muted-foreground">
                        Select how long you want your recording session to be.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">1 min</span>
                        <span className="font-semibold text-lg">{duration} minutes</span>
                        <span className="text-muted-foreground">15 min</span>
                      </div>
                      <Slider
                        defaultValue={[defaultDuration]}
                        value={[duration]}
                        min={1}
                        max={15}
                        step={1}
                        onValueChange={handleDurationChange}
                        className="py-2"
                      />
                    </div>
                  </div>
                </Card>

                {/* Continue Button */}
                <div className="animate-slide-up stagger-3">
                  <Button 
                    onClick={handleConfirm} 
                    className="w-full py-6 text-lg"
                    size="lg"
                  >
                    Start Recording Session
                  </Button>
                  
                  {checklistComplete && (
                    <p className="text-sm text-success text-center mt-3 flex items-center justify-center gap-2 animate-bounce-in">
                      <CheckSquare className="h-4 w-4" />
                      All set! You're ready to record.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RecordingPreferences;