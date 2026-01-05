import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface QuoteHeaderProps {
  quoteNumber: string;
  date: string;
  clientName: string;
  registration: string;
  vehicleMake: string;
  vehicleModel: string;
  claimNumber?: string;
  jobNumber?: string;
  assessmentType: string;
  version: number;
  onVersionChange?: (version: string) => void;
  onBackStage?: () => void;
  onNextStage?: () => void;
}

const versionTypes = [
  { value: "original", label: "Original Quote" },
  { value: "revised", label: "Revised Quote" },
  { value: "supplementary", label: "Supplementary Quote" },
  { value: "final", label: "Final Costing" },
];

export function QuoteHeader({
  quoteNumber,
  date,
  clientName,
  registration,
  vehicleMake,
  vehicleModel,
  claimNumber,
  jobNumber,
  assessmentType,
  version,
  onVersionChange,
  onBackStage,
  onNextStage,
}: QuoteHeaderProps) {
  return (
    <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
      <CardContent className="py-3 px-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Stage Navigation */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 bg-red-600 hover:bg-red-700 text-white border-0"
              onClick={onBackStage}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white border-0"
              onClick={onNextStage}
            >
              Final Stage
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="h-6 w-px bg-primary-foreground/30 hidden sm:block" />

          {/* Version Selector */}
          <Select
            defaultValue="original"
            onValueChange={onVersionChange}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border shadow-lg z-50">
              {versionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-primary-foreground/30 hidden sm:block" />

          {/* Quote Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm flex-1">
            <div>
              <span className="opacity-70">Ref:</span>{" "}
              <span className="font-semibold">{quoteNumber}</span>
            </div>
            <div>
              <span className="opacity-70">Date:</span>{" "}
              <span className="font-medium">{date}</span>
            </div>
            <div>
              <span className="opacity-70">Client:</span>{" "}
              <span className="font-medium">{clientName || "—"}</span>
            </div>
            <div>
              <span className="opacity-70">Reg:</span>{" "}
              <span className="font-mono font-medium">{registration || "—"}</span>
            </div>
            {claimNumber && (
              <div>
                <span className="opacity-70">Claim:</span>{" "}
                <span className="font-medium">{claimNumber}</span>
              </div>
            )}
            {jobNumber && (
              <div>
                <span className="opacity-70">Job:</span>{" "}
                <span className="font-medium">{jobNumber}</span>
              </div>
            )}
          </div>

          {/* Vehicle & Version */}
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <span className="opacity-70">Vehicle:</span>{" "}
              <span className="font-semibold">{vehicleMake} {vehicleModel}</span>
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              v{version}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
