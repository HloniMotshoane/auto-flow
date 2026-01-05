import { CaseDetail } from "@/hooks/useCaseDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Calendar, MapPin, Clock, History } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { StageHistoryTimeline } from "@/components/workshop/StageHistoryTimeline";

interface CaseOverviewTabProps {
  caseDetail: CaseDetail;
}

export function CaseOverviewTab({ caseDetail }: CaseOverviewTabProps) {
  const vehicle = caseDetail.vehicle;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vehicle Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Make</p>
              <p className="font-medium">{vehicle?.make || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p className="font-medium">{vehicle?.model || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Year</p>
              <p className="font-medium">{vehicle?.year || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Color</p>
              <p className="font-medium">{vehicle?.color || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration</p>
              <p className="font-medium">{vehicle?.registration || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">VIN</p>
              <p className="font-medium text-xs">{vehicle?.vin || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Engine Number</p>
              <p className="font-medium">{vehicle?.engine_number || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Case Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Case Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Case Number</p>
              <p className="font-medium">{caseDetail.case_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Job Number</p>
              <p className="font-medium">{caseDetail.job_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className="capitalize">
                {caseDetail.status?.replace(/_/g, " ")}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Stage</p>
              {caseDetail.current_stage ? (
                <Badge 
                  style={{ 
                    backgroundColor: caseDetail.current_stage.color || '#3B82F6',
                    color: 'white'
                  }}
                >
                  {caseDetail.current_stage.name}
                </Badge>
              ) : (
                <p className="font-medium">Unassigned</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Condition</p>
              <p className="font-medium capitalize">{caseDetail.condition_status?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Warranty</p>
              <p className="font-medium capitalize">{caseDetail.warranty_status?.replace(/_/g, " ") || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Dates & Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(new Date(caseDetail.created_at), "dd MMM yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(caseDetail.created_at), { addSuffix: true })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {format(new Date(caseDetail.updated_at), "dd MMM yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(caseDetail.updated_at), { addSuffix: true })}
              </p>
            </div>
            {caseDetail.activated_at && (
              <div>
                <p className="text-sm text-muted-foreground">Activated</p>
                <p className="font-medium">
                  {format(new Date(caseDetail.activated_at), "dd MMM yyyy")}
                </p>
              </div>
            )}
            {caseDetail.tow_in_date && (
              <div>
                <p className="text-sm text-muted-foreground">Tow In Date</p>
                <p className="font-medium">
                  {format(new Date(caseDetail.tow_in_date), "dd MMM yyyy")}
                </p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Storage Days</p>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="font-medium">{caseDetail.storage_days || 0} days in storage</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stage History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Stage History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StageHistoryTimeline caseId={caseDetail.id} />
        </CardContent>
      </Card>
    </div>
  );
}
