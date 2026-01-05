import { useCasePartsRequired } from "@/hooks/useCasePartsRequired";
import { usePartsOrders } from "@/hooks/usePartsOrders";
import { useCasePartsUsed } from "@/hooks/useCasePartsUsed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  CheckCircle, 
  Truck, 
  Clock,
  Wrench 
} from "lucide-react";
import { format } from "date-fns";

interface TabletPartsViewProps {
  caseId: string;
  technicianId: string;
}

export function TabletPartsView({ caseId, technicianId }: TabletPartsViewProps) {
  const { partsRequired, isLoading: requiredLoading } = useCasePartsRequired(caseId);
  const { orders, isLoading: ordersLoading, markDelivered, markFitted } = usePartsOrders(caseId);
  const { partsUsed, isLoading: usedLoading } = useCasePartsUsed(caseId);

  const isLoading = requiredLoading || ordersLoading || usedLoading;

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const pendingOrders = orders.filter(o => o.status === "ordered");

  const handleMarkFitted = (orderId: string) => {
    markFitted.mutate({ orderId, fittedBy: technicianId });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "ordered": return <Truck className="w-4 h-4" />;
      case "delivered": return <Package className="w-4 h-4" />;
      case "fitted": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "ordered": return "bg-blue-500/10 text-blue-600";
      case "delivered": return "bg-green-500/10 text-green-600";
      case "fitted": return "bg-primary/10 text-primary";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Tabs defaultValue="ready">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="ready">
          Ready to Fit ({deliveredOrders.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({pendingOrders.length})
        </TabsTrigger>
        <TabsTrigger value="fitted">
          Fitted ({partsUsed?.length || 0})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ready" className="mt-4 space-y-3">
        {deliveredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Package className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No parts ready to fit</p>
            </CardContent>
          </Card>
        ) : (
          deliveredOrders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{order.part_description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">Qty: {order.quantity}</span>
                    </div>
                    {order.supplier && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Supplier: {order.supplier.supplier_name}
                      </p>
                    )}
                  </div>
                  <Button
                    size="lg"
                    className="h-14 px-6"
                    onClick={() => handleMarkFitted(order.id)}
                    disabled={markFitted.isPending}
                  >
                    <Wrench className="w-5 h-5 mr-2" />
                    Mark Fitted
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="pending" className="mt-4 space-y-3">
        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Truck className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No parts on order</p>
            </CardContent>
          </Card>
        ) : (
          pendingOrders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{order.part_description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">Qty: {order.quantity}</span>
                    </div>
                    {order.expected_delivery_date && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ETA: {format(new Date(order.expected_delivery_date), "dd MMM yyyy")}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => markDelivered.mutate(order.id)}
                    disabled={markDelivered.isPending}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Mark Delivered
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Parts Required but not ordered */}
        {partsRequired && partsRequired.filter(p => p.status !== "ordered" && p.status !== "received" && p.status !== "fitted").length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Parts Requested (Not Ordered)</h3>
            {partsRequired
              .filter(p => p.status !== "ordered" && p.status !== "received" && p.status !== "fitted")
              .map((part) => (
                <Card key={part.id} className="mb-2 border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <p className="font-medium">{part.part_description}</p>
                    <Badge className="mt-1" variant="secondary">
                      {part.status || "pending"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="fitted" className="mt-4 space-y-3">
        {!partsUsed || partsUsed.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No parts fitted yet</p>
            </CardContent>
          </Card>
        ) : (
          partsUsed.map((part) => (
            <Card key={part.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{part.part_description || "Part"}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>Qty: {part.quantity || 1}</span>
                      <span>Cost: R {(part.cost_paid || 0).toFixed(2)}</span>
                    </div>
                    {part.fitted_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Fitted: {format(new Date(part.fitted_at), "dd MMM yyyy HH:mm")}
                      </p>
                    )}
                  </div>
                  <Badge className="bg-primary/10 text-primary">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Fitted
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
