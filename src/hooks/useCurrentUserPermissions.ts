import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPermission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

// Map sidebar URLs to permission module names
export const URL_TO_MODULE_MAP: Record<string, string> = {
  // Main
  "/": "dashboard",
  "/jobs": "jobs",
  "/workshop": "workshop",
  "/scheduling": "scheduling",
  "/payments": "payments",
  "/release-reports": "release_reports",
  "/marketing": "marketing",
  // Operations
  "/intake": "vehicle_intake",
  "/intakes": "intakes",
  "/towing": "towing",
  "/visit-requests": "visit_requests",
  "/quotations": "quotations",
  "/estimators": "estimators",
  "/customers": "customers",
  // Parts & Inventory
  "/parts/costing": "parts_costing",
  "/settings/parts-catalogue": "parts_catalogue",
  "/settings/suppliers": "suppliers",
  "/consumables": "consumables",
  // Vehicles
  "/vehicles": "vehicles",
  "/car-makes": "car_makes",
  // Insurance & Compliance
  "/insurance": "work_providers",
  "/assessors": "assessors",
  "/claims": "claims",
  "/oem-approvals": "oem_approvals",
  // System
  "/email": "email",
  "/reports": "reports",
  "/reports/profitability": "profitability",
  "/settings": "settings",
  "/users": "user_management",
  // Workshop Settings
  "/settings/team": "team_management",
  "/settings/workshop-segments": "workshop_segments",
  "/settings/qc-checklists": "qc_management",
  "/settings/tablets": "tablets_devices",
  "/workshop/tablet": "technician_tablet",
};

export function useCurrentUserPermissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["current-user-permissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("permissions")
        .select("module, can_view, can_create, can_edit, can_delete")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as UserPermission[];
    },
    enabled: !!user?.id,
  });
}

export function useHasPermission() {
  const { data: permissions, isLoading } = useCurrentUserPermissions();

  const hasViewPermission = (url: string): boolean => {
    // If permissions are still loading, show all (will re-render when loaded)
    if (isLoading || !permissions) return true;

    // If no permissions set at all, allow everything (likely admin/super admin)
    if (permissions.length === 0) return true;

    const module = URL_TO_MODULE_MAP[url];
    if (!module) return true; // Unknown routes are accessible

    const permission = permissions.find((p) => p.module === module);
    return permission?.can_view ?? false;
  };

  const hasModulePermission = (
    module: string,
    action: "can_view" | "can_create" | "can_edit" | "can_delete"
  ): boolean => {
    if (isLoading || !permissions) return true;
    if (permissions.length === 0) return true;

    const permission = permissions.find((p) => p.module === module);
    return permission?.[action] ?? false;
  };

  return {
    permissions,
    isLoading,
    hasViewPermission,
    hasModulePermission,
  };
}