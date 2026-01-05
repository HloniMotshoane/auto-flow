import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "./use-toast";

export interface TabletAssignment {
  id: string;
  tenant_id: string;
  tablet_identifier: string;
  segment_id: string;
  location_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workshop_segments?: {
    id: string;
    segment_name: string;
    color: string | null;
  };
}

export interface TabletUser {
  id: string;
  tablet_assignment_id: string;
  user_id: string;
  created_at: string;
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

export interface TabletAssignmentInsert {
  tablet_identifier: string;
  segment_id: string;
  location_description?: string | null;
  is_active?: boolean;
}

export function useTabletAssignments() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["tablet-assignments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("tablet_assignments")
        .select(`
          *,
          workshop_segments (
            id,
            segment_name,
            color
          )
        `)
        .eq("tenant_id", tenantId)
        .order("tablet_identifier", { ascending: true });

      if (error) throw error;
      return data as TabletAssignment[];
    },
    enabled: !!tenantId,
  });
}

export function useTabletUsers(tabletAssignmentId?: string) {
  return useQuery({
    queryKey: ["tablet-users", tabletAssignmentId],
    queryFn: async () => {
      if (!tabletAssignmentId) return [];
      
      const { data, error } = await supabase
        .from("tablet_users")
        .select("*")
        .eq("tablet_assignment_id", tabletAssignmentId);

      if (error) throw error;
      return data as unknown as TabletUser[];
    },
    enabled: !!tabletAssignmentId,
  });
}

export function useCreateTabletAssignment() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (assignment: TabletAssignmentInsert) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("tablet_assignments")
        .insert({ ...assignment, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-assignments"] });
      toast({ title: "Tablet registered successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error registering tablet", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateTabletAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TabletAssignment> & { id: string }) => {
      const { data, error } = await supabase
        .from("tablet_assignments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-assignments"] });
      toast({ title: "Tablet updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating tablet", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteTabletAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tablet_assignments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-assignments"] });
      toast({ title: "Tablet deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting tablet", description: error.message, variant: "destructive" });
    },
  });
}

export function useAddTabletUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tabletAssignmentId, userId }: { tabletAssignmentId: string; userId: string }) => {
      const { data, error } = await supabase
        .from("tablet_users")
        .insert({ tablet_assignment_id: tabletAssignmentId, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-users"] });
      toast({ title: "User added to tablet" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding user", description: error.message, variant: "destructive" });
    },
  });
}

export function useRemoveTabletUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tablet_users")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-users"] });
      toast({ title: "User removed from tablet" });
    },
    onError: (error: Error) => {
      toast({ title: "Error removing user", description: error.message, variant: "destructive" });
    },
  });
}
