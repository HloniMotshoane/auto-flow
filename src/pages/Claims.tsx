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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { Plus, Search, Edit, Trash2, FileText, DollarSign, Clock, CheckCircle, XCircle, Truck, AlertCircle, User, Package } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface Claim {
  id: string;
  claim_number: string;
  job_id: string | null;
  customer_id: string | null;
  insurance_company_id: string | null;
  status: string;
  claim_amount: number;
  excess_amount: number;
  authorization_number: string | null;
  notes: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  created_at: string;
}

const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  submitted: { color: "bg-blue-500", label: "Submitted", icon: <Clock className="h-3 w-3" /> },
  pending: { color: "bg-yellow-500", label: "Pending", icon: <Clock className="h-3 w-3" /> },
  authorised: { color: "bg-green-600", label: "Authorised", icon: <CheckCircle className="h-3 w-3" /> },
  in_progress: { color: "bg-indigo-500", label: "In Progress", icon: <Package className="h-3 w-3" /> },
  under_review: { color: "bg-orange-500", label: "Under Review", icon: <AlertCircle className="h-3 w-3" /> },
  awaiting_client: { color: "bg-purple-500", label: "Awaiting Client", icon: <User className="h-3 w-3" /> },
  upliftment_in_progress: { color: "bg-cyan-500", label: "Upliftment", icon: <Truck className="h-3 w-3" /> },
  write_off: { color: "bg-red-600", label: "Write Off", icon: <XCircle className="h-3 w-3" /> },
  awaiting_collection: { color: "bg-teal-500", label: "Awaiting Collection", icon: <Truck className="h-3 w-3" /> },
  approved: { color: "bg-green-500", label: "Approved", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { color: "bg-red-500", label: "Rejected", icon: <XCircle className="h-3 w-3" /> },
  paid: { color: "bg-emerald-600", label: "Paid", icon: <DollarSign className="h-3 w-3" /> },
};

const tabStatuses = [
  { value: "all", label: "All Claims" },
  { value: "authorised", label: "Authorised" },
  { value: "in_progress", label: "In Progress" },
  { value: "under_review", label: "Under Review" },
  { value: "awaiting_client", label: "Awaiting Client" },
  { value: "upliftment_in_progress", label: "Upliftment" },
  { value: "write_off", label: "Write Off" },
  { value: "awaiting_collection", label: "Collection" },
];

export default function Claims() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClaim, setEditingClaim] = useState<Claim | null>(null);
  const [formData, setFormData] = useState({
    claim_number: "",
    job_id: "",
    customer_id: "",
    insurance_company_id: "",
    status: "submitted",
    claim_amount: "",
    excess_amount: "",
    authorization_number: "",
    notes: "",
    submitted_at: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["claims", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claims")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Claim[];
    },
    enabled: !!organizationId,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("id, job_number");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: insuranceCompanies = [] } = useQuery({
    queryKey: ["insurance-companies", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("insurance_companies").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        claim_number: data.claim_number,
        job_id: data.job_id || null,
        customer_id: data.customer_id || null,
        insurance_company_id: data.insurance_company_id || null,
        status: data.status,
        claim_amount: parseFloat(data.claim_amount) || 0,
        excess_amount: parseFloat(data.excess_amount) || 0,
        authorization_number: data.authorization_number || null,
        notes: data.notes || null,
        submitted_at: data.submitted_at || null,
      };

      if (editingClaim) {
        const { error } = await supabase.from("claims").update(payload).eq("id", editingClaim.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("claims").insert({
          ...payload,
          organization_id: organizationId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast({ title: editingClaim ? "Claim updated" : "Claim created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("claims").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast({ title: "Claim deleted" });
    },
  });

  const resetForm = () => {
    setEditingClaim(null);
    setFormData({
      claim_number: "",
      job_id: "",
      customer_id: "",
      insurance_company_id: "",
      status: "submitted",
      claim_amount: "",
      excess_amount: "",
      authorization_number: "",
      notes: "",
      submitted_at: "",
    });
  };

  const openEdit = (claim: Claim) => {
    setEditingClaim(claim);
    setFormData({
      claim_number: claim.claim_number,
      job_id: claim.job_id || "",
      customer_id: claim.customer_id || "",
      insurance_company_id: claim.insurance_company_id || "",
      status: claim.status,
      claim_amount: claim.claim_amount.toString(),
      excess_amount: claim.excess_amount.toString(),
      authorization_number: claim.authorization_number || "",
      notes: claim.notes || "",
      submitted_at: claim.submitted_at || "",
    });
    setDialogOpen(true);
  };

  const generateClaimNumber = () => {
    const prefix = "CLM";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };

  const getFilteredClaims = (status: string) => {
    return claims.filter((claim) => {
      const matchesSearch = claim.claim_number.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || claim.status === status;
      return matchesSearch && matchesStatus;
    });
  };

  const getJobNumber = (jobId: string | null) => {
    if (!jobId) return "-";
    const job = jobs.find((j) => j.id === jobId);
    return job?.job_number || "-";
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "-";
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "-";
  };

  const getInsuranceName = (insuranceId: string | null) => {
    if (!insuranceId) return "-";
    const company = insuranceCompanies.find((c) => c.id === insuranceId);
    return company?.name || "-";
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { color: "bg-gray-500", label: status, icon: null };
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getTabCount = (status: string) => {
    if (status === "all") return claims.length;
    return claims.filter((c) => c.status === status).length;
  };

  const stats = {
    total: claims.length,
    authorised: claims.filter((c) => c.status === "authorised").length,
    inProgress: claims.filter((c) => c.status === "in_progress").length,
    awaitingCollection: claims.filter((c) => c.status === "awaiting_collection").length,
    totalAmount: claims.reduce((sum, c) => sum + c.claim_amount, 0),
  };

  const ClaimsTable = ({ claims: filteredClaims }: { claims: Claim[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Claim #</TableHead>
          <TableHead>Job #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Insurance</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredClaims.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No claims found
            </TableCell>
          </TableRow>
        ) : (
          filteredClaims.map((claim) => (
            <TableRow key={claim.id}>
              <TableCell className="font-mono font-medium">{claim.claim_number}</TableCell>
              <TableCell>{getJobNumber(claim.job_id)}</TableCell>
              <TableCell>{getCustomerName(claim.customer_id)}</TableCell>
              <TableCell>{getInsuranceName(claim.insurance_company_id)}</TableCell>
              <TableCell>R {claim.claim_amount.toLocaleString()}</TableCell>
              <TableCell>{getStatusBadge(claim.status)}</TableCell>
              <TableCell className="text-right">
                <Button size="icon" variant="ghost" onClick={() => openEdit(claim)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(claim.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Claims</h1>
          <p className="text-muted-foreground">Manage insurance claims</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setFormData((f) => ({ ...f, claim_number: generateClaimNumber() }));
            setDialogOpen(true);
          }}
          className="gradient-primary"
        >
          <Plus className="h-4 w-4 mr-2" /> New Claim
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Authorised</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.authorised}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center gap-4">
          <TabsList className="flex-wrap h-auto gap-1">
            {tabStatuses.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="relative">
                {tab.label}
                {getTabCount(tab.value) > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {getTabCount(tab.value)}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <>
                {tabStatuses.map((tab) => (
                  <TabsContent key={tab.value} value={tab.value} className="mt-0">
                    <ClaimsTable claims={getFilteredClaims(tab.value)} />
                  </TabsContent>
                ))}
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClaim ? "Edit Claim" : "New Claim"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="claim_number">Claim Number *</Label>
              <Input
                id="claim_number"
                value={formData.claim_number}
                onChange={(e) => setFormData({ ...formData, claim_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="authorised">Authorised</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="awaiting_client">Awaiting Client</SelectItem>
                  <SelectItem value="upliftment_in_progress">Upliftment in Progress</SelectItem>
                  <SelectItem value="write_off">Write Off</SelectItem>
                  <SelectItem value="awaiting_collection">Awaiting Collection</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_id">Job</Label>
              <Select
                value={formData.job_id}
                onValueChange={(value) => setFormData({ ...formData, job_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.job_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customer_id">Customer</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="insurance_company_id">Insurance Company</Label>
              <Select
                value={formData.insurance_company_id}
                onValueChange={(value) => setFormData({ ...formData, insurance_company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="authorization_number">Authorization Number</Label>
              <Input
                id="authorization_number"
                value={formData.authorization_number}
                onChange={(e) => setFormData({ ...formData, authorization_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="claim_amount">Claim Amount (R)</Label>
              <Input
                id="claim_amount"
                type="number"
                value={formData.claim_amount}
                onChange={(e) => setFormData({ ...formData, claim_amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="excess_amount">Excess Amount (R)</Label>
              <Input
                id="excess_amount"
                type="number"
                value={formData.excess_amount}
                onChange={(e) => setFormData({ ...formData, excess_amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="submitted_at">Submitted Date</Label>
              <Input
                id="submitted_at"
                type="date"
                value={formData.submitted_at}
                onChange={(e) => setFormData({ ...formData, submitted_at: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
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
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : editingClaim ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
