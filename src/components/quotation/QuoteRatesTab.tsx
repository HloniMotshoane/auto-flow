import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Wrench, Paintbrush, Truck, Settings } from "lucide-react";

interface SLARates {
  labourWarrantyRate: number;
  labourNonWarrantyRate: number;
  paintWarrantyPerPanel: number;
  paintNonWarrantyPerPanel: number;
  paintBlending: number;
  paintPearlescent: number;
  paintWaterBased: number;
  mechanicalPercent: number;
  electricalPercent: number;
  airConPercent: number;
  wheelAlignmentPercent: number;
  windscreenPercent: number;
  upholsteryPercent: number;
  jigHirePercent: number;
  wasteDisposalRate: number;
  towingFirstKmFree: number;
  towingPerKm: number;
  storagePerDay: number;
}

interface QuoteRatesTabProps {
  rates: SLARates | null;
  slaCompanyName?: string;
  isLoading?: boolean;
}

export function QuoteRatesTab({ rates, slaCompanyName, isLoading }: QuoteRatesTabProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading SLA rates...
      </div>
    );
  }

  if (!rates) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Settings className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No SLA rates loaded</p>
          <p className="text-sm text-muted-foreground mt-1">
            Select an insurance company to load their SLA rates
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {slaCompanyName && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            SLA: {slaCompanyName}
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Labour Rates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Labour Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warranty Rate:</span>
              <span className="font-medium">R{rates.labourWarrantyRate.toFixed(2)}/hr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Non-Warranty Rate:</span>
              <span className="font-medium">R{rates.labourNonWarrantyRate.toFixed(2)}/hr</span>
            </div>
          </CardContent>
        </Card>

        {/* Paint Rates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Paintbrush className="h-4 w-4" />
              Paint Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warranty/Panel:</span>
              <span className="font-medium">R{rates.paintWarrantyPerPanel.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Non-Warranty/Panel:</span>
              <span className="font-medium">R{rates.paintNonWarrantyPerPanel.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blending:</span>
              <span className="font-medium">R{rates.paintBlending.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pearlescent:</span>
              <span className="font-medium">R{rates.paintPearlescent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water Based:</span>
              <span className="font-medium">R{rates.paintWaterBased.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Outwork Rates */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Outwork Caps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mechanical:</span>
              <span className="font-medium">{rates.mechanicalPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Electrical:</span>
              <span className="font-medium">{rates.electricalPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Air Con:</span>
              <span className="font-medium">{rates.airConPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wheel Alignment:</span>
              <span className="font-medium">{rates.wheelAlignmentPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Windscreen:</span>
              <span className="font-medium">{rates.windscreenPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upholstery:</span>
              <span className="font-medium">{rates.upholsteryPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jig Hire:</span>
              <span className="font-medium">{rates.jigHirePercent}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Towing & Storage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Towing & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">First KM Free:</span>
              <span className="font-medium">{rates.towingFirstKmFree} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Per KM:</span>
              <span className="font-medium">R{rates.towingPerKm.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage/Day:</span>
              <span className="font-medium">R{rates.storagePerDay.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Other */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Other Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waste Disposal:</span>
              <span className="font-medium">R{rates.wasteDisposalRate.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
