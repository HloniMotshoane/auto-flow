import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserTenant } from './useUserTenant';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  tenant_id: string;
  job_id: string | null;
  case_id: string | null;
  customer_id: string | null;
  amount: number;
  payment_method: 'card' | 'eft' | 'cash' | 'cheque';
  payment_date: string;
  reference_number: string | null;
  receipt_number: string | null;
  received_by: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayments() {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!tenantId,
  });

  const createPayment = useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
      if (!tenantId) throw new Error('No tenant ID');

      // Generate receipt number
      const { data: receiptData } = await supabase.rpc('generate_receipt_number', { p_tenant_id: tenantId });

      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          tenant_id: tenantId,
          receipt_number: receiptData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record payment: ' + error.message);
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Payment> & { id: string }) => {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update payment: ' + error.message);
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Payment deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete payment: ' + error.message);
    },
  });

  return {
    payments,
    isLoading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
  };
}
