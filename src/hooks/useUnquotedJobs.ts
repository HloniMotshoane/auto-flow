import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

export interface UnquotedJob {
  id: string;
  quote_number: string;
  status: string | null;
  estimator_id: string | null;
  created_at: string;
  customer_id: string | null;
  vehicle_id: string | null;
  case_id: string | null;
  total_amount: number | null;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
  vehicle?: {
    id: string;
    make: string | null;
    model: string | null;
    registration: string | null;
    year: number | null;
  } | null;
  cases?: {
    id: string;
    case_number: string;
  } | null;
}

export function useUnquotedJobs() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  const { data: unquotedJobs, isLoading, error } = useQuery({
    queryKey: ["unquoted-jobs", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          id,
          quote_number,
          status,
          estimator_id,
          created_at,
          customer_id,
          vehicle_id,
          case_id,
          total_amount,
          customer:customers(id, name, phone, email),
          vehicle:vehicles(id, make, model, registration, year),
          cases(id, case_number)
        `)
        .eq("organization_id", organizationId!)
        .eq("status", "draft")
        .is("estimator_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as UnquotedJob[];
    },
    enabled: !!organizationId,
  });

  const assignEstimator = useMutation({
    mutationFn: async ({ quotationId, estimatorId }: { quotationId: string; estimatorId: string }) => {
      const { error } = await supabase
        .from("quotations")
        .update({ estimator_id: estimatorId })
        .eq("id", quotationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unquoted-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["authorised-quotes"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Estimator assigned successfully");
    },
    onError: (error) => {
      toast.error(`Failed to assign estimator: ${error.message}`);
    },
  });

  return {
    unquotedJobs: unquotedJobs || [],
    isLoading,
    error,
    assignEstimator,
  };
}
