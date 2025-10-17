import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import AppSidebar from '@/components/AppSidebar';
import { ArrowLeft, Brain, TrendingUp, MessageSquare, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const DataAnalysis = () => {
  const navigate = useNavigate();
  const [sessions] = useLocalStorage('speech-sessions', []);

  // Placeholder data for AI analysis
  const analysisData = {
    overallScore: 82,
    strengths: [
      { title: "Strong Vocal Clarity", description: "Your articulation and pronunciation are excellent. Words are clear and easy to understand." },
      { title: "Good Pacing", description: "You maintain a steady rhythm that keeps the audience engaged without rushing." },
      { title: "Confident Body Language", description: "Your posture and gestures convey confidence and authority." }
    ],
    improvements: [
      { title: "Reduce Filler Words", description: "Consider reducing the use of 'um' and 'uh' by 40%. Practice pausing instead." },
      { title: "Eye Contact Variance", description: "Try to distribute eye contact more evenly across different areas of the room." },
      { title: "Hand Gesture Consistency", description: "Your hand gestures could be more purposeful and aligned with your key points." }
    ],
    insights: [
      "Your confidence level increases by 15% after the 2-minute mark",
      "Peak performance occurs in the middle third of your session",
      "Your tone variation is strongest when discussing familiar topics"
    ]
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
            {/* Header */}
            <div className="animate-slide-down">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                AI Data Analysis
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive insights and recommendations based on your performance
              </p>
            </div>

            {/* Overall Score Card */}
            <Card className="p-6 shadow-card border border-border animate-slide-up hover-lift">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 animate-pulse-glow">
                  <span className="text-4xl font-bold text-primary">{analysisData.overallScore}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Overall Performance Score</h3>
                  <p className="text-muted-foreground text-sm mt-1">Based on your last session analysis</p>
                </div>
                <Progress value={analysisData.overallScore} className="h-3" />
              </div>
            </Card>

            {/* Strengths Section */}
            <div className="space-y-4 animate-slide-up stagger-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h2 className="text-2xl font-bold">Your Strengths</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {analysisData.strengths.map((strength, index) => (
                  <Card 
                    key={index} 
                    className={`p-5 shadow-card border border-border hover-lift transition-smooth animate-scale-in stagger-${index + 1}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="font-semibold mb-2">{strength.title}</h3>
                    <p className="text-sm text-muted-foreground">{strength.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="space-y-4 animate-slide-up stagger-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h2 className="text-2xl font-bold">Areas for Improvement</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {analysisData.improvements.map((improvement, index) => (
                  <Card 
                    key={index} 
                    className={`p-5 shadow-card border border-border hover-lift transition-smooth animate-scale-in stagger-${index + 1}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mb-3">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold mb-2">{improvement.title}</h3>
                    <p className="text-sm text-muted-foreground">{improvement.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="space-y-4 animate-slide-up stagger-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-bold">Key Insights</h2>
              </div>
              <Card className="p-6 shadow-card border border-border hover-lift">
                <div className="space-y-4">
                  {analysisData.insights.map((insight, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start gap-3 p-4 rounded-lg bg-secondary/20 transition-smooth animate-slide-right stagger-${index + 1}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <p className="text-sm flex-1">{insight}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Action Card */}
            <Card className="p-6 shadow-card border border-primary/20 bg-primary/5 animate-bounce-in">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Ready to Improve?</h3>
                <p className="text-muted-foreground">
                  Apply these insights in your next practice session to see measurable improvement
                </p>
                <Button 
                  onClick={() => navigate('/recording-preferences')}
                  className="hover-scale active-press"
                >
                  Start New Practice Session
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DataAnalysis;
