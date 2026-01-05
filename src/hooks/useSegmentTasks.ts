import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "./use-toast";

export interface SegmentTask {
  id: string;
  tenant_id: string;
  segment_id: string;
  task_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SegmentTaskInsert {
  segment_id: string;
  task_name: string;
  description?: string | null;
  is_active?: boolean;
}

export function useSegmentTasks(segmentId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["segment-tasks", tenantId, segmentId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("segment_tasks")
        .select("*")
        .eq("tenant_id", tenantId);

      if (segmentId) {
        query = query.eq("segment_id", segmentId);
      }

      const { data, error } = await query.order("task_name", { ascending: true });

      if (error) throw error;
      return data as SegmentTask[];
    },
    enabled: !!tenantId,
  });
}

export function useActiveSegmentTasks(segmentId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["segment-tasks-active", tenantId, segmentId],
    queryFn: async () => {
      if (!tenantId || !segmentId) return [];
      
      const { data, error } = await supabase
        .from("segment_tasks")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("segment_id", segmentId)
        .eq("is_active", true)
        .order("task_name", { ascending: true });

      if (error) throw error;
      return data as SegmentTask[];
    },
    enabled: !!tenantId && !!segmentId,
  });
}

export function useCreateSegmentTask() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (task: SegmentTaskInsert) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("segment_tasks")
        .insert({ ...task, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segment-tasks"] });
      toast({ title: "Task created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating task", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSegmentTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SegmentTask> & { id: string }) => {
      const { data, error } = await supabase
        .from("segment_tasks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segment-tasks"] });
      toast({ title: "Task updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteSegmentTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("segment_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segment-tasks"] });
      toast({ title: "Task deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
    },
  });
}
