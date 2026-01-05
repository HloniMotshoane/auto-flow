import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function useOrganization() {
  const { user } = useAuth();

  const { data: organizationId, isLoading, error } = useQuery({
    queryKey: ["organization", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.organization_id ?? null;
    },
    enabled: !!user?.id,
  });

  return { organizationId: organizationId ?? null, isLoading, error };
}
