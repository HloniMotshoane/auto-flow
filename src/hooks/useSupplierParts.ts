import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { toast } from "@/hooks/use-toast";

export interface SupplierPart {
  id: string;
  tenant_id: string;
  supplier_id: string;
  category_id: string | null;
  part_name: string;
  part_number: string | null;
  vin_number: string | null;
  description: string | null;
  model_compatibility: string | null;
  list_price: number | null;
  stock_available: number | null;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  // Joined data
  supplier?: { supplier_name: string } | null;
  category?: { name: string; color: string | null } | null;
}

export type SupplierPartInsert = Omit<SupplierPart, "id" | "created_at" | "updated_at" | "supplier" | "category">;
export type SupplierPartUpdate = Partial<Omit<SupplierPart, "id" | "tenant_id" | "created_at" | "updated_at" | "supplier" | "category">>;

export function useSupplierParts(supplierId?: string) {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: parts = [], isLoading, error } = useQuery({
    queryKey: ["supplier-parts", tenantId, supplierId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("supplier_parts")
        .select(`
          *,
          supplier:suppliers(supplier_name),
          category:part_categories(name, color)
        `)
        .eq("tenant_id", tenantId)
        .order("part_name");
      
      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SupplierPart[];
    },
    enabled: !!tenantId,
  });

  const createPart = useMutation({
    mutationFn: async (part: Omit<SupplierPartInsert, "tenant_id">) => {
      if (!tenantId) throw new Error("No tenant ID");
      const { data, error } = await supabase
        .from("supplier_parts")
        .insert({ ...part, tenant_id: tenantId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-parts", tenantId] });
      toast({ title: "Success", description: "Part created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePart = useMutation({
    mutationFn: async ({ id, ...updates }: SupplierPartUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("supplier_parts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-parts", tenantId] });
      toast({ title: "Success", description: "Part updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePart = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("supplier_parts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-parts", tenantId] });
      toast({ title: "Success", description: "Part deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Search parts by name, number, or model
  const searchParts = async (searchTerm: string) => {
    if (!tenantId || !searchTerm) return [];
    
    const { data, error } = await supabase
      .from("supplier_parts")
      .select(`
        *,
        supplier:suppliers(supplier_name),
        category:part_categories(name, color)
      `)
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .or(`part_name.ilike.%${searchTerm}%,part_number.ilike.%${searchTerm}%,model_compatibility.ilike.%${searchTerm}%`)
      .limit(20);
    
    if (error) throw error;
    return data as SupplierPart[];
  };

  return {
    parts,
    isLoading,
    error,
    createPart,
    updatePart,
    deletePart,
    searchParts,
    activeParts: parts.filter(p => p.is_active),
  };
}
