import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPermissionCard } from "./DashboardPermissionCard";
import { 
  Search, 
  ChevronDown, 
  ChevronRight,
  LayoutDashboard,
  Wrench,
  Package,
  Car,
  Shield,
  Settings,
  Cog
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface PermissionState {
  [module: string]: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
  };
}

// System modules organized by category matching the actual sidebar navigation
const MODULE_CATEGORIES = [
  {
    category: "Main",
    icon: LayoutDashboard,
    modules: [
      { module: "dashboard", displayName: "Dashboard" },
      { module: "jobs", displayName: "Jobs Management" },
      { module: "workshop", displayName: "Workshop" },
      { module: "scheduling", displayName: "Scheduling" },
      { module: "payments", displayName: "Payments" },
      { module: "release_reports", displayName: "Release Reports" },
      { module: "marketing", displayName: "Marketing & Leads" },
    ],
  },
  {
    category: "Operations",
    icon: Wrench,
    modules: [
      { module: "vehicle_intake", displayName: "Vehicle Intake" },
      { module: "intakes", displayName: "Intakes" },
      { module: "towing", displayName: "Towing" },
      { module: "visit_requests", displayName: "Visit Requests" },
      { module: "quotations", displayName: "Quotations" },
      { module: "estimators", displayName: "Estimators" },
      { module: "customers", displayName: "Customers" },
    ],
  },
  {
    category: "Parts & Inventory",
    icon: Package,
    modules: [
      { module: "parts_costing", displayName: "Parts Costing" },
      { module: "parts_catalogue", displayName: "Parts Catalogue" },
      { module: "suppliers", displayName: "Suppliers" },
      { module: "consumables", displayName: "Consumables" },
    ],
  },
  {
    category: "Vehicles",
    icon: Car,
    modules: [
      { module: "vehicles", displayName: "Vehicles" },
      { module: "car_makes", displayName: "Car Makes & Models" },
    ],
  },
  {
    category: "Insurance & Compliance",
    icon: Shield,
    modules: [
      { module: "work_providers", displayName: "Work Providers (SLA)" },
      { module: "assessors", displayName: "Assessors" },
      { module: "claims", displayName: "Claims" },
      { module: "oem_approvals", displayName: "OEM Approvals" },
    ],
  },
  {
    category: "System",
    icon: Settings,
    modules: [
      { module: "email", displayName: "Email" },
      { module: "reports", displayName: "Reports" },
      { module: "profitability", displayName: "Profitability Reports" },
      { module: "settings", displayName: "Settings" },
      { module: "user_management", displayName: "User Management" },
    ],
  },
  {
    category: "Workshop Settings",
    icon: Cog,
    modules: [
      { module: "team_management", displayName: "My Team" },
      { module: "workflow_stages", displayName: "Workflow Stages" },
      { module: "workshop_segments", displayName: "Workshop Segments" },
      { module: "qc_management", displayName: "QC Checklists" },
      { module: "tablets_devices", displayName: "Tablets & Devices" },
      { module: "technician_tablet", displayName: "Technician Tablet" },
    ],
  },
];

// Flatten all modules for utility functions
const ALL_MODULES = MODULE_CATEGORIES.flatMap((cat) => cat.modules);

// Role templates with predefined permissions
const ROLE_TEMPLATES = {
  technician: {
    name: "Technician",
    description: "Workshop floor access only",
    modules: ["workshop", "technician_tablet", "consumables"],
  },
  estimator: {
    name: "Estimator",
    description: "Quotations and customer management",
    modules: ["quotations", "customers", "vehicle_intake", "vehicles", "parts_catalogue"],
  },
  parts_manager: {
    name: "Parts Manager",
    description: "Full parts and inventory access",
    modules: ["parts_costing", "parts_catalogue", "suppliers", "consumables"],
  },
  workshop_manager: {
    name: "Workshop Manager",
    description: "Workshop operations and team management",
    modules: ["workshop", "jobs", "scheduling", "team_management", "workflow_stages", "workshop_segments", "qc_management", "tablets_devices", "technician_tablet", "consumables", "parts_costing"],
  },
  receptionist: {
    name: "Receptionist",
    description: "Front desk operations",
    modules: ["customers", "payments", "intakes", "visit_requests", "vehicle_intake", "towing", "scheduling"],
  },
  finance: {
    name: "Finance",
    description: "Financial and reporting access",
    modules: ["payments", "claims", "reports", "release_reports", "profitability"],
  },
  admin: {
    name: "Admin",
    description: "Full system access",
    modules: ALL_MODULES.map((m) => m.module),
  },
};

interface PermissionMatrixProps {
  permissions: PermissionState;
  onChange: (permissions: PermissionState) => void;
}

export function PermissionMatrix({ permissions, onChange }: PermissionMatrixProps) {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    MODULE_CATEGORIES.map((c) => c.category)
  );

  const filteredCategories = useMemo(() => {
    if (!search) return MODULE_CATEGORIES;
    return MODULE_CATEGORIES.map((cat) => ({
      ...cat,
      modules: cat.modules.filter((m) =>
        m.displayName.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((cat) => cat.modules.length > 0);
  }, [search]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handlePreset = (preset: "none" | "view_only" | "creator" | "editor") => {
    const newPermissions: PermissionState = {};
    ALL_MODULES.forEach(({ module }) => {
      switch (preset) {
        case "none":
          newPermissions[module] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
          break;
        case "view_only":
          newPermissions[module] = { can_view: true, can_create: false, can_edit: false, can_delete: false };
          break;
        case "creator":
          newPermissions[module] = { can_view: true, can_create: true, can_edit: false, can_delete: false };
          break;
        case "editor":
          newPermissions[module] = { can_view: true, can_create: true, can_edit: true, can_delete: false };
          break;
      }
    });
    onChange(newPermissions);
  };

  const handleRoleTemplate = (roleKey: keyof typeof ROLE_TEMPLATES) => {
    const template = ROLE_TEMPLATES[roleKey];
    const newPermissions: PermissionState = {};
    
    ALL_MODULES.forEach(({ module }) => {
      if (template.modules.includes(module)) {
        newPermissions[module] = { can_view: true, can_create: true, can_edit: true, can_delete: roleKey === "admin" };
      } else {
        newPermissions[module] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
      }
    });
    onChange(newPermissions);
  };

  const handleBulkToggle = (field: "can_view" | "can_create" | "can_edit" | "can_delete") => {
    const allChecked = ALL_MODULES.every((m) => permissions[m.module]?.[field]);
    const newPermissions = { ...permissions };
    ALL_MODULES.forEach(({ module }) => {
      if (!newPermissions[module]) {
        newPermissions[module] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
      }
      newPermissions[module][field] = !allChecked;
      if (field !== "can_view" && !allChecked) {
        newPermissions[module].can_view = true;
      }
    });
    onChange(newPermissions);
  };

  const handleModuleChange = (
    module: string,
    field: "can_view" | "can_create" | "can_edit" | "can_delete",
    value: boolean
  ) => {
    const newPermissions = { ...permissions };
    if (!newPermissions[module]) {
      newPermissions[module] = { can_view: false, can_create: false, can_edit: false, can_delete: false };
    }
    newPermissions[module][field] = value;
    onChange(newPermissions);
  };

  return (
    <div className="space-y-4">
      {/* Role Templates */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Quick Role Templates</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => handleRoleTemplate(key as keyof typeof ROLE_TEMPLATES)}
              className="text-xs"
              title={template.description}
            >
              {template.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Preset buttons */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Permission Presets</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => handlePreset("none")}>
            None
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handlePreset("view_only")}>
            View Only
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handlePreset("creator")}>
            View + Create
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handlePreset("editor")}>
            View + Create + Edit
          </Button>
        </div>
      </div>

      {/* Bulk toggles */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Bulk Toggle</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleBulkToggle("can_view")}>
            All View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleBulkToggle("can_create")}>
            All Create
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleBulkToggle("can_edit")}>
            All Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleBulkToggle("can_delete")}>
            All Delete
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grouped Permission cards */}
      <div className="space-y-3">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategories.includes(category.category);
          const enabledCount = category.modules.filter(
            (m) => permissions[m.module]?.can_view
          ).length;

          return (
            <Collapsible
              key={category.category}
              open={isExpanded}
              onOpenChange={() => toggleCategory(category.category)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {enabledCount}/{category.modules.length} enabled
                  </span>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-3 pl-6">
                  {category.modules.map(({ module, displayName }) => (
                    <DashboardPermissionCard
                      key={module}
                      module={module}
                      displayName={displayName}
                      canView={permissions[module]?.can_view ?? false}
                      canCreate={permissions[module]?.can_create ?? false}
                      canEdit={permissions[module]?.can_edit ?? false}
                      canDelete={permissions[module]?.can_delete ?? false}
                      onChange={(field, value) => handleModuleChange(module, field, value)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
