import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserTenant } from "./useUserTenant";
import { toast } from "sonner";

export interface JobBooking {
  id: string;
  tenant_id: string;
  case_id: string | null;
  job_id: string | null;
  bay_id: string | null;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  estimated_days: number;
  estimated_completion_date: string | null;
  actual_completion_date: string | null;
  booking_type: string;
  status: string;
  priority: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  case?: {
    id: string;
    case_number: string;
    vehicle?: {
      id: string;
      make: string | null;
      model: string | null;
      registration_number: string | null;
    } | null;
    customer?: {
      id: string;
      name: string;
      phone: string | null;
    } | null;
  } | null;
  bay?: {
    id: string;
    name: string;
    bay_type: string;
  } | null;
}

export function useJobBookings(startDate?: string, endDate?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["job-bookings", tenantId, startDate, endDate],
    queryFn: async () => {
      if (!tenantId) return [];

      let query = supabase
        .from("job_bookings")
        .select(`
          *,
          case:cases(
            id,
            case_number,
            vehicle:vehicles(id, make, model, registration_number),
            customer:customers(id, name, phone)
          ),
          bay:workshop_bays(id, name, bay_type)
        `)
        .eq("tenant_id", tenantId)
        .order("booking_date", { ascending: true });

      if (startDate) {
        query = query.gte("booking_date", startDate);
      }
      if (endDate) {
        query = query.lte("booking_date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as JobBooking[];
    },
    enabled: !!tenantId,
  });
}

export function useJobBookingsByBay(bayId?: string) {
  const { tenantId } = useUserTenant();

  return useQuery({
    queryKey: ["job-bookings-bay", tenantId, bayId],
    queryFn: async () => {
      if (!tenantId || !bayId) return [];

      const { data, error } = await supabase
        .from("job_bookings")
        .select(`
          *,
          case:cases(
            id,
            case_number,
            vehicle:vehicles(id, make, model, registration_number),
            customer:customers(id, name, phone)
          )
        `)
        .eq("tenant_id", tenantId)
        .eq("bay_id", bayId)
        .neq("status", "cancelled")
        .order("booking_date", { ascending: true });

      if (error) throw error;
      return data as unknown as JobBooking[];
    },
    enabled: !!tenantId && !!bayId,
  });
}

export function useCreateJobBooking() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();

  return useMutation({
    mutationFn: async (input: Omit<JobBooking, "id" | "tenant_id" | "created_at" | "updated_at">) => {
      if (!tenantId) throw new Error("No tenant ID");

      const { data, error } = await supabase
        .from("job_bookings")
        .insert({ ...input, tenant_id: tenantId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-bookings"] });
      toast.success("Booking created");
    },
    onError: (error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });
}

export function useUpdateJobBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobBooking> & { id: string }) => {
      const { data, error } = await supabase
        .from("job_bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-bookings"] });
      toast.success("Booking updated");
    },
    onError: (error) => {
      toast.error("Failed to update booking: " + error.message);
    },
  });
}

export function useDeleteJobBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-bookings"] });
      toast.success("Booking deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete booking: " + error.message);
    },
  });
}
