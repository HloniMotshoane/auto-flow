import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useJobCosts,
  useProfitabilitySummary,
  useLaborRates,
  useCreateLaborRate,
  useDeleteLaborRate,
  LaborRate,
} from "@/hooks/useJobCosts";
import { useActiveWorkshopSegments } from "@/hooks/useWorkshopSegments";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profitability() {
  const { data: jobCosts, isLoading } = useJobCosts();
  const { data: summary } = useProfitabilitySummary();
  const { data: laborRates } = useLaborRates();
  const { data: segments } = useActiveWorkshopSegments();
  const createLaborRate = useCreateLaborRate();
  const deleteLaborRate = useDeleteLaborRate();

  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [rateForm, setRateForm] = useState({
    name: "",
    description: "",
    rate_type: "hourly",
    rate_amount: 0,
    cost_rate: 0,
    segment_id: "",
    is_default: false,
  });

  const handleCreateRate = async () => {
    await createLaborRate.mutateAsync({
      ...rateForm,
      segment_id: rateForm.segment_id || null,
      is_active: true,
    });
    setIsRateDialogOpen(false);
    setRateForm({
      name: "",
      description: "",
      rate_type: "hourly",
      rate_amount: 0,
      cost_rate: 0,
      segment_id: "",
      is_default: false,
    });
  };

  const handleDeleteRate = async (id: string) => {
    if (confirm("Delete this labor rate?")) {
      await deleteLaborRate.mutateAsync(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  const profitableJobs = jobCosts?.filter((j) => (j.profit_margin || 0) > 0) || [];
  const unprofitableJobs = jobCosts?.filter((j) => (j.profit_margin || 0) < 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profitability</h1>
          <p className="text-muted-foreground">
            Track job costs, margins, and financial performance
          </p>
        </div>
        <Button onClick={() => setIsRateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Labor Rate
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quoted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalQuoted || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {summary?.totalJobs || 0} jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.totalActual || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            {(summary?.totalProfit || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                (summary?.totalProfit || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {formatCurrency(summary?.totalProfit || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                (summary?.averageMargin || 0) >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {(summary?.averageMargin || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary?.overbudgetCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">Jobs exceeded quote</p>
          </CardContent>
        </Card>
      </div>

      {/* Labor Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Labor Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {laborRates?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No labor rates configured. Add your first rate to start tracking costs.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {laborRates?.map((rate) => (
                <div
                  key={rate.id}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{rate.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteRate(rate.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {rate.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {rate.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>Charge Rate:</span>
                    <span className="font-medium">
                      {formatCurrency(rate.rate_amount)}/{rate.rate_type === "hourly" ? "hr" : "unit"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Cost Rate:</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(rate.cost_rate)}/{rate.rate_type === "hourly" ? "hr" : "unit"}
                    </span>
                  </div>
                  {rate.segment && (
                    <Badge variant="outline" className="mt-2">
                      {rate.segment.name}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case / Job</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead className="text-right">Quoted</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading job costs...
                  </TableCell>
                </TableRow>
              ) : jobCosts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No job cost data available yet.
                  </TableCell>
                </TableRow>
              ) : (
                jobCosts?.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.case?.case_number}</div>
                      {job.case?.job_number && (
                        <div className="text-sm text-muted-foreground">
                          {job.case.job_number}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {job.case?.vehicle ? (
                        <span>
                          {job.case.vehicle.make} {job.case.vehicle.model}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(job.quoted_total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(job.actual_total)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium",
                        (job.profit_amount || 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {formatCurrency(job.profit_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Progress
                          value={Math.min(Math.abs(job.profit_margin || 0), 100)}
                          className={cn(
                            "w-16 h-2",
                            (job.profit_margin || 0) >= 0
                              ? "[&>div]:bg-green-500"
                              : "[&>div]:bg-red-500"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            (job.profit_margin || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {(job.profit_margin || 0).toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.is_overbudget ? (
                        <Badge variant="destructive">Over Budget</Badge>
                      ) : (
                        <Badge variant="default">On Track</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Labor Rate Dialog */}
      <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Labor Rate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Rate Name</Label>
              <Input
                value={rateForm.name}
                onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                placeholder="e.g., Standard Panel Labor"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={rateForm.description}
                onChange={(e) =>
                  setRateForm({ ...rateForm, description: e.target.value })
                }
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rate Type</Label>
                <Select
                  value={rateForm.rate_type}
                  onValueChange={(value) =>
                    setRateForm({ ...rateForm, rate_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="per_panel">Per Panel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Segment</Label>
                <Select
                  value={rateForm.segment_id}
                  onValueChange={(value) =>
                    setRateForm({
                      ...rateForm,
                      segment_id: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All segments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All segments</SelectItem>
                    {segments?.map((seg) => (
                      <SelectItem key={seg.id} value={seg.id}>
                        {(seg as any).name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Charge Rate (R)</Label>
                <Input
                  type="number"
                  min={0}
                  value={rateForm.rate_amount}
                  onChange={(e) =>
                    setRateForm({
                      ...rateForm,
                      rate_amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Cost Rate (R)</Label>
                <Input
                  type="number"
                  min={0}
                  value={rateForm.cost_rate}
                  onChange={(e) =>
                    setRateForm({
                      ...rateForm,
                      cost_rate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRate} disabled={!rateForm.name}>
              Add Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
