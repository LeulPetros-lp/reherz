import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SpeechScore } from '@/types/speech';
import { TrendingUp } from 'lucide-react';

interface SpeechScoreCardProps {
  score: SpeechScore | null;
  isLive?: boolean;
}

const SpeechScoreCard = ({ score, isLive = false }: SpeechScoreCardProps) => {
  if (!score) {
    return (
      <Card className="p-6 md:p-8 shadow-card animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No Sessions Yet</h3>
          <p className="text-muted-foreground">
            Start your first speech session to see your scores
          </p>
        </div>
      </Card>
    );
  }

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-primary';
    return 'text-destructive';
  };

  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-success';
    if (value >= 60) return 'bg-primary';
    return 'bg-destructive';
  };

  return (
    <Card className="p-6 md:p-8 shadow-card animate-scale-in">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {isLive ? 'Live Score' : 'Latest Score'}
          </h3>
          {isLive && (
            <span className="flex items-center gap-2 text-sm text-primary animate-pulse-subtle">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Recording
            </span>
          )}
        </div>

        {/* Overall Score */}
        <div className="text-center py-4">
          <div className={`text-5xl md:text-6xl font-bold ${getScoreColor(score.overall)}`}>
            {score.overall}
            <span className="text-2xl md:text-3xl">%</span>
          </div>
          <p className="text-muted-foreground mt-2">Overall Performance</p>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Clarity</span>
              <span className={getScoreColor(score.clarity)}>{score.clarity}%</span>
            </div>
            <Progress value={score.clarity} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Pacing</span>
              <span className={getScoreColor(score.pacing)}>{score.pacing}%</span>
            </div>
            <Progress value={score.pacing} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Confidence</span>
              <span className={getScoreColor(score.confidence)}>{score.confidence}%</span>
            </div>
            <Progress value={score.confidence} className="h-2" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpeechScoreCard;
