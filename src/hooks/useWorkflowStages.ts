import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface WorkflowStage {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStageAssignment {
  id: string;
  user_id: string;
  stage_id: string;
  tenant_id: string;
  created_at: string;
}

export function useWorkflowStages(tenantId?: string) {
  return useQuery({
    queryKey: ["workflow-stages", tenantId],
    queryFn: async () => {
      let query = supabase
        .from("workflow_stages")
        .select("*")
        .order("order_index", { ascending: true });

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WorkflowStage[];
    },
  });
}

export function useUserStageAssignments(userId?: string) {
  return useQuery({
    queryKey: ["user-stage-assignments", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("user_stage_assignments")
        .select(`
          *,
          stage:workflow_stages(*)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateWorkflowStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stage: Omit<WorkflowStage, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("workflow_stages")
        .insert(stage)
        .select()
        .single();
      if (error) throw error;
      return data as WorkflowStage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-stages"] });
      toast.success("Stage created successfully");
    },
    onError: (error) => {
      console.error("Error creating stage:", error);
      toast.error("Failed to create stage");
    },
  });
}

export function useUpdateUserStageAssignments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      tenantId,
      stageIds 
    }: { 
      userId: string;
      tenantId: string;
      stageIds: string[];
    }) => {
      // Delete existing assignments
      await supabase
        .from("user_stage_assignments")
        .delete()
        .eq("user_id", userId);

      // Insert new assignments
      if (stageIds.length > 0) {
        const assignments = stageIds.map(stageId => ({
          user_id: userId,
          stage_id: stageId,
          tenant_id: tenantId,
        }));

        const { error } = await supabase
          .from("user_stage_assignments")
          .insert(assignments);

        if (error) throw error;
      }

      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-stage-assignments", data.userId] });
      toast.success("Stage assignments updated");
    },
    onError: (error) => {
      console.error("Error updating stage assignments:", error);
      toast.error("Failed to update stage assignments");
    },
  });
}
