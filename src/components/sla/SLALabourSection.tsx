import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wrench, Clock, DollarSign } from "lucide-react";

const KIND_OPTIONS = [
  { value: "warranty_non_warranty", label: "Warranty/Non-Warranty" },
  { value: "passenger_commercial", label: "Passenger/Commercial" },
  { value: "grading", label: "Grading" },
  { value: "nsr_asr_msr", label: "NSR/ASR/MSR" },
  { value: "heavy_commercial", label: "Heavy Commercial" },
  { value: "drivable_non_drivable", label: "Drivable/Non-Drivable" },
];

interface SLALabourSectionProps {
  data: {
    kind_tags: string[];
    warranty_rate: number;
    non_warranty_rate: number;
    rate_type?: "time" | "rand";
  };
  onChange: (data: SLALabourSectionProps["data"]) => void;
}

export function SLALabourSection({ data, onChange }: SLALabourSectionProps) {
  const rateType = data.rate_type || "rand";

  const toggleKind = (value: string) => {
    const newTags = data.kind_tags.includes(value)
      ? data.kind_tags.filter((t) => t !== value)
      : [...data.kind_tags, value];
    onChange({ ...data, kind_tags: newTags });
  };

  const handleRateChange = (field: "warranty_rate" | "non_warranty_rate", value: string) => {
    onChange({ ...data, [field]: parseFloat(value) || 0 });
  };

  const handleRateTypeChange = (value: "time" | "rand") => {
    onChange({ ...data, rate_type: value });
  };

  const getRateLabel = (base: string) => {
    return rateType === "time" ? `${base} (Hours)` : `${base} (Rand)`;
  };

  const getPrefix = () => {
    return rateType === "time" ? null : "R";
  };

  const getSuffix = () => {
    return rateType === "time" ? "hrs" : null;
  };

  return (
    <Card id="labour">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Labour Rates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rate Type Selector */}
        <div className="space-y-2">
          <Label>Rate Calculation Type</Label>
          <RadioGroup
            value={rateType}
            onValueChange={(v) => handleRateTypeChange(v as "time" | "rand")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="rand" id="labour-rand" />
              <Label htmlFor="labour-rand" className="flex items-center gap-1 cursor-pointer">
                <DollarSign className="h-4 w-4" />
                Rand (R)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="time" id="labour-time" />
              <Label htmlFor="labour-time" className="flex items-center gap-1 cursor-pointer">
                <Clock className="h-4 w-4" />
                Time (Hours)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Kind (Select applicable)</Label>
          <div className="flex flex-wrap gap-2">
            {KIND_OPTIONS.map((option) => (
              <Badge
                key={option.value}
                variant={data.kind_tags.includes(option.value) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleKind(option.value)}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="warranty_rate">{getRateLabel("Warranty Rate")}</Label>
            <div className="relative">
              {getPrefix() && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getPrefix()}</span>
              )}
              <Input
                id="warranty_rate"
                type="number"
                step="0.01"
                min="0"
                value={data.warranty_rate}
                onChange={(e) => handleRateChange("warranty_rate", e.target.value)}
                className={getPrefix() ? "pl-8" : getSuffix() ? "pr-12" : ""}
              />
              {getSuffix() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getSuffix()}</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="non_warranty_rate">{getRateLabel("Non-Warranty Rate")}</Label>
            <div className="relative">
              {getPrefix() && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getPrefix()}</span>
              )}
              <Input
                id="non_warranty_rate"
                type="number"
                step="0.01"
                min="0"
                value={data.non_warranty_rate}
                onChange={(e) => handleRateChange("non_warranty_rate", e.target.value)}
                className={getPrefix() ? "pl-8" : getSuffix() ? "pr-12" : ""}
              />
              {getSuffix() && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getSuffix()}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
