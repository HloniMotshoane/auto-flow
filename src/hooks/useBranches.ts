import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Branch {
  id: string;
  tenant_id: string;
  name: string;
  code: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BranchInsert {
  tenant_id: string;
  name: string;
  code?: string;
  address?: string;
  is_active?: boolean;
}

export function useBranches(tenantId?: string) {
  return useQuery({
    queryKey: ["branches", tenantId],
    queryFn: async () => {
      let query = supabase
        .from("branches")
        .select("*")
        .order("name", { ascending: true });

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Branch;
    },
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branch: BranchInsert) => {
      const { data, error } = await supabase
        .from("branches")
        .insert(branch)
        .select()
        .single();
      if (error) throw error;
      return data as Branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch created successfully");
    },
    onError: (error) => {
      console.error("Error creating branch:", error);
      toast.error("Failed to create branch");
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...branch }: Partial<Branch> & { id: string }) => {
      const { data, error } = await supabase
        .from("branches")
        .update(branch)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Branch;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", data.id] });
      toast.success("Branch updated successfully");
    },
    onError: (error) => {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch");
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast.success("Branch deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting branch:", error);
      toast.error("Failed to delete branch");
    },
  });
}
