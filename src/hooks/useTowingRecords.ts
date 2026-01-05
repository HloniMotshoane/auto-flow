import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface TowingRecord {
  id: string;
  tenant_id: string;
  reference_number: string;
  tow_type: "upliftment" | "tow_in" | "accident";
  status: "pending" | "in_progress" | "completed" | "written_off";
  client_first_name: string | null;
  client_last_name: string | null;
  client_phone: string | null;
  client_email: string | null;
  client_type: "individual" | "corporate" | null;
  client_id_number: string | null;
  registration_number: string | null;
  vin: string | null;
  make: string | null;
  model: string | null;
  odometer: string | null;
  engine_size: string | null;
  tow_company_id: string | null;
  insurance_company_id: string | null;
  storage_days: number | null;
  admin_days: number | null;
  security_days: number | null;
  car_rate: number | null;
  truck_rate: number | null;
  security_rate: number | null;
  admin_rate: number | null;
  towing_fee: number | null;
  release_fee: number | null;
  discount_percentage: number | null;
  payment_status: "paid" | "unpaid" | "partial" | null;
  payment_method: string | null;
  invoice_comments: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: { supplier_name: string } | null;
  insurance_company?: { name: string } | null;
}

export type TowingRecordInsert = Omit<TowingRecord, "id" | "created_at" | "updated_at" | "supplier" | "insurance_company">;

export function useTowingRecords() {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records, isLoading, error } = useQuery({
    queryKey: ["towing-records", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("towing_records")
        .select(`
          *,
          supplier:suppliers(supplier_name),
          insurance_company:insurance_companies(name)
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as TowingRecord[];
    },
    enabled: !!tenantId,
  });

  const createRecord = useMutation({
    mutationFn: async (record: Partial<TowingRecordInsert>) => {
      if (!tenantId) throw new Error("No tenant ID");
      
      // Generate reference number
      const { data: refData } = await supabase.rpc("generate_towing_reference", {
        p_tenant_id: tenantId,
      });
      
      const { data, error } = await supabase
        .from("towing_records")
        .insert({
          tenant_id: tenantId,
          reference_number: refData || `TOW${Date.now()}`,
          tow_type: record.tow_type || "upliftment",
          client_first_name: record.client_first_name,
          client_last_name: record.client_last_name,
          client_phone: record.client_phone,
          client_email: record.client_email,
          client_type: record.client_type,
          client_id_number: record.client_id_number,
          registration_number: record.registration_number,
          vin: record.vin,
          make: record.make,
          model: record.model,
          odometer: record.odometer,
          engine_size: record.engine_size,
          tow_company_id: record.tow_company_id,
          insurance_company_id: record.insurance_company_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-records"] });
      toast({ title: "Tow record created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating tow record", description: error.message, variant: "destructive" });
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TowingRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from("towing_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-records"] });
      toast({ title: "Tow record updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating tow record", description: error.message, variant: "destructive" });
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("towing_records")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-records"] });
      toast({ title: "Tow record deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting tow record", description: error.message, variant: "destructive" });
    },
  });

  const stats = {
    all: records?.length || 0,
    pending: records?.filter((r) => r.status === "pending").length || 0,
    in_progress: records?.filter((r) => r.status === "in_progress").length || 0,
    completed: records?.filter((r) => r.status === "completed").length || 0,
    written_off: records?.filter((r) => r.status === "written_off").length || 0,
  };

  return {
    records,
    isLoading,
    error,
    stats,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}

export function useTowingRecord(id: string | undefined) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["towing-record", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("towing_records")
        .select(`
          *,
          supplier:suppliers(id, supplier_name),
          insurance_company:insurance_companies(id, name)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as unknown as TowingRecord;
    },
    enabled: !!id && !!tenantId,
  });
}
