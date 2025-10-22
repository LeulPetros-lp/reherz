import { SessionType } from '@/types/speech';

export const getModeColor = (mode: SessionType): string => {
  switch (mode) {
    case 'debate':
      return 'hsl(var(--debate))';
    case 'presentation':
      return 'hsl(var(--presentation))';
    case 'speech':
      return 'hsl(var(--speech))';
  }
};

export const getModeColorMuted = (mode: SessionType): string => {
  switch (mode) {
    case 'debate':
      return 'hsl(var(--debate-muted))';
    case 'presentation':
      return 'hsl(var(--presentation-muted))';
    case 'speech':
      return 'hsl(var(--speech-muted))';
  }
};

export const getModeColorClass = (mode: SessionType): string => {
  switch (mode) {
    case 'debate':
      return 'text-[hsl(var(--debate))]';
    case 'presentation':
      return 'text-[hsl(var(--presentation))]';
    case 'speech':
      return 'text-[hsl(var(--speech))]';
  }
};

export const getModeBgClass = (mode: SessionType): string => {
  switch (mode) {
    case 'debate':
      return 'bg-[hsl(var(--debate-muted))]';
    case 'presentation':
      return 'bg-[hsl(var(--presentation-muted))]';
    case 'speech':
      return 'bg-[hsl(var(--speech-muted))]';
  }
};

export const getModeBorderClass = (mode: SessionType): string => {
  switch (mode) {
    case 'debate':
      return 'border-[hsl(var(--debate))]';
    case 'presentation':
      return 'border-[hsl(var(--presentation))]';
    case 'speech':
      return 'border-[hsl(var(--speech))]';
  }
};

export const getModeInfo = (mode: SessionType) => {
  switch (mode) {
    case 'debate':
      return {
        name: 'Debate',
        description: 'Practice argumentative skills',
        color: 'debate',
        tips: [
          'Speak assertively and confidently',
          'Address counter-arguments directly',
          'Use evidence to support your points',
          'Maintain composure under pressure'
        ]
      };
    case 'presentation':
      return {
        name: 'Presentation',
        description: 'Deliver structured presentations',
        color: 'presentation',
        tips: [
          'Make eye contact with your audience',
          'Use hand gestures naturally',
          'Pace yourself through sections',
          'Emphasize key takeaways'
        ]
      };
    case 'speech':
      return {
        name: 'Speech',
        description: 'General public speaking',
        color: 'speech',
        tips: [
          'Vary your tone and pace',
          'Pause for emphasis',
          'Connect with your audience emotionally',
          'Practice your delivery'
        ]
      };
  }
};
