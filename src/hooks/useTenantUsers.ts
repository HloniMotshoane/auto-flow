import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface TenantUser {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  cell_number: string | null;
  is_active: boolean;
  job_role: string | null;
  department: string | null;
  company_code: string | null;
  pin: string | null;
  branch_id: string | null;
  tenant_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  branch?: {
    id: string;
    name: string;
  } | null;
}

export interface TenantUserInsert {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  cell_number?: string;
  is_active?: boolean;
  job_role?: string;
  department?: string;
  company_code?: string;
  pin?: string;
  branch_id?: string;
  tenant_id?: string;
}

export interface DashboardPermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface SpecialActionPermission {
  action_name: string;
  is_enabled: boolean;
}

export function useTenantUsers(tenantId?: string) {
  return useQuery({
    queryKey: ["tenant-users", tenantId],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          *,
          branch:branches(id, name)
        `)
        .order("created_at", { ascending: false });

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      } else {
        query = query.not("tenant_id", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TenantUser[];
    },
  });
}

export function useTenantUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["tenant-user", userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          branch:branches(id, name)
        `)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as TenantUser | null;
    },
    enabled: !!userId,
  });
}

export function useUserDashboardPermissions(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-permissions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data as DashboardPermission[];
    },
    enabled: !!userId,
  });
}

export function useUserSpecialActions(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-special-actions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("special_action_permissions")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      return data as SpecialActionPermission[];
    },
    enabled: !!userId,
  });
}

export function useUpdateTenantUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      profile,
      permissions,
      specialActions 
    }: { 
      userId: string;
      profile: Partial<TenantUser>;
      permissions?: DashboardPermission[];
      specialActions?: SpecialActionPermission[];
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          cell_number: profile.cell_number,
          is_active: profile.is_active,
          job_role: profile.job_role,
          department: profile.department,
          company_code: profile.company_code,
          pin: profile.pin,
          branch_id: profile.branch_id,
          tenant_id: profile.tenant_id,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Update permissions if provided
      if (permissions && permissions.length > 0) {
        // Delete existing permissions
        await supabase.from("permissions").delete().eq("user_id", userId);
        
        // Insert new permissions
        const permissionRows = permissions.map(p => ({
          user_id: userId,
          module: p.module,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
          tenant_id: profile.tenant_id,
        }));

        const { error: permError } = await supabase
          .from("permissions")
          .insert(permissionRows);

        if (permError) throw permError;
      }

      // Update special actions if provided
      if (specialActions && specialActions.length > 0) {
        // Delete existing special actions
        await supabase.from("special_action_permissions").delete().eq("user_id", userId);
        
        // Insert new special actions
        const actionRows = specialActions
          .filter(a => a.is_enabled)
          .map(a => ({
            user_id: userId,
            tenant_id: profile.tenant_id,
            action_name: a.action_name,
            is_enabled: a.is_enabled,
          }));

        if (actionRows.length > 0) {
          const { error: actionsError } = await supabase
            .from("special_action_permissions")
            .insert(actionRows);

          if (actionsError) throw actionsError;
        }
      }

      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-user", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions", data.userId] });
      queryClient.invalidateQueries({ queryKey: ["user-special-actions", data.userId] });
      toast.success("User updated successfully");
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: isActive })
        .eq("user_id", userId);

      if (error) throw error;
      return { userId, isActive };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-users"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-user", data.userId] });
      toast.success(data.isActive ? "User activated" : "User deactivated");
    },
    onError: (error) => {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    },
  });
}
