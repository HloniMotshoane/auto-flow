import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Users, FileText, TrendingUp, Trophy } from "lucide-react";

interface EstimatorWithStats {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  cell_number: string | null;
  job_role: string | null;
  quotation_count: number;
  approved_count: number;
  total_value: number;
}

export function EstimatorOverviewTab() {
  const { organizationId } = useOrganization();
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEstimator, setNewEstimator] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    cell_number: "",
  });

  // Fetch estimators with their quotation stats
  const { data: estimators, isLoading } = useQuery({
    queryKey: ["estimators-with-stats", organizationId],
    queryFn: async () => {
      // First get all estimators (profiles with estimator job role)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, email, phone, cell_number, job_role")
        .eq("is_active", true)
        .ilike("job_role", "%estimator%")
        .order("first_name");

      if (profilesError) throw profilesError;

      // Get quotation stats for each estimator
      const estimatorsWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Get quotations where this estimator is assigned
          const { data: quotations, error: quotationsError } = await supabase
            .from("quotations")
            .select("id, status, total_amount, authorized")
            .eq("estimator_id", profile.user_id);

          if (quotationsError) {
            console.error("Error fetching quotations for estimator:", quotationsError);
            return {
              ...profile,
              quotation_count: 0,
              approved_count: 0,
              total_value: 0,
            };
          }

          const quotationCount = quotations?.length || 0;
          const approvedCount = quotations?.filter(q => q.status === "approved" || q.authorized === true).length || 0;
          const totalValue = quotations?.reduce((sum, q) => sum + (q.total_amount || 0), 0) || 0;

          return {
            ...profile,
            quotation_count: quotationCount,
            approved_count: approvedCount,
            total_value: totalValue,
          };
        })
      );

      return estimatorsWithStats as EstimatorWithStats[];
    },
    enabled: !!organizationId,
  });

  const createEstimatorMutation = useMutation({
    mutationFn: async (estimatorData: typeof newEstimator) => {
      const { error } = await supabase.from("profiles").insert({
        user_id: crypto.randomUUID(), // Temporary UUID - in production, this should be linked to auth
        email: estimatorData.email,
        first_name: estimatorData.first_name,
        last_name: estimatorData.last_name,
        phone: estimatorData.phone,
        cell_number: estimatorData.cell_number,
        job_role: "Estimator",
        organization_id: organizationId,
        tenant_id: tenantId,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estimators-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["estimators"] });
      setIsAddDialogOpen(false);
      setNewEstimator({ first_name: "", last_name: "", email: "", phone: "", cell_number: "" });
      toast.success("Estimator added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add estimator: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEstimator.email || !newEstimator.first_name) {
      toast.error("First name and email are required");
      return;
    }
    createEstimatorMutation.mutate(newEstimator);
  };

  // Calculate summary stats
  const totalEstimators = estimators?.length || 0;
  const totalQuotations = estimators?.reduce((sum, e) => sum + e.quotation_count, 0) || 0;
  const totalValue = estimators?.reduce((sum, e) => sum + e.total_value, 0) || 0;
  const topPerformer = estimators?.reduce((top, e) => 
    e.quotation_count > (top?.quotation_count || 0) ? e : top, 
    null as EstimatorWithStats | null
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Estimators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstimators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuotations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
            <Trophy className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {topPerformer ? `${topPerformer.first_name || ""} ${topPerformer.last_name || ""}`.trim() || "N/A" : "N/A"}
            </div>
            {topPerformer && (
              <p className="text-xs text-muted-foreground">{topPerformer.quotation_count} quotes</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Estimator Button & Dialog */}
      <div className="flex justify-end">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Estimator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Estimator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={newEstimator.first_name}
                    onChange={(e) => setNewEstimator(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={newEstimator.last_name}
                    onChange={(e) => setNewEstimator(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEstimator.email}
                  onChange={(e) => setNewEstimator(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newEstimator.phone}
                    onChange={(e) => setNewEstimator(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cell_number">Cell Number</Label>
                  <Input
                    id="cell_number"
                    value={newEstimator.cell_number}
                    onChange={(e) => setNewEstimator(prev => ({ ...prev, cell_number: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEstimatorMutation.isPending}>
                  {createEstimatorMutation.isPending ? "Adding..." : "Add Estimator"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estimators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estimator Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Vehicles Estimated</TableHead>
                <TableHead className="text-center">Approved</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-center">Conversion Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimators?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No estimators found. Add your first estimator to get started.
                  </TableCell>
                </TableRow>
              ) : (
                estimators?.map((estimator) => (
                  <TableRow key={estimator.id}>
                    <TableCell className="font-medium">
                      {`${estimator.first_name || ""} ${estimator.last_name || ""}`.trim() || "N/A"}
                    </TableCell>
                    <TableCell>{estimator.email}</TableCell>
                    <TableCell>{estimator.cell_number || estimator.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{estimator.job_role || "Estimator"}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{estimator.quotation_count}</TableCell>
                    <TableCell className="text-center">{estimator.approved_count}</TableCell>
                    <TableCell className="text-right">{formatCurrency(estimator.total_value)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={estimator.quotation_count > 0 && estimator.approved_count / estimator.quotation_count >= 0.5 ? "default" : "secondary"}>
                        {estimator.quotation_count > 0 
                          ? `${Math.round((estimator.approved_count / estimator.quotation_count) * 100)}%`
                          : "0%"}
                      </Badge>
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
