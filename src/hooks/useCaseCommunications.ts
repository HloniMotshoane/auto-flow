import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface CaseCommunication {
  id: string;
  case_id: string;
  channel: string;
  direction: string;
  from_address: string | null;
  to_address: string | null;
  subject: string | null;
  body: string | null;
  attachments: Json;
  sent_by_user_id: string | null;
  created_at: string;
}

export type CaseCommunicationInsert = Omit<CaseCommunication, "id" | "created_at">;

export function useCaseCommunications(caseId?: string) {
  const queryClient = useQueryClient();

  const { data: communications = [], isLoading, error } = useQuery({
    queryKey: ["case-communications", caseId],
    queryFn: async () => {
      if (!caseId) return [];
      
      const { data, error } = await supabase
        .from("case_communications")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as CaseCommunication[];
    },
    enabled: !!caseId,
  });

  const createCommunication = useMutation({
    mutationFn: async (comm: CaseCommunicationInsert) => {
      const { data, error } = await supabase
        .from("case_communications")
        .insert(comm)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-communications", caseId] });
      toast({ title: "Success", description: "Communication logged successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    communications,
    isLoading,
    error,
    createCommunication,
    inboundComms: communications.filter(c => c.direction === "inbound"),
    outboundComms: communications.filter(c => c.direction === "outbound"),
  };
}
