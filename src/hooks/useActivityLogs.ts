import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./use-toast";

export interface ActivityLog {
  id: string;
  tenant_id: string;
  case_id: string;
  segment_id: string;
  task_id: string | null;
  technician_id: string;
  start_time: string;
  stop_time: string | null;
  duration_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  workshop_segments?: {
    id: string;
    segment_name: string;
    color: string | null;
  };
  segment_tasks?: {
    id: string;
    task_name: string;
  } | null;
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface ActivityLogInsert {
  case_id: string;
  segment_id: string;
  task_id?: string | null;
  notes?: string | null;
}

export function useActivityLogs(caseId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["activity-logs", tenantId, caseId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("activity_logs")
        .select(`
          *,
          workshop_segments (
            id,
            segment_name,
            color
          ),
          segment_tasks (
            id,
            task_name
          )
        `)
        .eq("tenant_id", tenantId);

      if (caseId) {
        query = query.eq("case_id", caseId);
      }

      const { data, error } = await query.order("start_time", { ascending: false });

      if (error) throw error;
      return data as unknown as ActivityLog[];
    },
    enabled: !!tenantId,
  });
}

export function useActiveActivityLog() {
  const { tenantId } = useUserTenant();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["active-activity-log", tenantId, user?.id],
    queryFn: async () => {
      if (!tenantId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          workshop_segments (
            id,
            segment_name,
            color
          ),
          segment_tasks (
            id,
            task_name
          )
        `)
        .eq("tenant_id", tenantId)
        .eq("technician_id", user.id)
        .is("stop_time", null)
        .maybeSingle();

      if (error) throw error;
      return data as ActivityLog | null;
    },
    enabled: !!tenantId && !!user?.id,
  });
}

export function useStartActivity() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (activity: ActivityLogInsert) => {
      if (!tenantId || !user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("activity_logs")
        .insert({
          ...activity,
          tenant_id: tenantId,
          technician_id: user.id,
          start_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["active-activity-log"] });
      toast({ title: "Work started" });
    },
    onError: (error: Error) => {
      toast({ title: "Error starting work", description: error.message, variant: "destructive" });
    },
  });
}

export function useStopActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const stopTime = new Date();
      
      // First get the start time
      const { data: activity, error: fetchError } = await supabase
        .from("activity_logs")
        .select("start_time")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const startTime = new Date(activity.start_time);
      const durationMinutes = Math.round((stopTime.getTime() - startTime.getTime()) / 60000);

      const { data, error } = await supabase
        .from("activity_logs")
        .update({
          stop_time: stopTime.toISOString(),
          duration_minutes: durationMinutes,
          notes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      queryClient.invalidateQueries({ queryKey: ["active-activity-log"] });
      toast({ title: "Work stopped" });
    },
    onError: (error: Error) => {
      toast({ title: "Error stopping work", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteActivityLog() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("activity_logs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-logs"] });
      toast({ title: "Activity log deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting activity log", description: error.message, variant: "destructive" });
    },
  });
}
