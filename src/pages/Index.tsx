import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import SessionRecorder from '@/components/SessionRecorder';
import RecordingPreferencesModal from '@/components/RecordingPreferencesModal';
import AppSidebar from '@/components/AppSidebar';
import SpeechScoreCard from '@/components/SpeechScoreCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useLoadingState } from '@/hooks/useLoadingState';
import StartSessionModal from '@/components/StartSessionModal';
import SettingsModal from '@/components/SettingsModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles as spark, Sparkle, Sparkles } from "lucide-react";
import { ChartSkeleton } from '@/components/skeletons';

import { SpeechSession, SpeechScore } from '@/types/speech';
import { BarChart3, Clock, Activity, Volume2, Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Generate data points for a 2-minute session with points every 30 seconds
const generateSessionData = () => {
  const data = [];
  const totalDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
  const interval = 30 * 1000; // 30 seconds in milliseconds
  const now = new Date();
  
  for (let time = 0; time <= totalDuration; time += interval) {
    const timestamp = new Date(now.getTime() - (totalDuration - time));
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const timeLabel = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Add some natural variation to the scores
    const basePose = 7.5 + Math.random() * 2; // Base between 7.5-9.5
    const baseTone = 7.5 + Math.random() * 2; // Base between 7.5-9.5
    
    // Add some natural variation over time
    const timeFactor = Math.sin((time / totalDuration) * Math.PI) * 0.5;
    
    data.push({
      time: timeLabel,
      pose: Math.min(10, Math.max(7, basePose + (Math.random() - 0.5) + timeFactor)),
      tone: Math.min(10, Math.max(7, baseTone + (Math.random() - 0.5) + timeFactor)),
      timestamp: timestamp.toISOString()
    });
  }
  
  return data;
};

const sessionData = generateSessionData();
const latestSession = sessionData[sessionData.length - 1];

const Index = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useLocalStorage('speech-sessions', []);
  const { isLoading } = useLoadingState({ minDuration: 800, delay: 300 });

  const [defaultDuration, setDefaultDuration] = useState(5);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(
    sessions[0]?.id
  );
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(5);

  const handleSessionComplete = useCallback((videoBlob: Blob) => {
    // In a real app, you would process the video and generate scores
    const mockScore: SpeechScore = {
      overall: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      clarity: Math.floor(Math.random() * 30) + 70,
      pacing: Math.floor(Math.random() * 30) + 70,
      confidence: Math.floor(Math.random() * 30) + 70,
    };

    const newSession: SpeechSession = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      date: new Date(),
      duration: Math.floor(videoBlob.size / 1000000), // Rough duration in seconds based on file size
      score: mockScore,
      videoUrl: URL.createObjectURL(videoBlob),
    };

    setSessions(prevSessions => [newSession, ...prevSessions]);
    setSelectedSessionId(newSession.id);
    setRecordedVideo(videoBlob);
    setIsRecording(false);
    navigate('/data-analysis');
  }, [sessions.length]);

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setSessions(prevSessions => {
      const updatedSessions = prevSessions.filter(session => session.id !== sessionId);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(updatedSessions[0]?.id);
      }
      return updatedSessions;
    });
  };

  const startNewSession = () => {
    setSessionModalOpen(false);
    setPreferencesModalOpen(true);
  };

  const handleStartRecording = (duration: number) => {
    setRecordingDuration(duration);
    setPreferencesModalOpen(false);
    setIsRecording(true);
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0] || null;
  const averageScore = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + s.score.overall, 0) / sessions.length)
    : 0;

  return (
    <div className="min-h-screen w-full flex flex-col">


        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 md:py-12 space-y-8">
            <div className="animate-slide-down">
              <h1 className="text-3xl font-bold">Last Session (Session 2)</h1>
              <p className="text-muted-foreground mt-2">Practice makes you better they say... Try again if you are not satisfied with your score</p>
            </div>
            
            {/* Session Summary */}
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <Card className="p-6 shadow-card border border-border animate-slide-up">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Session Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Session: {new Date(sessionData[0]?.timestamp).toLocaleTimeString()} - {new Date(sessionData[sessionData.length - 1]?.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <div className="w-3 h-3 rounded-full bg-primary mr-1.5"></div>
                      <span>Average Pose score</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground ml-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5"></div>
                      <span>Average Tone score</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sessionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis 
                        domain={[6, 10]} 
                        axisLine={false} 
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        width={20}
                        tickCount={5}
                        tickFormatter={(value) => value.toFixed(0)}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                        }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="pose" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tone" 
                        stroke="rgb(16, 185, 129)" 
                        strokeWidth={2}
                        dot={false}
                        strokeDasharray="5 5"
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Latest Pose Score</p>
                        <p className="text-2xl font-bold">{latestSession.pose.toFixed(1)}/10</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Volume2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Latest Tone Score</p>
                        <p className="text-2xl font-bold">{latestSession.tone.toFixed(1)}/10</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/chat-analysis', { state: { sessionData } })}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Explain my data
                </Button>
              </Card>
            )}
            {/*  */}
       

          </div>
          
        </main>
        


      <StartSessionModal
        open={sessionModalOpen}
        onOpenChange={setSessionModalOpen}
        onStartSession={startNewSession}
        defaultDuration={defaultDuration}
      />

      <RecordingPreferencesModal
        open={preferencesModalOpen}
        onOpenChange={setPreferencesModalOpen}
        onConfirm={handleStartRecording}
        defaultDuration={defaultDuration}
      />
      
      {isRecording && (
        <SessionRecorder
          onStop={handleSessionComplete}
          onDelete={() => setIsRecording(false)}
          duration={recordingDuration}
        />
      )}

      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        defaultDuration={defaultDuration}
        onSave={setDefaultDuration}
      />
    </div>
  );
};

export default Index;
