import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./use-toast";

export interface WorkshopReport {
  id: string;
  tenant_id: string;
  case_id: string;
  closed_at: string;
  closed_by: string;
  manager_notes: string | null;
  final_status: string;
  report_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  cases?: {
    id: string;
    case_number: string;
    job_number: string | null;
    vehicles?: {
      registration_number: string | null;
      make: string | null;
      model: string | null;
    };
    customers?: {
      name: string;
      phone: string | null;
    };
  };
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CreateWorkshopReportInput {
  case_id: string;
  manager_notes?: string;
  final_status: string;
  report_data: Record<string, unknown>;
}

export function useWorkshopReports() {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["workshop-reports", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from("workshop_reports")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("closed_at", { ascending: false });

      if (error) throw error;
      return data as unknown as WorkshopReport[];
    },
    enabled: !!tenantId,
  });
}

export function useWorkshopReport(caseId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["workshop-report", tenantId, caseId],
    queryFn: async () => {
      if (!tenantId || !caseId) return null;
      
      const { data, error } = await supabase
        .from("workshop_reports")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as WorkshopReport | null;
    },
    enabled: !!tenantId && !!caseId,
  });
}

export function useCreateWorkshopReport() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateWorkshopReportInput) => {
      if (!tenantId || !user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("workshop_reports")
        .insert({
          case_id: input.case_id,
          manager_notes: input.manager_notes,
          final_status: input.final_status,
          report_data: input.report_data as unknown as Record<string, never>,
          tenant_id: tenantId,
          closed_by: user.id,
          closed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-reports"] });
      queryClient.invalidateQueries({ queryKey: ["workshop-report"] });
      toast({ title: "Workshop report created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating report", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateWorkshopReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, manager_notes, final_status }: { id: string; manager_notes?: string; final_status?: string }) => {
      const { data, error } = await supabase
        .from("workshop_reports")
        .update({ manager_notes, final_status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workshop-reports"] });
      queryClient.invalidateQueries({ queryKey: ["workshop-report"] });
      toast({ title: "Report updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating report", description: error.message, variant: "destructive" });
    },
  });
}
