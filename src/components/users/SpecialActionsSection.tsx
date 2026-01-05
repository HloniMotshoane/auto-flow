import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface SpecialActionsState {
  [action: string]: boolean;
}

// Organized special actions by category
const SPECIAL_ACTION_CATEGORIES = [
  {
    category: "Workshop Operations",
    actions: [
      { action: "sign_final_costing", displayName: "Sign Final Costing" },
      { action: "pre_fuel", displayName: "Pre/Fuel" },
      { action: "authorize_car_repair", displayName: "Authorize Car Repair" },
      { action: "close_record", displayName: "Close Record" },
      { action: "release_vehicle", displayName: "Release Vehicle" },
      { action: "assign_technicians", displayName: "Assign Technicians" },
    ],
  },
  {
    category: "Quotations & Approvals",
    actions: [
      { action: "approve_quotation", displayName: "Approve Quotation" },
      { action: "create_revision", displayName: "Create Quote Revision" },
      { action: "override_pricing", displayName: "Override Pricing" },
    ],
  },
  {
    category: "Financial",
    actions: [
      { action: "authorize_payment", displayName: "Authorize Payment" },
      { action: "process_refund", displayName: "Process Refund" },
      { action: "view_financial_reports", displayName: "View Financial Reports" },
      { action: "manage_insurance_claims", displayName: "Manage Insurance Claims" },
    ],
  },
  {
    category: "Parts & Suppliers",
    actions: [
      { action: "manage_suppliers", displayName: "Manage Suppliers" },
      { action: "approve_parts_order", displayName: "Approve Parts Order" },
      { action: "manage_sla_rates", displayName: "Manage SLA Rates" },
    ],
  },
  {
    category: "System & Admin",
    actions: [
      { action: "auditless_report", displayName: "Auditless Report" },
      { action: "export_data", displayName: "Export Data" },
      { action: "manage_users", displayName: "Manage Users" },
      { action: "full_admin_access", displayName: "Full Admin Access" },
    ],
  },
];

// Flatten all actions for utility
const ALL_ACTIONS = SPECIAL_ACTION_CATEGORIES.flatMap((cat) => cat.actions);

interface SpecialActionsSectionProps {
  actions: SpecialActionsState;
  onChange: (actions: SpecialActionsState) => void;
}

export function SpecialActionsSection({ actions, onChange }: SpecialActionsSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    SPECIAL_ACTION_CATEGORIES.map((c) => c.category)
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleChange = (action: string, checked: boolean) => {
    const newActions = { ...actions, [action]: checked };
    
    // If full_admin_access is enabled, enable all other actions
    if (action === "full_admin_access" && checked) {
      ALL_ACTIONS.forEach(({ action: a }) => {
        newActions[a] = true;
      });
    }
    
    onChange(newActions);
  };

  const handleCategoryToggle = (category: typeof SPECIAL_ACTION_CATEGORIES[0], enable: boolean) => {
    const newActions = { ...actions };
    category.actions.forEach(({ action }) => {
      newActions[action] = enable;
    });
    onChange(newActions);
  };

  const enabledCount = ALL_ACTIONS.filter((a) => actions[a.action]).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Special Actions</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">
            {enabledCount}/{ALL_ACTIONS.length} enabled
          </span>
        </div>
        <CardDescription>
          Elevated permissions for sensitive operations. These actions are logged for auditing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {SPECIAL_ACTION_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.includes(category.category);
          const categoryEnabledCount = category.actions.filter(
            (a) => actions[a.action]
          ).length;
          const allEnabled = categoryEnabledCount === category.actions.length;

          return (
            <Collapsible
              key={category.category}
              open={isExpanded}
              onOpenChange={() => toggleCategory(category.category)}
            >
              <div className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer flex-1">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium text-sm">{category.category}</span>
                    <span className="text-xs text-muted-foreground">
                      ({categoryEnabledCount}/{category.actions.length})
                    </span>
                  </div>
                </CollapsibleTrigger>
                <Checkbox
                  checked={allEnabled}
                  onCheckedChange={(checked) => handleCategoryToggle(category, !!checked)}
                  className="mr-2"
                />
              </div>
              <CollapsibleContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 pt-2 pl-6">
                  {category.actions.map(({ action, displayName }) => (
                    <div
                      key={action}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        actions[action] ? "bg-primary/5 border-primary/20" : "bg-muted/30"
                      )}
                    >
                      <Checkbox
                        id={action}
                        checked={actions[action] ?? false}
                        onCheckedChange={(checked) => handleChange(action, !!checked)}
                      />
                      <Label
                        htmlFor={action}
                        className={cn(
                          "text-sm font-medium cursor-pointer",
                          action === "full_admin_access" && "text-destructive"
                        )}
                      >
                        {displayName}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
