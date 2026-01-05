import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";

export interface CaseDetail {
  id: string;
  tenant_id: string;
  case_number: string;
  job_number: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  activated_at: string | null;
  current_stage_id: string | null;
  was_towed: boolean | null;
  tow_company: string | null;
  tow_contact_number: string | null;
  tow_email: string | null;
  tow_fee: number | null;
  tow_in_date: string | null;
  storage_days: number | null;
  insurance_company_id: string | null;
  insurance_type: string | null;
  insurance_email: string | null;
  insurance_number: string | null;
  policy_number: string | null;
  claim_reference: string | null;
  authorization_number: string | null;
  excess_amount: number | null;
  clerk_reference: string | null;
  assessor_id: string | null;
  assessor_company: string | null;
  assessor_phone: string | null;
  assessor_email: string | null;
  condition_status: string | null;
  warranty_status: string | null;
  vehicle: {
    id: string;
    vin: string | null;
    registration: string | null;
    make: string;
    model: string;
    year: number | null;
    color: string | null;
    engine_number: string | null;
  } | null;
  customer: {
    id: string;
    name: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    whatsapp_number: string | null;
    address: string | null;
    suburb: string | null;
    city: string | null;
    postal_code: string | null;
    customer_type: string | null;
    id_number: string | null;
    date_of_birth: string | null;
  } | null;
  current_stage: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  intake: {
    id: string;
    intake_number: string;
    notes: string | null;
  } | null;
}

export function useCaseDetail(caseId?: string) {
  const { tenantId } = useUserTenant();

  const { data: caseDetail, isLoading, error, refetch } = useQuery({
    queryKey: ["case-detail", caseId],
    queryFn: async () => {
      if (!caseId) return null;
      
      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          vehicle:vehicles(id, vin, registration, make, model, year, color, engine_number),
          customer:customers(id, name, first_name, last_name, email, phone, whatsapp_number, address, suburb, city, postal_code, customer_type, id_number, date_of_birth),
          current_stage:workflow_stages(id, name, color),
          intake:vehicle_intakes(id, intake_number, notes)
        `)
        .eq("id", caseId)
        .single();
      
      if (error) throw error;
      return data as unknown as CaseDetail;
    },
    enabled: !!caseId && !!tenantId,
  });

  return { caseDetail, isLoading, error, refetch };
}
