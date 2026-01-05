import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useQCChecklistWithItems,
  useCreateQCChecklistItem,
  useUpdateQCChecklistItem,
  useDeleteQCChecklistItem,
  QCChecklistItem,
} from "@/hooks/useQCChecklists";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Camera,
  FileText,
} from "lucide-react";

export default function QCChecklistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: checklist, isLoading } = useQCChecklistWithItems(id);
  const createItem = useCreateQCChecklistItem();
  const updateItem = useUpdateQCChecklistItem();
  const deleteItem = useDeleteQCChecklistItem();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<QCChecklistItem | null>(null);
  const [formData, setFormData] = useState({
    item_text: "",
    description: "",
    requires_photo: false,
    requires_notes: false,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      item_text: "",
      description: "",
      requires_photo: false,
      requires_notes: false,
      is_active: true,
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: QCChecklistItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_text: item.item_text,
        description: item.description || "",
        requires_photo: item.requires_photo,
        requires_notes: item.requires_notes,
        is_active: item.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!id) return;

    const sortOrder = checklist?.items?.length || 0;

    if (editingItem) {
      await updateItem.mutateAsync({ id: editingItem.id, ...formData });
    } else {
      await createItem.mutateAsync({
        ...formData,
        checklist_id: id,
        sort_order: sortOrder,
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem.mutateAsync(itemId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading checklist...</p>
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Checklist not found</p>
      </div>
    );
  }

  const sortedItems = [...(checklist.items || [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{checklist.name}</h1>
          <p className="text-muted-foreground">
            {checklist.description || "Manage checklist items"}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Checklist Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                checklist.checklist_type === "pre_repair"
                  ? "bg-blue-500"
                  : checklist.checklist_type === "mid_repair"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }
            >
              {checklist.checklist_type === "pre_repair"
                ? "Pre-Repair"
                : checklist.checklist_type === "mid_repair"
                ? "Mid-Repair"
                : "Final QC"}
            </Badge>
            {checklist.segment && (
              <Badge variant="outline">{checklist.segment.name}</Badge>
            )}
            {checklist.is_required && (
              <Badge variant="destructive">Required</Badge>
            )}
            <Badge variant={checklist.is_active ? "default" : "secondary"}>
              {checklist.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Checklist Items ({sortedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items yet. Add your first checklist item.
            </div>
          ) : (
            <div className="space-y-2">
              {sortedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <span className="text-sm font-medium text-muted-foreground w-8">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <div className="font-medium">{item.item_text}</div>
                    {item.description && (
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.requires_photo && (
                      <Badge variant="outline" className="gap-1">
                        <Camera className="h-3 w-3" />
                        Photo
                      </Badge>
                    )}
                    {item.requires_notes && (
                      <Badge variant="outline" className="gap-1">
                        <FileText className="h-3 w-3" />
                        Notes
                      </Badge>
                    )}
                    {!item.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add Checklist Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item_text">Item Text</Label>
              <Input
                id="item_text"
                value={formData.item_text}
                onChange={(e) =>
                  setFormData({ ...formData, item_text: e.target.value })
                }
                placeholder="e.g., Check for hidden damage under panels"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Additional instructions..."
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requires_photo">Requires Photo</Label>
                <p className="text-sm text-muted-foreground">
                  Photo must be taken for this item
                </p>
              </div>
              <Switch
                id="requires_photo"
                checked={formData.requires_photo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_photo: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requires_notes">Requires Notes</Label>
                <p className="text-sm text-muted-foreground">
                  Notes must be entered for this item
                </p>
              </div>
              <Switch
                id="requires_notes"
                checked={formData.requires_notes}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_notes: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.item_text}>
              {editingItem ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
