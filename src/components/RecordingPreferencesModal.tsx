import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export interface RecordingPreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (duration: number) => void;
  defaultDuration?: number;
}

export default function RecordingPreferencesModal({
  open,
  onOpenChange,
  onConfirm,
  defaultDuration = 5,
}: RecordingPreferencesModalProps) {
  const [duration, setDuration] = useState(defaultDuration);

  const handleDurationChange = (value: number[]) => {
    setDuration(value[0]);
  };

  const handleConfirm = () => {
    onConfirm(duration);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Recording Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Recording Duration</h3>
            <p className="text-sm text-muted-foreground">
              Select how long you want your recording session to be.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>1 min</span>
              <span>{duration} min</span>
              <span>15 min</span>
            </div>
            <Slider
              value={[duration]}
              min={1}
              max={15}
              step={1}
              onValueChange={handleDurationChange}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Start Recording
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
