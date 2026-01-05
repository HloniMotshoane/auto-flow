import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserTenant } from './useUserTenant';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface WorkSummaryItem {
  segment_name: string;
  duration_minutes: number;
  technician_name?: string;
}

export interface PartsSummaryItem {
  part_description: string;
  quantity: number;
  cost: number;
  supplier_name?: string;
}

export interface ConsumablesSummaryItem {
  consumable_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface ReleaseReport {
  id: string;
  tenant_id: string;
  case_id: string | null;
  job_id: string | null;
  report_number: string;
  payment_verified: boolean;
  payment_id: string | null;
  work_summary: WorkSummaryItem[];
  parts_summary: PartsSummaryItem[];
  consumables_summary: ConsumablesSummaryItem[];
  total_labour_cost: number;
  total_parts_cost: number;
  total_amount: number;
  amount_paid: number;
  outstanding_balance: number;
  generated_by: string | null;
  generated_at: string;
  released_by: string | null;
  released_at: string | null;
  customer_signature: string | null;
  status: 'pending' | 'ready' | 'released' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to convert Json to typed array
function parseJsonArray<T>(json: Json | null): T[] {
  if (!json || !Array.isArray(json)) return [];
  return json as unknown as T[];
}

export function useReleaseReports() {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: releaseReports = [], isLoading, error } = useQuery({
    queryKey: ['release_reports', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('release_reports')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to properly type the JSON fields
      return (data || []).map(report => ({
        ...report,
        work_summary: parseJsonArray<WorkSummaryItem>(report.work_summary),
        parts_summary: parseJsonArray<PartsSummaryItem>(report.parts_summary),
        consumables_summary: parseJsonArray<ConsumablesSummaryItem>(report.consumables_summary),
      })) as ReleaseReport[];
    },
    enabled: !!tenantId,
  });

  const createReleaseReport = useMutation({
    mutationFn: async (report: Omit<ReleaseReport, 'id' | 'created_at' | 'updated_at' | 'tenant_id' | 'report_number' | 'generated_at'>) => {
      if (!tenantId) throw new Error('No tenant ID');

      // Generate report number
      const { data: reportNumber } = await supabase.rpc('generate_release_report_number', { p_tenant_id: tenantId });

      const { data, error } = await supabase
        .from('release_reports')
        .insert({
          case_id: report.case_id,
          job_id: report.job_id,
          payment_verified: report.payment_verified,
          payment_id: report.payment_id,
          work_summary: report.work_summary as unknown as Json,
          parts_summary: report.parts_summary as unknown as Json,
          consumables_summary: report.consumables_summary as unknown as Json,
          total_labour_cost: report.total_labour_cost,
          total_parts_cost: report.total_parts_cost,
          total_amount: report.total_amount,
          amount_paid: report.amount_paid,
          outstanding_balance: report.outstanding_balance,
          generated_by: report.generated_by,
          released_by: report.released_by,
          released_at: report.released_at,
          customer_signature: report.customer_signature,
          status: report.status,
          notes: report.notes,
          tenant_id: tenantId,
          report_number: reportNumber,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release_reports'] });
      toast.success('Release report generated successfully');
    },
    onError: (error) => {
      toast.error('Failed to generate release report: ' + error.message);
    },
  });

  const updateReleaseReport = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ReleaseReport> & { id: string }) => {
      // Convert typed arrays back to Json for database update
      const dbUpdates: Record<string, unknown> = {};
      
      if (updates.work_summary !== undefined) {
        dbUpdates.work_summary = updates.work_summary as unknown as Json;
      }
      if (updates.parts_summary !== undefined) {
        dbUpdates.parts_summary = updates.parts_summary as unknown as Json;
      }
      if (updates.consumables_summary !== undefined) {
        dbUpdates.consumables_summary = updates.consumables_summary as unknown as Json;
      }
      
      // Copy other fields
      const otherFields = ['case_id', 'job_id', 'payment_verified', 'payment_id', 
        'total_labour_cost', 'total_parts_cost', 'total_amount', 'amount_paid',
        'outstanding_balance', 'generated_by', 'released_by', 'released_at',
        'customer_signature', 'status', 'notes'] as const;
      
      for (const field of otherFields) {
        if (updates[field] !== undefined) {
          dbUpdates[field] = updates[field];
        }
      }

      const { data, error } = await supabase
        .from('release_reports')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release_reports'] });
      toast.success('Release report updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update release report: ' + error.message);
    },
  });

  const releaseVehicle = useMutation({
    mutationFn: async ({ id, released_by, customer_signature }: { id: string; released_by: string; customer_signature?: string }) => {
      const { data, error } = await supabase
        .from('release_reports')
        .update({
          status: 'released',
          released_by,
          released_at: new Date().toISOString(),
          customer_signature,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['release_reports'] });
      toast.success('Vehicle released successfully');
    },
    onError: (error) => {
      toast.error('Failed to release vehicle: ' + error.message);
    },
  });

  return {
    releaseReports,
    isLoading,
    error,
    createReleaseReport,
    updateReleaseReport,
    releaseVehicle,
  };
}
