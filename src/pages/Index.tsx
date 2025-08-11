import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FileUpload } from "@/components/FileUpload";
import { MetadataDisplay } from "@/components/MetadataDisplay";
import { ProcessingResults } from "@/components/ProcessingResults";
import { MetadataProcessor, ProcessingResult } from "@/utils/metadataProcessor";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const processingResult = await MetadataProcessor.processImage(file);
      setResult(processingResult);
      
      toast({
        title: "Image Processed",
        description: `Found ${Object.keys(processingResult.metadata).length} metadata fields`,
      });
    } catch (error) {
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    
    const url = URL.createObjectURL(result.cleanedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.originalFile.name.replace(/\.[^/.]+$/, "_cleaned$&");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowResults(true);
    
    toast({
      title: "Download Started",
      description: "Your cleaned image is being downloaded",
    });
  };

  const handleProcessAnother = () => {
    setResult(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Remove Photo
              <span className="block text-transparent bg-gradient-yellow bg-clip-text">
                Metadata
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Protect your privacy by removing GPS location, camera info, and personal data from your photos before sharing them online.
            </p>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            {!result && (
              <div className="space-y-8">
                <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                
                {isProcessing && (
                  <div className="flex items-center justify-center gap-3 p-8">
                    <Loader2 className="w-6 h-6 animate-spin text-accent" />
                    <span className="text-lg">Processing your image...</span>
                  </div>
                )}
              </div>
            )}

            {result && !showResults && (
              <div className="space-y-8">
                <MetadataDisplay
                  metadata={result.metadata}
                  hasGPS={result.hasGPS}
                  hasPersonalData={result.hasPersonalData}
                />
                <div className="flex justify-center">
                  <ProcessingResults
                    result={result}
                    onDownload={handleDownload}
                    onProcessAnother={handleProcessAnother}
                  />
                </div>
              </div>
            )}

            {showResults && (
              <div className="text-center space-y-8">
                <div className="p-8 bg-yellow-light rounded-2xl">
                  <h2 className="text-2xl font-bold mb-4">Ready to Share Safely!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your photo has been cleaned and is now safe to share without compromising your privacy.
                  </p>
                  <button
                    onClick={handleProcessAnother}
                    className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-medium hover:bg-yellow-dark transition-colors"
                  >
                    Clean Another Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Section */}
          {!result && (
            <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold mb-2">100% Private</h3>
                <p className="text-muted-foreground text-sm">
                  All processing happens in your browser. Your photos never leave your device.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold mb-2">Lightning Fast</h3>
                <p className="text-muted-foreground text-sm">
                  Clean your photos instantly without waiting for uploads or downloads.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-yellow-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Complete Removal</h3>
                <p className="text-muted-foreground text-sm">
                  Removes GPS location, camera data, timestamps, and all metadata.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;