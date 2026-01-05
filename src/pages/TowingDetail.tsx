import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useTowingRecord } from "@/hooks/useTowingRecords";
import TowClientVehicleTab from "@/components/towing/TowClientVehicleTab";
import TowInternalNotesTab from "@/components/towing/TowInternalNotesTab";
import TowProformaInvoiceTab from "@/components/towing/TowProformaInvoiceTab";
import TowCostTab from "@/components/towing/TowCostTab";
import TowDocumentsTab from "@/components/towing/TowDocumentsTab";
import TowSecurityPhotosTab from "@/components/towing/TowSecurityPhotosTab";

export default function TowingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading } = useTowingRecord(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Towing record not found</p>
        <Button onClick={() => navigate("/towing")}>Back to Towing</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/towing")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-sm font-bold text-primary">
              {record.tow_type?.charAt(0).toUpperCase() || "T"}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{record.reference_number}</h1>
            <p className="text-sm text-muted-foreground">
              {record.registration_number || "No registration"} • {record.make} {record.model}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="client-vehicle" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="client-vehicle">Client & Vehicle</TabsTrigger>
          <TabsTrigger value="internal-notes">Internal Notes</TabsTrigger>
          <TabsTrigger value="proforma-invoice">Proforma Invoice</TabsTrigger>
          <TabsTrigger value="tow-cost">Tow Cost</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="security-photos">Security Photos</TabsTrigger>
          <TabsTrigger value="tax-invoice">Tax Invoice</TabsTrigger>
          <TabsTrigger value="booking-conf">Booking Conf.</TabsTrigger>
          <TabsTrigger value="salvage-status">Salvage Status</TabsTrigger>
          <TabsTrigger value="security-checklist">Security Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="client-vehicle">
          <TowClientVehicleTab record={record} />
        </TabsContent>

        <TabsContent value="internal-notes">
          <TowInternalNotesTab record={record} />
        </TabsContent>

        <TabsContent value="proforma-invoice">
          <TowProformaInvoiceTab record={record} />
        </TabsContent>

        <TabsContent value="tow-cost">
          <TowCostTab record={record} />
        </TabsContent>

        <TabsContent value="documents">
          <TowDocumentsTab record={record} />
        </TabsContent>

        <TabsContent value="security-photos">
          <TowSecurityPhotosTab record={record} />
        </TabsContent>

        <TabsContent value="tax-invoice">
          <div className="text-center py-8 text-muted-foreground">
            Tax Invoice tab - Coming soon
          </div>
        </TabsContent>

        <TabsContent value="booking-conf">
          <div className="text-center py-8 text-muted-foreground">
            Booking Confirmation tab - Coming soon
          </div>
        </TabsContent>

        <TabsContent value="salvage-status">
          <div className="text-center py-8 text-muted-foreground">
            Salvage Status tab - Coming soon
          </div>
        </TabsContent>

        <TabsContent value="security-checklist">
          <div className="text-center py-8 text-muted-foreground">
            Security Checklist tab - Coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
