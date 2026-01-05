import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { toast } from "@/hooks/use-toast";

export interface Supplier {
  id: string;
  tenant_id: string;
  supplier_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  delivery_time_estimate: number | null;
  notes: string | null;
  is_active: boolean | null;
  supplier_type: string | null;
  service_categories: string[] | null;
  created_at: string;
  updated_at: string;
}

export const SUPPLIER_TYPES = [
  { value: "parts", label: "Parts Supplier" },
  { value: "consumables", label: "Consumables Supplier" },
  { value: "services", label: "Service Provider" },
  { value: "towing", label: "Towing Company" },
  { value: "paint", label: "Paint Supplier" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "oem_parts", label: "OEM Parts" },
  { value: "aftermarket_parts", label: "Aftermarket Parts" },
  { value: "used_parts", label: "Used/Reconditioned Parts" },
  { value: "body_panels", label: "Body Panels" },
  { value: "mechanical", label: "Mechanical Parts" },
  { value: "electrical", label: "Electrical Parts" },
  { value: "glass", label: "Glass & Windscreens" },
  { value: "paint_materials", label: "Paint & Materials" },
  { value: "consumables", label: "Workshop Consumables" },
  { value: "tools_equipment", label: "Tools & Equipment" },
  { value: "towing_services", label: "Towing Services" },
  { value: "sublet_repairs", label: "Sublet Repairs" },
  { value: "calibration", label: "Calibration Services" },
  { value: "upholstery", label: "Upholstery & Trim" },
] as const;

export type SupplierInsert = Omit<Supplier, "id" | "created_at" | "updated_at">;
export type SupplierUpdate = Partial<Omit<Supplier, "id" | "tenant_id" | "created_at" | "updated_at">>;

export function useSuppliers() {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading, error } = useQuery({
    queryKey: ["suppliers", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("supplier_name");
      
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!tenantId,
  });

  const createSupplier = useMutation({
    mutationFn: async (supplier: Omit<SupplierInsert, "tenant_id">) => {
      if (!tenantId) throw new Error("No tenant ID");
      const { data, error } = await supabase
        .from("suppliers")
        .insert({ ...supplier, tenant_id: tenantId })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", tenantId] });
      toast({ title: "Success", description: "Supplier created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: SupplierUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", tenantId] });
      toast({ title: "Success", description: "Supplier updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", tenantId] });
      toast({ title: "Success", description: "Supplier deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    activeSuppliers: suppliers.filter(s => s.is_active),
  };
}
