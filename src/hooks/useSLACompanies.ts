import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

export interface SLACompany {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  telephone: string | null;
  cellphone: string | null;
  street: string | null;
  suburb: string | null;
  city: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface SLAHeader {
  id: string;
  company_id: string;
  tenant_id: string;
  effective_from: string;
  effective_to: string | null;
  province: string | null;
  city: string | null;
  metadata: Json | null;
  is_active: boolean | null;
}

export interface SLALabour {
  kind_tags: string[];
  warranty_rate: number;
  non_warranty_rate: number;
}

export interface SLAPaint {
  kind_tags: string[];
  warranty_per_panel: number;
  non_warranty_per_panel: number;
  blending: number;
  small_panel_paint: number;
  small_repair_paint: number;
  water_based: number;
  pearlescent_normal: number;
  pearlescent_3_stage: number;
}

export interface SLAParts {
  parts_type: string;
  new_oem_percent: number;
  alt_from_manufacturer_percent: number;
  alt_non_manufacturer_percent: number;
  used_percent: number;
  aftermarket_percent: number;
  new_oem_in_stock_factor: number;
  used_oem_in_stock_factor: number;
  alternative_in_stock_factor: number;
}

export interface SLATowing {
  towing_type: string;
  storage_per_day: number;
  first_km_free: number;
  per_km_thereafter: number;
}

export interface SLAOutwork {
  outwork_type: string;
  wheel_alignment_percent: number;
  air_con_percent: number;
  diagnostics_percent: number;
  warranty_checks_percent: number;
  courier_fees_percent: number;
  electrical_percent: number;
  mechanical_percent: number;
  mechanical_reports_percent: number;
  jig_hire_percent: number;
  upholstery_percent: number;
  cooling_systems_percent: number;
  railvan_repair_percent: number;
  on_off_bench_setup_minutes: number;
  on_off_jig_setup_minutes: number;
  floor_anchorage_minutes: number;
  windscreen_replacement_percent: number;
}

export interface SLASundries {
  sundries_type: string;
  parts_percent: number;
  cap_amount: number | null;
}

export interface SLAFullData {
  company: {
    tenant_id: string;
    name: string;
    email: string | null;
    telephone: string | null;
    cellphone: string | null;
    street: string | null;
    suburb: string | null;
    city: string | null;
    is_active: boolean | null;
  };
  header: {
    tenant_id: string;
    effective_from: string;
    effective_to: string | null;
    province: string | null;
    city: string | null;
    metadata: Json | null;
    is_active: boolean | null;
  };
  labour: SLALabour;
  paint: SLAPaint;
  parts: SLAParts;
  towing: SLATowing;
  outwork: SLAOutwork;
  sundries: SLASundries;
}

export function useSLACompanies(tenantId?: string) {
  return useQuery({
    queryKey: ["sla-companies", tenantId],
    queryFn: async () => {
      let query = supabase.from("sla_companies").select("*").order("name");
      if (tenantId) query = query.eq("tenant_id", tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useSLACompany(id: string) {
  return useQuery({
    queryKey: ["sla-company", id],
    queryFn: async () => {
      const { data: company, error: companyError } = await supabase
        .from("sla_companies").select("*").eq("id", id).single();
      if (companyError) throw companyError;
      
      const { data: headers } = await supabase.from("sla_headers").select("*").eq("company_id", id).limit(1);
      const header = headers?.[0];
      if (!header) return { company, header: null, labour: null, paint: null, parts: null, towing: null, outwork: null, sundries: null };
      
      const [labourRes, paintRes, partsRes, towingRes, outworkRes, sundriesRes] = await Promise.all([
        supabase.from("sla_labour").select("*").eq("sla_header_id", header.id).maybeSingle(),
        supabase.from("sla_paint").select("*").eq("sla_header_id", header.id).maybeSingle(),
        supabase.from("sla_parts").select("*").eq("sla_header_id", header.id).maybeSingle(),
        supabase.from("sla_towing").select("*").eq("sla_header_id", header.id).maybeSingle(),
        supabase.from("sla_outwork").select("*").eq("sla_header_id", header.id).maybeSingle(),
        supabase.from("sla_sundries").select("*").eq("sla_header_id", header.id).maybeSingle(),
      ]);
      
      return { company, header, labour: labourRes.data, paint: paintRes.data, parts: partsRes.data, towing: towingRes.data, outwork: outworkRes.data, sundries: sundriesRes.data };
    },
    enabled: !!id,
  });
}

export function useCreateSLACompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SLAFullData) => {
      const { data: company, error: companyError } = await supabase
        .from("sla_companies").insert({ tenant_id: data.company.tenant_id, name: data.company.name, email: data.company.email, telephone: data.company.telephone, cellphone: data.company.cellphone, street: data.company.street, suburb: data.company.suburb, city: data.company.city, is_active: data.company.is_active }).select().single();
      if (companyError) throw companyError;
      
      const { data: header, error: headerError } = await supabase
        .from("sla_headers").insert({ company_id: company.id, tenant_id: data.header.tenant_id, effective_from: data.header.effective_from, effective_to: data.header.effective_to, province: data.header.province, city: data.header.city, metadata: data.header.metadata, is_active: data.header.is_active }).select().single();
      if (headerError) throw headerError;
      
      const tenant_id = data.company.tenant_id;
      const sla_header_id = header.id;
      
      await Promise.all([
        supabase.from("sla_labour").insert({ sla_header_id, tenant_id, kind_tags: data.labour.kind_tags, warranty_rate: data.labour.warranty_rate, non_warranty_rate: data.labour.non_warranty_rate }),
        supabase.from("sla_paint").insert({ sla_header_id, tenant_id, kind_tags: data.paint.kind_tags, warranty_per_panel: data.paint.warranty_per_panel, non_warranty_per_panel: data.paint.non_warranty_per_panel, blending: data.paint.blending, small_panel_paint: data.paint.small_panel_paint, small_repair_paint: data.paint.small_repair_paint, water_based: data.paint.water_based, pearlescent_normal: data.paint.pearlescent_normal, pearlescent_3_stage: data.paint.pearlescent_3_stage }),
        supabase.from("sla_parts").insert({ sla_header_id, tenant_id, parts_type: data.parts.parts_type, new_oem_percent: data.parts.new_oem_percent, alt_from_manufacturer_percent: data.parts.alt_from_manufacturer_percent, alt_non_manufacturer_percent: data.parts.alt_non_manufacturer_percent, used_percent: data.parts.used_percent, aftermarket_percent: data.parts.aftermarket_percent, new_oem_in_stock_factor: data.parts.new_oem_in_stock_factor, used_oem_in_stock_factor: data.parts.used_oem_in_stock_factor, alternative_in_stock_factor: data.parts.alternative_in_stock_factor }),
        supabase.from("sla_towing").insert({ sla_header_id, tenant_id, towing_type: data.towing.towing_type, storage_per_day: data.towing.storage_per_day, first_km_free: data.towing.first_km_free, per_km_thereafter: data.towing.per_km_thereafter }),
        supabase.from("sla_outwork").insert({ sla_header_id, tenant_id, ...data.outwork }),
        supabase.from("sla_sundries").insert({ sla_header_id, tenant_id, sundries_type: data.sundries.sundries_type, parts_percent: data.sundries.parts_percent, cap_amount: data.sundries.cap_amount }),
      ]);
      return company;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sla-companies"] }); toast.success("SLA Company created"); },
    onError: () => { toast.error("Failed to create SLA company"); },
  });
}

export function useUpdateSLACompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SLAFullData }) => {
      await supabase.from("sla_companies").update({ name: data.company.name, email: data.company.email, telephone: data.company.telephone, cellphone: data.company.cellphone, street: data.company.street, suburb: data.company.suburb, city: data.company.city, is_active: data.company.is_active }).eq("id", id);
      
      const { data: existingHeaders } = await supabase.from("sla_headers").select("id").eq("company_id", id).limit(1);
      let headerId = existingHeaders?.[0]?.id;
      
      if (headerId) {
        await supabase.from("sla_headers").update({ effective_from: data.header.effective_from, effective_to: data.header.effective_to, province: data.header.province, city: data.header.city, metadata: data.header.metadata, is_active: data.header.is_active }).eq("id", headerId);
        await Promise.all([
          supabase.from("sla_labour").delete().eq("sla_header_id", headerId),
          supabase.from("sla_paint").delete().eq("sla_header_id", headerId),
          supabase.from("sla_parts").delete().eq("sla_header_id", headerId),
          supabase.from("sla_towing").delete().eq("sla_header_id", headerId),
          supabase.from("sla_outwork").delete().eq("sla_header_id", headerId),
          supabase.from("sla_sundries").delete().eq("sla_header_id", headerId),
        ]);
      } else {
        const { data: header } = await supabase.from("sla_headers").insert({ company_id: id, tenant_id: data.header.tenant_id, effective_from: data.header.effective_from, effective_to: data.header.effective_to, province: data.header.province, city: data.header.city, metadata: data.header.metadata, is_active: data.header.is_active }).select().single();
        headerId = header?.id;
      }
      
      if (headerId) {
        const tenant_id = data.company.tenant_id;
        await Promise.all([
          supabase.from("sla_labour").insert({ sla_header_id: headerId, tenant_id, kind_tags: data.labour.kind_tags, warranty_rate: data.labour.warranty_rate, non_warranty_rate: data.labour.non_warranty_rate }),
          supabase.from("sla_paint").insert({ sla_header_id: headerId, tenant_id, kind_tags: data.paint.kind_tags, warranty_per_panel: data.paint.warranty_per_panel, non_warranty_per_panel: data.paint.non_warranty_per_panel, blending: data.paint.blending, small_panel_paint: data.paint.small_panel_paint, small_repair_paint: data.paint.small_repair_paint, water_based: data.paint.water_based, pearlescent_normal: data.paint.pearlescent_normal, pearlescent_3_stage: data.paint.pearlescent_3_stage }),
          supabase.from("sla_parts").insert({ sla_header_id: headerId, tenant_id, parts_type: data.parts.parts_type, new_oem_percent: data.parts.new_oem_percent, alt_from_manufacturer_percent: data.parts.alt_from_manufacturer_percent, alt_non_manufacturer_percent: data.parts.alt_non_manufacturer_percent, used_percent: data.parts.used_percent, aftermarket_percent: data.parts.aftermarket_percent, new_oem_in_stock_factor: data.parts.new_oem_in_stock_factor, used_oem_in_stock_factor: data.parts.used_oem_in_stock_factor, alternative_in_stock_factor: data.parts.alternative_in_stock_factor }),
          supabase.from("sla_towing").insert({ sla_header_id: headerId, tenant_id, towing_type: data.towing.towing_type, storage_per_day: data.towing.storage_per_day, first_km_free: data.towing.first_km_free, per_km_thereafter: data.towing.per_km_thereafter }),
          supabase.from("sla_outwork").insert({ sla_header_id: headerId, tenant_id, ...data.outwork }),
          supabase.from("sla_sundries").insert({ sla_header_id: headerId, tenant_id, sundries_type: data.sundries.sundries_type, parts_percent: data.sundries.parts_percent, cap_amount: data.sundries.cap_amount }),
        ]);
      }
      return { id };
    },
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ["sla-companies"] }); queryClient.invalidateQueries({ queryKey: ["sla-company", variables.id] }); toast.success("SLA Company updated"); },
    onError: () => { toast.error("Failed to update SLA company"); },
  });
}

export function useDeleteSLACompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("sla_companies").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sla-companies"] }); toast.success("SLA Company deleted"); },
    onError: () => { toast.error("Failed to delete SLA company"); },
  });
}
