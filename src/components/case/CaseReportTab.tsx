import { useCasePartsRequired } from "@/hooks/useCasePartsRequired";
import { useCasePartsUsed } from "@/hooks/useCasePartsUsed";
import { usePartsOrders } from "@/hooks/usePartsOrders";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Package, Beaker, FileText, Download, DollarSign } from "lucide-react";

interface CaseReportTabProps {
  caseId: string;
}

export function CaseReportTab({ caseId }: CaseReportTabProps) {
  const { tenantId } = useUserTenant();
  const { partsUsed, isLoading: partsUsedLoading, totalPartsCost } = useCasePartsUsed(caseId);
  const { orders, isLoading: ordersLoading } = usePartsOrders(caseId);

  // Fetch consumables used for this case with segment info
  const { data: consumablesUsed, isLoading: consumablesLoading } = useQuery({
    queryKey: ["case-consumables-report", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("case_consumables")
        .select(`
          *,
          consumable:consumables(id, name, unit_of_measure),
          segment:workshop_segments(id, name)
        `)
        .eq("case_id", caseId)
        .eq("tenant_id", tenantId);

      if (error) throw error;
      return data;
    },
    enabled: !!caseId && !!tenantId,
  });

  const totalConsumablesCost = consumablesUsed?.reduce((sum, c) => sum + (c.total_cost || 0), 0) || 0;
  const totalJobCost = totalPartsCost + totalConsumablesCost;

  const isLoading = partsUsedLoading || ordersLoading || consumablesLoading;

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Parts Cost</p>
                <p className="text-2xl font-bold">
                  R {totalPartsCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumables Cost</p>
                <p className="text-2xl font-bold">
                  R {totalConsumablesCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Beaker className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Job Cost</p>
                <p className="text-2xl font-bold text-primary">
                  R {totalJobCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts Used Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Parts Used
          </CardTitle>
          <Badge variant="secondary">{partsUsed?.length || 0} items</Badge>
        </CardHeader>
        <CardContent>
          {!partsUsed || partsUsed.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No parts recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Description</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partsUsed.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.part_description || "Part"}</TableCell>
                    <TableCell>{(part as any).supplier?.name || "-"}</TableCell>
                    <TableCell className="text-center">{part.quantity || 1}</TableCell>
                    <TableCell className="text-right">
                      R {(part.cost_paid || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R {((part.cost_paid || 0) * (part.quantity || 1)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-bold">Total Parts Cost</TableCell>
                  <TableCell className="text-right font-bold">
                    R {totalPartsCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Consumables Used Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-5 h-5" />
            Consumables Used
          </CardTitle>
          <Badge variant="secondary">{consumablesUsed?.length || 0} items</Badge>
        </CardHeader>
        <CardContent>
          {!consumablesUsed || consumablesUsed.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No consumables recorded</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consumablesUsed.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.consumable?.name || "Consumable"}
                      <span className="text-xs text-muted-foreground ml-1">
                        ({item.consumable?.unit_of_measure})
                      </span>
                    </TableCell>
                    <TableCell>{(item as any).segment?.name || "-"}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">R {item.unit_cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      R {(item.total_cost || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="font-bold">Total Consumables Cost</TableCell>
                  <TableCell className="text-right font-bold">
                    R {totalConsumablesCost.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Export Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Export PDF (Coming Soon)
            </Button>
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Export Excel (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
