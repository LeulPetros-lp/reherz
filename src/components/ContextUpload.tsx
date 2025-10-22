import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { SessionType } from '@/types/speech';
import DragDropZone from './upload/DragDropZone';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface ContextUploadProps {
  onUpload?: (context: string) => void;
  mode?: SessionType;
}

const ContextUpload = ({ onUpload, mode = 'speech' }: ContextUploadProps) => {
  const [uploadedContext, setUploadedContext] = useLocalStorage<string>('presentation-context', '');

  const handleFileUpload = (file: File, content: string) => {
    setUploadedContext(content);
    if (onUpload) {
      onUpload(content);
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'debate': return 'Upload Debate Materials';
      case 'presentation': return 'Upload Presentation Context';
      case 'speech': return 'Upload Speech Notes';
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'debate': return 'Upload your arguments, counter-points, or reference materials';
      case 'presentation': return 'Upload slide notes, talking points, or reference documents';
      case 'speech': return 'Upload speech outline, notes, or key points';
    }
  };

  return (
    <div className="space-y-4">
      <div className="animate-slide-down">
        <h3 className="text-lg font-semibold mb-1">{getModeTitle()}</h3>
        <p className="text-sm text-muted-foreground">{getModeDescription()}</p>
      </div>
      
      <DragDropZone 
        onFileUpload={handleFileUpload}
        acceptedTypes=".txt,.md"
        maxSizeMB={10}
        mode={mode}
      />
      
      {uploadedContext && (
        <Card className="p-4 bg-secondary/50 animate-slide-up">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">Uploaded Content:</p>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {uploadedContext.substring(0, 200)}...
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContextUpload;