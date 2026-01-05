import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, Settings } from "lucide-react";
import { WorkflowStage } from "@/hooks/useWorkflowStages";

interface StageAssignmentSectionProps {
  stages: WorkflowStage[];
  selectedStageIds: string[];
  isLoading?: boolean;
  onChange: (stageIds: string[]) => void;
  onManageStages?: () => void;
}

export function StageAssignmentSection({
  stages,
  selectedStageIds,
  isLoading,
  onChange,
  onManageStages,
}: StageAssignmentSectionProps) {
  const handleStageChange = (stageId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedStageIds, stageId]);
    } else {
      onChange(selectedStageIds.filter((id) => id !== stageId));
    }
  };

  const handleSelectAll = () => {
    onChange(stages.map((s) => s.id));
  };

  const handleSelectNone = () => {
    onChange([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Assign Stages</CardTitle>
          </div>
          {onManageStages && (
            <Button variant="outline" size="sm" onClick={onManageStages}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Stages
            </Button>
          )}
        </div>
        <CardDescription>
          Assign workflow stages this user can work on. Users can only perform operations within their assigned stages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No workflow stages configured for this tenant.
          </p>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>
                Select None
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    selectedStageIds.includes(stage.id)
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30"
                  }`}
                >
                  <Checkbox
                    id={stage.id}
                    checked={selectedStageIds.includes(stage.id)}
                    onCheckedChange={(checked) => handleStageChange(stage.id, !!checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={stage.id} className="text-sm font-medium cursor-pointer">
                      {stage.name}
                    </Label>
                    {stage.description && (
                      <p className="text-xs text-muted-foreground">{stage.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
