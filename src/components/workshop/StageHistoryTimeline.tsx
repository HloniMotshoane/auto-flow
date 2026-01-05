import { useStageHistory } from "@/hooks/useStageHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, Clock, User, MessageSquare, Mail, Bell } from "lucide-react";

interface StageHistoryTimelineProps {
  caseId: string;
}

export function StageHistoryTimeline({ caseId }: StageHistoryTimelineProps) {
  const { data: history, isLoading } = useStageHistory(caseId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Stage History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No stage history recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Stage History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {history.map((entry, index) => (
              <div key={entry.id} className="relative pl-10">
                {/* Timeline dot */}
                <div 
                  className="absolute left-2.5 w-3 h-3 rounded-full border-2 border-background"
                  style={{ 
                    backgroundColor: entry.stage?.color || '#3B82F6',
                    top: '0.375rem'
                  }}
                />

                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.previous_stage && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {entry.previous_stage.name}
                            </Badge>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          </>
                        )}
                        <Badge 
                          className="text-xs"
                          style={{ 
                            backgroundColor: entry.stage?.color || '#3B82F6',
                            color: 'white'
                          }}
                        >
                          {entry.stage?.name || "Unknown"}
                        </Badge>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>

                    {entry.notified_customer && (
                      <div className="flex items-center gap-1">
                        {(entry.notification_type === "email" || entry.notification_type === "both") && (
                          <Mail className="w-3 h-3 text-blue-500" />
                        )}
                        {(entry.notification_type === "whatsapp" || entry.notification_type === "both") && (
                          <MessageSquare className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(entry.created_at), "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
