import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useUserTenant() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["user-tenant", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("tenant_id, tenants:tenant_id(id, company_name, branch_name)")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching user tenant:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    tenantId: data?.tenant_id ?? null,
    tenant: data?.tenants ?? null,
    isLoading,
    hasTenant: !!data?.tenant_id,
  };
}
