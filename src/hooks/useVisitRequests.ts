import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VisitRequest {
  id: string;
  tenant_id: string;
  request_number: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  id_number: string | null;
  request_type: string;
  vehicle_registration: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_year: string | null;
  vehicle_color: string | null;
  damage_description: string | null;
  preferred_date: string | null;
  preferred_time_slot: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  handled_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VisitRequestInsert {
  tenant_id: string;
  request_number: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
  id_number?: string | null;
  request_type: string;
  vehicle_registration?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: string | null;
  vehicle_color?: string | null;
  damage_description?: string | null;
  preferred_date?: string | null;
  preferred_time_slot?: string | null;
  message?: string | null;
}

export const useVisitRequests = (statusFilter?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['visit-requests', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('visit_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VisitRequest[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { error } = await supabase
        .from('visit_requests')
        .update({ status, admin_notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-requests'] });
      toast({ title: 'Request updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating request', description: error.message, variant: 'destructive' });
    },
  });

  const deleteRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('visit_requests')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-requests'] });
      toast({ title: 'Request deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting request', description: error.message, variant: 'destructive' });
    },
  });

  return {
    requests,
    isLoading,
    error,
    updateStatus,
    deleteRequest,
  };
};

export const useCreateVisitRequest = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: VisitRequestInsert) => {
      const { data: result, error } = await supabase
        .from('visit_requests')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as VisitRequest;
    },
    onError: (error) => {
      toast({ title: 'Error submitting request', description: error.message, variant: 'destructive' });
    },
  });
};
