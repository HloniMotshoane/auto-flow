import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "./use-toast";

export interface WorkshopSegment {
  id: string;
  tenant_id: string;
  segment_name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkshopSegmentInsert {
  segment_name: string;
  description?: string | null;
  sort_order?: number;
  is_active?: boolean;
  color?: string | null;
}

export function useWorkshopSegments() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["workshop-segments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("workshop_segments")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as WorkshopSegment[];
    },
    enabled: !!tenantId,
  });
}

export function useActiveWorkshopSegments() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["workshop-segments-active", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("workshop_segments")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as WorkshopSegment[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateWorkshopSegment() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (segment: WorkshopSegmentInsert) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("workshop_segments")
        .insert({ ...segment, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-segments"] });
      toast({ title: "Segment created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating segment", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWorkshopSegment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkshopSegment> & { id: string }) => {
      const { data, error } = await supabase
        .from("workshop_segments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-segments"] });
      toast({ title: "Segment updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating segment", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteWorkshopSegment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workshop_segments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-segments"] });
      toast({ title: "Segment deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting segment", description: error.message, variant: "destructive" });
    },
  });
}

export function useReorderWorkshopSegments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (segments: { id: string; sort_order: number }[]) => {
      const updates = segments.map(({ id, sort_order }) =>
        supabase.from("workshop_segments").update({ sort_order }).eq("id", id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-segments"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error reordering segments", description: error.message, variant: "destructive" });
    },
  });
}
