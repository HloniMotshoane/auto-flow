import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Truck, Plus, Search, Eye, FileText, MoreHorizontal, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useTowingRecords } from "@/hooks/useTowingRecords";

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
  in_progress: { label: "In Progress", variant: "default" as const, icon: AlertTriangle },
  completed: { label: "Completed", variant: "outline" as const, icon: CheckCircle },
  written_off: { label: "Written Off", variant: "destructive" as const, icon: XCircle },
};

const typeConfig = {
  upliftment: { label: "Upliftment", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  tow_in: { label: "Tow-In", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  accident: { label: "Accident", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
};

export default function TowingList() {
  const navigate = useNavigate();
  const { records, isLoading, stats } = useTowingRecords();
  const [search, setSearch] = useState("");

  const filteredRecords = records?.filter((record) => {
    const searchLower = search.toLowerCase();
    return (
      record.reference_number?.toLowerCase().includes(searchLower) ||
      record.client_first_name?.toLowerCase().includes(searchLower) ||
      record.client_last_name?.toLowerCase().includes(searchLower) ||
      record.registration_number?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Towing Management</h1>
              <p className="text-sm text-muted-foreground">Track and manage all towing records</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/towing/new/upliftment")} className="gap-2">
            <Plus className="h-4 w-4" />
            New Upliftment
          </Button>
          <Button onClick={() => navigate("/towing/new/tow-in")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Tow-In
          </Button>
          <Button onClick={() => navigate("/towing/new/accident")} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            New Accident
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">All Tows</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.all}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Written Off</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.written_off}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by reference, client, or registration..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRecords?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No towing records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords?.map((record) => {
                  const status = statusConfig[record.status];
                  const type = typeConfig[record.tow_type];
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.reference_number}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                          {type.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {record.client_first_name || record.client_last_name
                          ? `${record.client_first_name || ""} ${record.client_last_name || ""}`.trim()
                          : "-"}
                      </TableCell>
                      <TableCell>{record.registration_number || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/towing/${record.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Export PDF
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
