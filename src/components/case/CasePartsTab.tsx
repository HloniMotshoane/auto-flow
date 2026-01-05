import { useCasePartsRequired } from "@/hooks/useCasePartsRequired";
import { useCasePartsUsed } from "@/hooks/useCasePartsUsed";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Wrench, ClipboardList, Beaker } from "lucide-react";
import { format } from "date-fns";

interface CasePartsTabProps {
  caseId: string;
}

export function CasePartsTab({ caseId }: CasePartsTabProps) {
  const { tenantId } = useUserTenant();
  const { partsRequired, isLoading: partsRequiredLoading } = useCasePartsRequired(caseId);
  const { partsUsed, isLoading: partsUsedLoading, totalPartsCost } = useCasePartsUsed(caseId);

  // Fetch consumables used for this case
  const { data: consumablesUsed, isLoading: consumablesLoading } = useQuery({
    queryKey: ["case-consumables", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_consumables")
        .select(`
          *,
          consumable:consumables(id, name, unit_of_measure)
        `)
        .eq("case_id", caseId)
        .eq("tenant_id", tenantId);

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!tenantId,
  });

  const totalConsumablesCost = consumablesUsed?.reduce((sum, c) => sum + (c.total_cost || 0), 0) || 0;

  const isLoading = partsRequiredLoading || partsUsedLoading || consumablesLoading;

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "ordered": return "bg-blue-500/10 text-blue-600";
      case "received": return "bg-green-500/10 text-green-600";
      case "fitted": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{partsRequired?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Parts Requested</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{partsUsed?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Parts Fitted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  R {totalPartsCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Parts Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  R {totalConsumablesCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-muted-foreground">Consumables Cost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="required">
        <TabsList>
          <TabsTrigger value="required">Parts Required</TabsTrigger>
          <TabsTrigger value="fitted">Parts Fitted</TabsTrigger>
          <TabsTrigger value="consumables">Consumables Used</TabsTrigger>
        </TabsList>

        <TabsContent value="required" className="mt-4">
          {!partsRequired || partsRequired.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No parts requested yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {partsRequired.map((part) => (
                <Card key={part.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{part.part_description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(part.status)}>
                            {part.status || "pending"}
                          </Badge>
                          {part.urgency && (
                            <Badge variant="outline" className="capitalize">
                              {part.urgency}
                            </Badge>
                          )}
                        </div>
                        {part.reason && (
                          <p className="text-sm text-muted-foreground mt-2">{part.reason}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(part.created_at), "dd MMM yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fitted" className="mt-4">
          {!partsUsed || partsUsed.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No parts fitted yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {partsUsed.map((part) => (
                <Card key={part.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{part.part_description || "Part"}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>Qty: {part.quantity || 1}</span>
                          <span>
                            Cost: R {(part.cost_paid || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                          </span>
                          {(part as any).supplier && (
                            <span>Supplier: {(part as any).supplier.name}</span>
                          )}
                        </div>
                        {part.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{part.notes}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {part.fitted_at && format(new Date(part.fitted_at), "dd MMM yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="consumables" className="mt-4">
          {!consumablesUsed || consumablesUsed.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Beaker className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No consumables logged yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {consumablesUsed.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{item.consumable?.name || "Consumable"}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>
                            Qty: {item.quantity} {item.consumable?.unit_of_measure || "units"}
                          </span>
                          <span>
                            Unit Cost: R {(item.unit_cost || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                          </span>
                          <span>
                            Total: R {(item.total_cost || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{item.notes}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "dd MMM yyyy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
