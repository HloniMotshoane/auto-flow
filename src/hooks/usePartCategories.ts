import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { toast } from "@/hooks/use-toast";

export interface PartCategory {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export type PartCategoryInsert = Omit<PartCategory, "id" | "created_at" | "updated_at">;
export type PartCategoryUpdate = Partial<Omit<PartCategory, "id" | "tenant_id" | "created_at" | "updated_at">>;

export function usePartCategories() {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["part-categories", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("part_categories")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("name");
      
      if (error) throw error;
      return data as PartCategory[];
    },
    enabled: !!tenantId,
  });

  const createCategory = useMutation({
    mutationFn: async (category: Omit<PartCategoryInsert, "tenant_id">) => {
      if (!tenantId) throw new Error("No tenant ID");
      const { data, error } = await supabase
        .from("part_categories")
        .insert({ ...category, tenant_id: tenantId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-categories", tenantId] });
      toast({ title: "Success", description: "Category created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: PartCategoryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("part_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-categories", tenantId] });
      toast({ title: "Success", description: "Category updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("part_categories")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-categories", tenantId] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    activeCategories: categories.filter(c => c.is_active),
  };
}
