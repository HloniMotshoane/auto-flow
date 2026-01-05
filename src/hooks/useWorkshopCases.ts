import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface WorkshopCase {
  id: string;
  case_number: string;
  job_number: string | null;
  status: string;
  current_stage_id: string | null;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  authorization_number: string | null;
  insurance_company_id: string | null;
  notes: string | null;
  vehicle?: {
    id: string;
    make: string | null;
    model: string | null;
    year: number | null;
    color: string | null;
    vin_number: string | null;
  } | null;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    whatsapp_number: string | null;
  } | null;
  current_stage?: {
    id: string;
    name: string;
    color: string | null;
    order_index: number;
  } | null;
}

export function useWorkshopCases(tenantId?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ["workshop-cases", tenantId, searchQuery],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("cases")
        .select(`
          id,
          case_number,
          job_number,
          status,
          current_stage_id,
          tenant_id,
          created_at,
          updated_at,
          vehicle:vehicles(
            id,
            make,
            model,
            year,
            color,
            vin_number
          ),
          customer:customers(
            id,
            name,
            phone,
            email,
            whatsapp_number
          ),
          current_stage:workflow_stages!cases_current_stage_id_fkey(
            id,
            name,
            color,
            order_index
          )
        `)
        .eq("tenant_id", tenantId)
        .neq("status", "delivered")
        .order("updated_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`case_number.ilike.%${searchQuery}%,job_number.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as WorkshopCase[];
    },
    enabled: !!tenantId,
  });
}

export function useWorkshopCasesByStage(tenantId?: string) {
  return useQuery({
    queryKey: ["workshop-cases-by-stage", tenantId],
    queryFn: async () => {
      if (!tenantId) return { stages: [], casesByStage: {} };

      // Get all stages
      const { data: stages, error: stagesError } = await supabase
        .from("workflow_stages")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (stagesError) throw stagesError;

      // Get all active cases
      const { data: cases, error: casesError } = await supabase
        .from("cases")
        .select(`
          id,
          case_number,
          job_number,
          status,
          current_stage_id,
          tenant_id,
          created_at,
          updated_at,
          authorization_number,
          insurance_company_id,
          notes,
          vehicle:vehicles(
            id,
            make,
            model,
            year,
            color,
            vin_number
          ),
          customer:customers(
            id,
            name,
            phone,
            email,
            whatsapp_number
          )
        `)
        .eq("tenant_id", tenantId)
        .neq("status", "delivered");

      if (casesError) throw casesError;

      // Group cases by stage
      const casesByStage: Record<string, WorkshopCase[]> = {};
      stages?.forEach((stage) => {
        casesByStage[stage.id] = [];
      });
      casesByStage["unassigned"] = [];

      cases?.forEach((c) => {
        const caseData = c as unknown as WorkshopCase;
        if (c.current_stage_id && casesByStage[c.current_stage_id]) {
          casesByStage[c.current_stage_id].push(caseData);
        } else {
          casesByStage["unassigned"].push(caseData);
        }
      });

      return { stages: stages || [], casesByStage };
    },
    enabled: !!tenantId,
  });
}
