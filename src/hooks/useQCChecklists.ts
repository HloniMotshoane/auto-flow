import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserTenant } from "./useUserTenant";
import { toast } from "sonner";

export interface QCChecklistItem {
  id: string;
  checklist_id: string;
  item_text: string;
  description: string | null;
  requires_photo: boolean;
  requires_notes: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QCChecklist {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  checklist_type: string;
  segment_id: string | null;
  is_active: boolean;
  is_required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  items?: QCChecklistItem[];
  segment?: {
    id: string;
    name: string;
    color: string | null;
  } | null;
}

export function useQCChecklists() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["qc-checklists", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("qc_checklists")
        .select(`
          *,
          segment:workshop_segments(id, name, color)
        `)
        .eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as unknown as QCChecklist[];
    },
    enabled: !!tenantId,
  });
}

export function useQCChecklistWithItems(checklistId?: string) {
  return useQuery({
    queryKey: ["qc-checklist", checklistId],
    queryFn: async () => {
      if (!checklistId) return null;

      const { data, error } = await supabase
        .from("qc_checklists")
        .select(`
          *,
          segment:workshop_segments(id, name, color),
          items:qc_checklist_items(*)
        `)
        .eq("id", checklistId)
        .single();

      if (error) throw error;
      return data as unknown as QCChecklist;
    },
    enabled: !!checklistId,
  });
}

export function useCreateQCChecklist() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: Omit<QCChecklist, "id" | "tenant_id" | "created_at" | "updated_at">) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("qc_checklists")
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-checklists"] });
      toast.success("QC checklist created");
    },
    onError: (error) => {
      toast.error("Failed to create checklist: " + error.message);
    },
  });
}

export function useUpdateQCChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QCChecklist> & { id: string }) => {
      const { data, error } = await supabase
        .from("qc_checklists")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-checklists"] });
      queryClient.invalidateQueries({ queryKey: ["qc-checklist"] });
      toast.success("QC checklist updated");
    },
    onError: (error) => {
      toast.error("Failed to update checklist: " + error.message);
    },
  });
}

export function useDeleteQCChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("qc_checklists")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-checklists"] });
      toast.success("QC checklist deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete checklist: " + error.message);
    },
  });
}

// Checklist Items
export function useCreateQCChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<QCChecklistItem, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("qc_checklist_items")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-checklist"] });
      toast.success("Checklist item added");
    },
    onError: (error) => {
      toast.error("Failed to add item: " + error.message);
    },
  });
}

export function useUpdateQCChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QCChecklistItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("qc_checklist_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-checklist"] });
    },
  });
}

export function useDeleteQCChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("qc_checklist_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-checklist"] });
      toast.success("Checklist item removed");
    },
  });
}
