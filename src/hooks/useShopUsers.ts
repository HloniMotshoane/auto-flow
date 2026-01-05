import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "./use-toast";

export interface ShopUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  cell_number: string | null;
  job_role: string | null;
  department: string | null;
  pin: string | null;
  branch_id: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
  user_roles?: {
    role: string;
  }[];
}

export interface CreateShopUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'technician' | 'user' | 'workshop_manager';
  phone?: string;
  cell_number?: string;
  job_role?: string;
  department?: string;
  pin?: string;
  branch_id?: string;
}

export function useShopUsers() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["shop-users", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("first_name", { ascending: true });

      if (error) throw error;
      return data as unknown as ShopUser[];
    },
    enabled: !!tenantId,
  });
}

export function useShopTechnicians() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["shop-technicians", tenantId],
    queryFn: async (): Promise<ShopUser[]> => {
      if (!tenantId) return [];
      
      // Get all active profiles for tenant
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("first_name", { ascending: true });

      if (profilesError) throw profilesError;
      
      // Return all active users - full role-based filtering requires additional setup
      return (profiles ?? []) as unknown as ShopUser[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateShopUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateShopUserInput) => {
      const { data, error } = await supabase.functions.invoke('create-shop-user', {
        body: input,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-users"] });
      queryClient.invalidateQueries({ queryKey: ["shop-technicians"] });
      toast({ title: "User created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating user", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateShopUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, ...updates }: Partial<ShopUser> & { userId: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          phone: updates.phone,
          cell_number: updates.cell_number,
          job_role: updates.job_role,
          department: updates.department,
          pin: updates.pin,
          branch_id: updates.branch_id,
          is_active: updates.is_active,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-users"] });
      queryClient.invalidateQueries({ queryKey: ["shop-technicians"] });
      toast({ title: "User updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating user", description: error.message, variant: "destructive" });
    },
  });
}

export function useToggleShopUserActive() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shop-users"] });
      queryClient.invalidateQueries({ queryKey: ["shop-technicians"] });
      toast({ title: variables.isActive ? "User activated" : "User deactivated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating user", description: error.message, variant: "destructive" });
    },
  });
}
