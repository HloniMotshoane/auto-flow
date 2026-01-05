import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Camera, Upload, X, CheckCircle, Car, ImageIcon, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  isPlateImage: boolean;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

export default function VehicleIntake() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const photosFileInputRef = useRef<HTMLInputElement>(null);
  const photosCameraInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"plate" | "photos" | "review">("plate");
  const [plateNumber, setPlateNumber] = useState("");
  const [plateImageCaptured, setPlateImageCaptured] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_IMAGES = 100;

  const handleImageCapture = useCallback((files: FileList | null, isPlateCapture: boolean = false) => {
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newImages: UploadedImage[] = filesToProcess.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isPlateImage: isPlateCapture && index === 0 && !plateImageCaptured,
      uploading: false,
      uploaded: false,
    }));

    if (isPlateCapture && newImages.length > 0) {
      setPlateImageCaptured(true);
    }

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, plateImageCaptured]);

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove?.isPlateImage) {
        setPlateImageCaptured(false);
      }
      URL.revokeObjectURL(imageToRemove?.preview || "");
      return prev.filter(img => img.id !== id);
    });
  };

  const uploadImage = async (image: UploadedImage): Promise<string | null> => {
    try {
      const fileExt = image.file.name.split('.').pop();
      const fileName = `${profile?.tenant_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(fileName, image.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!profile?.tenant_id || !user?.id) {
      toast({
        title: "Error",
        description: "User profile not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!plateImageCaptured && !plateNumber) {
      toast({
        title: "Error",
        description: "Please capture a license plate photo or enter the plate number manually.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload all images
      const uploadPromises = images.map(async (image, index) => {
        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, uploading: true } : img
        ));

        const url = await uploadImage(image);

        setImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, uploading: false, uploaded: !!url, url } : img
        ));

        return { ...image, url, sequenceNumber: index + 1 };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const plateImage = uploadedImages.find(img => img.isPlateImage);

      // Generate intake number
      const { data: intakeNumber, error: intakeNumberError } = await supabase
        .rpc('generate_intake_number', { p_tenant_id: profile.tenant_id });

      if (intakeNumberError) throw intakeNumberError;

      // Create vehicle intake record
      const { data: intake, error: intakeError } = await supabase
        .from('vehicle_intakes')
        .insert({
          tenant_id: profile.tenant_id,
          intake_number: intakeNumber,
          plate_number: plateNumber || null,
          plate_image_url: plateImage?.url || null,
          intake_officer_id: user.id,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (intakeError) throw intakeError;

      // Insert intake images
      const imageRecords = uploadedImages
        .filter(img => img.url)
        .map((img, index) => ({
          intake_id: intake.id,
          image_url: img.url!,
          image_type: img.isPlateImage ? 'plate' : 'general',
          sequence_number: index + 1,
          is_plate_image: img.isPlateImage
        }));

      if (imageRecords.length > 0) {
        const { error: imagesError } = await supabase
          .from('intake_images')
          .insert(imageRecords);

        if (imagesError) throw imagesError;
      }

      // Create case shell
      const { data: caseNumber, error: caseNumberError } = await supabase
        .rpc('generate_case_number', { p_tenant_id: profile.tenant_id });

      if (caseNumberError) throw caseNumberError;

      const { error: caseError } = await supabase
        .from('cases')
        .insert({
          tenant_id: profile.tenant_id,
          case_number: caseNumber,
          intake_id: intake.id,
          status: 'awaiting_reception'
        });

      if (caseError) throw caseError;

      toast({
        title: "Intake Submitted",
        description: `Vehicle intake ${intakeNumber} has been created successfully.`,
      });

      // Clean up previews
      images.forEach(img => URL.revokeObjectURL(img.preview));

      navigate("/dashboard");
    } catch (error) {
      console.error('Error submitting intake:', error);
      toast({
        title: "Error",
        description: "Failed to submit vehicle intake. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const plateImage = images.find(img => img.isPlateImage);
  const otherImages = images.filter(img => !img.isPlateImage);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Vehicle Intake</h1>
          <p className="text-muted-foreground">Capture vehicle details for new intake</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2">
          {["plate", "photos", "review"].map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : ["plate", "photos", "review"].indexOf(step) > index
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              {index < 2 && (
                <div
                  className={cn(
                    "w-12 h-1 mx-1",
                    ["plate", "photos", "review"].indexOf(step) > index
                      ? "bg-primary/20"
                      : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: License Plate */}
        {step === "plate" && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: License Plate</CardTitle>
              <CardDescription>
                Capture or enter the vehicle's license plate number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plate Image Capture */}
              <div className="space-y-4">
                <Label>License Plate Photo (Recommended)</Label>
                {plateImage ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                    <img
                      src={plateImage.preview}
                      alt="License plate"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => removeImage(plateImage.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium">
                      Plate Photo ✓
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-32 flex-col gap-2"
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      <Camera className="w-8 h-8" />
                      <span>Take Photo</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-32 flex-col gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8" />
                      <span>Upload Photo</span>
                    </Button>
                  </div>
                )}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleImageCapture(e.target.files, true)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageCapture(e.target.files, true)}
                />
              </div>

              {/* Manual Plate Entry */}
              <div className="space-y-2">
                <Label htmlFor="plateNumber">
                  Or Enter Plate Number Manually
                </Label>
                <Input
                  id="plateNumber"
                  placeholder="e.g., CA 123-456"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  className="text-lg font-mono"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setStep("photos")}
                disabled={!plateImageCaptured && !plateNumber}
              >
                Continue to Vehicle Photos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Additional Photos */}
        {step === "photos" && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Vehicle Photos</CardTitle>
              <CardDescription>
                Capture additional photos of the vehicle ({otherImages.length}/{MAX_IMAGES - 1} photos)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => photosCameraInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                >
                  <Camera className="w-6 h-6" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => photosFileInputRef.current?.click()}
                  disabled={images.length >= MAX_IMAGES}
                >
                  <Upload className="w-6 h-6" />
                  <span>Upload Photos</span>
                </Button>
              </div>

              <input
                ref={photosCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  handleImageCapture(e.target.files, false);
                  e.target.value = '';
                }}
              />
              <input
                ref={photosFileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleImageCapture(e.target.files, false);
                  e.target.value = '';
                }}
              />

              {/* Image Grid */}
              {otherImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {otherImages.map((image, index) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={image.preview}
                        alt={`Vehicle photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(image.id)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive/80 text-destructive-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {otherImages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No additional photos yet</p>
                  <p className="text-sm">Take or upload photos of the vehicle</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("plate")}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep("review")}>
                  Review & Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Review & Submit</CardTitle>
              <CardDescription>
                Review the intake details before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">License Plate</p>
                    <p className="text-sm text-muted-foreground">
                      {plateNumber || "Photo captured"}
                      {plateImageCaptured && plateNumber && " (with photo)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Photos</p>
                    <p className="text-sm text-muted-foreground">
                      {images.length} photo(s) captured
                    </p>
                  </div>
                </div>
              </div>

              {/* Plate Preview */}
              {plateImage && (
                <div className="space-y-2">
                  <Label>License Plate Photo</Label>
                  <img
                    src={plateImage.preview}
                    alt="License plate"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Photo Thumbnails */}
              {otherImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Vehicle Photos ({otherImages.length})</Label>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {otherImages.slice(0, 6).map((image, index) => (
                      <img
                        key={image.id}
                        src={image.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border flex-shrink-0"
                      />
                    ))}
                    {otherImages.length > 6 && (
                      <div className="w-16 h-16 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-muted-foreground">
                          +{otherImages.length - 6}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information about the vehicle..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("photos")}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Intake"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
