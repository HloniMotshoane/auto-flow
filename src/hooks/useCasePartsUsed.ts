import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface CasePartUsed {
  id: string;
  tenant_id: string;
  case_id: string;
  supplier_part_id: string | null;
  costing_request_id: string | null;
  part_required_id: string | null;
  supplier_id: string | null;
  part_description: string | null;
  quantity: number | null;
  cost_paid: number | null;
  fitted_by: string | null;
  segment_id: string | null;
  fitted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  supplier?: { supplier_name: string } | null;
  supplier_part?: { part_name: string; part_number: string | null } | null;
  segment?: { segment_name: string } | null;
  fitter?: { first_name: string | null; last_name: string | null } | null;
}

export type CasePartUsedInsert = {
  case_id: string;
  supplier_part_id?: string | null;
  costing_request_id?: string | null;
  part_required_id?: string | null;
  supplier_id?: string | null;
  part_description?: string | null;
  quantity?: number;
  cost_paid?: number;
  segment_id?: string | null;
  notes?: string | null;
};

export type CasePartUsedUpdate = Partial<Omit<CasePartUsed, "id" | "tenant_id" | "case_id" | "created_at" | "updated_at" | "supplier" | "supplier_part" | "segment" | "fitter">>;

export function useCasePartsUsed(caseId?: string) {
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: partsUsed = [], isLoading, error } = useQuery({
    queryKey: ["case-parts-used", tenantId, caseId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("case_parts_used")
        .select(`
          *,
          supplier:suppliers(supplier_name),
          supplier_part:supplier_parts(part_name, part_number),
          segment:workshop_segments(segment_name)
        `)
        .eq("tenant_id", tenantId)
        .order("fitted_at", { ascending: false });
      
      if (caseId) {
        query = query.eq("case_id", caseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CasePartUsed[];
    },
    enabled: !!tenantId,
  });

  const logPartUsed = useMutation({
    mutationFn: async (partUsed: CasePartUsedInsert) => {
      if (!tenantId || !user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("case_parts_used")
        .insert({
          ...partUsed,
          tenant_id: tenantId,
          fitted_by: user.id,
          quantity: partUsed.quantity || 1,
          fitted_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the part request status to "fitted" if linked
      if (partUsed.part_required_id) {
        await supabase
          .from("case_parts_required")
          .update({ status: "fitted" })
          .eq("id", partUsed.part_required_id);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-parts-used", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["case-parts-required", tenantId] });
      toast({ title: "Success", description: "Part logged as fitted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePartUsed = useMutation({
    mutationFn: async ({ id, ...updates }: CasePartUsedUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("case_parts_used")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-parts-used", tenantId] });
      toast({ title: "Success", description: "Part record updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePartUsed = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("case_parts_used")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-parts-used", tenantId] });
      toast({ title: "Success", description: "Part record deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Calculate total parts cost for a case
  const totalPartsCost = partsUsed.reduce((sum, part) => 
    sum + ((part.cost_paid || 0) * (part.quantity || 1)), 0
  );

  return {
    partsUsed,
    isLoading,
    error,
    logPartUsed,
    updatePartUsed,
    deletePartUsed,
    totalPartsCost,
  };
}
