import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePendingIntakes = () => {
  return useQuery({
    queryKey: ["pending-intakes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_intakes")
        .select(`
          id,
          intake_number,
          plate_number,
          vehicle_make_detected,
          vehicle_model_detected,
          created_at,
          intake_images (
            id,
            image_url,
            image_type,
            sequence_number
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
