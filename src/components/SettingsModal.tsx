import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Moon, Sun } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDuration: number;
  onSave: (duration: number) => void;
}

const SettingsModal = ({ open, onOpenChange, defaultDuration, onSave }: SettingsModalProps) => {
  const [duration, setDuration] = useState(defaultDuration);
  const { theme, toggleTheme } = useTheme();

  const handleSave = () => {
    onSave(duration);
    onOpenChange(false);
    toast({
      title: "Settings saved",
      description: `Default duration set to ${duration} minutes`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Preferences</DialogTitle>
          <DialogDescription>
            Customize your speech session preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Theme Toggle */}
          <div className="space-y-3 p-4 rounded-lg border border-border bg-secondary/20 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <Label htmlFor="theme-toggle" className="text-base font-medium cursor-pointer">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'dark' 
                      ? 'Using dark theme for reduced eye strain'
                      : 'Using light theme for bright environments'
                    }
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
                className="transition-smooth"
              />
            </div>
          </div>

          {/* Duration Setting */}
          <div className="space-y-2 animate-slide-up stagger-1">
            <Label htmlFor="default-duration">Default Session Duration (minutes)</Label>
            <Input
              id="default-duration"
              type="number"
              min="1"
              max="120"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              This will be used as the default time for new sessions
            </p>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 animate-slide-up stagger-2"
            size="lg"
            onClick={handleSave}
          >
            <Save className="w-5 h-5 mr-2" />
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
