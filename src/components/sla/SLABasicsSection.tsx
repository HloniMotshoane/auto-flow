import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
];

interface SLABasicsSectionProps {
  data: {
    effective_from: string;
    effective_to: string;
    province: string;
    city: string;
  };
  onChange: (data: SLABasicsSectionProps["data"]) => void;
}

export function SLABasicsSection({ data, onChange }: SLABasicsSectionProps) {
  const handleChange = (field: keyof typeof data, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card id="sla-basics">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          SLA Basics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="effective_from">Effective From *</Label>
            <Input
              id="effective_from"
              type="date"
              value={data.effective_from}
              onChange={(e) => handleChange("effective_from", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="effective_to">Effective To</Label>
            <Input
              id="effective_to"
              type="date"
              value={data.effective_to}
              onChange={(e) => handleChange("effective_to", e.target.value)}
              min={data.effective_from}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="province">Province</Label>
            <Select
              value={data.province}
              onValueChange={(value) => handleChange("province", value)}
            >
              <SelectTrigger id="province">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sla-city">City</Label>
            <Input
              id="sla-city"
              value={data.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Enter city"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
