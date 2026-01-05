import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface TowingInvoice {
  id: string;
  towing_record_id: string;
  tenant_id: string;
  invoice_file_url: string | null;
  branch_id: string | null;
  destination: string | null;
  vat_type: "vat" | "non_vat" | null;
  supplier_id: string | null;
  invoice_date: string | null;
  description: string | null;
  invoice_number: string | null;
  sub_total: number | null;
  vat_percentage: number | null;
  amount: number | null;
  created_at: string;
  updated_at: string;
  branch?: { name: string } | null;
  supplier?: { supplier_name: string } | null;
}

export function useTowingInvoices(towingRecordId: string | undefined) {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ["towing-invoices", towingRecordId],
    queryFn: async () => {
      if (!towingRecordId) return [];
      const { data, error } = await supabase
        .from("towing_invoices")
        .select(`
          *,
          branch:branches(name),
          supplier:suppliers(supplier_name)
        `)
        .eq("towing_record_id", towingRecordId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as TowingInvoice[];
    },
    enabled: !!towingRecordId && !!tenantId,
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: Partial<Omit<TowingInvoice, "id" | "created_at" | "updated_at" | "branch" | "supplier">>) => {
      if (!towingRecordId || !tenantId) throw new Error("Missing required IDs");
      
      const { data, error } = await supabase
        .from("towing_invoices")
        .insert({
          ...invoice,
          towing_record_id: towingRecordId,
          tenant_id: tenantId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-invoices", towingRecordId] });
      toast({ title: "Invoice created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating invoice", description: error.message, variant: "destructive" });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TowingInvoice> & { id: string }) => {
      const { data, error } = await supabase
        .from("towing_invoices")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-invoices", towingRecordId] });
      toast({ title: "Invoice updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating invoice", description: error.message, variant: "destructive" });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("towing_invoices")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-invoices", towingRecordId] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting invoice", description: error.message, variant: "destructive" });
    },
  });

  return {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
