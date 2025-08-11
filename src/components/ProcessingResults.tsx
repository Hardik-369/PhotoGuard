import { Download, CheckCircle, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProcessingResult } from "@/utils/metadataProcessor";

interface ProcessingResultsProps {
  result: ProcessingResult;
  onDownload: () => void;
  onProcessAnother: () => void;
}

export const ProcessingResults = ({ result, onDownload, onProcessAnother }: ProcessingResultsProps) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionSaved = result.sizeBefore - result.sizeAfter;
  const compressionPercent = ((compressionSaved / result.sizeBefore) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-accent bg-yellow-light">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-accent mb-4" />
          </div>
          <CardTitle className="text-2xl">Photo Cleaned Successfully!</CardTitle>
          <CardDescription className="text-lg">
            All metadata has been removed from your image
          </CardDescription>
        </CardHeader>
      </Card>

      {/* File Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Original Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{result.originalFile.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">File Size:</span>
              <Badge variant="secondary">{formatFileSize(result.sizeBefore)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Metadata Fields:</span>
              <Badge variant="destructive">{Object.keys(result.metadata).length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cleaned Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{result.originalFile.name.replace(/\.[^/.]+$/, "_cleaned$&")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">File Size:</span>
              <Badge variant="secondary">{formatFileSize(result.sizeAfter)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Metadata Fields:</span>
              <Badge variant="secondary">0</Badge>
            </div>
            {compressionSaved > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Size Reduced:</span>
                <Badge className="bg-accent text-accent-foreground">-{compressionPercent}%</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="hero" size="lg" onClick={onDownload} className="sm:min-w-[200px]">
          <Download className="w-5 h-5" />
          Download Clean Image
        </Button>
        
        <Button variant="outline" size="lg" onClick={onProcessAnother}>
          Process Another Photo
        </Button>
      </div>

      {/* Privacy reminder */}
      <div className="text-center p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Your cleaned image is ready for safe sharing without any privacy-compromising metadata
        </p>
      </div>
    </div>
  );
};