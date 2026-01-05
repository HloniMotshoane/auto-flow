import { 
  LayoutDashboard, 
  FileText, 
  ClipboardList, 
  Users, 
  Car, 
  Building2, 
  Shield, 
  Mail, 
  BarChart3, 
  Settings,
  ChevronDown,
  Award,
  Wrench,
  Building,
  Camera,
  Inbox,
  UserCheck,
  Factory,
  Package,
  Layers,
  Tablet,
  Users2,
  Truck,
  DollarSign,
  Monitor,
  UserPlus,
  Cog,
  CreditCard,
  Megaphone,
  CalendarDays,
  TrendingUp,
  ClipboardCheck
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useTenantAdmin } from "@/hooks/useTenantAdmin";
import { useHasPermission } from "@/hooks/useCurrentUserPermissions";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Jobs", url: "/jobs", icon: ClipboardList },
  { title: "Workshop", url: "/workshop", icon: Factory },
  { title: "Scheduling", url: "/scheduling", icon: CalendarDays },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Release Reports", url: "/release-reports", icon: FileText },
  { title: "Marketing & Leads", url: "/marketing", icon: Megaphone },
];

const operationsNavItems: NavItem[] = [
  { title: "Vehicle Intake", url: "/intake", icon: Camera },
  { title: "Intakes (Photos)", url: "/intakes", icon: Inbox },
  { title: "Towing", url: "/towing", icon: Truck },
  { title: "Visit Requests", url: "/visit-requests", icon: UserCheck },
  { title: "Quotations", url: "/quotations", icon: FileText },
  { title: "Estimators", url: "/estimators", icon: Users2 },
  { title: "Customers", url: "/customers", icon: Users },
];

const partsNavItems: NavItem[] = [
  { title: "Parts Costing", url: "/parts/costing", icon: Package },
  { title: "Parts Catalogue", url: "/settings/parts-catalogue", icon: Layers },
  { title: "Suppliers", url: "/settings/suppliers", icon: Truck },
  { title: "Consumables", url: "/consumables", icon: Cog },
];

const vehicleNavItems: NavItem[] = [
  { title: "Vehicles", url: "/vehicles", icon: Car },
  { title: "Car Makes", url: "/car-makes", icon: Wrench },
];

const insuranceNavItems: NavItem[] = [
  { title: "Work Providers (SLA & Insurance)", url: "/insurance", icon: Building2 },
  { title: "Assessors", url: "/assessors", icon: UserCheck },
  { title: "Claims", url: "/claims", icon: Shield },
  { title: "OEM Approvals", url: "/oem-approvals", icon: Award },
];

const systemNavItems: NavItem[] = [
  { title: "Email", url: "/email", icon: Mail },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Profitability", url: "/reports/profitability", icon: TrendingUp },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "User Management", url: "/users", icon: UserPlus },
];

const workshopSettingsNavItems: NavItem[] = [
  { title: "My Team", url: "/settings/team", icon: Users2 },
  { title: "Workshop Segments", url: "/settings/workshop-segments", icon: Layers },
  { title: "QC Checklists", url: "/settings/qc-checklists", icon: ClipboardCheck },
  { title: "Tablets & Devices", url: "/settings/tablets", icon: Monitor },
  { title: "Technician Tablet", url: "/workshop/tablet", icon: Tablet },
];

const superAdminOnlyNavItems: NavItem[] = [
  { title: "Tenants", url: "/tenants", icon: Building },
];

const adminNavItems: NavItem[] = [
  { title: "Users", url: "/users", icon: Users },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const { isSuperAdmin } = useSuperAdmin();
  const { data: isTenantAdmin } = useTenantAdmin();
  const { hasViewPermission, permissions, isLoading: isLoadingPermissions } = useHasPermission();
  
  const hasAdminAccess = isSuperAdmin || isTenantAdmin;
  
  // Check if user has any permissions set (if none, show everything)
  const hasPermissionsConfigured = permissions && permissions.length > 0;

  // Filter nav items based on permissions
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    // Super admins and tenant admins see everything
    if (isSuperAdmin || isTenantAdmin) return items;
    
    // If no permissions configured or still loading, show all
    if (!hasPermissionsConfigured || isLoadingPermissions) return items;
    
    // Filter based on can_view permission
    return items.filter(item => hasViewPermission(item.url));
  };

  // Memoize filtered items to prevent unnecessary recalculations
  const filteredMainNav = useMemo(() => filterNavItems(mainNavItems), [permissions, isSuperAdmin, isTenantAdmin]);
  const filteredOperationsNav = useMemo(() => filterNavItems(operationsNavItems), [permissions, isSuperAdmin, isTenantAdmin]);
  const filteredPartsNav = useMemo(() => filterNavItems(partsNavItems), [permissions, isSuperAdmin, isTenantAdmin]);
  const filteredVehicleNav = useMemo(() => filterNavItems(vehicleNavItems), [permissions, isSuperAdmin, isTenantAdmin]);
  const filteredInsuranceNav = useMemo(() => filterNavItems(insuranceNavItems), [permissions, isSuperAdmin, isTenantAdmin]);
  const filteredSystemNav = useMemo(() => filterNavItems(systemNavItems), [permissions, isSuperAdmin, isTenantAdmin]);
  const filteredWorkshopSettingsNav = useMemo(() => filterNavItems(workshopSettingsNavItems), [permissions, isSuperAdmin, isTenantAdmin]);

  const [operationsOpen, setOperationsOpen] = useState(
    operationsNavItems.some(item => currentPath === item.url)
  );
  const [partsOpen, setPartsOpen] = useState(
    partsNavItems.some(item => currentPath === item.url)
  );
  const [vehiclesOpen, setVehiclesOpen] = useState(
    vehicleNavItems.some(item => currentPath === item.url)
  );
  const [insuranceOpen, setInsuranceOpen] = useState(
    insuranceNavItems.some(item => currentPath === item.url)
  );

  const isActive = (path: string) => currentPath === path;

  const NavItem = ({ item }: { item: NavItem }) => (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={item.url} 
          end 
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive(item.url) && "bg-sidebar-accent text-sidebar-primary font-medium"
          )}
          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Car className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sidebar-foreground">AIS</span>
              <span className="text-xs text-sidebar-foreground/60">Panel Shop Manager</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        {filteredMainNav.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
                Main
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMainNav.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Operations Section */}
        {filteredOperationsNav.length > 0 && (
          <SidebarGroup>
            {!collapsed ? (
              <Collapsible open={operationsOpen} onOpenChange={setOperationsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors">
                  <span>Operations</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    operationsOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      {filteredOperationsNav.map((item) => (
                        <NavItem key={item.title} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredOperationsNav.map((item) => (
                    <NavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Parts & Inventory Section */}
        {filteredPartsNav.length > 0 && (
          <SidebarGroup>
            {!collapsed ? (
              <Collapsible open={partsOpen} onOpenChange={setPartsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors">
                  <span>Parts & Inventory</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    partsOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      {filteredPartsNav.map((item) => (
                        <NavItem key={item.title} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredPartsNav.map((item) => (
                    <NavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Vehicles Section */}
        {filteredVehicleNav.length > 0 && (
          <SidebarGroup>
            {!collapsed ? (
              <Collapsible open={vehiclesOpen} onOpenChange={setVehiclesOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors">
                  <span>Vehicles</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    vehiclesOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      {filteredVehicleNav.map((item) => (
                        <NavItem key={item.title} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredVehicleNav.map((item) => (
                    <NavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* Insurance Section */}
        {filteredInsuranceNav.length > 0 && (
          <SidebarGroup>
            {!collapsed ? (
              <Collapsible open={insuranceOpen} onOpenChange={setInsuranceOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors">
                  <span>Insurance & Claims</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    insuranceOpen && "rotate-180"
                  )} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu className="mt-1">
                      {filteredInsuranceNav.map((item) => (
                        <NavItem key={item.title} item={item} />
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredInsuranceNav.map((item) => (
                    <NavItem key={item.title} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        )}

        {/* System Section */}
        {filteredSystemNav.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
                System
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystemNav.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Workshop Settings Section */}
        {hasAdminAccess && filteredWorkshopSettingsNav.length > 0 && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
                Workshop Settings
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredWorkshopSettingsNav.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Admin Section - Users (for tenant admins and super admins) */}
        {hasAdminAccess && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
                Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Super Admin Section - Tenants only */}
        {isSuperAdmin && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
                Super Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminOnlyNavItems.map((item) => (
                  <NavItem key={item.title} item={item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && (
          <div className="text-xs text-sidebar-foreground/50 text-center">
            AIS v1.0 • Phase 1
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}