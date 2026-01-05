import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useQCInspections,
  useCreateQCInspection,
  useQCInspectionWithResults,
  useUpdateQCInspectionResult,
  useCompleteQCInspection,
} from "@/hooks/useQCInspections";
import { useQCChecklists } from "@/hooks/useQCChecklists";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClipboardCheck,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CaseQCTabProps {
  caseId: string;
}

export function CaseQCTab({ caseId }: CaseQCTabProps) {
  const { user } = useAuth();
  const { data: inspections, isLoading } = useQCInspections(caseId);
  const { data: checklists } = useQCChecklists();
  const createInspection = useCreateQCInspection();
  const completeInspection = useCompleteQCInspection();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState("");
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);

  const { data: activeInspection } = useQCInspectionWithResults(selectedInspectionId || undefined);
  const updateResult = useUpdateQCInspectionResult();

  const activeChecklists = checklists?.filter((c) => c.is_active) || [];

  const handleStartInspection = async () => {
    if (!selectedChecklistId || !user?.id) return;

    const checklist = checklists?.find((c) => c.id === selectedChecklistId);
    await createInspection.mutateAsync({
      case_id: caseId,
      checklist_id: selectedChecklistId,
      inspector_id: user.id,
      inspection_type: checklist?.checklist_type || "pre_repair",
    });
    setIsCreateDialogOpen(false);
    setSelectedChecklistId("");
  };

  const handleResultChange = async (resultId: string, result: string) => {
    await updateResult.mutateAsync({ id: resultId, result });
  };

  const handleCompleteInspection = async () => {
    if (!selectedInspectionId) return;
    await completeInspection.mutateAsync(selectedInspectionId);
    setIsInspectionDialogOpen(false);
    setSelectedInspectionId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Passed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case "requires_rework":
        return (
          <Badge className="bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Rework Required
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "pre_repair":
        return "Pre-Repair";
      case "mid_repair":
        return "Mid-Repair";
      case "final_qc":
        return "Final QC";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Quality Control Inspections
        </h3>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Start Inspection
        </Button>
      </div>

      {/* Inspections List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading inspections...
        </div>
      ) : inspections?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No QC inspections yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start a new inspection to ensure quality standards
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {inspections?.map((inspection) => (
            <Card key={inspection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {inspection.checklist?.name || "Inspection"}
                  </CardTitle>
                  {getStatusBadge(inspection.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">
                      {getTypeLabel(inspection.inspection_type)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span>
                      {inspection.passed_items + inspection.failed_items + inspection.na_items} / {inspection.total_items}
                    </span>
                  </div>
                  {inspection.status !== "in_progress" && (
                    <>
                      <Progress
                        value={(inspection.passed_items / (inspection.total_items - inspection.na_items)) * 100}
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span
                          className={cn(
                            "font-medium",
                            (inspection.overall_score || 0) >= 80
                              ? "text-green-600"
                              : (inspection.overall_score || 0) >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                          )}
                        >
                          {inspection.overall_score || 0}%
                        </span>
                      </div>
                    </>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {inspection.completed_at
                      ? `Completed ${format(new Date(inspection.completed_at), "MMM d, yyyy h:mm a")}`
                      : `Started ${format(new Date(inspection.created_at), "MMM d, yyyy h:mm a")}`}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedInspectionId(inspection.id);
                      setIsInspectionDialogOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {inspection.status === "in_progress" ? "Continue" : "View Details"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Start Inspection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Inspection</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Select Checklist
            </label>
            <Select value={selectedChecklistId} onValueChange={setSelectedChecklistId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a checklist" />
              </SelectTrigger>
              <SelectContent>
                {activeChecklists.map((checklist) => (
                  <SelectItem key={checklist.id} value={checklist.id}>
                    <div className="flex items-center gap-2">
                      <span>{checklist.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(checklist.checklist_type)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeChecklists.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No checklists available. Create one in Settings → QC Checklists.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartInspection} disabled={!selectedChecklistId}>
              Start Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inspection Detail Dialog */}
      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{activeInspection?.checklist?.name}</span>
              {activeInspection && getStatusBadge(activeInspection.status)}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {activeInspection?.results?.map((result, index) => (
              <div
                key={result.id}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium">
                      {index + 1}. {result.checklist_item?.item_text}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={result.result === "pass" ? "default" : "outline"}
                      className={cn(
                        result.result === "pass" && "bg-green-500 hover:bg-green-600"
                      )}
                      onClick={() => handleResultChange(result.id, "pass")}
                      disabled={activeInspection.status !== "in_progress"}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={result.result === "fail" ? "destructive" : "outline"}
                      onClick={() => handleResultChange(result.id, "fail")}
                      disabled={activeInspection.status !== "in_progress"}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={result.result === "na" ? "secondary" : "outline"}
                      onClick={() => handleResultChange(result.id, "na")}
                      disabled={activeInspection.status !== "in_progress"}
                    >
                      N/A
                    </Button>
                  </div>
                </div>
                {result.checklist_item?.requires_notes && (
                  <Textarea
                    className="mt-2"
                    placeholder="Add notes..."
                    value={result.notes || ""}
                    onChange={(e) =>
                      updateResult.mutate({ id: result.id, notes: e.target.value })
                    }
                    disabled={activeInspection.status !== "in_progress"}
                  />
                )}
              </div>
            ))}
          </div>
          {activeInspection?.status === "in_progress" && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>
                Save & Close
              </Button>
              <Button onClick={handleCompleteInspection}>
                Complete Inspection
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
