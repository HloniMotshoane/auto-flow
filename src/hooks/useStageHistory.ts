import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface StageHistory {
  id: string;
  tenant_id: string;
  case_id: string;
  stage_id: string;
  previous_stage_id: string | null;
  updated_by: string;
  notes: string | null;
  notified_customer: boolean;
  notification_type: string;
  notification_sent_at: string | null;
  created_at: string;
  stage?: {
    id: string;
    name: string;
    color: string;
  };
  previous_stage?: {
    id: string;
    name: string;
    color: string;
  } | null;
  updated_by_profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export function useStageHistory(caseId?: string) {
  return useQuery({
    queryKey: ["stage-history", caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data, error } = await supabase
        .from("stage_history")
        .select(`
          *,
          stage:workflow_stages!stage_history_stage_id_fkey(id, name, color),
          previous_stage:workflow_stages!stage_history_previous_stage_id_fkey(id, name, color)
        `)
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StageHistory[];
    },
    enabled: !!caseId,
  });
}

export function useCreateStageHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenantId,
      caseId,
      stageId,
      previousStageId,
      updatedBy,
      notes,
      notificationType,
    }: {
      tenantId: string;
      caseId: string;
      stageId: string;
      previousStageId: string | null;
      updatedBy: string;
      notes?: string;
      notificationType: "email" | "whatsapp" | "both" | "none";
    }) => {
      // First, update the case's current_stage_id
      const { error: caseError } = await supabase
        .from("cases")
        .update({ current_stage_id: stageId })
        .eq("id", caseId);

      if (caseError) throw caseError;

      // Then create the history entry
      const { data, error } = await supabase
        .from("stage_history")
        .insert({
          tenant_id: tenantId,
          case_id: caseId,
          stage_id: stageId,
          previous_stage_id: previousStageId,
          updated_by: updatedBy,
          notes,
          notification_type: notificationType,
          notified_customer: notificationType !== "none",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["stage-history", variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["workshop-cases"] });
      toast.success("Vehicle stage updated successfully");
    },
    onError: (error) => {
      console.error("Error updating stage:", error);
      toast.error("Failed to update vehicle stage");
    },
  });
}
