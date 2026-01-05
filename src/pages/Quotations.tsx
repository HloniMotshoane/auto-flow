import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

type Quotation = {
  id: string;
  quote_number: string;
  status: string;
  description: string | null;
  labour_cost: number;
  parts_cost: number;
  paint_cost: number;
  other_cost: number;
  discount_percent: number;
  vat_percent: number;
  total_amount: number;
  valid_until: string | null;
  notes: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  created_at: string;
  customers?: { name: string } | null;
  vehicles?: { make: string; model: string; registration: string | null } | null;
};

type Customer = { id: string; name: string };
type Vehicle = { id: string; make: string; model: string; registration: string | null };

export default function Quotations() {
  const { organizationId } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    vehicle_id: "",
    status: "draft",
    description: "",
    labour_cost: "0",
    parts_cost: "0",
    paint_cost: "0",
    other_cost: "0",
    discount_percent: "0",
    vat_percent: "15",
    valid_until: "",
    notes: "",
  });

  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["quotations", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select("*, customers(name), vehicles(make, model, registration)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Quotation[];
    },
    enabled: !!organizationId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!organizationId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-list", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id, make, model, registration").order("make");
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!organizationId,
  });

  const generateQuoteNumber = () => `QT-${Date.now().toString(36).toUpperCase()}`;

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("quotations").insert({
        organization_id: organizationId,
        quote_number: generateQuoteNumber(),
        customer_id: data.customer_id || null,
        vehicle_id: data.vehicle_id || null,
        status: data.status,
        description: data.description || null,
        labour_cost: parseFloat(data.labour_cost) || 0,
        parts_cost: parseFloat(data.parts_cost) || 0,
        paint_cost: parseFloat(data.paint_cost) || 0,
        other_cost: parseFloat(data.other_cost) || 0,
        discount_percent: parseFloat(data.discount_percent) || 0,
        vat_percent: parseFloat(data.vat_percent) || 15,
        valid_until: data.valid_until || null,
        notes: data.notes || null,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation created successfully");
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("quotations").update({
        customer_id: data.customer_id || null,
        vehicle_id: data.vehicle_id || null,
        status: data.status,
        description: data.description || null,
        labour_cost: parseFloat(data.labour_cost) || 0,
        parts_cost: parseFloat(data.parts_cost) || 0,
        paint_cost: parseFloat(data.paint_cost) || 0,
        other_cost: parseFloat(data.other_cost) || 0,
        discount_percent: parseFloat(data.discount_percent) || 0,
        vat_percent: parseFloat(data.vat_percent) || 15,
        valid_until: data.valid_until || null,
        notes: data.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation updated successfully");
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quotations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const convertToJobMutation = useMutation({
    mutationFn: async (quotation: Quotation) => {
      const jobNumber = `JOB-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("jobs").insert({
        organization_id: organizationId,
        quotation_id: quotation.id,
        customer_id: quotation.customer_id,
        vehicle_id: quotation.vehicle_id,
        job_number: jobNumber,
        status: "pending",
        description: quotation.description,
        created_by: user?.id,
      });
      if (error) throw error;
      
      await supabase.from("quotations").update({ status: "approved" }).eq("id", quotation.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job created from quotation");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({
      customer_id: "",
      vehicle_id: "",
      status: "draft",
      description: "",
      labour_cost: "0",
      parts_cost: "0",
      paint_cost: "0",
      other_cost: "0",
      discount_percent: "0",
      vat_percent: "15",
      valid_until: "",
      notes: "",
    });
    setEditingQuote(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuote) {
      updateMutation.mutate({ id: editingQuote.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (quote: Quotation) => {
    setEditingQuote(quote);
    setFormData({
      customer_id: quote.customer_id || "",
      vehicle_id: quote.vehicle_id || "",
      status: quote.status,
      description: quote.description || "",
      labour_cost: quote.labour_cost.toString(),
      parts_cost: quote.parts_cost.toString(),
      paint_cost: quote.paint_cost.toString(),
      other_cost: quote.other_cost.toString(),
      discount_percent: quote.discount_percent.toString(),
      vat_percent: quote.vat_percent.toString(),
      valid_until: quote.valid_until || "",
      notes: quote.notes || "",
    });
    setIsDialogOpen(true);
  };

  const subtotal = parseFloat(formData.labour_cost || "0") + parseFloat(formData.parts_cost || "0") +
    parseFloat(formData.paint_cost || "0") + parseFloat(formData.other_cost || "0");
  const discount = subtotal * (parseFloat(formData.discount_percent || "0") / 100);
  const afterDiscount = subtotal - discount;
  const vat = afterDiscount * (parseFloat(formData.vat_percent || "15") / 100);
  const total = afterDiscount + vat;

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch = q.quote_number.toLowerCase().includes(search.toLowerCase()) ||
      q.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      q.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: quotations.length,
    draft: quotations.filter((q) => q.status === "draft").length,
    sent: quotations.filter((q) => q.status === "sent").length,
    approved: quotations.filter((q) => q.status === "approved").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: "secondary",
      sent: "default",
      approved: "default",
      rejected: "destructive",
      expired: "outline",
    };
    return <Badge variant={variants[status] || "secondary"} className="capitalize">{status}</Badge>;
  };

  const formatCurrency = (amount: number) => `R ${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Create and manage repair quotations</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/quotations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Quotation
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuote ? "Edit Quotation" : "Create New Quotation"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <Select value={formData.customer_id || "none"} onValueChange={(v) => setFormData({ ...formData, customer_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No customer</SelectItem>
                      {customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <Select value={formData.vehicle_id || "none"} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No vehicle</SelectItem>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.make} {v.model} {v.registration && `(${v.registration})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the repair work..."
                />
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Cost Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Labour Cost (R)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.labour_cost}
                      onChange={(e) => setFormData({ ...formData, labour_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Parts Cost (R)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.parts_cost}
                      onChange={(e) => setFormData({ ...formData, parts_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Paint Cost (R)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.paint_cost}
                      onChange={(e) => setFormData({ ...formData, paint_cost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Other Costs (R)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.other_cost}
                      onChange={(e) => setFormData({ ...formData, other_cost: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>VAT (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.vat_percent}
                      onChange={(e) => setFormData({ ...formData, vat_percent: e.target.value })}
                    />
                  </div>
                </div>
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>Discount:</span><span>-{formatCurrency(discount)}</span></div>
                  <div className="flex justify-between text-muted-foreground"><span>VAT ({formData.vat_percent}%):</span><span>+{formatCurrency(vat)}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total:</span><span>{formatCurrency(total)}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valid Until</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingQuote ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Draft</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.draft}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.sent}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.approved}</div></CardContent>
        </Card>
      </div>

      {/* Search & Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search quotations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filteredQuotations.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No quotations found</TableCell></TableRow>
              ) : (
                filteredQuotations.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quote_number}</TableCell>
                    <TableCell>{quote.customers?.name || "-"}</TableCell>
                    <TableCell>
                      {quote.vehicles ? `${quote.vehicles.make} ${quote.vehicles.model}` : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(quote.total_amount)}</TableCell>
                    <TableCell>{format(new Date(quote.created_at), "dd MMM yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(quote)}><Pencil className="h-4 w-4" /></Button>
                        {quote.status !== "approved" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => convertToJobMutation.mutate(quote)}
                            title="Convert to Job"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(quote.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
