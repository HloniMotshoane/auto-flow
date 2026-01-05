import { useNavigate } from "react-router-dom";
import { useUnquotedJobs } from "@/hooks/useUnquotedJobs";
import { useEstimators } from "@/hooks/useEstimators";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { FileText, Car, User, Calendar, Eye } from "lucide-react";

export function UnquotedJobsTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unquotedJobs, isLoading, assignEstimator } = useUnquotedJobs();
  const { data: estimators } = useEstimators();

  const handleAssignToMe = (quotationId: string) => {
    if (user?.id) {
      assignEstimator.mutate({ quotationId, estimatorId: user.id });
    }
  };

  const handleAssignEstimator = (quotationId: string, estimatorId: string) => {
    assignEstimator.mutate({ quotationId, estimatorId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unquoted Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Unquoted Jobs
          <Badge variant="secondary" className="ml-2">{unquotedJobs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unquotedJobs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No unquoted jobs</p>
            <p className="text-sm">All current jobs have been assigned to an estimator</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Case #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unquotedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.quote_number}</TableCell>
                  <TableCell>{job.cases?.case_number || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{job.customer?.name || "Unknown"}</div>
                        {job.customer?.phone && (
                          <div className="text-xs text-muted-foreground">{job.customer.phone}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {[job.vehicle?.make, job.vehicle?.model].filter(Boolean).join(" ") || "Unknown"}
                        </div>
                        {job.vehicle?.registration && (
                          <div className="text-xs text-muted-foreground">{job.vehicle.registration}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(job.created_at), "dd MMM yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.status || "draft"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/quotations/${job.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAssignToMe(job.id)}
                        disabled={assignEstimator.isPending}
                      >
                        Assign to Me
                      </Button>
                      <Select onValueChange={(value) => handleAssignEstimator(job.id, value)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          {estimators?.map((estimator) => (
                            <SelectItem key={estimator.id} value={estimator.user_id}>
                              {`${estimator.first_name || ""} ${estimator.last_name || ""}`.trim() || estimator.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
