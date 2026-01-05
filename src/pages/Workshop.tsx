import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useWorkshopCasesByStage, WorkshopCase } from "@/hooks/useWorkshopCases";
import { useWorkflowStages } from "@/hooks/useWorkflowStages";
import { useCreateStageHistory } from "@/hooks/useStageHistory";
import { usePartsOrders } from "@/hooks/usePartsOrders";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Search, 
  Car, 
  ArrowRight, 
  User, 
  Mail, 
  MessageSquare, 
  Settings,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  PlusCircle,
  Truck
} from "lucide-react";

export default function Workshop() {
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const { data: stagesData, isLoading: stagesLoading } = useWorkshopCasesByStage(tenantId);
  const { data: allStages } = useWorkflowStages(tenantId);
  const { orders: partsOrders } = usePartsOrders(tenantId);
  const createStageHistory = useCreateStageHistory();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<WorkshopCase | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetStageId, setTargetStageId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [notificationType, setNotificationType] = useState<"none" | "email" | "whatsapp" | "both">("none");
  const [activeTab, setActiveTab] = useState("all");

  const handleMoveStage = () => {
    if (!selectedCase || !targetStageId || !tenantId || !user?.id) return;

    createStageHistory.mutate({
      tenantId,
      caseId: selectedCase.id,
      stageId: targetStageId,
      previousStageId: selectedCase.current_stage_id,
      updatedBy: user.id,
      notes: notes || undefined,
      notificationType,
    }, {
      onSuccess: () => {
        setMoveDialogOpen(false);
        setSelectedCase(null);
        setTargetStageId("");
        setNotes("");
        setNotificationType("none");
      },
    });
  };

  const filteredCases = (cases: WorkshopCase[]) => {
    if (!searchQuery) return cases;
    const query = searchQuery.toLowerCase();
    return cases.filter(c => 
      c.case_number?.toLowerCase().includes(query) ||
      c.job_number?.toLowerCase().includes(query) ||
      c.vehicle?.vin_number?.toLowerCase().includes(query)
    );
  };

  if (stagesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  const { stages = [], casesByStage = {} } = stagesData || {};

  // Calculate summary stats
  const allCases: WorkshopCase[] = Object.values(casesByStage).flat();
  const totalCases = allCases.length;
  const authorisedCases = allCases.filter(c => c.authorization_number);
  const insuranceAuthorisedCases = allCases.filter(c => c.authorization_number && c.insurance_company_id);
  const additionalsCases = allCases.filter(c => c.status === 'additionals' || c.notes?.toLowerCase().includes('additional'));
  
  // Cases awaiting parts (have pending parts orders)
  const pendingPartsOrdersCaseIds = new Set(
    partsOrders?.filter(o => o.status === 'ordered' || o.status === 'pending').map(o => o.case_id) || []
  );
  const awaitingPartsCases = allCases.filter(c => pendingPartsOrdersCaseIds.has(c.id));
  
  // Cars per stage summary
  const stageSummary = stages.map(stage => ({
    name: stage.name,
    color: stage.color || '#3B82F6',
    count: casesByStage[stage.id]?.length || 0
  }));

  const hasNoStages = stages.length === 0;

  // Filter cases based on active tab
  const getTabCases = () => {
    switch (activeTab) {
      case "authorised":
        return insuranceAuthorisedCases;
      case "additionals":
        return additionalsCases;
      case "awaiting-parts":
        return awaitingPartsCases;
      default:
        return allCases;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workshop</h1>
          <p className="text-muted-foreground">Track vehicles through repair stages</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by reg, VIN, job #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" asChild>
            <Link to="/parts/costing">
              <Package className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link to="/settings/workflow-stages">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCases}</p>
                <p className="text-xs text-muted-foreground">Total in Workshop</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{authorisedCases.length}</p>
                <p className="text-xs text-muted-foreground">Authorised</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{insuranceAuthorisedCases.length}</p>
                <p className="text-xs text-muted-foreground">Insurance Authorised</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <PlusCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{additionalsCases.length}</p>
                <p className="text-xs text-muted-foreground">Additionals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Truck className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{awaitingPartsCases.length}</p>
                <p className="text-xs text-muted-foreground">Awaiting Parts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stage Summary */}
      {stageSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vehicles by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stageSummary.map((stage, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium">{stage.name}</span>
                  <Badge variant="secondary" className="ml-1">{stage.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({totalCases})</TabsTrigger>
          <TabsTrigger value="authorised">Insurance Authorised ({insuranceAuthorisedCases.length})</TabsTrigger>
          <TabsTrigger value="additionals">Additionals ({additionalsCases.length})</TabsTrigger>
          <TabsTrigger value="awaiting-parts">Awaiting Parts ({awaitingPartsCases.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {/* Empty State - No Stages */}
          {hasNoStages && (
            <Card className="p-12">
              <div className="text-center">
                <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Workflow Stages Configured</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Set up your workflow stages to track vehicles through the repair process. 
                  Create stages like "Reception", "Stripping", "Panel Beating", "Painting", etc.
                </p>
                <Button asChild>
                  <Link to="/settings/workflow-stages">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Workflow Stages
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Empty State - No Cases */}
          {!hasNoStages && totalCases === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Vehicles in Workshop</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Vehicles will appear here once they are received through the intake process 
                  and assigned to a workflow stage.
                </p>
                <Button asChild>
                  <Link to="/intake">
                    Start Vehicle Intake
                  </Link>
                </Button>
              </div>
            </Card>
          )}

          {/* Kanban Board */}
          {!hasNoStages && totalCases > 0 && (
            <KanbanBoard 
              stages={stages}
              casesByStage={casesByStage}
              filteredCases={filteredCases}
              onMoveCase={(c) => {
                setSelectedCase(c);
                setTargetStageId("");
                setMoveDialogOpen(true);
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="authorised" className="mt-4">
          {insuranceAuthorisedCases.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Insurance Authorised Repairs</h3>
                <p className="text-muted-foreground">
                  Vehicles with insurance authorisation will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCases(insuranceAuthorisedCases).map((c) => (
                <VehicleCard 
                  key={c.id} 
                  caseData={c} 
                  onMove={() => {
                    setSelectedCase(c);
                    setMoveDialogOpen(true);
                  }}
                  showAuthInfo
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="additionals" className="mt-4">
          {additionalsCases.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Additionals</h3>
                <p className="text-muted-foreground">
                  Vehicles requiring additional work will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCases(additionalsCases).map((c) => (
                <VehicleCard 
                  key={c.id} 
                  caseData={c} 
                  onMove={() => {
                    setSelectedCase(c);
                    setMoveDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="awaiting-parts" className="mt-4">
          {awaitingPartsCases.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <Truck className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Vehicles Awaiting Parts</h3>
                <p className="text-muted-foreground">
                  Vehicles with pending parts orders will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCases(awaitingPartsCases).map((c) => (
                <VehicleCard 
                  key={c.id} 
                  caseData={c} 
                  onMove={() => {
                    setSelectedCase(c);
                    setMoveDialogOpen(true);
                  }}
                  showPartsInfo
                  pendingPartsCount={partsOrders?.filter(o => o.case_id === c.id && (o.status === 'ordered' || o.status === 'pending')).length || 0}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Move Stage Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Vehicle Stage</DialogTitle>
          </DialogHeader>
          
          {selectedCase && (
            <div className="space-y-4">
              {/* Vehicle Info */}
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-primary" />
                  <span className="font-medium">
                    {selectedCase.vehicle?.vin_number || selectedCase.case_number}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedCase.vehicle?.make} {selectedCase.vehicle?.model} ({selectedCase.vehicle?.year})
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCase.case_number} • {selectedCase.job_number || "No Job #"}
                </p>
              </div>

              {/* Target Stage */}
              <div className="space-y-2">
                <Label>Move to Stage</Label>
                <Select value={targetStageId} onValueChange={setTargetStageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {allStages?.filter(s => s.id !== selectedCase.current_stage_id).map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: (stage as any).color || '#3B82F6' }}
                          />
                          {stage.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes about this stage change..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Notification Type */}
              <div className="space-y-2">
                <Label>Notify Customer</Label>
                <RadioGroup value={notificationType} onValueChange={(v) => setNotificationType(v as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" />
                    <Label htmlFor="none" className="text-sm font-normal">Don't notify</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="text-sm font-normal flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="text-sm font-normal flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> WhatsApp only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="text-sm font-normal">Both Email & WhatsApp</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveStage} 
              disabled={!targetStageId || createStageHistory.isPending}
            >
              {createStageHistory.isPending ? "Updating..." : "Update Stage"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KanbanBoard({ 
  stages, 
  casesByStage, 
  filteredCases, 
  onMoveCase 
}: { 
  stages: Array<{ id: string; name: string; color?: string | null }>;
  casesByStage: Record<string, WorkshopCase[]>;
  filteredCases: (cases: WorkshopCase[]) => WorkshopCase[];
  onMoveCase: (c: WorkshopCase) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {/* Unassigned Column */}
      {casesByStage["unassigned"]?.length > 0 && (
        <div className="flex-shrink-0 w-72">
          <Card className="h-full bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                  Unassigned
                </CardTitle>
                <Badge variant="secondary">{filteredCases(casesByStage["unassigned"]).length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredCases(casesByStage["unassigned"]).map((c) => (
                <VehicleCard 
                  key={c.id} 
                  caseData={c} 
                  onMove={() => onMoveCase(c)}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stage Columns */}
      {stages.map((stage) => (
        <div key={stage.id} className="flex-shrink-0 w-72">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: stage.color || '#3B82F6' }}
                  />
                  {stage.name}
                </CardTitle>
                <Badge variant="secondary">{filteredCases(casesByStage[stage.id] || []).length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredCases(casesByStage[stage.id] || []).map((c) => (
                <VehicleCard 
                  key={c.id} 
                  caseData={c} 
                  onMove={() => onMoveCase(c)}
                />
              ))}
              {filteredCases(casesByStage[stage.id] || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No vehicles</p>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

function VehicleCard({ 
  caseData, 
  onMove,
  showAuthInfo = false,
  showPartsInfo = false,
  pendingPartsCount = 0
}: { 
  caseData: WorkshopCase; 
  onMove: () => void;
  showAuthInfo?: boolean;
  showPartsInfo?: boolean;
  pendingPartsCount?: number;
}) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/workshop/case/${caseData.id}`);
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">
              {caseData.vehicle?.make} {caseData.vehicle?.model}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMove();
            }}
          >
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">
          {caseData.vehicle?.make} {caseData.vehicle?.model}
          {caseData.vehicle?.color && ` • ${caseData.vehicle.color}`}
        </p>
        
        {showAuthInfo && caseData.authorization_number && (
          <div className="mb-2">
            <Badge variant="outline" className="text-xs">
              Auth: {caseData.authorization_number}
            </Badge>
          </div>
        )}
        
        {showPartsInfo && pendingPartsCount > 0 && (
          <div className="mb-2">
            <Badge variant="secondary" className="text-xs bg-purple-500/10 text-purple-600">
              <Truck className="w-3 h-3 mr-1" />
              {pendingPartsCount} part{pendingPartsCount > 1 ? 's' : ''} pending
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{caseData.job_number || caseData.case_number}</span>
          {caseData.customer && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{caseData.customer.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
