import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useTenants } from "@/hooks/useTenants";
import { useSLACompany, useCreateSLACompany, useUpdateSLACompany } from "@/hooks/useSLACompanies";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Json } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SLACompanySection } from "@/components/sla/SLACompanySection";
import { SLABasicsSection } from "@/components/sla/SLABasicsSection";
import { SLALabourSection } from "@/components/sla/SLALabourSection";
import { SLAPaintSection } from "@/components/sla/SLAPaintSection";
import { SLAPartsSection } from "@/components/sla/SLAPartsSection";
import { SLATowingSection } from "@/components/sla/SLATowingSection";
import { SLAOutworkSection } from "@/components/sla/SLAOutworkSection";
import { SLASundriesSection } from "@/components/sla/SLASundriesSection";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  company: { tenant_id: string; name: string; email: string | null; telephone: string | null; cellphone: string | null; street: string | null; suburb: string | null; city: string | null; is_active: boolean | null; };
  header: { tenant_id: string; effective_from: string; effective_to: string | null; province: string | null; city: string | null; metadata: Json | null; is_active: boolean | null; };
  labour: { kind_tags: string[]; warranty_rate: number; non_warranty_rate: number; rate_type?: "time" | "rand"; };
  paint: { kind_tags: string[]; warranty_per_panel: number; non_warranty_per_panel: number; blending: number; small_panel_paint: number; small_repair_paint: number; water_based: number; pearlescent_normal: number; pearlescent_3_stage: number; rate_type?: "time" | "rand"; };
  parts: { parts_type: string; new_oem_percent: number; alt_from_manufacturer_percent: number; alt_non_manufacturer_percent: number; used_percent: number; aftermarket_percent: number; new_oem_in_stock_factor: number; used_oem_in_stock_factor: number; alternative_in_stock_factor: number; };
  towing: { towing_type: string; storage_per_day: number; first_km_free: number; per_km_thereafter: number; };
  outwork: { outwork_type: string; wheel_alignment_percent: number; air_con_percent: number; diagnostics_percent: number; warranty_checks_percent: number; courier_fees_percent: number; electrical_percent: number; mechanical_percent: number; mechanical_reports_percent: number; jig_hire_percent: number; upholstery_percent: number; cooling_systems_percent: number; railvan_repair_percent: number; on_off_bench_setup_minutes: number; on_off_jig_setup_minutes: number; floor_anchorage_minutes: number; windscreen_replacement_percent: number; };
  sundries: { sundries_type: string; parts_percent: number; cap_amount: number | null; };
}

const defaultFormData: FormData = {
  company: { tenant_id: "", name: "", email: "", telephone: "", cellphone: "", street: "", suburb: "", city: "", is_active: true },
  header: { tenant_id: "", effective_from: new Date().toISOString().split("T")[0], effective_to: null, province: "", city: "", metadata: {}, is_active: true },
  labour: { kind_tags: [], warranty_rate: 0, non_warranty_rate: 0, rate_type: "rand" },
  paint: { kind_tags: [], warranty_per_panel: 0, non_warranty_per_panel: 0, blending: 0, small_panel_paint: 0, small_repair_paint: 0, water_based: 0, pearlescent_normal: 0, pearlescent_3_stage: 0, rate_type: "rand" },
  parts: { parts_type: "type_1_simple", new_oem_percent: 0, alt_from_manufacturer_percent: 0, alt_non_manufacturer_percent: 0, used_percent: 0, aftermarket_percent: 0, new_oem_in_stock_factor: 0, used_oem_in_stock_factor: 0, alternative_in_stock_factor: 0 },
  towing: { towing_type: "type_1_simple", storage_per_day: 0, first_km_free: 0, per_km_thereafter: 0 },
  outwork: { outwork_type: "rule_based_caps", wheel_alignment_percent: 0, air_con_percent: 0, diagnostics_percent: 0, warranty_checks_percent: 0, courier_fees_percent: 0, electrical_percent: 0, mechanical_percent: 0, mechanical_reports_percent: 0, jig_hire_percent: 0, upholstery_percent: 0, cooling_systems_percent: 0, railvan_repair_percent: 0, on_off_bench_setup_minutes: 0, on_off_jig_setup_minutes: 0, floor_anchorage_minutes: 0, windscreen_replacement_percent: 0 },
  sundries: { sundries_type: "type_1_percent_with_cap", parts_percent: 0, cap_amount: null },
};

export default function SLACompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const { isSuperAdmin, isLoading: isLoadingSuperAdmin } = useSuperAdmin();
  const { tenantId: userTenantId, isLoading: isLoadingUserTenant } = useUserTenant();
  const { data: tenants, isLoading: isLoadingTenants } = useTenants();
  const { data: existingData, isLoading: isLoadingExisting } = useSLACompany(id ?? "");
  
  const createCompany = useCreateSLACompany();
  const updateCompany = useUpdateSLACompany();
  
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [activeTab, setActiveTab] = useState("company");

  // Auto-set tenant_id for non-super-admin users
  useEffect(() => {
    if (!isEditing && userTenantId && !isSuperAdmin) {
      setFormData((prev) => ({
        ...prev,
        company: { ...prev.company, tenant_id: userTenantId },
        header: { ...prev.header, tenant_id: userTenantId },
      }));
    }
  }, [userTenantId, isSuperAdmin, isEditing]);

  useEffect(() => {
    if (existingData?.company) {
      setFormData({
        company: {
          tenant_id: existingData.company.tenant_id,
          name: existingData.company.name,
          email: existingData.company.email ?? "",
          telephone: existingData.company.telephone ?? "",
          cellphone: existingData.company.cellphone ?? "",
          street: existingData.company.street ?? "",
          suburb: existingData.company.suburb ?? "",
          city: existingData.company.city ?? "",
          is_active: existingData.company.is_active ?? true,
        },
        header: {
          tenant_id: existingData.header?.tenant_id ?? existingData.company.tenant_id,
          effective_from: existingData.header?.effective_from ?? new Date().toISOString().split("T")[0],
          effective_to: existingData.header?.effective_to ?? null,
          province: existingData.header?.province ?? "",
          city: existingData.header?.city ?? "",
          metadata: existingData.header?.metadata ?? {},
          is_active: existingData.header?.is_active ?? true,
        },
        labour: existingData.labour ?? defaultFormData.labour,
        paint: existingData.paint ?? defaultFormData.paint,
        parts: existingData.parts ?? defaultFormData.parts,
        towing: existingData.towing ?? defaultFormData.towing,
        outwork: existingData.outwork ?? defaultFormData.outwork,
        sundries: existingData.sundries ?? defaultFormData.sundries,
      });
    }
  }, [existingData]);

  if (isLoadingSuperAdmin || isLoadingUserTenant || isLoadingTenants || (isEditing && isLoadingExisting)) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!formData.company.name) {
      toast.error("Company name is required");
      return;
    }
    if (!formData.company.tenant_id) {
      toast.error("Tenant is required");
      return;
    }
    if (!formData.header.effective_from) {
      toast.error("Effective from date is required");
      return;
    }

    try {
      if (isEditing) {
        await updateCompany.mutateAsync({ id, data: formData });
      } else {
        await createCompany.mutateAsync(formData);
      }
      navigate("/sla-companies");
    } catch (error) {
      console.error("Error saving SLA company:", error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/sla-companies")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? "Edit SLA Company" : "Add SLA Company"}</h1>
            <p className="text-muted-foreground">{isEditing ? "Update the SLA agreement details" : "Configure a new SLA agreement"}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={createCompany.isPending || updateCompany.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {createCompany.isPending || updateCompany.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Tenant Selection - Only show for super admins creating new SLAs */}
      {!isEditing && isSuperAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="tenant">Select Tenant *</Label>
              <Select
                value={formData.company.tenant_id}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    company: { ...formData.company, tenant_id: value },
                    header: { ...formData.header, tenant_id: value },
                  });
                }}
              >
                <SelectTrigger id="tenant">
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants?.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.company_name} - {tenant.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={scrollToSection} className="sticky top-0 z-10 bg-background py-2">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="sla-basics">SLA Basics</TabsTrigger>
          <TabsTrigger value="labour">Labour</TabsTrigger>
          <TabsTrigger value="paint">Paint</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="towing">Tow & Storage</TabsTrigger>
          <TabsTrigger value="outwork">Outwork</TabsTrigger>
          <TabsTrigger value="sundries">Sundries</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Form Sections */}
      <div className="space-y-6">
        <SLACompanySection
          data={{ name: formData.company.name, email: formData.company.email ?? "", telephone: formData.company.telephone ?? "", cellphone: formData.company.cellphone ?? "", street: formData.company.street ?? "", suburb: formData.company.suburb ?? "", city: formData.company.city ?? "", is_active: formData.company.is_active ?? true }}
          onChange={(data) => setFormData({ ...formData, company: { ...formData.company, ...data } })}
        />
        <SLABasicsSection
          data={{ effective_from: formData.header.effective_from, effective_to: formData.header.effective_to ?? "", province: formData.header.province ?? "", city: formData.header.city ?? "" }}
          onChange={(data) => setFormData({ ...formData, header: { ...formData.header, ...data } })}
        />
        <SLALabourSection data={formData.labour} onChange={(data) => setFormData({ ...formData, labour: data })} />
        <SLAPaintSection data={formData.paint} onChange={(data) => setFormData({ ...formData, paint: data })} />
        <SLAPartsSection data={formData.parts} onChange={(data) => setFormData({ ...formData, parts: data })} />
        <SLATowingSection data={formData.towing} onChange={(data) => setFormData({ ...formData, towing: data })} />
        <SLAOutworkSection data={formData.outwork} onChange={(data) => setFormData({ ...formData, outwork: data })} />
        <SLASundriesSection data={formData.sundries} onChange={(data) => setFormData({ ...formData, sundries: data })} />
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={createCompany.isPending || updateCompany.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {createCompany.isPending || updateCompany.isPending ? "Saving..." : "Save SLA Company"}
        </Button>
      </div>
    </div>
  );
}
