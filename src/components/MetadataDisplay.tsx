import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MapPin, Camera, Calendar, User } from "lucide-react";

interface MetadataDisplayProps {
  metadata: Record<string, any>;
  hasGPS: boolean;
  hasPersonalData: boolean;
}

export const MetadataDisplay = ({ metadata, hasGPS, hasPersonalData }: MetadataDisplayProps) => {
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const getMetadataIcon = (key: string) => {
    if (key.toLowerCase().includes('gps') || key.toLowerCase().includes('location')) {
      return <MapPin className="w-4 h-4" />;
    }
    if (key.toLowerCase().includes('camera') || key.toLowerCase().includes('make') || key.toLowerCase().includes('model')) {
      return <Camera className="w-4 h-4" />;
    }
    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
      return <Calendar className="w-4 h-4" />;
    }
    if (key.toLowerCase().includes('artist') || key.toLowerCase().includes('author') || key.toLowerCase().includes('owner')) {
      return <User className="w-4 h-4" />;
    }
    return null;
  };

  const getSensitiveItems = () => {
    const sensitive = [];
    
    if (hasGPS) {
      sensitive.push({ type: "GPS Location", description: "Your photo contains GPS coordinates that reveal where it was taken" });
    }
    
    if (hasPersonalData) {
      sensitive.push({ type: "Personal Data", description: "Camera info, timestamps, and other identifying data found" });
    }

    return sensitive;
  };

  const sensitiveItems = getSensitiveItems();

  return (
    <div className="space-y-6">
      {/* Privacy Alert */}
      {(hasGPS || hasPersonalData) && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-lg text-destructive">Privacy Alert</CardTitle>
            </div>
            <CardDescription>
              Sensitive data found in your image that should be removed before sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sensitiveItems.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2" />
                <div>
                  <p className="font-medium text-sm">{item.type}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metadata Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Image Metadata Found
            <Badge variant="secondary">{Object.keys(metadata).length} fields</Badge>
          </CardTitle>
          <CardDescription>
            All metadata below will be completely removed from your cleaned image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Object.keys(metadata).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No metadata found in this image
              </p>
            ) : (
              Object.entries(metadata).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getMetadataIcon(key)}
                    <span className="font-medium text-sm truncate">{key}</span>
                  </div>
                  <span className="text-sm text-muted-foreground ml-4 text-right break-all">
                    {formatValue(value)}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};