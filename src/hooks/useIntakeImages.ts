import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface IntakeImage {
  id: string;
  intake_id: string;
  image_url: string;
  image_type: string | null;
  is_plate_image: boolean | null;
  sequence_number: number;
  created_at: string;
}

export function useIntakeImages(intakeId?: string) {
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ["intake-images", intakeId],
    queryFn: async () => {
      if (!intakeId) return [];
      
      const { data, error } = await supabase
        .from("intake_images")
        .select("*")
        .eq("intake_id", intakeId)
        .order("sequence_number");
      
      if (error) throw error;
      return data as IntakeImage[];
    },
    enabled: !!intakeId,
  });

  return {
    images,
    isLoading,
    error,
    plateImages: images.filter(img => img.is_plate_image),
    damageImages: images.filter(img => !img.is_plate_image),
  };
}
