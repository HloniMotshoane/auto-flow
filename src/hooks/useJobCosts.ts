import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserTenant } from "./useUserTenant";
import { toast } from "sonner";

export interface JobCost {
  id: string;
  tenant_id: string;
  case_id: string;
  job_id: string | null;
  quoted_labor: number;
  actual_labor: number;
  quoted_parts: number;
  actual_parts: number;
  quoted_consumables: number;
  actual_consumables: number;
  quoted_sublet: number;
  actual_sublet: number;
  quoted_total: number;
  actual_total: number;
  labor_hours_quoted: number;
  labor_hours_actual: number;
  profit_margin: number | null;
  profit_amount: number | null;
  is_overbudget: boolean;
  overbudget_amount: number;
  last_calculated_at: string | null;
  created_at: string;
  updated_at: string;
  case?: {
    id: string;
    case_number: string;
    job_number: string | null;
    status: string;
    vehicle?: {
      id: string;
      make: string | null;
      model: string | null;
    } | null;
    customer?: {
      id: string;
      name: string;
    } | null;
  };
}

export interface LaborRate {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  rate_type: string;
  rate_amount: number;
  cost_rate: number;
  segment_id: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  segment?: {
    id: string;
    name: string;
  } | null;
}

export function useJobCosts() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["job-costs", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("job_costs")
        .select(`
          *,
          case:cases(
            id,
            case_number,
            job_number,
            status,
            vehicle:vehicles(id, make, model),
            customer:customers(id, name)
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as JobCost[];
    },
    enabled: !!tenantId,
  });
}

export function useJobCostByCase(caseId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["job-cost", caseId, tenantId],
    queryFn: async () => {
      if (!tenantId || !caseId) return null;

      const { data, error } = await supabase
        .from("job_costs")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) throw error;
      return data as JobCost | null;
    },
    enabled: !!tenantId && !!caseId,
  });
}

export function useCreateJobCost() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: Omit<JobCost, "id" | "tenant_id" | "created_at" | "updated_at">) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("job_costs")
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-costs"] });
      toast.success("Job costs initialized");
    },
    onError: (error) => {
      toast.error("Failed to initialize job costs: " + error.message);
    },
  });
}

export function useUpdateJobCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobCost> & { id: string }) => {
      // Calculate profit margin and amount
      const quoted = updates.quoted_total || 0;
      const actual = updates.actual_total || 0;
      const profit_amount = quoted - actual;
      const profit_margin = quoted > 0 ? (profit_amount / quoted) * 100 : 0;
      const is_overbudget = actual > quoted;
      const overbudget_amount = is_overbudget ? actual - quoted : 0;

      const { data, error } = await supabase
        .from("job_costs")
        .update({
          ...updates,
          profit_amount,
          profit_margin,
          is_overbudget,
          overbudget_amount,
          last_calculated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-costs"] });
      queryClient.invalidateQueries({ queryKey: ["job-cost"] });
    },
  });
}

// Labor Rates
export function useLaborRates() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["labor-rates", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("labor_rates")
        .select(`
          *,
          segment:workshop_segments(id, name)
        `)
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });

      if (error) throw error;
      return data as unknown as LaborRate[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateLaborRate() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: Omit<LaborRate, "id" | "tenant_id" | "created_at" | "updated_at">) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("labor_rates")
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labor-rates"] });
      toast.success("Labor rate created");
    },
    onError: (error) => {
      toast.error("Failed to create labor rate: " + error.message);
    },
  });
}

export function useUpdateLaborRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LaborRate> & { id: string }) => {
      const { data, error } = await supabase
        .from("labor_rates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labor-rates"] });
      toast.success("Labor rate updated");
    },
    onError: (error) => {
      toast.error("Failed to update labor rate: " + error.message);
    },
  });
}

export function useDeleteLaborRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("labor_rates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labor-rates"] });
      toast.success("Labor rate deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete labor rate: " + error.message);
    },
  });
}

// Profitability Summary
export function useProfitabilitySummary() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["profitability-summary", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from("job_costs")
        .select("quoted_total, actual_total, profit_amount, profit_margin, is_overbudget")
        .eq("tenant_id", tenantId);

      if (error) throw error;

      const summary = {
        totalJobs: data?.length || 0,
        totalQuoted: data?.reduce((sum, j) => sum + (j.quoted_total || 0), 0) || 0,
        totalActual: data?.reduce((sum, j) => sum + (j.actual_total || 0), 0) || 0,
        totalProfit: data?.reduce((sum, j) => sum + (j.profit_amount || 0), 0) || 0,
        averageMargin: 0,
        overbudgetCount: data?.filter((j) => j.is_overbudget).length || 0,
      };

      if (summary.totalQuoted > 0) {
        summary.averageMargin = (summary.totalProfit / summary.totalQuoted) * 100;
      }

      return summary;
    },
    enabled: !!tenantId,
  });
}
