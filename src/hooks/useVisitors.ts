import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";
import { toast } from "@/hooks/use-toast";

export interface Visitor {
  id: string;
  tenant_id: string;
  visitor_number: string;
  first_name: string;
  last_name: string;
  id_passport: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  visit_category_id: string | null;
  visit_type: string;
  purpose_details: string | null;
  host_staff_id: string | null;
  host_staff_name: string | null;
  host_department: string | null;
  vehicle_registration: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  vehicle_color: string | null;
  vehicle_reason: string | null;
  signature_data: string | null;
  timestamp_in: string;
  timestamp_out: string | null;
  tablet_id: string | null;
  linked_case_id: string | null;
  linked_quotation_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface VisitCategory {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  requires_vehicle: boolean;
  requires_company: boolean;
  requires_host: boolean;
  dynamic_fields: unknown[] | null;
  display_order: number;
  is_active: boolean;
}

export type VisitorInsert = Omit<Visitor, "id" | "created_at" | "updated_at">;
export type VisitCategoryInsert = {
  name: string;
  description?: string | null;
  requires_vehicle?: boolean;
  requires_company?: boolean;
  requires_host?: boolean;
  display_order?: number;
};

export function useVisitors(dateRange?: { from: Date; to: Date }) {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: visitors = [], isLoading, error } = useQuery({
    queryKey: ["visitors", tenantId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("visitors")
        .select("*")
        .eq("tenant_id", tenantId!)
        .order("timestamp_in", { ascending: false });

      if (dateRange?.from) {
        query = query.gte("timestamp_in", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte("timestamp_in", dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Visitor[];
    },
    enabled: !!tenantId,
  });

  const signOutVisitor = useMutation({
    mutationFn: async (visitorId: string) => {
      const { error } = await supabase
        .from("visitors")
        .update({ timestamp_out: new Date().toISOString() })
        .eq("id", visitorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast({ title: "Visitor signed out successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const linkToCase = useMutation({
    mutationFn: async ({ visitorId, caseId }: { visitorId: string; caseId: string }) => {
      const { error } = await supabase
        .from("visitors")
        .update({ linked_case_id: caseId })
        .eq("id", visitorId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast({ title: "Visitor linked to case successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    visitors,
    isLoading,
    error,
    signOutVisitor,
    linkToCase,
  };
}

export function useVisitCategories() {
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["visit-categories", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visit_categories")
        .select("*")
        .eq("tenant_id", tenantId!)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      return data as VisitCategory[];
    },
    enabled: !!tenantId,
  });

  const createCategory = useMutation({
    mutationFn: async (category: VisitCategoryInsert) => {
      const { data, error } = await supabase
        .from("visit_categories")
        .insert({ 
          name: category.name,
          description: category.description,
          requires_vehicle: category.requires_vehicle,
          requires_company: category.requires_company,
          requires_host: category.requires_host,
          tenant_id: tenantId!
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-categories"] });
      toast({ title: "Category created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, description, requires_vehicle, requires_company, requires_host }: { id: string; name?: string; description?: string; requires_vehicle?: boolean; requires_company?: boolean; requires_host?: boolean }) => {
      const { error } = await supabase
        .from("visit_categories")
        .update({ name, description, requires_vehicle, requires_company, requires_host })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-categories"] });
      toast({ title: "Category updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("visit_categories")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
