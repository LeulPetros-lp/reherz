import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { SessionType } from '@/types/speech';
import { CheckCircle2, Circle } from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
}

interface PreRecordingChecklistProps {
  mode: SessionType;
  onComplete?: (isComplete: boolean) => void;
}

const PreRecordingChecklist = ({ mode, onComplete }: PreRecordingChecklistProps) => {
  const getChecklistItems = (): ChecklistItem[] => {
    switch (mode) {
      case 'debate':
        return [
          { id: 'stance', label: 'Position clearly defined', description: 'Know what you\'re arguing for' },
          { id: 'arguments', label: 'Key arguments prepared', description: '3-5 strong points ready' },
          { id: 'counters', label: 'Counter-arguments anticipated', description: 'Ready to rebut opposition' },
          { id: 'evidence', label: 'Evidence and facts noted', description: 'Support your claims' },
          { id: 'confidence', label: 'Feeling confident', description: 'Ready to speak assertively' }
        ];
      case 'presentation':
        return [
          { id: 'slides', label: 'Presentation slides ready', description: 'Content organized and loaded' },
          { id: 'flow', label: 'Flow rehearsed', description: 'Smooth transitions between sections' },
          { id: 'timing', label: 'Timing checked', description: 'Fits within allocated time' },
          { id: 'talking-points', label: 'Talking points memorized', description: 'Key messages clear in mind' },
          { id: 'audience', label: 'Audience in mind', description: 'Tailored to their needs' }
        ];
      case 'speech':
        return [
          { id: 'topic', label: 'Topic and message clear', description: 'Know your core message' },
          { id: 'structure', label: 'Structure planned', description: 'Opening, body, closing ready' },
          { id: 'notes', label: 'Notes accessible (if needed)', description: 'Quick reference available' },
          { id: 'key-points', label: 'Key points memorized', description: 'Main ideas locked in' },
          { id: 'energy', label: 'Energy and tone ready', description: 'Prepared to engage' }
        ];
    }
  };

  const items = getChecklistItems();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const handleCheck = (id: string, value: boolean) => {
    const updated = { ...checked, [id]: value };
    setChecked(updated);
    
    // Check if all items are checked
    const allChecked = items.every(item => updated[item.id]);
    onComplete?.(allChecked);
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const progress = (checkedCount / items.length) * 100;

  const getModeColor = () => {
    switch (mode) {
      case 'debate': return 'debate';
      case 'presentation': return 'presentation';
      case 'speech': return 'speech';
    }
  };

  const color = getModeColor();

  return (
    <Card className="p-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pre-Recording Checklist</h3>
          <span className={`text-sm font-medium ${checkedCount === items.length ? 'text-success' : `text-[hsl(var(--${color}))]`}`}>
            {checkedCount}/{items.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`absolute inset-y-0 left-0 bg-[hsl(var(--${color}))] transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div 
            key={item.id}
            className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-secondary/50 animate-slide-up stagger-${Math.min(index + 1, 5)}`}
          >
            <Checkbox
              id={item.id}
              checked={checked[item.id] || false}
              onCheckedChange={(value) => handleCheck(item.id, value as boolean)}
              className="mt-1"
            />
            <label 
              htmlFor={item.id}
              className="flex-1 cursor-pointer space-y-1"
            >
              <div className="flex items-center gap-2">
                {checked[item.id] ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`font-medium ${checked[item.id] ? 'line-through text-muted-foreground' : ''}`}>
                  {item.label}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground pl-6">
                  {item.description}
                </p>
              )}
            </label>
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {checkedCount === items.length && (
        <div className={`p-4 rounded-lg bg-[hsl(var(--${color}-muted))] border border-[hsl(var(--${color}))] animate-bounce-in`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className={`h-5 w-5 text-[hsl(var(--${color}))]`} />
            <p className={`font-medium text-[hsl(var(--${color}))]`}>
              You're all set! Ready to start recording.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PreRecordingChecklist;
