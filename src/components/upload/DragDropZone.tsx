import { useState, useCallback, DragEvent } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DragDropZoneProps {
  onFileUpload: (file: File, content: string) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  mode?: 'debate' | 'presentation' | 'speech';
}

const DragDropZone = ({ 
  onFileUpload, 
  acceptedTypes = '.txt,.md', 
  maxSizeMB = 10,
  mode = 'speech'
}: DragDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Mode-specific colors
  const modeColors = {
    debate: 'border-[hsl(var(--debate))] bg-[hsl(var(--debate-muted))]',
    presentation: 'border-[hsl(var(--presentation))] bg-[hsl(var(--presentation-muted))]',
    speech: 'border-[hsl(var(--speech))] bg-[hsl(var(--speech-muted))]'
  };

  const modeTextColors = {
    debate: 'text-[hsl(var(--debate))]',
    presentation: 'text-[hsl(var(--presentation))]',
    speech: 'text-[hsl(var(--speech))]'
  };

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (selectedFile: File): boolean => {
    setError('');
    
    // Check file size
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }

    // Check file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedTypes.split(',').map(ext => ext.trim());
    if (!acceptedExtensions.includes(fileExtension)) {
      setError(`File type not supported. Please upload: ${acceptedTypes}`);
      return false;
    }

    return true;
  };

  const processFile = (selectedFile: File) => {
    if (!validateFile(selectedFile)) return;

    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPreview(content.substring(0, 300));
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        onFileUpload(selectedFile, content);
      }, 300);
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
      setIsUploading(false);
      setFile(null);
    };

    reader.readAsText(selectedFile);
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview('');
    setUploadProgress(0);
    setError('');
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <Card 
          className={`p-8 transition-all duration-300 ${
            isDragging 
              ? `${modeColors[mode]} border-2 scale-105` 
              : 'border-2 border-dashed border-border hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="context-file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="context-file" 
            className="flex flex-col items-center justify-center cursor-pointer space-y-3"
          >
            <Upload className={`h-12 w-12 ${modeTextColors[mode]} animate-bounce-in`} />
            <div className="text-center">
              <p className="text-base font-semibold mb-1">
                {isDragging ? 'Drop your file here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">
                {acceptedTypes.toUpperCase().replace(/\./g, '')} up to {maxSizeMB}MB
              </p>
            </div>
          </label>
        </Card>
      ) : (
        <Card className="p-6 space-y-4 animate-scale-in">
          {/* File Info */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <FileText className={`h-5 w-5 mt-1 flex-shrink-0 ${modeTextColors[mode]}`} />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleRemove}
                className="hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading...</span>
                <span className={`font-medium ${modeTextColors[mode]}`}>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Success State */}
          {!isUploading && uploadProgress === 100 && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>File uploaded successfully</span>
            </div>
          )}

          {/* Preview */}
          {preview && !isUploading && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Preview:</p>
              <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground max-h-32 overflow-y-auto">
                {preview}
                {preview.length >= 300 && '...'}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm animate-slide-down">
          {error}
        </div>
      )}
    </div>
  );
};

export default DragDropZone;
