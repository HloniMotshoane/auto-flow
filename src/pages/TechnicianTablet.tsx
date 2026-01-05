import { useState } from "react";
import { useWorkshopCases } from "@/hooks/useWorkshopCases";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Search, Car, Package, Beaker, Wrench, ArrowLeft, UserCog, HelpCircle, CheckCircle, LogOut, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TabletPartsView } from "@/components/tablet/TabletPartsView";
import { TabletConsumablesView } from "@/components/tablet/TabletConsumablesView";
import { toast } from "sonner";

export default function TechnicianTablet() {
  const { tenantId } = useUserTenant();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const { data: cases, isLoading } = useWorkshopCases(tenantId, searchQuery);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6 flex gap-4">
        <Skeleton className="h-full w-24 rounded-2xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const selectedCaseData = cases?.find(c => c.id === selectedCase);

  const handleRequestManager = () => {
    toast.success("Request sent to workshop manager", {
      description: `Manager has been notified about ${selectedCaseData?.case_number || 'your request'}`,
    });
  };

  const handleRequestHelp = () => {
    toast.success("Help request sent", {
      description: "A team member will assist you shortly",
    });
  };

  const handleStageComplete = () => {
    toast.success("Stage marked as complete", {
      description: `${selectedCaseData?.current_stage?.name || 'Current stage'} completed`,
    });
  };

  // Sidebar Component
  const ActionSidebar = ({ showBack = false }: { showBack?: boolean }) => (
    <div className="w-24 bg-gradient-to-b from-card to-card/80 border-r shadow-lg flex flex-col items-center py-6 gap-2 shrink-0">
      {/* Logo / Back */}
      <div className="mb-4">
        {showBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-14 h-14 rounded-xl hover:bg-primary/10 transition-all"
            onClick={() => setSelectedCase(null)}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
        ) : (
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wrench className="w-7 h-7 text-primary" />
          </div>
        )}
      </div>

      <Separator className="w-12 mb-4" />

      {/* Action Buttons */}
      <div className="flex-1 flex flex-col items-center gap-3">
        <Button
          variant="ghost"
          className="w-20 h-24 flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
          onClick={handleRequestManager}
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <UserCog className="w-5 h-5 text-primary" />
          </div>
          <span className="text-[10px] text-center leading-tight font-medium text-muted-foreground group-hover:text-foreground">
            Request Manager
          </span>
        </Button>

        <Button
          variant="ghost"
          className="w-20 h-24 flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all group"
          onClick={handleRequestHelp}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <HelpCircle className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-[10px] text-center leading-tight font-medium text-muted-foreground group-hover:text-foreground">
            Request Help
          </span>
        </Button>

        <Button
          variant="ghost"
          className="w-20 h-24 flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-green-500/10 border border-transparent hover:border-green-500/20 transition-all group disabled:opacity-50"
          onClick={handleStageComplete}
          disabled={!selectedCase}
        >
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <span className="text-[10px] text-center leading-tight font-medium text-muted-foreground group-hover:text-foreground">
            Stage Complete
          </span>
        </Button>
      </div>

      <Separator className="w-12 mb-2" />

      {/* Exit Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        asChild 
        className="text-xs text-muted-foreground hover:text-foreground gap-1"
      >
        <Link to="/workshop">
          <LogOut className="w-4 h-4" />
          Exit
        </Link>
      </Button>
    </div>
  );

  // Case Detail View
  if (selectedCase && selectedCaseData) {
    return (
      <div className="min-h-screen bg-muted/30 flex">
        <ActionSidebar showBack />

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
          {/* Case Header Card */}
          <Card className="border-0 shadow-md bg-gradient-to-r from-card to-card/90">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: selectedCaseData.current_stage?.color || '#3B82F6' }}
                  >
                    <Car className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {selectedCaseData.vehicle?.make} {selectedCaseData.vehicle?.model}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm">{selectedCaseData.case_number}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{selectedCaseData.vehicle?.color}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{selectedCaseData.vehicle?.year}</span>
                    </p>
                  </div>
                </div>
                {selectedCaseData.current_stage && (
                  <Badge 
                    className="text-sm px-4 py-2 font-medium shadow-sm"
                    style={{ 
                      backgroundColor: selectedCaseData.current_stage.color || '#3B82F6',
                      color: 'white' 
                    }}
                  >
                    {selectedCaseData.current_stage.name}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Tabs */}
          <Tabs defaultValue="parts" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-2 w-full h-16 p-1.5 bg-card shadow-sm rounded-xl">
              <TabsTrigger 
                value="parts" 
                className="h-full text-lg rounded-lg data-[state=active]:shadow-md transition-all"
              >
                <Package className="w-5 h-5 mr-2" />
                Parts
              </TabsTrigger>
              <TabsTrigger 
                value="consumables" 
                className="h-full text-lg rounded-lg data-[state=active]:shadow-md transition-all"
              >
                <Beaker className="w-5 h-5 mr-2" />
                Consumables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="parts" className="mt-6 flex-1 animate-fade-in">
              <Card className="h-full border-0 shadow-md">
                <CardContent className="p-6">
                  <TabletPartsView 
                    caseId={selectedCase} 
                    technicianId={user?.id || ""} 
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="consumables" className="mt-6 flex-1 animate-fade-in">
              <Card className="h-full border-0 shadow-md">
                <CardContent className="p-6">
                  <TabletConsumablesView 
                    caseId={selectedCase} 
                    technicianId={user?.id || ""} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Job List View
  return (
    <div className="min-h-screen bg-muted/30 flex">
      <ActionSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
        {/* Header Card */}
        <Card className="border-0 shadow-md bg-gradient-to-r from-card to-card/90">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Workshop Tablet</h1>
                <p className="text-muted-foreground mt-1">Parts & Consumables Logging</p>
              </div>
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                {cases?.length || 0} Active Jobs
              </Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by case number or vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-muted bg-muted/50 focus:bg-background transition-colors"
              />
            </div>
          </CardContent>
        </Card>

        {/* Case List */}
        <div className="flex-1 overflow-auto space-y-3">
          {cases?.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted mx-auto flex items-center justify-center mb-4">
                  <Car className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">No active jobs found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Jobs will appear here when assigned</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {cases?.map((caseItem, index) => (
                <Card 
                  key={caseItem.id} 
                  className="cursor-pointer border-0 shadow-sm hover:shadow-md transition-all active:scale-[0.99] group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedCase(caseItem.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-105"
                          style={{ backgroundColor: caseItem.current_stage?.color || '#3B82F6' }}
                        >
                          <Car className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {caseItem.vehicle?.make} {caseItem.vehicle?.model}
                          </p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {caseItem.case_number}
                          </p>
                          {caseItem.vehicle?.color && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              {caseItem.vehicle.color} • {caseItem.vehicle.year}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {caseItem.current_stage && (
                          <Badge 
                            className="font-medium shadow-sm"
                            style={{ 
                              backgroundColor: caseItem.current_stage.color || '#3B82F6',
                              color: 'white' 
                            }}
                          >
                            {caseItem.current_stage.name}
                          </Badge>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}