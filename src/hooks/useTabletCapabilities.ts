import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "./useUserTenant";
import { useToast } from "./use-toast";

export interface TabletCapability {
  id: string;
  tenant_id: string;
  tablet_id: string;
  capability_type: string;
  is_enabled: boolean;
  configuration: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TabletInstalledApp {
  id: string;
  tenant_id: string;
  tablet_id: string;
  app_name: string;
  app_description: string | null;
  app_version: string | null;
  is_active: boolean;
  installed_at: string;
  updated_at: string;
}

export const CAPABILITY_TYPES = [
  { id: "photo_capture", label: "Photo Capture", icon: "📷", description: "Take and upload photos" },
  { id: "checklist", label: "Checklists", icon: "✅", description: "Complete inspection checklists" },
  { id: "technician_workflow", label: "Technician Workflow", icon: "👨‍🔧", description: "Log work activities" },
  { id: "job_updates", label: "Job Updates", icon: "📋", description: "Update job status and notes" },
  { id: "parts_scanning", label: "Parts Scanning", icon: "📦", description: "Scan and track parts" },
  { id: "vehicle_inspection", label: "Vehicle Inspection", icon: "🔍", description: "Conduct vehicle inspections" },
  { id: "consumables_logging", label: "Consumables Logging", icon: "🛢️", description: "Log consumable usage" },
  { id: "time_tracking", label: "Time Tracking", icon: "⏱️", description: "Track work time" },
] as const;

export function useTabletCapabilities(tabletId?: string) {
  return useQuery({
    queryKey: ["tablet-capabilities", tabletId],
    queryFn: async () => {
      if (!tabletId) return [];
      const { data, error } = await supabase
        .from("tablet_capabilities")
        .select("*")
        .eq("tablet_id", tabletId);
      if (error) throw error;
      return data as TabletCapability[];
    },
    enabled: !!tabletId,
  });
}

export function useToggleTabletCapability() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tabletId, capabilityType, isEnabled }: { tabletId: string; capabilityType: string; isEnabled: boolean }) => {
      if (!tenantId) throw new Error("No tenant ID");

      // Check if capability exists
      const { data: existing } = await supabase
        .from("tablet_capabilities")
        .select("id")
        .eq("tablet_id", tabletId)
        .eq("capability_type", capabilityType)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("tablet_capabilities")
          .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("tablet_capabilities")
          .insert({ tenant_id: tenantId, tablet_id: tabletId, capability_type: capabilityType, is_enabled: isEnabled });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-capabilities"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating capability", description: error.message, variant: "destructive" });
    },
  });
}

export function useTabletInstalledApps(tabletId?: string) {
  return useQuery({
    queryKey: ["tablet-installed-apps", tabletId],
    queryFn: async () => {
      if (!tabletId) return [];
      const { data, error } = await supabase
        .from("tablet_installed_apps")
        .select("*")
        .eq("tablet_id", tabletId)
        .order("app_name");
      if (error) throw error;
      return data as TabletInstalledApp[];
    },
    enabled: !!tabletId,
  });
}

export function useAddTabletApp() {
  const queryClient = useQueryClient();
  const { tenantId } = useUserTenant();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tabletId, appName, appDescription, appVersion }: { tabletId: string; appName: string; appDescription?: string; appVersion?: string }) => {
      if (!tenantId) throw new Error("No tenant ID");
      const { error } = await supabase
        .from("tablet_installed_apps")
        .insert({ tenant_id: tenantId, tablet_id: tabletId, app_name: appName, app_description: appDescription, app_version: appVersion });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-installed-apps"] });
      toast({ title: "App added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error adding app", description: error.message, variant: "destructive" });
    },
  });
}

export function useRemoveTabletApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tablet_installed_apps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-installed-apps"] });
      toast({ title: "App removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Error removing app", description: error.message, variant: "destructive" });
    },
  });
}

export function useToggleTabletApp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("tablet_installed_apps")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tablet-installed-apps"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating app", description: error.message, variant: "destructive" });
    },
  });
}
