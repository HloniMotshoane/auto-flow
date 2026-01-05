import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

export interface AuthorisedQuote {
  id: string;
  quote_number: string;
  status: string | null;
  estimator_id: string | null;
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  vehicle_id: string | null;
  case_id: string | null;
  total_amount: number | null;
  authorized: boolean | null;
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
  vehicle?: {
    id: string;
    make: string | null;
    model: string | null;
    registration: string | null;
    year: number | null;
  } | null;
  cases?: {
    id: string;
    case_number: string;
  } | null;
  estimator?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export function useAuthorisedQuotes() {
  const { organizationId } = useOrganization();

  return useQuery({
    queryKey: ["authorised-quotes", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quotations")
        .select(`
          id,
          quote_number,
          status,
          estimator_id,
          created_at,
          updated_at,
          customer_id,
          vehicle_id,
          case_id,
          total_amount,
          authorized,
          customer:customers(id, name, phone, email),
          vehicle:vehicles(id, make, model, registration, year)
        `)
        .eq("organization_id", organizationId!)
        .or("status.eq.approved,authorized.eq.true")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // Fetch estimator details separately for quotes with estimator_id
      const quotesWithEstimators = await Promise.all(
        (data || []).map(async (quote) => {
          if (quote.estimator_id) {
            const { data: estimatorData } = await supabase
              .from("profiles")
              .select("id, first_name, last_name, email")
              .eq("user_id", quote.estimator_id)
              .single();
            
            return { ...quote, estimator: estimatorData };
          }
          return { ...quote, estimator: null };
        })
      );

      return quotesWithEstimators as AuthorisedQuote[];
    },
    enabled: !!organizationId,
  });
}
