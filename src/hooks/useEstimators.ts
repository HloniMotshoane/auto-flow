import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";

export interface Estimator {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  cell_number: string | null;
  job_role: string | null;
}

export function useEstimators() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["estimators", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, email, phone, cell_number, job_role")
        .eq("is_active", true)
        .order("first_name");

      if (error) throw error;
      return data as Estimator[];
    },
    enabled: !!tenantId,
  });
}
