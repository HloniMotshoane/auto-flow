import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface PartsCostingRequest {
  id: string;
  tenant_id: string;
  case_id: string;
  part_required_id: string | null;
  supplier_id: string;
  supplier_part_id: string | null;
  part_description: string | null;
  quantity: number | null;
  requested_by: string;
  status: string | null;
  sent_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  supplier?: { supplier_name: string; email: string | null } | null;
  supplier_part?: { part_name: string; part_number: string | null; list_price: number | null } | null;
  case?: { case_number: string; vehicle_id: string | null } | null;
  responses?: SupplierResponse[];
}

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
}

export type CostingRequestInsert = {
  case_id: string;
  part_required_id?: string | null;
  supplier_id: string;
  supplier_part_id?: string | null;
  part_description?: string | null;
  quantity?: number;
  notes?: string | null;
};

export type CostingRequestUpdate = Partial<Omit<PartsCostingRequest, "id" | "tenant_id" | "case_id" | "requested_by" | "created_at" | "updated_at" | "supplier" | "supplier_part" | "case" | "responses">>;

export function usePartsCosting(caseId?: string) {
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: costingRequests = [], isLoading, error } = useQuery({
    queryKey: ["parts-costing", tenantId, caseId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      let query = supabase
        .from("parts_costing_requests")
        .select(`
          *,
          supplier:suppliers(supplier_name, email),
          supplier_part:supplier_parts(part_name, part_number, list_price),
          case:cases(case_number, vehicle_id),
          responses:supplier_responses(*)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (caseId) {
        query = query.eq("case_id", caseId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PartsCostingRequest[];
    },
    enabled: !!tenantId,
  });

  const createCostingRequest = useMutation({
    mutationFn: async (request: CostingRequestInsert) => {
      if (!tenantId || !user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("parts_costing_requests")
        .insert({
          ...request,
          tenant_id: tenantId,
          requested_by: user.id,
          quantity: request.quantity || 1,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-costing", tenantId] });
      toast({ title: "Success", description: "Costing request created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCostingRequest = useMutation({
    mutationFn: async ({ id, ...updates }: CostingRequestUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("parts_costing_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-costing", tenantId] });
      toast({ title: "Success", description: "Costing request updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCostingRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("parts_costing_requests")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-costing", tenantId] });
      toast({ title: "Success", description: "Costing request deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Send costing request to multiple suppliers at once
  const sendToMultipleSuppliers = useMutation({
    mutationFn: async (requests: CostingRequestInsert[]) => {
      if (!tenantId || !user?.id) throw new Error("Not authenticated");
      
      const insertData = requests.map(r => ({
        ...r,
        tenant_id: tenantId,
        requested_by: user.id,
        quantity: r.quantity || 1,
        status: "sent",
        sent_at: new Date().toISOString(),
      }));
      
      const { data, error } = await supabase
        .from("parts_costing_requests")
        .insert(insertData)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-costing", tenantId] });
      toast({ title: "Success", description: "Costing requests sent to suppliers" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    costingRequests,
    isLoading,
    error,
    createCostingRequest,
    updateCostingRequest,
    deleteCostingRequest,
    sendToMultipleSuppliers,
    pendingRequests: costingRequests.filter(r => r.status === "pending" || r.status === "sent"),
    byStatus: (status: string) => costingRequests.filter(r => r.status === status),
  };
}
