import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface TowingDocument {
  id: string;
  towing_record_id: string;
  tenant_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export function useTowingDocuments(towingRecordId: string | undefined) {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ["towing-documents", towingRecordId],
    queryFn: async () => {
      if (!towingRecordId) return [];
      const { data, error } = await supabase
        .from("towing_documents")
        .select("*")
        .eq("towing_record_id", towingRecordId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as TowingDocument[];
    },
    enabled: !!towingRecordId && !!tenantId,
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!towingRecordId || !tenantId) throw new Error("Missing required IDs");

      const fileExt = file.name.split(".").pop();
      const filePath = `${tenantId}/${towingRecordId}/docs/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("towing")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("towing")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("towing_documents")
        .insert({
          towing_record_id: towingRecordId,
          tenant_id: tenantId,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-documents", towingRecordId] });
      toast({ title: "Document uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: "Error uploading document", description: error.message, variant: "destructive" });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("towing_documents")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-documents", towingRecordId] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting document", description: error.message, variant: "destructive" });
    },
  });

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
  };
}
