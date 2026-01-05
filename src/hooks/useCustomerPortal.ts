import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface CustomerPortalToken {
  id: string;
  tenant_id: string;
  case_id: string;
  customer_id: string;
  token: string;
  expires_at: string;
  last_accessed_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function useCustomerPortal() {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generatePortalLink = useMutation({
    mutationFn: async ({ caseId, customerId }: { caseId: string; customerId: string }) => {
      // Generate a secure random token
      const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
      
      // Set expiry to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { data, error } = await supabase
        .from("customer_portal_tokens")
        .insert({
          tenant_id: tenantId!,
          case_id: caseId,
          customer_id: customerId,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Generate the portal URL
      const baseUrl = window.location.origin;
      const portalUrl = `${baseUrl}/portal/${token}`;

      return { ...data, portalUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-tokens"] });
      toast({ title: "Portal link generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error generating portal link", description: error.message, variant: "destructive" });
    },
  });

  const getTokensForCase = useQuery({
    queryKey: ["portal-tokens", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_portal_tokens")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CustomerPortalToken[];
    },
    enabled: !!tenantId,
  });

  const revokeToken = useMutation({
    mutationFn: async (tokenId: string) => {
      const { error } = await supabase
        .from("customer_portal_tokens")
        .update({ is_active: false })
        .eq("id", tokenId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-tokens"] });
      toast({ title: "Portal link revoked" });
    },
    onError: (error: Error) => {
      toast({ title: "Error revoking link", description: error.message, variant: "destructive" });
    },
  });

  return {
    generatePortalLink,
    tokens: getTokensForCase.data || [],
    isLoading: getTokensForCase.isLoading,
    revokeToken,
  };
}
