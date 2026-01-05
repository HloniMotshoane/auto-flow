import { useState } from "react";
import { usePartsCosting } from "@/hooks/usePartsCosting";
import { useSupplierResponses } from "@/hooks/useSupplierResponses";
import { usePartsAnalytics } from "@/hooks/usePartsAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  TrendingUp, 
  Trophy,
  DollarSign,
  Truck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PartsCosting() {
  const { costingRequests, isLoading, pendingRequests, byStatus } = usePartsCosting();
  const { responses, createResponse } = useSupplierResponses();
  const { analytics, isLoading: analyticsLoading } = usePartsAnalytics();
  
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [responseForm, setResponseForm] = useState({
    quoted_price: "",
    availability: "in_stock",
    delivery_eta_days: "",
    notes: "",
  });

  const handleLogResponse = (requestId: string) => {
    setSelectedRequest(requestId);
    setResponseForm({
      quoted_price: "",
      availability: "in_stock",
      delivery_eta_days: "",
      notes: "",
    });
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedRequest || !responseForm.quoted_price) return;
    
    createResponse.mutate({
      costing_request_id: selectedRequest,
      quoted_price: parseFloat(responseForm.quoted_price),
      availability: responseForm.availability,
      delivery_eta_days: responseForm.delivery_eta_days ? parseInt(responseForm.delivery_eta_days) : null,
      notes: responseForm.notes || null,
      attachments: [],
    }, {
      onSuccess: () => setResponseDialogOpen(false),
    });
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "sent":
        return <Badge variant="outline"><Truck className="w-3 h-3 mr-1" />Sent</Badge>;
      case "received":
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Received</Badge>;
      case "declined":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Parts Costing</h1>
        <p className="text-muted-foreground">Track costing requests and supplier responses</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{analytics?.pendingRequests || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Delivery</p>
                <p className="text-2xl font-bold">{analytics?.awaitingDelivery || 0}</p>
              </div>
              <Truck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Spend</p>
                <p className="text-2xl font-bold">R {analytics?.totalSpendThisMonth?.toFixed(2) || "0.00"}</p>
              </div>
              <DollarSign className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Supplier</p>
                <p className="text-lg font-bold truncate">{analytics?.topSuppliers?.[0]?.supplierName || "-"}</p>
              </div>
              <Trophy className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Costing Requests</TabsTrigger>
          <TabsTrigger value="leaderboard">Supplier Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All Requests ({costingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Case</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costingRequests.map((req) => {
                    const reqResponses = responses.filter(r => r.costing_request_id === req.id);
                    const bestResponse = reqResponses[0];
                    
                    return (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {req.supplier_part?.part_name || req.part_description || "Unknown Part"}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">Qty: {req.quantity || 1}</span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {req.case?.case_number || "-"}
                        </TableCell>
                        <TableCell>{req.supplier?.supplier_name || "-"}</TableCell>
                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          {bestResponse ? (
                            <div>
                              <span className="font-medium text-success">R {bestResponse.quoted_price?.toFixed(2)}</span>
                              <p className="text-xs text-muted-foreground">{bestResponse.availability}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending" || req.status === "sent" ? (
                            <Button size="sm" variant="outline" onClick={() => handleLogResponse(req.id)}>
                              Log Response
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {costingRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No costing requests found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead className="text-center">Total Quotes</TableHead>
                    <TableHead className="text-center">Avg Response (hrs)</TableHead>
                    <TableHead className="text-right">Avg Price</TableHead>
                    <TableHead className="text-center">In-Stock %</TableHead>
                    <TableHead className="text-center">Total Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.supplierStats?.map((supplier, index) => (
                    <TableRow key={supplier.supplierName}>
                      <TableCell>
                        {index < 3 ? (
                          <Trophy className={`w-5 h-5 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-600"}`} />
                        ) : (
                          <span className="text-muted-foreground">{index + 1}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                      <TableCell className="text-center">{supplier.totalQuotes}</TableCell>
                      <TableCell className="text-center">{supplier.averageResponseTime?.toFixed(1) || "-"}</TableCell>
                      <TableCell className="text-right">R {supplier.averagePrice?.toFixed(2) || "-"}</TableCell>
                      <TableCell className="text-center">{supplier.inStockPercentage?.toFixed(0) || 0}%</TableCell>
                      <TableCell className="text-center">{supplier.totalOrders}</TableCell>
                    </TableRow>
                  ))}
                  {(!analytics?.supplierStats || analytics.supplierStats.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No supplier data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Log Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Supplier Response</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Quoted Price (R) *</Label>
              <Input
                type="number"
                value={responseForm.quoted_price}
                onChange={(e) => setResponseForm({ ...responseForm, quoted_price: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Availability</Label>
              <Select value={responseForm.availability} onValueChange={(v) => setResponseForm({ ...responseForm, availability: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="back_order">Back Order</SelectItem>
                  <SelectItem value="special_order">Special Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Delivery ETA (days)</Label>
              <Input
                type="number"
                value={responseForm.delivery_eta_days}
                onChange={(e) => setResponseForm({ ...responseForm, delivery_eta_days: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={responseForm.notes}
                onChange={(e) => setResponseForm({ ...responseForm, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResponseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitResponse} disabled={createResponse.isPending}>
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
