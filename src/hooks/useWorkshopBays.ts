import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserTenant } from "./useUserTenant";
import { toast } from "sonner";

export interface WorkshopBay {
  id: string;
  tenant_id: string;
  name: string;
  code: string | null;
  bay_type: string;
  segment_id: string | null;
  capacity: number;
  is_active: boolean;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  segment?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  current_assignment?: {
    id: string;
    case_id: string | null;
    vehicle?: {
      id: string;
      make: string | null;
      model: string | null;
      registration_number: string | null;
    } | null;
  } | null;
}

export function useWorkshopBays() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["workshop-bays", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("workshop_bays")
        .select(`
          *,
          segment:workshop_segments(id, name, color)
        `)
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as unknown as WorkshopBay[];
    },
    enabled: !!tenantId,
  });
}

export function useWorkshopBaysWithAssignments() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["workshop-bays-assignments", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      // Get bays
      const { data: bays, error: baysError } = await supabase
        .from("workshop_bays")
        .select(`
          *,
          segment:workshop_segments(id, name, color)
        `)
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (baysError) throw baysError;

      // Get active assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("bay_assignments")
        .select(`
          id,
          bay_id,
          case_id,
          vehicle:vehicles(id, make, model, registration_number)
        `)
        .eq("tenant_id", tenantId)
        .eq("status", "active");

      if (assignmentsError) throw assignmentsError;

      // Map assignments to bays
      const baysWithAssignments = bays?.map((bay) => ({
        ...bay,
        current_assignment: assignments?.find((a) => a.bay_id === bay.id) || null,
      }));

      return baysWithAssignments as unknown as WorkshopBay[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateWorkshopBay() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: Omit<WorkshopBay, "id" | "tenant_id" | "created_at" | "updated_at">) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("workshop_bays")
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-bays"] });
      toast.success("Bay created");
    },
    onError: (error) => {
      toast.error("Failed to create bay: " + error.message);
    },
  });
}

export function useUpdateWorkshopBay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkshopBay> & { id: string }) => {
      const { data, error } = await supabase
        .from("workshop_bays")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-bays"] });
      toast.success("Bay updated");
    },
    onError: (error) => {
      toast.error("Failed to update bay: " + error.message);
    },
  });
}

export function useDeleteWorkshopBay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workshop_bays")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-bays"] });
      toast.success("Bay deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete bay: " + error.message);
    },
  });
}

// Bay Assignments
export function useAssignBay() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: {
      bay_id: string;
      case_id?: string;
      vehicle_id?: string;
      assigned_technician_id?: string;
    }) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("bay_assignments")
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-bays"] });
      queryClient.invalidateQueries({ queryKey: ["bay-assignments"] });
      toast.success("Bay assigned");
    },
    onError: (error) => {
      toast.error("Failed to assign bay: " + error.message);
    },
  });
}

export function useReleaseBay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const { data, error } = await supabase
        .from("bay_assignments")
        .update({
          status: "completed",
          released_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-bays"] });
      queryClient.invalidateQueries({ queryKey: ["bay-assignments"] });
      toast.success("Bay released");
    },
    onError: (error) => {
      toast.error("Failed to release bay: " + error.message);
    },
  });
}
