import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "@/hooks/use-toast";

export interface TowingImage {
  id: string;
  towing_record_id: string;
  tenant_id: string;
  image_type: "car_license" | "client_image" | "tow_slip" | "security_photo" | "tow_image";
  file_name: string;
  image_url: string;
  created_at: string;
}

export function useTowingImages(towingRecordId: string | undefined) {
  const { tenantId } = useUserTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: images, isLoading, error } = useQuery({
    queryKey: ["towing-images", towingRecordId],
    queryFn: async () => {
      if (!towingRecordId) return [];
      const { data, error } = await supabase
        .from("towing_images")
        .select("*")
        .eq("towing_record_id", towingRecordId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as TowingImage[];
    },
    enabled: !!towingRecordId && !!tenantId,
  });

  const uploadImage = useMutation({
    mutationFn: async ({ file, imageType }: { file: File; imageType: TowingImage["image_type"] }) => {
      if (!towingRecordId || !tenantId) throw new Error("Missing required IDs");

      const fileExt = file.name.split(".").pop();
      const filePath = `${tenantId}/${towingRecordId}/${imageType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("towing")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("towing")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("towing_images")
        .insert({
          towing_record_id: towingRecordId,
          tenant_id: tenantId,
          image_type: imageType,
          file_name: file.name,
          image_url: publicUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-images", towingRecordId] });
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error) => {
      toast({ title: "Error uploading image", description: error.message, variant: "destructive" });
    },
  });

  const deleteImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("towing_images")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["towing-images", towingRecordId] });
      toast({ title: "Image deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting image", description: error.message, variant: "destructive" });
    },
  });

  return {
    images,
    isLoading,
    error,
    uploadImage,
    deleteImage,
  };
}
