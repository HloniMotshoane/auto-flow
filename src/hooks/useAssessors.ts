import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";
import { toast } from "sonner";

export interface Assessor {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  cell_number: string | null;
  company: string | null;
  insurance_company_id: string | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessorInsert {
  tenant_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  cell_number?: string | null;
  company?: string | null;
  insurance_company_id?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

export function useAssessors() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["assessors", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessors")
        .select("*")
        .order("first_name");

      if (error) throw error;
      return data as Assessor[];
    },
    enabled: !!tenantId,
  });
}

export function useActiveAssessors() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["assessors", "active", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessors")
        .select("id, first_name, last_name, email, phone, cell_number, company")
        .eq("is_active", true)
        .order("first_name");

      if (error) throw error;
      return data as Pick<Assessor, 'id' | 'first_name' | 'last_name' | 'email' | 'phone' | 'cell_number' | 'company'>[];
    },
    enabled: !!tenantId,
  });
}

export function useAssessor(id: string | undefined) {
  return useQuery({
    queryKey: ["assessor", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("assessors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Assessor;
    },
    enabled: !!id,
  });
}

export function useAssessorMutations() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  const createMutation = useMutation({
    mutationFn: async (assessor: Omit<AssessorInsert, 'tenant_id'>) => {
      if (!tenantId) throw new Error("Tenant not found");
      const { data, error } = await supabase
        .from("assessors")
        .insert({ ...assessor, tenant_id: tenantId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessors"] });
      toast.success("Assessor created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create assessor: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Assessor> & { id: string }) => {
      const { data, error } = await supabase
        .from("assessors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessors"] });
      toast.success("Assessor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update assessor: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("assessors")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessors"] });
      toast.success("Assessor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete assessor: ${error.message}`);
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
