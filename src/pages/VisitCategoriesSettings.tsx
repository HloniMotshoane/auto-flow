import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, GripVertical, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useVisitCategories, VisitCategory } from "@/hooks/useVisitors";
import { Skeleton } from "@/components/ui/skeleton";

export default function VisitCategoriesSettings() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useVisitCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VisitCategory | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    description: "",
    requires_vehicle: false,
    requires_company: false,
    requires_host: false,
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      requires_vehicle: false,
      requires_company: false,
      requires_host: false,
    });
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    if (editingCategory) {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        ...form,
      });
    } else {
      await createCategory.mutateAsync(form);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (category: VisitCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || "",
      requires_vehicle: category.requires_vehicle,
      requires_company: category.requires_company,
      requires_host: category.requires_host,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/visitors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Visit Categories</h1>
          <p className="text-muted-foreground">Manage visitor sign-in categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Client – Requesting Quote"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                  className="mt-1"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requires_vehicle">Requires Vehicle Details</Label>
                  <Switch
                    id="requires_vehicle"
                    checked={form.requires_vehicle}
                    onCheckedChange={(checked) => setForm({ ...form, requires_vehicle: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requires_company">Requires Company Name</Label>
                  <Switch
                    id="requires_company"
                    checked={form.requires_company}
                    onCheckedChange={(checked) => setForm({ ...form, requires_company: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requires_host">Requires Host Selection</Label>
                  <Switch
                    id="requires_host"
                    checked={form.requires_host}
                    onCheckedChange={(checked) => setForm({ ...form, requires_host: checked })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!form.name.trim()}>
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No categories configured yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell>
                      {category.requires_vehicle ? "Required" : "-"}
                    </TableCell>
                    <TableCell>
                      {category.requires_company ? "Required" : "-"}
                    </TableCell>
                    <TableCell>
                      {category.requires_host ? "Required" : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Default Categories Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> If no custom categories are configured, the tablet will display
            default categories (Client – Quote, Client – Collect, Assessor, Supplier, Meeting, etc.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
