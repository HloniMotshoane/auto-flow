import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface PartsOrder {
  id: string;
  tenant_id: string;
  case_id: string;
  supplier_id: string;
  supplier_part_id: string | null;
  costing_request_id: string | null;
  part_required_id: string | null;
  part_description: string;
  quantity: number;
  ordered_date: string;
  expected_delivery_date: string | null;
  delivered_date: string | null;
  fitted_date: string | null;
  fitted_by: string | null;
  status: string;
  order_reference: string | null;
  invoice_number: string | null;
  cost_quoted: number | null;
  cost_actual: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: {
    id: string;
    supplier_name: string;
  } | null;
  case?: {
    id: string;
    case_number: string;
  } | null;
}

export interface PartsOrderInsert {
  tenant_id: string;
  case_id: string;
  supplier_id: string;
  part_description: string;
  quantity?: number;
  expected_delivery_date?: string | null;
  cost_quoted?: number | null;
  order_reference?: string | null;
  costing_request_id?: string | null;
  part_required_id?: string | null;
  supplier_part_id?: string | null;
  notes?: string | null;
}

export interface PartsOrderUpdate {
  status?: string;
  delivered_date?: string | null;
  fitted_date?: string | null;
  fitted_by?: string | null;
  cost_actual?: number | null;
  invoice_number?: string | null;
  notes?: string | null;
}

export function usePartsOrders(caseId?: string) {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["parts-orders", tenantId, caseId],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("parts_orders")
        .select(`
          *,
          supplier:suppliers(id, supplier_name),
          case:cases(id, case_number)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (caseId) {
        query = query.eq("case_id", caseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PartsOrder[];
    },
    enabled: !!tenantId,
  });

  const createOrder = useMutation({
    mutationFn: async (order: PartsOrderInsert) => {
      const { data, error } = await supabase
        .from("parts_orders")
        .insert(order)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-orders"] });
      toast({ title: "Order created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating order", description: error.message, variant: "destructive" });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async ({ id, ...updates }: PartsOrderUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("parts_orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-orders"] });
      toast({ title: "Order updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating order", description: error.message, variant: "destructive" });
    },
  });

  const markDelivered = useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from("parts_orders")
        .update({
          status: "delivered",
          delivered_date: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-orders"] });
      toast({ title: "Part marked as delivered" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const markFitted = useMutation({
    mutationFn: async ({ orderId, fittedBy }: { orderId: string; fittedBy: string }) => {
      const { data, error } = await supabase
        .from("parts_orders")
        .update({
          status: "fitted",
          fitted_date: new Date().toISOString(),
          fitted_by: fittedBy,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-orders"] });
      toast({ title: "Part marked as fitted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("parts_orders")
        .delete()
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts-orders"] });
      toast({ title: "Order deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Analytics helpers
  const ordersByStatus = (status: string) => orders.filter(o => o.status === status);
  const pendingOrders = ordersByStatus("ordered");
  const deliveredOrders = ordersByStatus("delivered");
  const fittedOrders = ordersByStatus("fitted");

  return {
    orders,
    isLoading,
    error,
    createOrder,
    updateOrder,
    markDelivered,
    markFitted,
    deleteOrder,
    pendingOrders,
    deliveredOrders,
    fittedOrders,
  };
}
