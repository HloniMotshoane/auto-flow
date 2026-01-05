import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useQCChecklists,
  useCreateQCChecklist,
  useUpdateQCChecklist,
  useDeleteQCChecklist,
  QCChecklist,
} from "@/hooks/useQCChecklists";
import { useActiveWorkshopSegments } from "@/hooks/useWorkshopSegments";
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardCheck,
  List,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const checklistTypes = [
  { value: "pre_repair", label: "Pre-Repair Assessment", color: "bg-blue-500" },
  { value: "mid_repair", label: "Mid-Repair Check", color: "bg-yellow-500" },
  { value: "final_qc", label: "Final QC", color: "bg-green-500" },
];

export default function QCChecklists() {
  const navigate = useNavigate();
  const { data: checklists, isLoading } = useQCChecklists();
  const { data: segments } = useActiveWorkshopSegments();
  const createChecklist = useCreateQCChecklist();
  const updateChecklist = useUpdateQCChecklist();
  const deleteChecklist = useDeleteQCChecklist();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<QCChecklist | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    checklist_type: "pre_repair",
    segment_id: "",
    is_active: true,
    is_required: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      checklist_type: "pre_repair",
      segment_id: "",
      is_active: true,
      is_required: false,
    });
    setEditingChecklist(null);
  };

  const handleOpenDialog = (checklist?: QCChecklist) => {
    if (checklist) {
      setEditingChecklist(checklist);
      setFormData({
        name: checklist.name,
        description: checklist.description || "",
        checklist_type: checklist.checklist_type,
        segment_id: checklist.segment_id || "",
        is_active: checklist.is_active,
        is_required: checklist.is_required,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      segment_id: formData.segment_id || null,
      sort_order: editingChecklist?.sort_order || 0,
    };

    if (editingChecklist) {
      await updateChecklist.mutateAsync({ id: editingChecklist.id, ...payload });
    } else {
      await createChecklist.mutateAsync(payload);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this checklist?")) {
      await deleteChecklist.mutateAsync(id);
    }
  };

  const getTypeInfo = (type: string) => {
    return checklistTypes.find((t) => t.value === type) || checklistTypes[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QC Checklists</h1>
          <p className="text-muted-foreground">
            Create and manage quality control checklist templates
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Checklist
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checklists</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checklists?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pre-Repair</CardTitle>
            <List className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists?.filter((c) => c.checklist_type === "pre_repair").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mid-Repair</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists?.filter((c) => c.checklist_type === "mid_repair").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final QC</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {checklists?.filter((c) => c.checklist_type === "final_qc").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklists Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading checklists...
                  </TableCell>
                </TableRow>
              ) : checklists?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No checklists found. Create your first QC checklist.
                  </TableCell>
                </TableRow>
              ) : (
                checklists?.map((checklist) => {
                  const typeInfo = getTypeInfo(checklist.checklist_type);
                  return (
                    <TableRow key={checklist.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{checklist.name}</div>
                          {checklist.description && (
                            <div className="text-sm text-muted-foreground">
                              {checklist.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {checklist.segment ? (
                          <Badge
                            variant="outline"
                            style={{ borderColor: checklist.segment.color || undefined }}
                          >
                            {checklist.segment.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">All segments</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {checklist.is_required ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={checklist.is_active ? "default" : "outline"}>
                          {checklist.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/settings/qc-checklists/${checklist.id}`)}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(checklist)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(checklist.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChecklist ? "Edit Checklist" : "Create New Checklist"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Checklist Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Pre-Repair Damage Assessment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Checklist Type</Label>
              <Select
                value={formData.checklist_type}
                onValueChange={(value) => setFormData({ ...formData, checklist_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {checklistTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="segment">Segment (optional)</Label>
              <Select
                value={formData.segment_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, segment_id: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All segments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All segments</SelectItem>
                  {segments?.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {(segment as any).name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_required">Required Checklist</Label>
              <Switch
                id="is_required"
                checked={formData.is_required}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_required: checked })
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
            <Button onClick={handleSubmit} disabled={!formData.name}>
              {editingChecklist ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
