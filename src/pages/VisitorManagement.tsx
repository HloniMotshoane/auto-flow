import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Calendar, 
  Download, 
  ExternalLink,
  Car,
  Clock,
  Building,
  LogOut,
  Eye,
  Settings,
  Tablet,
  Link as LinkIcon
} from "lucide-react";
import { format } from "date-fns";
import { useVisitors, Visitor } from "@/hooks/useVisitors";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useWorkshopCases } from "@/hooks/useWorkshopCases";
import { Skeleton } from "@/components/ui/skeleton";

export default function VisitorManagement() {
  const navigate = useNavigate();
  const { tenantId } = useUserTenant();
  const { visitors, isLoading, signOutVisitor, linkToCase } = useVisitors();
  const { data: casesData } = useWorkshopCases();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");

  const cases = casesData || [];

  // Filter visitors
  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      visitor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.visit_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || visitor.visit_type.toLowerCase().includes(filterType.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Get unique visit types for filter
  const visitTypes = [...new Set(visitors.map((v) => v.visit_type))];

  // Stats
  const todayVisitors = visitors.filter(
    (v) => new Date(v.timestamp_in).toDateString() === new Date().toDateString()
  );
  const activeVisitors = visitors.filter((v) => !v.timestamp_out);
  const vehicleVisitors = visitors.filter((v) => v.vehicle_registration);

  const handleExport = () => {
    const csv = [
      ["Name", "Visit Type", "Company", "Host", "Time In", "Time Out", "Vehicle", "Notes"].join(","),
      ...filteredVisitors.map((v) =>
        [
          `${v.first_name} ${v.last_name}`,
          v.visit_type,
          v.company || "",
          v.host_staff_name || v.host_department || "",
          format(new Date(v.timestamp_in), "yyyy-MM-dd HH:mm"),
          v.timestamp_out ? format(new Date(v.timestamp_out), "yyyy-MM-dd HH:mm") : "",
          v.vehicle_registration || "",
          v.notes || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  const handleSignOut = async (visitor: Visitor) => {
    await signOutVisitor.mutateAsync(visitor.id);
  };

  const handleLinkToCase = async () => {
    if (selectedVisitor && selectedCaseId) {
      await linkToCase.mutateAsync({
        visitorId: selectedVisitor.id,
        caseId: selectedCaseId,
      });
      setLinkDialogOpen(false);
      setSelectedVisitor(null);
      setSelectedCaseId("");
    }
  };

  const getTabletUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/visitor-signin?tenant=${tenantId}&tablet=ENTRY01`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visitor Management</h1>
          <p className="text-muted-foreground">Track and manage all visitors to your premises</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/settings/visit-categories")}>
            <Settings className="w-4 h-4 mr-2" />
            Categories
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.open(getTabletUrl(), "_blank")}>
            <Tablet className="w-4 h-4 mr-2" />
            Open Tablet View
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today's Visitors</p>
                <p className="text-2xl font-bold">{todayVisitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Clock className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Currently On-Site</p>
                <p className="text-2xl font-bold">{activeVisitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Car className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Vehicles</p>
                <p className="text-2xl font-bold">{vehicleVisitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Building className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Visits</p>
                <p className="text-2xl font-bold">{visitors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tablet URL Info */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Tablet className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Tablet Sign-In URL</p>
              <code className="text-xs text-muted-foreground break-all">{getTabletUrl()}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(getTabletUrl());
              }}
            >
              Copy URL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Visit Types</SelectItem>
                {visitTypes.map((type) => (
                  <SelectItem key={type} value={type.toLowerCase()}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visitors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visitor Log</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No visitors found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Visitors will appear here once they sign in"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Visit Type</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-medium">
                      {visitor.first_name} {visitor.last_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{visitor.visit_type}</Badge>
                    </TableCell>
                    <TableCell>{visitor.company || "-"}</TableCell>
                    <TableCell>
                      {visitor.host_staff_name || visitor.host_department || "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(visitor.timestamp_in), "HH:mm")}
                      <span className="text-xs text-muted-foreground block">
                        {format(new Date(visitor.timestamp_in), "dd MMM")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {visitor.vehicle_registration ? (
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span className="text-xs">{visitor.vehicle_registration}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {visitor.timestamp_out ? (
                        <Badge variant="outline">Signed Out</Badge>
                      ) : (
                        <Badge className="bg-green-500">On-Site</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedVisitor(visitor)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!visitor.linked_case_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedVisitor(visitor);
                              setLinkDialogOpen(true);
                            }}
                          >
                            <LinkIcon className="w-4 h-4" />
                          </Button>
                        )}
                        {!visitor.timestamp_out && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSignOut(visitor)}
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Visitor Detail Dialog */}
      <Dialog open={!!selectedVisitor && !linkDialogOpen} onOpenChange={() => setSelectedVisitor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Visitor Details</DialogTitle>
          </DialogHeader>
          {selectedVisitor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {selectedVisitor.first_name} {selectedVisitor.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Visit Type</p>
                  <Badge variant="secondary">{selectedVisitor.visit_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedVisitor.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedVisitor.email || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedVisitor.company || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Host</p>
                  <p className="font-medium">
                    {selectedVisitor.host_staff_name || selectedVisitor.host_department || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time In</p>
                  <p className="font-medium">
                    {format(new Date(selectedVisitor.timestamp_in), "dd MMM yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time Out</p>
                  <p className="font-medium">
                    {selectedVisitor.timestamp_out
                      ? format(new Date(selectedVisitor.timestamp_out), "dd MMM yyyy HH:mm")
                      : "Still on-site"}
                  </p>
                </div>
              </div>

              {selectedVisitor.vehicle_registration && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4" /> Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Registration</p>
                      <p className="font-medium">{selectedVisitor.vehicle_registration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Make/Model</p>
                      <p className="font-medium">
                        {selectedVisitor.vehicle_make} {selectedVisitor.vehicle_model}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Colour</p>
                      <p className="font-medium">{selectedVisitor.vehicle_color || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="font-medium">{selectedVisitor.vehicle_reason || "-"}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedVisitor.purpose_details && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{selectedVisitor.purpose_details}</p>
                </div>
              )}

              {selectedVisitor.signature_data && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Signature</p>
                  <img
                    src={selectedVisitor.signature_data}
                    alt="Visitor signature"
                    className="border rounded max-h-24"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Link to Case Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Visitor to Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Link this visitor to an existing case/job for tracking purposes.
            </p>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.case_number} - {c.vehicle ? `${c.vehicle.make} ${c.vehicle.model}` : "No vehicle"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleLinkToCase} disabled={!selectedCaseId}>
                Link to Case
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
