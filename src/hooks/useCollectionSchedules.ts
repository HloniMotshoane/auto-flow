import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface CollectionSchedule {
  id: string;
  tenant_id: string;
  case_id: string;
  customer_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  notes: string | null;
  status: string;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  case?: {
    case_number: string;
    vehicle?: {
      registration: string;
      make: string;
      model: string;
    } | null;
  } | null;
  customer?: {
    name: string;
    phone: string;
    email: string;
  } | null;
}

export function useCollectionSchedules(date?: string) {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedules, isLoading, error } = useQuery({
    queryKey: ["collection-schedules", tenantId, date],
    queryFn: async () => {
      let query = supabase
        .from("collection_schedules")
        .select(`
          *,
          case:cases(case_number, vehicle:vehicles(registration, make, model)),
          customer:customers(name, phone, email)
        `)
        .eq("tenant_id", tenantId!)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (date) {
        query = query.eq("scheduled_date", date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as CollectionSchedule[];
    },
    enabled: !!tenantId,
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: Omit<CollectionSchedule, "id" | "created_at" | "updated_at" | "tenant_id" | "case" | "customer">) => {
      const { data, error } = await supabase
        .from("collection_schedules")
        .insert({ ...schedule, tenant_id: tenantId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-schedules"] });
      toast({ title: "Collection scheduled successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error scheduling collection", description: error.message, variant: "destructive" });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CollectionSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from("collection_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-schedules"] });
      toast({ title: "Schedule updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating schedule", description: error.message, variant: "destructive" });
    },
  });

  const confirmSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("collection_schedules")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-schedules"] });
      toast({ title: "Collection confirmed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error confirming collection", description: error.message, variant: "destructive" });
    },
  });

  const completeSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("collection_schedules")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-schedules"] });
      toast({ title: "Collection completed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error completing collection", description: error.message, variant: "destructive" });
    },
  });

  return {
    schedules: schedules || [],
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    confirmSchedule,
    completeSchedule,
  };
}
