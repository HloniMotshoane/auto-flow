import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { toast } from "@/hooks/use-toast";

export interface SupplierResponse {
  id: string;
  costing_request_id: string;
  quoted_price: number;
  availability: string | null;
  delivery_eta_days: number | null;
  notes: string | null;
  attachments: string[];
  responded_at: string | null;
  created_at: string;
  // Joined data
  costing_request?: {
    supplier_id: string;
    part_description: string | null;
    case_id: string;
    supplier?: { supplier_name: string } | null;
  } | null;
}

export type SupplierResponseInsert = {
  costing_request_id: string;
  quoted_price: number;
  availability?: string | null;
  delivery_eta_days?: number | null;
  notes?: string | null;
  attachments?: string[];
};

export type SupplierResponseUpdate = Partial<Omit<SupplierResponse, "id" | "costing_request_id" | "created_at" | "costing_request">>;

export function useSupplierResponses(costingRequestId?: string) {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: responses = [], isLoading, error } = useQuery({
    queryKey: ["supplier-responses", tenantId, costingRequestId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("supplier_responses")
        .select(`
          *,
          costing_request:parts_costing_requests(
            supplier_id,
            part_description,
            case_id,
            supplier:suppliers(supplier_name)
          )
        `)
        .order("responded_at", { ascending: false });
      
      if (costingRequestId) {
        query = query.eq("costing_request_id", costingRequestId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SupplierResponse[];
    },
    enabled: !!tenantId,
  });

  const createResponse = useMutation({
    mutationFn: async (response: SupplierResponseInsert) => {
      const { data, error } = await supabase
        .from("supplier_responses")
        .insert({
          ...response,
          attachments: response.attachments || [],
          responded_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the costing request status to "received"
      await supabase
        .from("parts_costing_requests")
        .update({ status: "received" })
        .eq("id", response.costing_request_id);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-responses", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["parts-costing", tenantId] });
      toast({ title: "Success", description: "Supplier response recorded" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateResponse = useMutation({
    mutationFn: async ({ id, ...updates }: SupplierResponseUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("supplier_responses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-responses", tenantId] });
      toast({ title: "Success", description: "Response updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Get best quote for a part (lowest price with stock)
  const getBestQuote = (requestId: string) => {
    const requestResponses = responses.filter(r => r.costing_request_id === requestId);
    const inStockResponses = requestResponses.filter(r => r.availability === "in_stock");
    
    if (inStockResponses.length > 0) {
      return inStockResponses.reduce((best, current) => 
        current.quoted_price < best.quoted_price ? current : best
      );
    }
    
    if (requestResponses.length > 0) {
      return requestResponses.reduce((best, current) => 
        current.quoted_price < best.quoted_price ? current : best
      );
    }
    
    return null;
  };

  return {
    responses,
    isLoading,
    error,
    createResponse,
    updateResponse,
    getBestQuote,
  };
}
