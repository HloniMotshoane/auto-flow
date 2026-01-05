import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface CustomerNotification {
  id: string;
  tenant_id: string;
  case_id: string | null;
  customer_id: string | null;
  notification_type: string;
  channel: string;
  subject: string | null;
  message: string;
  status: string;
  sent_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export function useCustomerNotifications(caseId?: string) {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ["customer-notifications", tenantId, caseId],
    queryFn: async () => {
      let query = supabase
        .from("customer_notifications")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("created_at", { ascending: false });

      if (caseId) {
        query = query.eq("case_id", caseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CustomerNotification[];
    },
    enabled: !!tenantId,
  });

  const createNotification = useMutation({
    mutationFn: async (notification: { case_id?: string; customer_id?: string; notification_type: string; channel: string; subject?: string; message: string; status?: string }) => {
      const { data, error } = await supabase
        .from("customer_notifications")
        .insert([{ ...notification, tenant_id: tenantId! }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-notifications"] });
      toast({ title: "Notification created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error creating notification", description: error.message, variant: "destructive" });
    },
  });

  const sendNotification = useMutation({
    mutationFn: async ({ notificationId, caseId }: { notificationId?: string; caseId: string }) => {
      const { data, error } = await supabase.functions.invoke("send-customer-notification", {
        body: { notificationId, caseId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-notifications"] });
      toast({ title: "Notification sent successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error sending notification", description: error.message, variant: "destructive" });
    },
  });

  return {
    notifications: notifications || [],
    isLoading,
    error,
    createNotification,
    sendNotification,
  };
}
