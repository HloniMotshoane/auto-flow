import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useSuperAdmin() {
  const { user } = useAuth();

  const { data: isSuperAdmin, isLoading } = useQuery({
    queryKey: ["super-admin", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Use the SECURITY DEFINER function which bypasses RLS
      const { data, error } = await supabase.rpc("is_super_admin", {
        _user_id: user.id,
      });
      
      if (error) {
        console.error("Error checking super admin status:", error);
        return false;
      }
      
      return data === true;
    },
    enabled: !!user?.id,
  });

  return { isSuperAdmin: isSuperAdmin ?? false, isLoading };
}
