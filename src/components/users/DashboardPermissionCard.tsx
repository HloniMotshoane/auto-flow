import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardPermissionCardProps {
  module: string;
  displayName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onChange: (field: "can_view" | "can_create" | "can_edit" | "can_delete", value: boolean) => void;
}

export function DashboardPermissionCard({
  module,
  displayName,
  canView,
  canCreate,
  canEdit,
  canDelete,
  onChange,
}: DashboardPermissionCardProps) {
  const handleAllChange = (checked: boolean) => {
    onChange("can_view", checked);
    onChange("can_create", checked);
    onChange("can_edit", checked);
    onChange("can_delete", checked);
  };

  const allChecked = canView && canCreate && canEdit && canDelete;

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">{displayName}</h4>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${module}-all`}
              checked={allChecked}
              onCheckedChange={handleAllChange}
            />
            <Label htmlFor={`${module}-all`} className="text-xs text-muted-foreground">
              All
            </Label>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${module}-view`}
              checked={canView}
              onCheckedChange={(checked) => onChange("can_view", !!checked)}
            />
            <Label htmlFor={`${module}-view`} className="text-xs">View</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${module}-create`}
              checked={canCreate}
              onCheckedChange={(checked) => {
                onChange("can_create", !!checked);
                if (checked) onChange("can_view", true);
              }}
            />
            <Label htmlFor={`${module}-create`} className="text-xs">Create</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${module}-edit`}
              checked={canEdit}
              onCheckedChange={(checked) => {
                onChange("can_edit", !!checked);
                if (checked) onChange("can_view", true);
              }}
            />
            <Label htmlFor={`${module}-edit`} className="text-xs">Edit</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${module}-delete`}
              checked={canDelete}
              onCheckedChange={(checked) => {
                onChange("can_delete", !!checked);
                if (checked) onChange("can_view", true);
              }}
            />
            <Label htmlFor={`${module}-delete`} className="text-xs">Delete</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
