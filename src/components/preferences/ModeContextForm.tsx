import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SessionType } from '@/types/speech';
import { MessageSquare, Presentation, Mic } from 'lucide-react';

interface ModeContextFormProps {
  mode: SessionType;
  onContextChange?: (context: Record<string, string>) => void;
}

const ModeContextForm = ({ mode, onContextChange }: ModeContextFormProps) => {
  const [context, setContext] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    const updated = { ...context, [key]: value };
    setContext(updated);
    onContextChange?.(updated);
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'debate':
        return {
          color: 'debate',
          icon: MessageSquare,
          title: 'Debate Context',
          description: 'Prepare your arguments and rebuttals',
          fields: [
            { key: 'stance', label: 'Your Stance', placeholder: 'e.g., "Technology improves education"', type: 'input' },
            { key: 'arguments', label: 'Key Arguments (3-5 points)', placeholder: 'List your main arguments...', type: 'textarea', rows: 4 },
            { key: 'counterArguments', label: 'Expected Counter-Arguments', placeholder: 'What might opponents say?', type: 'textarea', rows: 3 },
            { key: 'evidence', label: 'Supporting Evidence', placeholder: 'Facts, statistics, examples...', type: 'textarea', rows: 3 }
          ]
        };
      case 'presentation':
        return {
          color: 'presentation',
          icon: Presentation,
          title: 'Presentation Context',
          description: 'Structure your presentation flow',
          fields: [
            { key: 'topic', label: 'Presentation Topic', placeholder: 'e.g., "Q4 Sales Report"', type: 'input' },
            { key: 'audience', label: 'Target Audience', placeholder: 'e.g., "Executive team, stakeholders"', type: 'input' },
            { key: 'mainMessage', label: 'Main Message', placeholder: 'What\'s your key takeaway?', type: 'textarea', rows: 2 },
            { key: 'outline', label: 'Presentation Outline', placeholder: '1. Introduction\n2. Main points\n3. Conclusion', type: 'textarea', rows: 5 },
            { key: 'talkingPoints', label: 'Key Talking Points', placeholder: 'Bullet points for each section...', type: 'textarea', rows: 4 }
          ]
        };
      case 'speech':
        return {
          color: 'speech',
          icon: Mic,
          title: 'Speech Context',
          description: 'Outline your speech structure',
          fields: [
            { key: 'topic', label: 'Speech Topic', placeholder: 'e.g., "Overcoming challenges"', type: 'input' },
            { key: 'type', label: 'Speech Type', placeholder: 'Informative / Persuasive / Entertaining', type: 'input' },
            { key: 'opening', label: 'Opening Hook', placeholder: 'How will you grab attention?', type: 'textarea', rows: 2 },
            { key: 'keyPoints', label: 'Key Points (3-5)', placeholder: 'Main ideas to cover...', type: 'textarea', rows: 4 },
            { key: 'closing', label: 'Closing Statement', placeholder: 'End with impact...', type: 'textarea', rows: 2 }
          ]
        };
    }
  };

  const config = getModeConfig();
  const Icon = config.icon;

  return (
    <Card className="p-6 space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-[hsl(var(--${config.color}-muted))]`}>
          <Icon className={`h-5 w-5 text-[hsl(var(--${config.color}))]`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {config.fields.map((field, index) => (
          <div key={field.key} className={`space-y-2 animate-slide-up stagger-${Math.min(index + 1, 5)}`}>
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label}
            </Label>
            {field.type === 'input' ? (
              <Input
                id={field.key}
                placeholder={field.placeholder}
                value={context[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="transition-smooth"
              />
            ) : (
              <Textarea
                id={field.key}
                placeholder={field.placeholder}
                value={context[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                rows={field.rows}
                className="transition-smooth resize-none"
              />
            )}
          </div>
        ))}
      </div>

      {/* Helper Text */}
      <div className={`p-3 rounded-lg bg-[hsl(var(--${config.color}-muted))] border border-[hsl(var(--${config.color}))] animate-slide-up stagger-5`}>
        <p className={`text-sm text-[hsl(var(--${config.color}))] font-medium`}>
          💡 Pro Tip: {mode === 'debate' 
            ? 'Practice responding to counter-arguments to strengthen your position.'
            : mode === 'presentation'
            ? 'Time yourself per section to ensure balanced coverage.'
            : 'Vary your tone and pace to keep your audience engaged.'}
        </p>
      </div>
    </Card>
  );
};

export default ModeContextForm;
