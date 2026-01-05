import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserTenant } from './useUserTenant';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  tenant_id: string;
  source: string | null;
  lead_type: 'client' | 'assessor' | 'insurance' | 'fleet' | 'partner' | 'other';
  company_name: string | null;
  contact_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost';
  assigned_to: string | null;
  converted_to_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!tenantId,
  });

  const createLead = useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
      if (!tenantId) throw new Error('No tenant ID');

      const { data, error } = await supabase
        .from('leads')
        .insert({
          ...lead,
          tenant_id: tenantId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create lead: ' + error.message);
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update lead: ' + error.message);
    },
  });

  const deleteLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete lead: ' + error.message);
    },
  });

  const convertToCustomer = useMutation({
    mutationFn: async ({ leadId, customerId }: { leadId: string; customerId: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_to_customer_id: customerId,
        })
        .eq('id', leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead converted to customer successfully');
    },
    onError: (error) => {
      toast.error('Failed to convert lead: ' + error.message);
    },
  });

  return {
    leads,
    isLoading,
    error,
    createLead,
    updateLead,
    deleteLead,
    convertToCustomer,
  };
}
