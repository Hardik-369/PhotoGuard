import { useCallback, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSelectFile(file);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPG, PNG, TIFF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    onFileSelect(file);
  };

  return (
    <Card className="border-2 border-dashed border-border hover:border-accent transition-colors duration-200">
      <div
        className={`p-12 text-center transition-all duration-200 ${
          dragActive ? "bg-yellow-light border-accent" : ""
        } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 rounded-full bg-secondary">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Upload Your Photo</h3>
            <p className="text-muted-foreground">
              Drag and drop your image here, or click to browse
            </p>
          </div>

          <Button 
            variant="outline" 
            className="relative overflow-hidden"
            disabled={isProcessing}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            Choose File
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>All processing happens locally in your browser</span>
          </div>
        </div>
      </div>
    </Card>
  );
};