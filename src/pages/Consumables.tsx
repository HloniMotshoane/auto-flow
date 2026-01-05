import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, Filter, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/dialog";
import { useConsumables, useConsumableCategories, useLowStockConsumables } from "@/hooks/useConsumables";
import { ConsumableForm } from "@/components/consumables/ConsumableForm";
import { StockMovementDialog } from "@/components/consumables/StockMovementDialog";
import { AllocateToCaseDialog } from "@/components/consumables/AllocateToCaseDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Consumables() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConsumable, setEditingConsumable] = useState<string | null>(null);
  const [stockMovementConsumable, setStockMovementConsumable] = useState<string | null>(null);
  const [allocateConsumable, setAllocateConsumable] = useState<string | null>(null);

  const { data: consumables, isLoading } = useConsumables();
  const { data: categories } = useConsumableCategories();
  const { data: lowStockItems } = useLowStockConsumables();

  const filteredConsumables = consumables?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    const matchesLowStock = !showLowStockOnly || item.current_stock <= item.minimum_stock_level;
    return matchesSearch && matchesCategory && matchesLowStock && item.is_active;
  });

  const handleEdit = (id: string) => {
    setEditingConsumable(id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingConsumable(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consumables</h1>
          <p className="text-muted-foreground">Manage inventory and track consumable usage</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Consumable
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consumables?.filter(c => c.is_active).length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className={lowStockItems && lowStockItems.length > 0 ? "border-destructive" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${lowStockItems && lowStockItems.length > 0 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockItems && lowStockItems.length > 0 ? "text-destructive" : ""}`}>
              {lowStockItems?.length || 0}
            </div>
            {lowStockItems && lowStockItems.length > 0 && (
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-destructive"
                onClick={() => setShowLowStockOnly(true)}
              >
                View items
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search consumables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showLowStockOnly ? "default" : "outline"}
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className="gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Low Stock Only
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min Level</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsumables?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No consumables found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsumables?.map((item) => {
                    const isLowStock = item.current_stock <= item.minimum_stock_level;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.name}
                            {isLowStock && (
                              <Badge variant="destructive" className="text-xs">
                                Low
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.sku || "-"}
                        </TableCell>
                        <TableCell>
                          {item.category && (
                            <Badge 
                              variant="secondary"
                              style={{ 
                                backgroundColor: item.category.color || undefined,
                                color: "white"
                              }}
                            >
                              {item.category.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${isLowStock ? "text-destructive" : ""}`}>
                          {item.current_stock}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.minimum_stock_level}
                        </TableCell>
                        <TableCell className="text-right">
                          R{item.unit_cost.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.unit_of_measure}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAllocateConsumable(item.id)}
                              title="Allocate to Job"
                            >
                              <FileOutput className="h-4 w-4 mr-1" />
                              Allocate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setStockMovementConsumable(item.id)}
                            >
                              Stock
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item.id)}
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Consumable Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConsumable ? "Edit Consumable" : "Add Consumable"}
            </DialogTitle>
          </DialogHeader>
          <ConsumableForm
            consumableId={editingConsumable}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <StockMovementDialog
        consumableId={stockMovementConsumable}
        onClose={() => setStockMovementConsumable(null)}
      />

      {/* Allocate to Case Dialog */}
      <AllocateToCaseDialog
        consumableId={allocateConsumable}
        onClose={() => setAllocateConsumable(null)}
      />
    </div>
  );
}
