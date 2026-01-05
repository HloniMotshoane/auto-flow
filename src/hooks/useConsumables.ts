import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { toast } from "sonner";

export interface ConsumableCategory {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  color: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface Consumable {
  id: string;
  tenant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  sku: string | null;
  unit_of_measure: string;
  current_stock: number;
  minimum_stock_level: number;
  unit_cost: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  category?: ConsumableCategory;
}

export interface ConsumableMovement {
  id: string;
  tenant_id: string;
  consumable_id: string;
  case_id: string | null;
  movement_type: string;
  quantity: number;
  unit_cost: number | null;
  reason: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CaseConsumable {
  id: string;
  tenant_id: string;
  case_id: string;
  consumable_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  notes: string | null;
  created_by: string | null;
  segment_id: string | null;
  technician_id: string | null;
  created_at: string;
  updated_at: string;
  consumable?: Consumable;
}

// Categories hooks
export function useConsumableCategories() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["consumable-categories", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consumable_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as ConsumableCategory[];
    },
    enabled: !!tenantId,
  });
}

// Consumables hooks
export function useConsumables() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["consumables", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consumables")
        .select(`
          *,
          category:consumable_categories(*)
        `)
        .order("name");

      if (error) throw error;
      return data as Consumable[];
    },
    enabled: !!tenantId,
  });
}

export function useConsumable(id: string | undefined) {
  return useQuery({
    queryKey: ["consumable", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("consumables")
        .select(`
          *,
          category:consumable_categories(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Consumable;
    },
    enabled: !!id,
  });
}

export function useLowStockConsumables() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["low-stock-consumables", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consumables")
        .select(`
          *,
          category:consumable_categories(*)
        `)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      // Filter for items where current_stock <= minimum_stock_level
      return (data as Consumable[]).filter(
        item => item.current_stock <= item.minimum_stock_level
      );
    },
    enabled: !!tenantId,
  });
}

export function useCreateConsumable() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (consumable: Partial<Consumable>) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("consumables")
        .insert({
          name: consumable.name!,
          tenant_id: tenantId,
          category_id: consumable.category_id,
          description: consumable.description,
          sku: consumable.sku,
          unit_of_measure: consumable.unit_of_measure || "each",
          current_stock: consumable.current_stock || 0,
          minimum_stock_level: consumable.minimum_stock_level || 0,
          unit_cost: consumable.unit_cost || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      toast.success("Consumable created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create consumable: " + error.message);
    },
  });
}

export function useUpdateConsumable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...consumable }: Partial<Consumable> & { id: string }) => {
      const { data, error } = await supabase
        .from("consumables")
        .update(consumable)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      toast.success("Consumable updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update consumable: " + error.message);
    },
  });
}

export function useDeleteConsumable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("consumables")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      toast.success("Consumable deactivated successfully");
    },
    onError: (error) => {
      toast.error("Failed to deactivate consumable: " + error.message);
    },
  });
}

// Stock movement hooks
export function useConsumableMovements(consumableId: string | undefined) {
  return useQuery({
    queryKey: ["consumable-movements", consumableId],
    queryFn: async () => {
      if (!consumableId) return [];
      const { data, error } = await supabase
        .from("consumable_movements")
        .select("*")
        .eq("consumable_id", consumableId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ConsumableMovement[];
    },
    enabled: !!consumableId,
  });
}

export function useCreateMovement() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (movement: Partial<ConsumableMovement>) => {
      if (!tenantId) throw new Error("No tenant ID");

      // Create the movement
      const { data, error } = await supabase
        .from("consumable_movements")
        .insert({
          consumable_id: movement.consumable_id!,
          tenant_id: tenantId,
          movement_type: movement.movement_type || "in",
          quantity: movement.quantity!,
          unit_cost: movement.unit_cost,
          reason: movement.reason,
          notes: movement.notes,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the consumable stock
      const { data: consumable, error: fetchError } = await supabase
        .from("consumables")
        .select("current_stock")
        .eq("id", movement.consumable_id)
        .single();

      if (fetchError) throw fetchError;

      const stockChange = movement.movement_type === "in" 
        ? (movement.quantity || 0) 
        : -(movement.quantity || 0);
      
      const newStock = (consumable.current_stock || 0) + stockChange;

      const { error: updateError } = await supabase
        .from("consumables")
        .update({ current_stock: newStock })
        .eq("id", movement.consumable_id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      queryClient.invalidateQueries({ queryKey: ["consumable-movements"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock-consumables"] });
      toast.success("Stock movement recorded");
    },
    onError: (error) => {
      toast.error("Failed to record movement: " + error.message);
    },
  });
}

// Case consumables hooks
export function useCaseConsumables(caseId: string | undefined) {
  return useQuery({
    queryKey: ["case-consumables", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      const { data, error } = await supabase
        .from("case_consumables")
        .select(`
          *,
          consumable:consumables(*)
        `)
        .eq("case_id", caseId)
        .order("created_at");

      if (error) throw error;
      return data as CaseConsumable[];
    },
    enabled: !!caseId,
  });
}

export function useAddCaseConsumable() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (caseConsumable: Partial<CaseConsumable> & { segment_id?: string | null; technician_id?: string | null }) => {
      if (!tenantId) throw new Error("No tenant ID");

      // Add to case_consumables
      const { data, error } = await supabase
        .from("case_consumables")
        .insert({
          case_id: caseConsumable.case_id!,
          consumable_id: caseConsumable.consumable_id!,
          tenant_id: tenantId,
          quantity: caseConsumable.quantity || 1,
          unit_cost: caseConsumable.unit_cost || 0,
          notes: caseConsumable.notes,
          segment_id: caseConsumable.segment_id || null,
          technician_id: caseConsumable.technician_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create a movement record
      await supabase.from("consumable_movements").insert({
        tenant_id: tenantId,
        consumable_id: caseConsumable.consumable_id!,
        case_id: caseConsumable.case_id,
        movement_type: "out",
        quantity: caseConsumable.quantity || 1,
        unit_cost: caseConsumable.unit_cost,
        reason: "Used on case",
      });

      // Deduct from stock
      const { data: consumable, error: fetchError } = await supabase
        .from("consumables")
        .select("current_stock")
        .eq("id", caseConsumable.consumable_id)
        .single();

      if (!fetchError && consumable) {
        const newStock = (consumable.current_stock || 0) - (caseConsumable.quantity || 0);
        await supabase
          .from("consumables")
          .update({ current_stock: Math.max(0, newStock) })
          .eq("id", caseConsumable.consumable_id);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-consumables"] });
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      queryClient.invalidateQueries({ queryKey: ["low-stock-consumables"] });
      toast.success("Consumable added to case");
    },
    onError: (error) => {
      toast.error("Failed to add consumable: " + error.message);
    },
  });
}

export function useRemoveCaseConsumable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("case_consumables")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-consumables"] });
      toast.success("Consumable removed from case");
    },
    onError: (error) => {
      toast.error("Failed to remove consumable: " + error.message);
    },
  });
}
