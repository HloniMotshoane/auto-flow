import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type TenantStatus = "active" | "suspended" | "archived" | "pending";

export interface Tenant {
  id: string;
  branch_name: string;
  company_name: string;
  status: TenantStatus;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  vat_number: string | null;
  registration_number: string | null;
  credits: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantInsert {
  branch_name: string;
  company_name: string;
  status?: TenantStatus;
  contact_person?: string;
  email?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  province?: string;
  country?: string;
  vat_number?: string;
  registration_number?: string;
  credits?: number;
  notes?: string;
}

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("branch_name", { ascending: true });

      if (error) throw error;
      return data as Tenant[];
    },
  });
}

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: ["tenant", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!id,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tenant: TenantInsert) => {
      const { data, error } = await supabase
        .from("tenants")
        .insert(tenant)
        .select()
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant created successfully");
    },
    onError: (error) => {
      console.error("Error creating tenant:", error);
      toast.error("Failed to create tenant");
    },
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...tenant }: Partial<Tenant> & { id: string }) => {
      const { data, error } = await supabase
        .from("tenants")
        .update(tenant)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Tenant;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenant", data.id] });
      toast.success("Tenant updated successfully");
    },
    onError: (error) => {
      console.error("Error updating tenant:", error);
      toast.error("Failed to update tenant");
    },
  });
}

export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tenants")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Tenant deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant");
    },
  });
}
