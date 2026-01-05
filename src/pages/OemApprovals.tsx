import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { Plus, Search, Edit, Trash2, Award, AlertTriangle, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format, differenceInDays, parseISO } from "date-fns";

interface OemApproval {
  id: string;
  make_id: string | null;
  brand_name: string;
  certificate_number: string | null;
  issue_date: string;
  expiry_date: string;
  status: string;
  notes: string | null;
}

export default function OemApprovals() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApproval, setEditingApproval] = useState<OemApproval | null>(null);
  const [formData, setFormData] = useState({
    brand_name: "",
    make_id: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    notes: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["oem-approvals", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("oem_approvals")
        .select("*")
        .order("expiry_date");
      if (error) throw error;
      return data as OemApproval[];
    },
    enabled: !!organizationId,
  });

  const { data: carMakes = [] } = useQuery({
    queryKey: ["car-makes", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("car_makes").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const getApprovalStatus = (expiryDate: string): { status: string; variant: "default" | "destructive" | "secondary" | "outline" } => {
    const daysUntilExpiry = differenceInDays(parseISO(expiryDate), new Date());
    if (daysUntilExpiry < 0) return { status: "Expired", variant: "destructive" };
    if (daysUntilExpiry <= 30) return { status: "Expiring Soon", variant: "outline" };
    return { status: "Active", variant: "default" };
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { status } = getApprovalStatus(data.expiry_date);
      const payload = {
        brand_name: data.brand_name,
        make_id: data.make_id || null,
        certificate_number: data.certificate_number || null,
        issue_date: data.issue_date,
        expiry_date: data.expiry_date,
        status: status.toLowerCase().replace(" ", "_"),
        notes: data.notes || null,
      };

      if (editingApproval) {
        const { error } = await supabase.from("oem_approvals").update(payload).eq("id", editingApproval.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("oem_approvals").insert({
          ...payload,
          organization_id: organizationId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oem-approvals"] });
      toast({ title: editingApproval ? "Approval updated" : "Approval created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("oem_approvals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oem-approvals"] });
      toast({ title: "Approval deleted" });
    },
  });

  const resetForm = () => {
    setEditingApproval(null);
    setFormData({
      brand_name: "",
      make_id: "",
      certificate_number: "",
      issue_date: "",
      expiry_date: "",
      notes: "",
    });
  };

  const openEdit = (approval: OemApproval) => {
    setEditingApproval(approval);
    setFormData({
      brand_name: approval.brand_name,
      make_id: approval.make_id || "",
      certificate_number: approval.certificate_number || "",
      issue_date: approval.issue_date,
      expiry_date: approval.expiry_date,
      notes: approval.notes || "",
    });
    setDialogOpen(true);
  };

  const filteredApprovals = approvals.filter((approval) => {
    const matchesSearch = approval.brand_name.toLowerCase().includes(search.toLowerCase());
    const { status } = getApprovalStatus(approval.expiry_date);
    const matchesStatus = statusFilter === "all" || status.toLowerCase().replace(" ", "_") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: approvals.length,
    active: approvals.filter((a) => getApprovalStatus(a.expiry_date).status === "Active").length,
    expiringSoon: approvals.filter((a) => getApprovalStatus(a.expiry_date).status === "Expiring Soon").length,
    expired: approvals.filter((a) => getApprovalStatus(a.expiry_date).status === "Expired").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OEM Approvals</h1>
          <p className="text-muted-foreground">Manage manufacturer certifications</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Approval
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Approvals</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search approvals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No approvals found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OEM Brand</TableHead>
                  <TableHead>Certificate #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApprovals.map((approval) => {
                  const { status, variant } = getApprovalStatus(approval.expiry_date);
                  const daysLeft = differenceInDays(parseISO(approval.expiry_date), new Date());
                  return (
                    <TableRow key={approval.id}>
                      <TableCell className="font-medium">{approval.brand_name}</TableCell>
                      <TableCell>{approval.certificate_number || "-"}</TableCell>
                      <TableCell>{format(parseISO(approval.issue_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>{format(parseISO(approval.expiry_date), "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <span className={daysLeft < 0 ? "text-red-500" : daysLeft <= 30 ? "text-yellow-500" : ""}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>{status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(approval)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(approval.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingApproval ? "Edit OEM Approval" : "Add OEM Approval"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand_name">OEM Brand Name *</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                placeholder="e.g., BMW, Mercedes-Benz"
              />
            </div>
            <div>
              <Label htmlFor="make_id">Link to Car Make (Optional)</Label>
              <Select
                value={formData.make_id}
                onValueChange={(value) => setFormData({ ...formData, make_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select car make" />
                </SelectTrigger>
                <SelectContent>
                  {carMakes.map((make) => (
                    <SelectItem key={make.id} value={make.id}>
                      {make.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="certificate_number">Certificate Number</Label>
              <Input
                id="certificate_number"
                value={formData.certificate_number}
                onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                placeholder="e.g., OEM-2024-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date *</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              disabled={!formData.brand_name || !formData.issue_date || !formData.expiry_date || saveMutation.isPending}
              className="gradient-primary"
            >
              {editingApproval ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
