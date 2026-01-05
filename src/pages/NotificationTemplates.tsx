import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Mail, MessageSquare, Loader2 } from "lucide-react";

interface NotificationTemplate {
  id: string;
  tenant_id: string;
  name: string;
  notification_type: string;
  channel: string;
  subject_template: string | null;
  body_template: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

const notificationTypes = [
  { value: "status_update", label: "Status Update" },
  { value: "ecd_update", label: "ECD Update" },
  { value: "ready_for_collection", label: "Ready for Collection" },
  { value: "payment_reminder", label: "Payment Reminder" },
];

const channels = [
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: MessageSquare },
];

export default function NotificationTemplates() {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    notification_type: "status_update",
    channel: "email",
    subject_template: "",
    body_template: "",
    is_active: true,
    is_default: false,
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ["notification-templates", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("notification_type")
        .order("name");
      if (error) throw error;
      return data as NotificationTemplate[];
    },
    enabled: !!tenantId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingTemplate) {
        const { error } = await supabase
          .from("notification_templates")
          .update(data)
          .eq("id", editingTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_templates")
          .insert({ ...data, tenant_id: tenantId! });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast({ title: editingTemplate ? "Template updated" : "Template created" });
      closeDialog();
    },
    onError: (error: Error) => {
      toast({ title: "Error saving template", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notification_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast({ title: "Template deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting template", description: error.message, variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData({
      name: "",
      notification_type: "status_update",
      channel: "email",
      subject_template: "",
      body_template: "",
      is_active: true,
      is_default: false,
    });
  };

  const openEditDialog = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      notification_type: template.notification_type,
      channel: template.channel,
      subject_template: template.subject_template || "",
      body_template: template.body_template,
      is_active: template.is_active,
      is_default: template.is_default,
    });
    setIsDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notification Templates</h1>
            <p className="text-muted-foreground">
              Manage customer notification message templates
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? "Edit Template" : "Create Template"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Status Update - In Progress"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notification Type</Label>
                    <Select
                      value={formData.notification_type}
                      onValueChange={(v) => setFormData({ ...formData, notification_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Channel</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(v) => setFormData({ ...formData, channel: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((ch) => (
                        <SelectItem key={ch.value} value={ch.value}>
                          {ch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.channel === "email" && (
                  <div className="space-y-2">
                    <Label>Subject Template</Label>
                    <Input
                      value={formData.subject_template}
                      onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
                      placeholder="e.g., Update on your vehicle repair - {{case_number}}"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <Textarea
                    value={formData.body_template}
                    onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
                    placeholder="Use placeholders like {{customer_name}}, {{vehicle}}, {{status}}, {{ecd}}"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Available placeholders: {"{{customer_name}}"}, {"{{vehicle}}"}, {"{{case_number}}"}, {"{{status}}"}, {"{{ecd}}"}, {"{{portal_link}}"}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                    />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_default}
                      onCheckedChange={(v) => setFormData({ ...formData, is_default: v })}
                    />
                    <Label>Default for this type</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={closeDialog}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => saveMutation.mutate(formData)}
                    disabled={saveMutation.isPending || !formData.name || !formData.body_template}
                  >
                    {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No templates created yet</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {templates?.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {template.channel === "email" ? (
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>
                          {notificationTypes.find((t) => t.value === template.notification_type)?.label}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.is_default && <Badge>Default</Badge>}
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(template.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.subject_template && (
                    <p className="text-sm font-medium mb-2">Subject: {template.subject_template}</p>
                  )}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {template.body_template}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
