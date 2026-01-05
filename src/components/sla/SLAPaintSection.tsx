import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Paintbrush, Clock, DollarSign } from "lucide-react";

const KIND_OPTIONS = [
  { value: "warranty_non_warranty", label: "Warranty/Non-Warranty" },
  { value: "passenger_commercial", label: "Passenger/Commercial" },
  { value: "grading", label: "Grading" },
  { value: "nsr_asr_msr", label: "NSR/ASR/MSR" },
  { value: "heavy_commercial", label: "Heavy Commercial" },
];

interface SLAPaintSectionProps {
  data: {
    kind_tags: string[];
    warranty_per_panel: number;
    non_warranty_per_panel: number;
    blending: number;
    small_panel_paint: number;
    small_repair_paint: number;
    water_based: number;
    pearlescent_normal: number;
    pearlescent_3_stage: number;
    rate_type?: "time" | "rand";
  };
  onChange: (data: SLAPaintSectionProps["data"]) => void;
}

export function SLAPaintSection({ data, onChange }: SLAPaintSectionProps) {
  const rateType = data.rate_type || "rand";

  const toggleKind = (value: string) => {
    const newTags = data.kind_tags.includes(value)
      ? data.kind_tags.filter((t) => t !== value)
      : [...data.kind_tags, value];
    onChange({ ...data, kind_tags: newTags });
  };

  const handleChange = (field: keyof typeof data, value: string) => {
    if (field === "kind_tags" || field === "rate_type") return;
    onChange({ ...data, [field]: parseFloat(value) || 0 });
  };

  const handleRateTypeChange = (value: "time" | "rand") => {
    onChange({ ...data, rate_type: value });
  };

  const getPrefix = () => {
    return rateType === "time" ? null : "R";
  };

  const getSuffix = () => {
    return rateType === "time" ? "hrs" : null;
  };

  const getLabel = (base: string) => {
    return rateType === "time" ? `${base} (Hours)` : `${base} (R)`;
  };

  const renderInput = (id: string, label: string, field: keyof typeof data, value: number) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{getLabel(label)}</Label>
      <div className="relative">
        {getPrefix() && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getPrefix()}</span>
        )}
        <Input
          id={id}
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className={getPrefix() ? "pl-8" : getSuffix() ? "pr-12" : ""}
        />
        {getSuffix() && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{getSuffix()}</span>
        )}
      </div>
    </div>
  );

  return (
    <Card id="paint">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5" />
          Paint Rates
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
              <RadioGroupItem value="rand" id="paint-rand" />
              <Label htmlFor="paint-rand" className="flex items-center gap-1 cursor-pointer">
                <DollarSign className="h-4 w-4" />
                Rand (R)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="time" id="paint-time" />
              <Label htmlFor="paint-time" className="flex items-center gap-1 cursor-pointer">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderInput("warranty_per_panel", "Warranty Per Panel", "warranty_per_panel", data.warranty_per_panel)}
          {renderInput("non_warranty_per_panel", "Non-Warranty Per Panel", "non_warranty_per_panel", data.non_warranty_per_panel)}
          {renderInput("blending", "Blending", "blending", data.blending)}
          {renderInput("small_panel_paint", "Small Panel Paint", "small_panel_paint", data.small_panel_paint)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderInput("small_repair_paint", "Small Repair Paint", "small_repair_paint", data.small_repair_paint)}
          {renderInput("water_based", "Water Based", "water_based", data.water_based)}
          {renderInput("pearlescent_normal", "Pearlescent Normal", "pearlescent_normal", data.pearlescent_normal)}
          {renderInput("pearlescent_3_stage", "Pearlescent 3-Stage", "pearlescent_3_stage", data.pearlescent_3_stage)}
        </div>
      </CardContent>
    </Card>
  );
}
