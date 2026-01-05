import { useParams, Link } from "react-router-dom";
import { useCaseDetail } from "@/hooks/useCaseDetail";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car } from "lucide-react";
import { CaseOverviewTab } from "@/components/case/CaseOverviewTab";
import { CaseCustomerTab } from "@/components/case/CaseCustomerTab";
import { CaseInsuranceTab } from "@/components/case/CaseInsuranceTab";
import { CasePhotosTab } from "@/components/case/CasePhotosTab";
import { CaseDocumentsTab } from "@/components/case/CaseDocumentsTab";
import { CaseCommunicationsTab } from "@/components/case/CaseCommunicationsTab";
import { CaseTowingTab } from "@/components/case/CaseTowingTab";
import { CasePartsTab } from "@/components/case/CasePartsTab";
import { CaseActivityTab } from "@/components/case/CaseActivityTab";
import { CaseNotesTab } from "@/components/case/CaseNotesTab";
import { CaseReportTab } from "@/components/case/CaseReportTab";
import { CaseQCTab } from "@/components/case/CaseQCTab";

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const { caseDetail, isLoading, error } = useCaseDetail(caseId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[600px]" />
      </div>
    );
  }

  if (error || !caseDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Case not found or you don't have access.</p>
        <Button asChild className="mt-4">
          <Link to="/workshop">Back to Workshop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/workshop">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Car className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                {caseDetail.vehicle?.make} {caseDetail.vehicle?.model}
              </h1>
              {caseDetail.current_stage && (
                <Badge 
                  style={{ 
                    backgroundColor: caseDetail.current_stage.color || '#3B82F6',
                    color: 'white'
                  }}
                >
                  {caseDetail.current_stage.name}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {caseDetail.case_number} 
              {caseDetail.job_number && ` • Job: ${caseDetail.job_number}`}
              {caseDetail.vehicle?.registration && ` • ${caseDetail.vehicle.registration}`}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="qc">Quality Control</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="towing">Towing</TabsTrigger>
          <TabsTrigger value="parts">Parts & Consumables</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CaseOverviewTab caseDetail={caseDetail} />
        </TabsContent>

        <TabsContent value="customer" className="mt-6">
          <CaseCustomerTab customer={caseDetail.customer} />
        </TabsContent>

        <TabsContent value="insurance" className="mt-6">
          <CaseInsuranceTab caseDetail={caseDetail} />
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          <CasePhotosTab intakeId={caseDetail.intake?.id} caseId={caseDetail.id} />
        </TabsContent>

        <TabsContent value="qc" className="mt-6">
          <CaseQCTab caseId={caseDetail.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <CaseDocumentsTab caseId={caseDetail.id} />
        </TabsContent>

        <TabsContent value="communications" className="mt-6">
          <CaseCommunicationsTab caseId={caseDetail.id} />
        </TabsContent>

        <TabsContent value="towing" className="mt-6">
          <CaseTowingTab caseDetail={caseDetail} />
        </TabsContent>

        <TabsContent value="parts" className="mt-6">
          <CasePartsTab caseId={caseDetail.id} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <CaseActivityTab caseId={caseDetail.id} />
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <CaseNotesTab caseDetail={caseDetail} />
        </TabsContent>

        <TabsContent value="report" className="mt-6">
          <CaseReportTab caseId={caseDetail.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
