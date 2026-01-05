import { useState } from "react";
import { useIntakeImages } from "@/hooks/useIntakeImages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Camera, ZoomIn, X } from "lucide-react";

interface CasePhotosTabProps {
  intakeId?: string;
  caseId: string;
}

export function CasePhotosTab({ intakeId, caseId }: CasePhotosTabProps) {
  const { images, isLoading } = useIntakeImages(intakeId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No photos available.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Photos are captured during vehicle intake.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Damage Photos ({images.length})</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <Card 
            key={image.id} 
            className="overflow-hidden cursor-pointer group relative"
            onClick={() => setSelectedImage(image.image_url)}
          >
            <div className="aspect-square relative">
              <img
                src={image.image_url}
                alt={`Damage photo ${image.sequence_number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {image.is_plate_image && (
                <Badge className="absolute top-2 left-2 bg-primary">
                  License Plate
                </Badge>
              )}
              {image.image_type && image.image_type !== "general" && (
                <Badge variant="secondary" className="absolute bottom-2 left-2 capitalize">
                  {image.image_type}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Image Zoom Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size damage photo"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
