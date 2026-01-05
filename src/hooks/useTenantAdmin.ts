import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useTenantAdmin() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-tenant-admin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc("is_tenant_admin", {
        _user_id: user.id,
      });
      
      if (error) {
        console.error("Error checking tenant admin status:", error);
        return false;
      }
      
      return data as boolean;
    },
    enabled: !!user?.id,
  });
}
