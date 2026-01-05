import { useState } from "react";
import { useConsumables, useCaseConsumables, useAddCaseConsumable } from "@/hooks/useConsumables";
import { useWorkshopSegments } from "@/hooks/useWorkshopSegments";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Beaker, Plus, Check, Search } from "lucide-react";
import { format } from "date-fns";

interface TabletConsumablesViewProps {
  caseId: string;
  technicianId: string;
}

export function TabletConsumablesView({ caseId, technicianId }: TabletConsumablesViewProps) {
  const { tenantId } = useUserTenant();
  const { data: consumables, isLoading: consumablesLoading } = useConsumables();
  const { data: caseConsumables, isLoading: caseConsumablesLoading } = useCaseConsumables(caseId);
  const { data: segments } = useWorkshopSegments();
  const addCaseConsumable = useAddCaseConsumable();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConsumable, setSelectedConsumable] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const isLoading = consumablesLoading || caseConsumablesLoading;

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  const filteredConsumables = consumables?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConsumableData = consumables?.find(c => c.id === selectedConsumable);

  const handleQuickAdd = (consumableId: string) => {
    setSelectedConsumable(consumableId);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!selectedConsumable || !tenantId) return;

    const consumable = consumables?.find(c => c.id === selectedConsumable);
    if (!consumable) return;

    addCaseConsumable.mutate({
      case_id: caseId,
      consumable_id: selectedConsumable,
      quantity: parseFloat(quantity),
      unit_cost: consumable.unit_cost,
      tenant_id: tenantId,
      notes: notes || null,
      segment_id: selectedSegment || null,
      technician_id: technicianId,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        setSelectedConsumable(null);
        setQuantity("1");
        setNotes("");
        setSelectedSegment(null);
      },
    });
  };

  // Group recent consumables
  const recentConsumableIds = caseConsumables?.slice(0, 5).map(cc => cc.consumable_id) || [];
  const recentConsumables = consumables?.filter(c => recentConsumableIds.includes(c.id)) || [];

  return (
    <div className="space-y-4">
      {/* Quick Add Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Add Consumable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search consumables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Recent Consumables */}
          {recentConsumables.length > 0 && !searchQuery && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Recently Used</p>
              <div className="flex flex-wrap gap-2">
                {recentConsumables.map((consumable) => (
                  <Button
                    key={consumable.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(consumable.id)}
                    className="h-10"
                  >
                    <Beaker className="w-4 h-4 mr-1" />
                    {consumable.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {filteredConsumables?.map((consumable) => (
                <Button
                  key={consumable.id}
                  variant="ghost"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => handleQuickAdd(consumable.id)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <p className="font-medium">{consumable.name}</p>
                      <p className="text-xs text-muted-foreground">
                        R {consumable.unit_cost.toFixed(2)} / {consumable.unit_of_measure}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      Stock: {consumable.current_stock}
                    </Badge>
                  </div>
                </Button>
              ))}
              {filteredConsumables?.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No consumables found</p>
              )}
            </div>
          )}

          {/* All Categories */}
          {!searchQuery && (
            <div className="grid grid-cols-2 gap-2">
              {consumables?.slice(0, 8).map((consumable) => (
                <Button
                  key={consumable.id}
                  variant="outline"
                  className="h-auto py-3 justify-start"
                  onClick={() => handleQuickAdd(consumable.id)}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">{consumable.name}</p>
                    <p className="text-xs text-muted-foreground">
                      R {consumable.unit_cost.toFixed(2)}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Used on this case */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            Used on This Job ({caseConsumables?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!caseConsumables || caseConsumables.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No consumables logged yet
            </p>
          ) : (
            <div className="space-y-2">
              {caseConsumables.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.consumable?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} {item.consumable?.unit_of_measure} × R {(item.unit_cost || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">R {item.total_cost?.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(item.created_at), "HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Consumable Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Consumable Usage</DialogTitle>
          </DialogHeader>
          
          {selectedConsumableData && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-bold text-lg">{selectedConsumableData.name}</p>
                <p className="text-sm text-muted-foreground">
                  R {selectedConsumableData.unit_cost.toFixed(2)} per {selectedConsumableData.unit_of_measure}
                </p>
                <p className="text-sm text-muted-foreground">
                  Stock: {selectedConsumableData.current_stock} available
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Quantity ({selectedConsumableData.unit_of_measure})</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0.1"
                  step="0.1"
                  className="h-12 text-lg"
                />
              </div>

              <div className="grid gap-2">
                <Label>Workshop Segment (Optional)</Label>
                <Select value={selectedSegment || ""} onValueChange={setSelectedSegment}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments?.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.segment_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="h-12"
                />
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-primary">
                  R {(parseFloat(quantity || "0") * selectedConsumableData.unit_cost).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={addCaseConsumable.isPending}
              className="h-12 px-8"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
