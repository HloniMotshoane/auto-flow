import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Link2, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { IntakeFormData } from "@/pages/CreateQuotation";
import { usePendingIntakes } from "@/hooks/usePendingIntakes";

interface TowDetailsCardProps {
  formData: IntakeFormData;
  errors: Partial<Record<keyof IntakeFormData, string>>;
  updateField: (field: keyof IntakeFormData, value: string | boolean) => void;
  selectedIntakeId?: string;
  onIntakeSelect?: (intakeId: string | null) => void;
  showIntakeLinking?: boolean;
}

export function TowDetailsCard({ 
  formData, 
  errors, 
  updateField, 
  selectedIntakeId,
  onIntakeSelect,
  showIntakeLinking = false 
}: TowDetailsCardProps) {
  const { data: pendingIntakes } = usePendingIntakes();

  const handleTowedChange = (value: string) => {
    const wasTowed = value === "yes";
    updateField("wasTowed", wasTowed);
    
    // Clear tow fields if not towed
    if (!wasTowed) {
      updateField("towedBy", "");
      updateField("towContactNumber", "");
      updateField("towEmail", "");
      updateField("towFee", "0");
    }
  };

  const selectedIntake = pendingIntakes?.find(i => i.id === selectedIntakeId);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5 text-primary" />
          Tow Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Was Vehicle Towed?</Label>
          <Select 
            value={formData.wasTowed ? "yes" : "no"} 
            onValueChange={handleTowedChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">No</SelectItem>
              <SelectItem value="yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="towedBy" className="text-sm">
            Towed By {formData.wasTowed && "*"}
          </Label>
          <Input
            id="towedBy"
            value={formData.towedBy}
            onChange={(e) => updateField("towedBy", e.target.value)}
            placeholder="Tow company name"
            disabled={!formData.wasTowed}
            className={cn(
              errors.towedBy && "border-destructive",
              !formData.wasTowed && "bg-muted"
            )}
          />
          {errors.towedBy && <p className="text-xs text-destructive">{errors.towedBy}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="towContactNumber" className="text-sm">
            Tow Contact Number {formData.wasTowed && "*"}
          </Label>
          <Input
            id="towContactNumber"
            value={formData.towContactNumber}
            onChange={(e) => updateField("towContactNumber", e.target.value)}
            placeholder="0821234567"
            disabled={!formData.wasTowed}
            className={cn(
              errors.towContactNumber && "border-destructive",
              !formData.wasTowed && "bg-muted"
            )}
          />
          {errors.towContactNumber && <p className="text-xs text-destructive">{errors.towContactNumber}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="towEmail" className="text-sm">Tow Email</Label>
          <Input
            id="towEmail"
            type="email"
            value={formData.towEmail}
            onChange={(e) => updateField("towEmail", e.target.value)}
            placeholder="tow@company.co.za"
            disabled={!formData.wasTowed}
            className={cn(!formData.wasTowed && "bg-muted")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="towFee" className="text-sm">Tow Fee (R)</Label>
          <Input
            id="towFee"
            type="number"
            step="0.01"
            value={formData.towFee}
            onChange={(e) => updateField("towFee", e.target.value)}
            placeholder="0.00"
            disabled={!formData.wasTowed}
            className={cn(!formData.wasTowed && "bg-muted")}
          />
        </div>

        {/* Intake Linking Section */}
        {showIntakeLinking && onIntakeSelect && (
          <>
            <div className="border-t pt-4 mt-4">
              <Label className="text-sm flex items-center gap-2 mb-2">
                <Link2 className="h-4 w-4 text-primary" />
                Link to Vehicle Intake
              </Label>
              <Select 
                value={selectedIntakeId || "none"} 
                onValueChange={(value) => onIntakeSelect(value === "none" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select intake (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No intake linked</SelectItem>
                  {pendingIntakes?.map((intake) => (
                    <SelectItem key={intake.id} value={intake.id}>
                      {intake.intake_number} {intake.plate_number && `- ${intake.plate_number}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Link to images captured during vehicle intake
              </p>
            </div>

            {/* Show linked intake images */}
            {selectedIntake && selectedIntake.intake_images && selectedIntake.intake_images.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Image className="h-4 w-4 text-primary" />
                  Intake Images ({selectedIntake.intake_images.length})
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedIntake.intake_images.slice(0, 6).map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-md overflow-hidden border">
                      <img 
                        src={img.image_url} 
                        alt={img.image_type || "Intake image"} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {selectedIntake.intake_images.length > 6 && (
                  <p className="text-xs text-muted-foreground">
                    +{selectedIntake.intake_images.length - 6} more images
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
