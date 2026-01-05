import { useState } from "react";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useWorkflowStages, useCreateWorkflowStage, WorkflowStage } from "@/hooks/useWorkflowStages";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ArrowLeft, Plus, GripVertical, Edit, Trash2, Bell, BellOff } from "lucide-react";
import { Link } from "react-router-dom";

export default function WorkflowStagesSettings() {
  const { tenantId } = useUserTenant();
  const { data: stages, isLoading } = useWorkflowStages(tenantId);
  const createStage = useCreateWorkflowStage();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<WorkflowStage | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    notify_customer: true,
    notification_template: "",
  });

  const updateStageMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<WorkflowStage> }) => {
      const { error } = await supabase
        .from("workflow_stages")
        .update(data.updates)
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-stages"] });
      toast.success("Stage updated successfully");
      setDialogOpen(false);
      setEditingStage(null);
    },
    onError: (error) => {
      console.error("Error updating stage:", error);
      toast.error("Failed to update stage");
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const { error } = await supabase
        .from("workflow_stages")
        .delete()
        .eq("id", stageId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-stages"] });
      toast.success("Stage deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting stage:", error);
      toast.error("Failed to delete stage. It may be in use.");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("workflow_stages")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-stages"] });
    },
  });

  const handleOpenCreate = () => {
    setEditingStage(null);
    setFormData({
      name: "",
      description: "",
      color: "#3B82F6",
      notify_customer: true,
      notification_template: "",
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (stage: WorkflowStage) => {
    setEditingStage(stage);
    setFormData({
      name: stage.name,
      description: stage.description || "",
      color: (stage as any).color || "#3B82F6",
      notify_customer: (stage as any).notify_customer ?? true,
      notification_template: (stage as any).notification_template || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Stage name is required");
      return;
    }

    if (editingStage) {
      updateStageMutation.mutate({
        id: editingStage.id,
        updates: {
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          notify_customer: formData.notify_customer,
          notification_template: formData.notification_template || null,
        } as any,
      });
    } else {
      if (!tenantId) return;
      const maxOrder = stages?.reduce((max, s) => Math.max(max, s.order_index), 0) || 0;
      createStage.mutate({
        tenant_id: tenantId,
        name: formData.name,
        description: formData.description || null,
        order_index: maxOrder + 1,
        is_active: true,
        color: formData.color,
        notify_customer: formData.notify_customer,
        notification_template: formData.notification_template || null,
      } as any, {
        onSuccess: () => {
          setDialogOpen(false);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/workshop">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Workflow Stages</h1>
          <p className="text-muted-foreground">Configure repair process stages and notifications</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Stage
        </Button>
      </div>

      {/* Stages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Repair Stages</CardTitle>
          <CardDescription>
            Define the stages vehicles go through during the repair process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Stage Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-24">Notify</TableHead>
                <TableHead className="w-24">Active</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stages?.map((stage, index) => (
                <TableRow key={stage.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: (stage as any).color || '#3B82F6' }}
                      />
                      <span className="font-medium">{stage.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {stage.description || "-"}
                  </TableCell>
                  <TableCell>
                    {(stage as any).notify_customer ? (
                      <Bell className="w-4 h-4 text-primary" />
                    ) : (
                      <BellOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={stage.is_active}
                      onCheckedChange={(checked) => 
                        toggleActiveMutation.mutate({ id: stage.id, is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenEdit(stage)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this stage?")) {
                            deleteStageMutation.mutate(stage.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!stages || stages.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No workflow stages configured. Click "Add Stage" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStage ? "Edit Stage" : "Add New Stage"}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label>Stage Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Paint Booth"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 p-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this stage"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notify Customer</Label>
                <p className="text-xs text-muted-foreground">
                  Send notification when vehicle enters this stage
                </p>
              </div>
              <Switch
                checked={formData.notify_customer}
                onCheckedChange={(checked) => setFormData({ ...formData, notify_customer: checked })}
              />
            </div>

            {formData.notify_customer && (
              <div className="space-y-2">
                <Label>Notification Message</Label>
                <Textarea
                  value={formData.notification_template}
                  onChange={(e) => setFormData({ ...formData, notification_template: e.target.value })}
                  placeholder="Enter the message to send to customers..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {"{customer_name}"}, {"{vehicle_reg}"}, {"{vehicle_make}"}, {"{vehicle_model}"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createStage.isPending || updateStageMutation.isPending}
            >
              {editingStage ? "Save Changes" : "Add Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
