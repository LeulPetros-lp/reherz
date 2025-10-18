import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Brain, TrendingUp, MessageSquare, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { ChartSkeleton } from '@/components/skeletons';

const DataAnalysis = () => {
  const navigate = useNavigate();

  interface BackendScore { metric: string; value: number; max_value: number }
  interface BackendResponse {
    transcript: string;
    summary: string;
    overall_score: number;
    scores: BackendScore[];
  }

  const { data: backendData, isLoading: analysisLoading } = useQuery<BackendResponse>({
    queryKey: ['session-analysis'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8000/api/analysis', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to fetch analysis');
      return res.json();
    },
  });

  console.log(backendData)

  if (analysisLoading || !backendData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <ChartSkeleton />
      </div>
    );
  }

  // Transform backend data to match frontend expectations
  const analysisData = {
    overallScore: Math.round(backendData.overall_score),
    transcript: backendData.transcript,
    summary: backendData.summary,
    scores: backendData.scores,
    // Generate strengths and improvements from scores
    strengths: backendData.scores
      .filter(score => score.value / score.max_value >= 0.7) // Scores above 70%
      .map(score => ({
        title: `Strong ${score.metric}`,
        description: `Your ${score.metric.toLowerCase()} is excellent with a score of ${Math.round(score.value)}/100.`
      })),
    improvements: backendData.scores
      .filter(score => score.value / score.max_value < 0.7) // Scores below 70%
      .map(score => ({
        title: `Improve ${score.metric}`,
        description: `Your ${score.metric.toLowerCase()} could use some work. Current score: ${Math.round(score.value)}/100.`
      })),
    insights: [
      'Your confidence level increases by 15% after the 2-minute mark',
      'Peak performance occurs in the middle third of your session',
      'Your tone variation is strongest when discussing familiar topics',
    ]
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
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
                  <span className="text-4xl font-bold text-primary">{('overallScore' in analysisData ? analysisData.overallScore : (analysisData as BackendResponse).overall_score) ?? 0}</span>
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
  );
};

export default DataAnalysis;
