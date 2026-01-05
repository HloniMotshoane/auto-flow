import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLowStockConsumables } from "@/hooks/useConsumables";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LowStockAlert() {
  const { data: lowStockItems, isLoading } = useLowStockConsumables();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!lowStockItems || lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Low Stock Alerts</span>
          <Badge variant="destructive" className="ml-auto">
            {lowStockItems.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lowStockItems.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm"
          >
            <span className="font-medium truncate flex-1">{item.name}</span>
            <span className="text-destructive font-bold">
              {item.current_stock} / {item.minimum_stock_level} {item.unit_of_measure}
            </span>
          </div>
        ))}
        {lowStockItems.length > 5 && (
          <div className="text-sm text-muted-foreground">
            +{lowStockItems.length - 5} more items
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => navigate("/consumables")}
        >
          View All Consumables
        </Button>
      </CardContent>
    </Card>
  );
}
