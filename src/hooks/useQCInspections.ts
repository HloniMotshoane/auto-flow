import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserTenant } from "./useUserTenant";
import { toast } from "sonner";

export interface QCInspectionResult {
  id: string;
  inspection_id: string;
  checklist_item_id: string;
  result: string;
  notes: string | null;
  photos: string[];
  created_at: string;
  updated_at: string;
  checklist_item?: {
    id: string;
    item_text: string;
    requires_photo: boolean;
    requires_notes: boolean;
  };
}

export interface QCInspection {
  id: string;
  tenant_id: string;
  case_id: string;
  checklist_id: string;
  inspector_id: string;
  inspection_type: string;
  status: string;
  overall_score: number | null;
  total_items: number;
  passed_items: number;
  failed_items: number;
  na_items: number;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  checklist?: {
    id: string;
    name: string;
    checklist_type: string;
  };
  inspector?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
  results?: QCInspectionResult[];
}

export function useQCInspections(caseId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["qc-inspections", caseId, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("qc_inspections")
        .select(`
          *,
          checklist:qc_checklists(id, name, checklist_type),
          inspector:profiles!qc_inspections_inspector_id_fkey(id, first_name, last_name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (caseId) {
        query = query.eq("case_id", caseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as QCInspection[];
    },
    enabled: !!tenantId,
  });
}

export function useQCInspectionWithResults(inspectionId?: string) {
  return useQuery({
    queryKey: ["qc-inspection", inspectionId],
    queryFn: async () => {
      if (!inspectionId) return null;

      const { data, error } = await supabase
        .from("qc_inspections")
        .select(`
          *,
          checklist:qc_checklists(id, name, checklist_type),
          results:qc_inspection_results(
            *,
            checklist_item:qc_checklist_items(id, item_text, requires_photo, requires_notes)
          )
        `)
        .eq("id", inspectionId)
        .single();

      if (error) throw error;
      return data as unknown as QCInspection;
    },
    enabled: !!inspectionId,
  });
}

export function useCreateQCInspection() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: {
      case_id: string;
      checklist_id: string;
      inspector_id: string;
      inspection_type: string;
    }) => {
      if (!tenantId) throw new Error("No tenant ID");

      // Get checklist items to create result placeholders
      const { data: items } = await supabase
        .from("qc_checklist_items")
        .select("id")
        .eq("checklist_id", input.checklist_id)
        .eq("is_active", true);

      const { data: inspection, error: inspectionError } = await supabase
        .from("qc_inspections")
        .insert({
          ...input,
          tenant_id: tenantId,
          total_items: items?.length || 0,
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Create result placeholders for each item
      if (items && items.length > 0) {
        const results = items.map((item) => ({
          inspection_id: inspection.id,
          checklist_item_id: item.id,
          result: "pending",
        }));

        await supabase.from("qc_inspection_results").insert(results);
      }

      return inspection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-inspections"] });
      toast.success("Inspection started");
    },
    onError: (error) => {
      toast.error("Failed to start inspection: " + error.message);
    },
  });
}

export function useUpdateQCInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QCInspection> & { id: string }) => {
      const { data, error } = await supabase
        .from("qc_inspections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-inspections"] });
      queryClient.invalidateQueries({ queryKey: ["qc-inspection"] });
    },
  });
}

export function useUpdateQCInspectionResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<QCInspectionResult> & { id: string }) => {
      const { data, error } = await supabase
        .from("qc_inspection_results")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qc-inspection"] });
    },
  });
}

export function useCompleteQCInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inspectionId: string) => {
      // Calculate results
      const { data: results } = await supabase
        .from("qc_inspection_results")
        .select("result")
        .eq("inspection_id", inspectionId);

      const passed = results?.filter((r) => r.result === "pass").length || 0;
      const failed = results?.filter((r) => r.result === "fail").length || 0;
      const na = results?.filter((r) => r.result === "na").length || 0;
      const total = results?.length || 0;
      const score = total > 0 ? (passed / (total - na)) * 100 : 0;

      const status = failed > 0 ? "failed" : "passed";

      const { data, error } = await supabase
        .from("qc_inspections")
        .update({
          status,
          passed_items: passed,
          failed_items: failed,
          na_items: na,
          overall_score: Math.round(score),
          completed_at: new Date().toISOString(),
        })
        .eq("id", inspectionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["qc-inspections"] });
      queryClient.invalidateQueries({ queryKey: ["qc-inspection"] });
      toast.success(`Inspection ${data.status === "passed" ? "passed" : "failed"}`);
    },
    onError: (error) => {
      toast.error("Failed to complete inspection: " + error.message);
    },
  });
}
