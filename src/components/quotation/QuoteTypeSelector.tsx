import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuoteTypeSelectorProps {
  quoteType: string;
  onQuoteTypeChange: (value: string) => void;
  options: {
    wasteDisposal: boolean;
    covid19: boolean;
    writeOff: boolean;
    onsite: boolean;
    polish: boolean;
    agreedOnly: boolean;
    authorized: boolean;
  };
  onOptionChange: (key: string, value: boolean) => void;
}

const quoteTypes = [
  { value: "money", label: "Money" },
  { value: "write_off", label: "Write Off" },
  { value: "covid", label: "Covid" },
  { value: "waste_disposal", label: "Waste Disposal" },
  { value: "agreed_only", label: "Agreed Only" },
  { value: "onsite", label: "Onsite" },
  { value: "polish", label: "Polish" },
  { value: "authorized_only", label: "Authorized Only" },
];

export function QuoteTypeSelector({
  quoteType,
  onQuoteTypeChange,
  options,
  onOptionChange,
}: QuoteTypeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Quote Type</Label>
        <Select value={quoteType} onValueChange={onQuoteTypeChange}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg z-50">
            {quoteTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="wasteDisposal"
            checked={options.wasteDisposal}
            onCheckedChange={(checked) => onOptionChange("wasteDisposal", !!checked)}
          />
          <Label htmlFor="wasteDisposal" className="text-sm cursor-pointer">
            Waste Disposal
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="covid19"
            checked={options.covid19}
            onCheckedChange={(checked) => onOptionChange("covid19", !!checked)}
          />
          <Label htmlFor="covid19" className="text-sm cursor-pointer">
            Covid - 19
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="writeOff"
            checked={options.writeOff}
            onCheckedChange={(checked) => onOptionChange("writeOff", !!checked)}
          />
          <Label htmlFor="writeOff" className="text-sm cursor-pointer">
            Write Off
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="onsite"
            checked={options.onsite}
            onCheckedChange={(checked) => onOptionChange("onsite", !!checked)}
          />
          <Label htmlFor="onsite" className="text-sm cursor-pointer">
            Onsite
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="polish"
            checked={options.polish}
            onCheckedChange={(checked) => onOptionChange("polish", !!checked)}
          />
          <Label htmlFor="polish" className="text-sm cursor-pointer">
            Polish
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="agreedOnly"
            checked={options.agreedOnly}
            onCheckedChange={(checked) => onOptionChange("agreedOnly", !!checked)}
          />
          <Label htmlFor="agreedOnly" className="text-sm cursor-pointer">
            Agreed Only?
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="authorized"
            checked={options.authorized}
            onCheckedChange={(checked) => onOptionChange("authorized", !!checked)}
          />
          <Label htmlFor="authorized" className="text-sm cursor-pointer">
            Authorized?
          </Label>
        </div>
      </div>
    </div>
  );
}
