import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon, Trash2, X } from "lucide-react";
import { TowingRecord } from "@/hooks/useTowingRecords";
import { useTowingImages, TowingImage } from "@/hooks/useTowingImages";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const IMAGE_TYPES: { value: TowingImage["image_type"]; label: string }[] = [
  { value: "security_photo", label: "Security Photo" },
  { value: "car_license", label: "Car License" },
  { value: "client_image", label: "Client Image" },
  { value: "tow_slip", label: "Tow Slip" },
  { value: "tow_image", label: "Tow Image" },
];

interface TowSecurityPhotosTabProps {
  record: TowingRecord;
}

export default function TowSecurityPhotosTab({ record }: TowSecurityPhotosTabProps) {
  const { images, uploadImage, deleteImage, isLoading } = useTowingImages(record.id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageType, setImageType] = useState<TowingImage["image_type"]>("security_photo");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadImage.mutateAsync({
        file,
        imageType,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const groupedImages = IMAGE_TYPES.map((type) => ({
    ...type,
    images: images?.filter((img) => img.image_type === type.value) || [],
  }));

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Photo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Image Type</Label>
              <Select value={imageType} onValueChange={(v) => setImageType(v as TowingImage["image_type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </div>
          </div>
          {isUploading && (
            <p className="text-sm text-muted-foreground">Uploading...</p>
          )}
        </CardContent>
      </Card>

      {/* Photos by Type */}
      {groupedImages.map((group) => (
        <Card key={group.value}>
          <CardHeader>
            <CardTitle className="text-lg">{group.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {group.images.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No {group.label.toLowerCase()} uploaded</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {group.images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.image_url}
                      alt={image.file_name}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image.image_url)}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteImage.mutate(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
