import { useState } from "react";
import { useSupplierParts, SupplierPart } from "@/hooks/useSupplierParts";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePartCategories } from "@/hooks/usePartCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Pencil, Trash2, Package, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function PartsCatalogue() {
  const { parts, isLoading, createPart, updatePart, deletePart } = useSupplierParts();
  const { activeSuppliers } = useSuppliers();
  const { categories, activeCategories, createCategory } = usePartCategories();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSupplier, setFilterSupplier] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SupplierPart | null>(null);
  
  const [formData, setFormData] = useState({
    supplier_id: "",
    category_id: "",
    part_name: "",
    part_number: "",
    vin_number: "",
    description: "",
    model_compatibility: "",
    list_price: "",
    stock_available: "",
    image_url: "",
    is_active: true,
  });

  const [newCategory, setNewCategory] = useState({ name: "", description: "", color: "#6B7280" });

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.part_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model_compatibility?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier = filterSupplier === "all" || p.supplier_id === filterSupplier;
    const matchesCategory = filterCategory === "all" || p.category_id === filterCategory;
    return matchesSearch && matchesSupplier && matchesCategory;
  });

  const handleOpenDialog = (part?: SupplierPart) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        supplier_id: part.supplier_id,
        category_id: part.category_id || "",
        part_name: part.part_name,
        part_number: part.part_number || "",
        vin_number: part.vin_number || "",
        description: part.description || "",
        model_compatibility: part.model_compatibility || "",
        list_price: part.list_price?.toString() || "",
        stock_available: part.stock_available?.toString() || "",
        image_url: part.image_url || "",
        is_active: part.is_active ?? true,
      });
    } else {
      setEditingPart(null);
      setFormData({
        supplier_id: activeSuppliers[0]?.id || "",
        category_id: "",
        part_name: "",
        part_number: "",
        vin_number: "",
        description: "",
        model_compatibility: "",
        list_price: "",
        stock_available: "",
        image_url: "",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.part_name.trim() || !formData.supplier_id) {
      toast({ title: "Error", description: "Part name and supplier are required", variant: "destructive" });
      return;
    }

    const payload = {
      supplier_id: formData.supplier_id,
      category_id: formData.category_id || null,
      part_name: formData.part_name,
      part_number: formData.part_number || null,
      vin_number: formData.vin_number || null,
      description: formData.description || null,
      model_compatibility: formData.model_compatibility || null,
      list_price: formData.list_price ? parseFloat(formData.list_price) : 0,
      stock_available: formData.stock_available ? parseInt(formData.stock_available) : null,
      image_url: formData.image_url || null,
      is_active: formData.is_active,
    };

    if (editingPart) {
      updatePart.mutate({ id: editingPart.id, ...payload }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      createPart.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDelete = (part: SupplierPart) => {
    if (confirm(`Are you sure you want to delete ${part.part_name}?`)) {
      deletePart.mutate(part.id);
    }
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }
    createCategory.mutate({ ...newCategory, is_active: true }, {
      onSuccess: () => {
        setCategoryDialogOpen(false);
        setNewCategory({ name: "", description: "", color: "#6B7280" });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Parts Catalogue</h1>
          <p className="text-muted-foreground">Manage supplier parts inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <Tag className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Part
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search parts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterSupplier} onValueChange={setFilterSupplier}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Suppliers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Suppliers</SelectItem>
            {activeSuppliers.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.supplier_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {activeCategories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Parts ({filteredParts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part</TableHead>
                <TableHead>Part #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Model Compatibility</TableHead>
                <TableHead className="text-right">List Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{part.part_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{part.part_number || "-"}</TableCell>
                  <TableCell>{part.supplier?.supplier_name || "-"}</TableCell>
                  <TableCell>
                    {part.category && (
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: part.category.color || undefined }}
                      >
                        {part.category.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                    {part.model_compatibility || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R {part.list_price?.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    {part.stock_available ?? "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={part.is_active ? "default" : "secondary"}>
                      {part.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(part)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(part)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredParts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No parts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Part Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPart ? "Edit Part" : "Add Part"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="supplier_id">Supplier *</Label>
              <Select value={formData.supplier_id} onValueChange={(v) => setFormData({ ...formData, supplier_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {activeSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.supplier_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="part_name">Part Name *</Label>
              <Input
                id="part_name"
                value={formData.part_name}
                onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="part_number">Part Number</Label>
                <Input
                  id="part_number"
                  value={formData.part_number}
                  onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vin_number">VIN Number</Label>
                <Input
                  id="vin_number"
                  value={formData.vin_number}
                  onChange={(e) => setFormData({ ...formData, vin_number: e.target.value })}
                  placeholder="Vehicle Identification Number"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category_id">Category</Label>
              <Select value={formData.category_id} onValueChange={(v) => setFormData({ ...formData, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model_compatibility">Model Compatibility</Label>
              <Input
                id="model_compatibility"
                value={formData.model_compatibility}
                onChange={(e) => setFormData({ ...formData, model_compatibility: e.target.value })}
                placeholder="e.g., VW Polo Vivo 2018-2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="list_price">List Price (R)</Label>
                <Input
                  id="list_price"
                  type="number"
                  value={formData.list_price}
                  onChange={(e) => setFormData({ ...formData, list_price: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock_available">Stock Available</Label>
                <Input
                  id="stock_available"
                  type="number"
                  value={formData.stock_available}
                  onChange={(e) => setFormData({ ...formData, stock_available: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createPart.isPending || updatePart.isPending}>
              {editingPart ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cat_name">Category Name *</Label>
              <Input
                id="cat_name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat_desc">Description</Label>
              <Input
                id="cat_desc"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat_color">Color</Label>
              <Input
                id="cat_color"
                type="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
