import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Settings } from "lucide-react";

interface SLAOutworkSectionProps {
  data: {
    outwork_type: string;
    wheel_alignment_percent: number;
    air_con_percent: number;
    diagnostics_percent: number;
    warranty_checks_percent: number;
    courier_fees_percent: number;
    electrical_percent: number;
    mechanical_percent: number;
    mechanical_reports_percent: number;
    jig_hire_percent: number;
    upholstery_percent: number;
    cooling_systems_percent: number;
    railvan_repair_percent: number;
    on_off_bench_setup_minutes: number;
    on_off_jig_setup_minutes: number;
    floor_anchorage_minutes: number;
    windscreen_replacement_percent: number;
  };
  onChange: (data: SLAOutworkSectionProps["data"]) => void;
}

export function SLAOutworkSection({ data, onChange }: SLAOutworkSectionProps) {
  const handleChange = (field: keyof typeof data, value: string | number) => {
    if (field === "outwork_type") {
      onChange({ ...data, [field]: value as string });
    } else if (
      field === "on_off_bench_setup_minutes" ||
      field === "on_off_jig_setup_minutes" ||
      field === "floor_anchorage_minutes"
    ) {
      onChange({ ...data, [field]: parseInt(value as string) || 0 });
    } else {
      onChange({ ...data, [field]: parseFloat(value as string) || 0 });
    }
  };

  const percentFields = [
    { key: "wheel_alignment_percent", label: "Wheel Alignment %" },
    { key: "air_con_percent", label: "Air-Con %" },
    { key: "diagnostics_percent", label: "Diagnostics %" },
    { key: "warranty_checks_percent", label: "Warranty Checks %" },
    { key: "courier_fees_percent", label: "Courier Fees %" },
    { key: "electrical_percent", label: "Electrical %" },
    { key: "mechanical_percent", label: "Mechanical %" },
    { key: "mechanical_reports_percent", label: "Mechanical Reports %" },
    { key: "jig_hire_percent", label: "Jig Hire %" },
    { key: "upholstery_percent", label: "Upholstery %" },
    { key: "cooling_systems_percent", label: "Cooling Systems %" },
    { key: "railvan_repair_percent", label: "Rail/Van Repair %" },
    { key: "windscreen_replacement_percent", label: "Windscreen Replacement %" },
  ] as const;

  const minuteFields = [
    { key: "on_off_bench_setup_minutes", label: "On/Off Bench Setup (min)" },
    { key: "on_off_jig_setup_minutes", label: "On/Off Jig Setup (min)" },
    { key: "floor_anchorage_minutes", label: "Floor Anchorage (min)" },
  ] as const;

  return (
    <Card id="outwork">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Outwork Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Outwork Type</Label>
          <RadioGroup
            value={data.outwork_type}
            onValueChange={(value) => handleChange("outwork_type", value)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rule_based_caps" id="rule_based_caps" />
              <Label htmlFor="rule_based_caps" className="cursor-pointer">
                Rule Based (Caps)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in_house_fixed" id="in_house_fixed" />
              <Label htmlFor="in_house_fixed" className="cursor-pointer">
                In-House Fixed
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {percentFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <div className="relative">
                <Input
                  id={field.key}
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={data[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {minuteFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="number"
                min="0"
                value={data[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
