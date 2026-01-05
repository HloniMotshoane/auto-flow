import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck } from "lucide-react";

const TOWING_TYPES = [
  { value: "type_1_simple", label: "Type 1 - Simple" },
  { value: "type_2_salvage", label: "Type 2 - Salvage Windows" },
  { value: "type_3_free_days_radius", label: "Type 3 - Free Days & Radius" },
  { value: "type_4_admin_security", label: "Type 4 - Admin/Security" },
];

interface SLATowingSectionProps {
  data: {
    towing_type: string;
    storage_per_day: number;
    first_km_free: number;
    per_km_thereafter: number;
  };
  onChange: (data: SLATowingSectionProps["data"]) => void;
}

export function SLATowingSection({ data, onChange }: SLATowingSectionProps) {
  const handleChange = (field: keyof typeof data, value: string | number) => {
    if (field === "towing_type") {
      onChange({ ...data, [field]: value as string });
    } else {
      onChange({ ...data, [field]: parseFloat(value as string) || 0 });
    }
  };

  return (
    <Card id="towing">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Towing & Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Towing Type</Label>
          <RadioGroup
            value={data.towing_type}
            onValueChange={(value) => handleChange("towing_type", value)}
            className="flex flex-wrap gap-4"
          >
            {TOWING_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={`towing-${type.value}`} />
                <Label htmlFor={`towing-${type.value}`} className="cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storage_per_day">Storage Per Day (R)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
              <Input
                id="storage_per_day"
                type="number"
                step="0.01"
                min="0"
                value={data.storage_per_day}
                onChange={(e) => handleChange("storage_per_day", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_km_free">First KM Free</Label>
            <Input
              id="first_km_free"
              type="number"
              step="0.01"
              min="0"
              value={data.first_km_free}
              onChange={(e) => handleChange("first_km_free", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="per_km_thereafter">Per KM Thereafter (R)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
              <Input
                id="per_km_thereafter"
                type="number"
                step="0.01"
                min="0"
                value={data.per_km_thereafter}
                onChange={(e) => handleChange("per_km_thereafter", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
