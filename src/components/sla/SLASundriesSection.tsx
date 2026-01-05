import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DollarSign } from "lucide-react";

interface SLASundriesSectionProps {
  data: {
    sundries_type: string;
    parts_percent: number;
    cap_amount: number | null;
  };
  onChange: (data: SLASundriesSectionProps["data"]) => void;
}

export function SLASundriesSection({ data, onChange }: SLASundriesSectionProps) {
  const handleChange = (field: keyof typeof data, value: string | number | null) => {
    if (field === "sundries_type") {
      const newType = value as string;
      onChange({
        ...data,
        sundries_type: newType,
        cap_amount: newType === "type_2_percent_only" ? null : data.cap_amount,
      });
    } else if (field === "cap_amount") {
      onChange({ ...data, [field]: value === "" ? null : parseFloat(value as string) || 0 });
    } else {
      onChange({ ...data, [field]: parseFloat(value as string) || 0 });
    }
  };

  return (
    <Card id="sundries">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Sundries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Sundries Type</Label>
          <RadioGroup
            value={data.sundries_type}
            onValueChange={(value) => handleChange("sundries_type", value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="type_1_percent_with_cap" id="type_1_percent_with_cap" />
              <Label htmlFor="type_1_percent_with_cap" className="cursor-pointer">
                Type 1 - % with Cap
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="type_2_percent_only" id="type_2_percent_only" />
              <Label htmlFor="type_2_percent_only" className="cursor-pointer">
                Type 2 - % Only
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parts_percent">% of Parts</Label>
            <div className="relative">
              <Input
                id="parts_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.parts_percent}
                onChange={(e) => handleChange("parts_percent", e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
          {data.sundries_type === "type_1_percent_with_cap" && (
            <div className="space-y-2">
              <Label htmlFor="cap_amount">Cap Amount (R)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                <Input
                  id="cap_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={data.cap_amount ?? ""}
                  onChange={(e) => handleChange("cap_amount", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
