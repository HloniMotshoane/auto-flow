import { useActivityLogs } from "@/hooks/useActivityLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, Wrench, Timer } from "lucide-react";
import { format, formatDistanceStrict } from "date-fns";

interface CaseActivityTabProps {
  caseId: string;
}

export function CaseActivityTab({ caseId }: CaseActivityTabProps) {
  const { data: activityLogs, isLoading } = useActivityLogs(caseId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  // Calculate totals by segment and technician
  const segmentTotals: Record<string, { name: string; color: string | null; minutes: number }> = {};
  const technicianTotals: Record<string, { name: string; minutes: number }> = {};

  interface ActivityLogWithRelations {
    id: string;
    duration_minutes: number | null;
    start_time: string;
    stop_time: string | null;
    notes: string | null;
    technician_id: string;
    workshop_segment?: { id: string; name: string; color: string | null } | null;
    segment_task?: { id: string; task_name: string } | null;
    profile?: { first_name: string | null; last_name: string | null; email: string; user_id: string } | null;
  }

  (activityLogs as ActivityLogWithRelations[] | undefined)?.forEach((log) => {
    const segmentId = log.workshop_segment?.id || "unknown";
    const segmentName = log.workshop_segment?.name || "Unknown";
    const segmentColor = log.workshop_segment?.color || null;
    const techId = log.profile?.user_id || log.technician_id || "unknown";
    const techName = log.profile
      ? `${log.profile.first_name || ""} ${log.profile.last_name || ""}`.trim() || log.profile.email
      : "Unknown";
    const duration = log.duration_minutes || 0;

    if (!segmentTotals[segmentId]) {
      segmentTotals[segmentId] = { name: segmentName, color: segmentColor, minutes: 0 };
    }
    segmentTotals[segmentId].minutes += duration;

    if (!technicianTotals[techId]) {
      technicianTotals[techId] = { name: techName, minutes: 0 };
    }
    technicianTotals[techId].minutes += duration;
  });

  const totalMinutes = activityLogs?.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) || 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatDuration(totalMinutes)}</p>
                <p className="text-sm text-muted-foreground">Total Work Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(technicianTotals).length}</p>
                <p className="text-sm text-muted-foreground">Technicians Involved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Wrench className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{activityLogs?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Activity Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time by Area/Segment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Time by Workshop Area
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(segmentTotals).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(segmentTotals)
                .sort((a, b) => b[1].minutes - a[1].minutes)
                .map(([id, data]) => (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: data.color || "#3B82F6" }}
                      />
                      <span className="font-medium">{data.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(data.minutes / totalMinutes) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {formatDuration(data.minutes)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time by Technician */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Time by Technician
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(technicianTotals).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(technicianTotals)
                .sort((a, b) => b[1].minutes - a[1].minutes)
                .map(([id, data]) => (
                  <div key={id} className="flex items-center justify-between">
                    <span className="font-medium">{data.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(data.minutes / totalMinutes) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {formatDuration(data.minutes)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activityLogs || activityLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No activity logged yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(activityLogs as ActivityLogWithRelations[]).map((log) => (
                <div key={log.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: log.workshop_segment?.color || "#3B82F6" }}
                    />
                    <div className="w-px flex-1 bg-border mt-2" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.workshop_segment?.name || "Unknown"}</Badge>
                        {log.segment_task && (
                          <Badge variant="secondary">{log.segment_task.task_name}</Badge>
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {formatDuration(log.duration_minutes || 0)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {log.profile
                        ? `${log.profile.first_name || ""} ${log.profile.last_name || ""}`.trim() || log.profile.email
                        : "Unknown technician"}
                    </p>
                    {log.notes && (
                      <p className="text-sm mt-1">{log.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.start_time), "dd MMM yyyy, HH:mm")}
                      {log.stop_time && ` → ${format(new Date(log.stop_time), "HH:mm")}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
