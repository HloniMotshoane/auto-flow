import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Wrench, CheckCircle, Truck, FileText, ShieldCheck, Car, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Job = {
  id: string;
  job_number: string;
  status: string;
  priority: string;
  description: string | null;
  start_date: string | null;
  estimated_completion: string | null;
  actual_completion: string | null;
  assigned_to: string | null;
  bay_number: string | null;
  claim_number: string | null;
  insurance_company: string | null;
  notes: string | null;
  customer_id: string | null;
  vehicle_id: string | null;
  quotation_id: string | null;
  lifecycle_status: string | null;
  authorization_status: string | null;
  authorization_date: string | null;
  vehicle_arrived_at: string | null;
  created_at: string;
  customers?: { name: string } | null;
  vehicles?: { make: string; model: string; registration: string | null } | null;
  quotations?: { quote_number: string } | null;
};

export default function Jobs() {
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editFormData, setEditFormData] = useState({
    priority: "normal",
    description: "",
    estimated_completion: "",
    assigned_to: "",
    bay_number: "",
    notes: "",
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, customers(name), vehicles(make, model, registration), quotations(quote_number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!organizationId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof editFormData }) => {
      const { error } = await supabase.from("jobs").update({
        priority: data.priority,
        description: data.description || null,
        estimated_completion: data.estimated_completion || null,
        assigned_to: data.assigned_to || null,
        bay_number: data.bay_number || null,
        notes: data.notes || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job updated successfully");
      closeEditDialog();
    },
    onError: (error) => toast.error(error.message),
  });

  const authorizeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({
        lifecycle_status: "authorized",
        authorization_status: "approved",
        authorization_date: new Date().toISOString(),
        job_number: `JOB-${Date.now().toString(36).toUpperCase()}`,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job authorized successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const vehicleArrivedMutation = useMutation({
    mutationFn: async (job: Job) => {
      const { error: jobError } = await supabase.from("jobs").update({
        lifecycle_status: "active",
        status: "in_progress",
        vehicle_arrived_at: new Date().toISOString(),
        start_date: new Date().toISOString().split("T")[0],
      }).eq("id", job.id);
      if (jobError) throw jobError;

      if (tenantId && job.customer_id && job.vehicle_id) {
        const caseNumber = `CASE-${format(new Date(), "yyMMdd")}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
        const { error: caseError } = await supabase.from("cases").insert({
          tenant_id: tenantId,
          case_number: caseNumber,
          job_number: job.job_number,
          customer_id: job.customer_id,
          vehicle_id: job.vehicle_id,
          status: "awaiting_reception",
          insurance_type: job.insurance_company ? "insurance" : "private",
          claim_reference: job.claim_number,
          notes: job.description,
        });
        if (caseError) throw caseError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["workshop-cases"] });
      toast.success("Vehicle arrived - Job is now active and visible in Workshop");
    },
    onError: (error) => toast.error(error.message),
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({
        lifecycle_status: "completed",
        status: "completed",
        actual_completion: new Date().toISOString().split("T")[0],
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job marked as completed");
    },
    onError: (error) => toast.error(error.message),
  });

  const deliverMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").update({
        lifecycle_status: "delivered",
        status: "delivered",
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Vehicle delivered to customer");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const closeEditDialog = () => {
    setEditFormData({
      priority: "normal",
      description: "",
      estimated_completion: "",
      assigned_to: "",
      bay_number: "",
      notes: "",
    });
    setEditingJob(null);
    setIsEditDialogOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data: editFormData });
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setEditFormData({
      priority: job.priority,
      description: job.description || "",
      estimated_completion: job.estimated_completion || "",
      assigned_to: job.assigned_to || "",
      bay_number: job.bay_number || "",
      notes: job.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = j.job_number.toLowerCase().includes(search.toLowerCase()) ||
      j.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      j.claim_number?.toLowerCase().includes(search.toLowerCase());
    const lifecycle = j.lifecycle_status || "quote";
    const matchesLifecycle = lifecycleFilter === "all" || lifecycle === lifecycleFilter;
    return matchesSearch && matchesLifecycle;
  });

  const stats = {
    quotes: jobs.filter((j) => (j.lifecycle_status || "quote") === "quote").length,
    authorized: jobs.filter((j) => j.lifecycle_status === "authorized").length,
    active: jobs.filter((j) => j.lifecycle_status === "active").length,
    completed: jobs.filter((j) => j.lifecycle_status === "completed").length,
    delivered: jobs.filter((j) => j.lifecycle_status === "delivered").length,
  };

  const getLifecycleBadge = (lifecycle: string | null) => {
    const status = lifecycle || "quote";
    const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ReactNode; label: string }> = {
      quote: { variant: "secondary", icon: <FileText className="h-3 w-3" />, label: "Quote" },
      authorized: { variant: "outline", icon: <ShieldCheck className="h-3 w-3" />, label: "Authorized" },
      active: { variant: "default", icon: <Wrench className="h-3 w-3" />, label: "Active" },
      completed: { variant: "default", icon: <CheckCircle className="h-3 w-3" />, label: "Completed" },
      delivered: { variant: "secondary", icon: <Truck className="h-3 w-3" />, label: "Delivered" },
    };
    const c = config[status] || config.quote;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1">
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      low: "secondary",
      normal: "outline",
      high: "default",
      urgent: "destructive",
    };
    return <Badge variant={variants[priority] || "outline"} className="capitalize">{priority}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">Manage quotes and active jobs</p>
        </div>
        <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/quotations/create")}>
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) closeEditDialog(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job: {editingJob?.job_number}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={editFormData.priority} onValueChange={(v) => setEditFormData({ ...editFormData, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Completion</Label>
                <Input type="date" value={editFormData.estimated_completion} onChange={(e) => setEditFormData({ ...editFormData, estimated_completion: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Input value={editFormData.assigned_to} onChange={(e) => setEditFormData({ ...editFormData, assigned_to: e.target.value })} placeholder="Technician name" />
              </div>
              <div className="space-y-2">
                <Label>Bay Number</Label>
                <Input value={editFormData.bay_number} onChange={(e) => setEditFormData({ ...editFormData, bay_number: e.target.value })} placeholder="e.g., Bay 1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Describe the repair work..."
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={editFormData.notes} onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })} placeholder="Internal notes..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditDialog}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setLifecycleFilter("quote")}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" />Quotes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.quotes}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setLifecycleFilter("authorized")}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Authorized</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.authorized}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setLifecycleFilter("active")}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Wrench className="h-4 w-4" />Active Jobs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.active}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setLifecycleFilter("completed")}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CheckCircle className="h-4 w-4" />Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50" onClick={() => setLifecycleFilter("delivered")}>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Truck className="h-4 w-4" />Delivered</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.delivered}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            <SelectItem value="quote">Quotes</SelectItem>
            <SelectItem value="authorized">Authorized</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
            ) : filteredJobs.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No jobs found</TableCell></TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.job_number}</TableCell>
                  <TableCell>{job.customers?.name || "-"}</TableCell>
                  <TableCell>
                    {job.vehicles ? `${job.vehicles.make} ${job.vehicles.model}` : "-"}
                    {job.vehicles?.registration && <span className="text-muted-foreground ml-1">({job.vehicles.registration})</span>}
                  </TableCell>
                  <TableCell>{getLifecycleBadge(job.lifecycle_status)}</TableCell>
                  <TableCell>{getPriorityBadge(job.priority)}</TableCell>
                  <TableCell>{format(new Date(job.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {job.quotation_id && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/quotations/${job.quotation_id}`)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View Quote
                        </Button>
                      )}
                      {(job.lifecycle_status || "quote") === "quote" && (
                        <Button size="sm" variant="outline" onClick={() => authorizeMutation.mutate(job.id)}>
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Authorize
                        </Button>
                      )}
                      {job.lifecycle_status === "authorized" && (
                        <Button size="sm" variant="default" onClick={() => vehicleArrivedMutation.mutate(job)}>
                          <Car className="h-3 w-3 mr-1" />
                          Vehicle Arrived
                        </Button>
                      )}
                      {job.lifecycle_status === "active" && (
                        <Button size="sm" variant="outline" onClick={() => completeMutation.mutate(job.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                      {job.lifecycle_status === "completed" && (
                        <Button size="sm" variant="outline" onClick={() => deliverMutation.mutate(job.id)}>
                          <Truck className="h-3 w-3 mr-1" />
                          Deliver
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(job)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(job.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
