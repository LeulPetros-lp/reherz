import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ContextUploadProps {
  onUpload?: (context: string) => void;
}

const ContextUpload = ({ onUpload }: ContextUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState<string>('');
  const [uploadedContext, setUploadedContext] = useLocalStorage<string>('presentation-context', '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setContext(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleUpload = () => {
    if (context) {
      setUploadedContext(context);
      if (onUpload) {
        onUpload(context);
      }
    }
  };

  return (
    <Card className="p-6 shadow-card border border-border">
      <h3 className="text-lg font-semibold mb-4">Upload Presentation Context</h3>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <input
            type="file"
            id="context-file"
            accept=".txt,.md,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="context-file" 
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              TXT, MD, DOC, DOCX up to 10MB
            </p>
          </label>
        </div>
        
        {file && (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{file.name}</span>
            <span className="text-muted-foreground">
              ({Math.round(file.size / 1024)} KB)
            </span>
          </div>
        )}
        
    
        
        {uploadedContext && (
          <div className="mt-4">
            <p className="text-sm font-medium">Current Context:</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
              {uploadedContext.substring(0, 150)}...
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContextUpload;