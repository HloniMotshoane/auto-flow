import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CasePartRequired {
  id: string;
  tenant_id: string;
  case_id: string;
  segment_id: string | null;
  requested_by: string;
  part_description: string;
  reason: string | null;
  urgency: string | null;
  images: string[];
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  segment?: { segment_name: string } | null;
  requester?: { first_name: string | null; last_name: string | null } | null;
}

export type CasePartRequiredInsert = {
  case_id: string;
  segment_id?: string | null;
  part_description: string;
  reason?: string | null;
  urgency?: string | null;
  images?: string[];
  notes?: string | null;
};

export type CasePartRequiredUpdate = Partial<Omit<CasePartRequired, "id" | "tenant_id" | "case_id" | "requested_by" | "created_at" | "updated_at" | "segment" | "requester">>;

export function useCasePartsRequired(caseId?: string) {
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: partsRequired = [], isLoading, error } = useQuery({
    queryKey: ["case-parts-required", tenantId, caseId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("case_parts_required")
        .select(`
          *,
          segment:workshop_segments(segment_name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (caseId) {
        query = query.eq("case_id", caseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CasePartRequired[];
    },
    enabled: !!tenantId,
  });

  const createPartRequest = useMutation({
    mutationFn: async (request: CasePartRequiredInsert) => {
      if (!tenantId || !user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("case_parts_required")
        .insert({
          ...request,
          tenant_id: tenantId,
          requested_by: user.id,
          images: request.images || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-parts-required", tenantId] });
      toast({ title: "Success", description: "Part request submitted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePartRequest = useMutation({
    mutationFn: async ({ id, ...updates }: CasePartRequiredUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("case_parts_required")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-parts-required", tenantId] });
      toast({ title: "Success", description: "Part request updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePartRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("case_parts_required")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-parts-required", tenantId] });
      toast({ title: "Success", description: "Part request deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    partsRequired,
    isLoading,
    error,
    createPartRequest,
    updatePartRequest,
    deletePartRequest,
    pendingRequests: partsRequired.filter(p => p.status === "pending"),
    byStatus: (status: string) => partsRequired.filter(p => p.status === status),
  };
}
