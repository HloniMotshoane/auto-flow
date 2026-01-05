import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Package } from "lucide-react";

const PARTS_TYPES = [
  { value: "type_1_simple", label: "Type 1 - Simple %" },
  { value: "type_2_tiered_new", label: "Type 2 - Tiered New" },
  { value: "type_3_alt_used_cap", label: "Type 3 - Alt/Used Cap" },
  { value: "type_4_simple", label: "Type 4 - Simple" },
];

interface SLAPartsSectionProps {
  data: {
    parts_type: string;
    new_oem_percent: number;
    alt_from_manufacturer_percent: number;
    alt_non_manufacturer_percent: number;
    used_percent: number;
    aftermarket_percent: number;
    new_oem_in_stock_factor: number;
    used_oem_in_stock_factor: number;
    alternative_in_stock_factor: number;
  };
  onChange: (data: SLAPartsSectionProps["data"]) => void;
}

export function SLAPartsSection({ data, onChange }: SLAPartsSectionProps) {
  const handleChange = (field: keyof typeof data, value: string | number) => {
    if (field === "parts_type") {
      onChange({ ...data, [field]: value as string });
    } else {
      onChange({ ...data, [field]: parseFloat(value as string) || 0 });
    }
  };

  return (
    <Card id="parts">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Parts Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Parts Type</Label>
          <RadioGroup
            value={data.parts_type}
            onValueChange={(value) => handleChange("parts_type", value)}
            className="flex flex-wrap gap-4"
          >
            {PARTS_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="cursor-pointer">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new_oem_percent">New OEM %</Label>
            <div className="relative">
              <Input
                id="new_oem_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.new_oem_percent}
                onChange={(e) => handleChange("new_oem_percent", e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alt_from_manufacturer_percent">Alt From Manufacturer %</Label>
            <div className="relative">
              <Input
                id="alt_from_manufacturer_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.alt_from_manufacturer_percent}
                onChange={(e) => handleChange("alt_from_manufacturer_percent", e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="alt_non_manufacturer_percent">Alt Non-Manufacturer %</Label>
            <div className="relative">
              <Input
                id="alt_non_manufacturer_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.alt_non_manufacturer_percent}
                onChange={(e) => handleChange("alt_non_manufacturer_percent", e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="used_percent">Used %</Label>
            <div className="relative">
              <Input
                id="used_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.used_percent}
                onChange={(e) => handleChange("used_percent", e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aftermarket_percent">Aftermarket %</Label>
            <div className="relative">
              <Input
                id="aftermarket_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.aftermarket_percent}
                onChange={(e) => handleChange("aftermarket_percent", e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="new_oem_in_stock_factor">New OEM In-Stock Factor</Label>
            <Input
              id="new_oem_in_stock_factor"
              type="number"
              step="0.01"
              min="0"
              value={data.new_oem_in_stock_factor}
              onChange={(e) => handleChange("new_oem_in_stock_factor", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="used_oem_in_stock_factor">Used OEM In-Stock Factor</Label>
            <Input
              id="used_oem_in_stock_factor"
              type="number"
              step="0.01"
              min="0"
              value={data.used_oem_in_stock_factor}
              onChange={(e) => handleChange("used_oem_in_stock_factor", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternative_in_stock_factor">Alternative In-Stock Factor</Label>
            <Input
              id="alternative_in_stock_factor"
              type="number"
              step="0.01"
              min="0"
              value={data.alternative_in_stock_factor}
              onChange={(e) => handleChange("alternative_in_stock_factor", e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
