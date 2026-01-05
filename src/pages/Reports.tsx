import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOrganization } from "@/hooks/useOrganization";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { FileText, Users, Car, DollarSign, TrendingUp, Briefcase } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Reports() {
  const { organizationId } = useOrganization();

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-report", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: quotations = [] } = useQuery({
    queryKey: ["quotations-report", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("quotations").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-report", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles-report", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  // Job status distribution
  const jobStatusData = [
    { name: "Pending", value: jobs.filter((j) => j.status === "pending").length },
    { name: "In Progress", value: jobs.filter((j) => j.status === "in_progress").length },
    { name: "Completed", value: jobs.filter((j) => j.status === "completed").length },
    { name: "On Hold", value: jobs.filter((j) => j.status === "on_hold").length },
  ].filter((d) => d.value > 0);

  // Quotation status distribution
  const quotationStatusData = [
    { name: "Draft", value: quotations.filter((q) => q.status === "draft").length },
    { name: "Sent", value: quotations.filter((q) => q.status === "sent").length },
    { name: "Approved", value: quotations.filter((q) => q.status === "approved").length },
    { name: "Rejected", value: quotations.filter((q) => q.status === "rejected").length },
  ].filter((d) => d.value > 0);

  // Monthly trends (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthJobs = jobs.filter((j) => {
      const created = new Date(j.created_at);
      return created >= monthStart && created <= monthEnd;
    });
    
    const monthQuotes = quotations.filter((q) => {
      const created = new Date(q.created_at);
      return created >= monthStart && created <= monthEnd;
    });

    return {
      month: format(date, "MMM"),
      jobs: monthJobs.length,
      quotations: monthQuotes.length,
    };
  });

  // Revenue data
  const totalRevenue = quotations
    .filter((q) => q.status === "approved")
    .reduce((sum, q) => sum + (q.total_amount || 0), 0);

  const averageJobValue = quotations.length > 0
    ? quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0) / quotations.length
    : 0;

  // Top customers by job count
  const customerJobCounts = customers.map((customer) => ({
    name: customer.name,
    jobs: jobs.filter((j) => j.customer_id === customer.id).length,
  })).sort((a, b) => b.jobs - a.jobs).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Analytics and business insights</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From approved quotations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {jobs.filter((j) => j.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Job Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {averageJobValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">Per quotation</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Jobs and quotations over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="jobs" fill="#3b82f6" name="Jobs" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="quotations" fill="#10b981" name="Quotations" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
            <CardDescription>Current status of all jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {jobStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={jobStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No job data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quotation Status</CardTitle>
            <CardDescription>Status breakdown of all quotations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {quotationStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={quotationStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {quotationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No quotation data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>Customers with most jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {customerJobCounts.length > 0 && customerJobCounts.some(c => c.jobs > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerJobCounts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      className="text-xs"
                      tickFormatter={(value) => value.length > 12 ? `${value.substring(0, 12)}...` : value}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="jobs" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No customer data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quotation Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {quotations.length > 0
                ? `${((quotations.filter((q) => q.status === "approved").length / quotations.length) * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {quotations.filter((q) => q.status === "approved").length} of {quotations.length} approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {jobs.length > 0
                ? `${((jobs.filter((j) => j.status === "completed").length / jobs.length) * 100).toFixed(1)}%`
                : "0%"}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {jobs.filter((j) => j.status === "completed").length} of {jobs.length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicles Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vehicles.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total vehicles in system</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
