import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useVisitRequests, VisitRequest } from '@/hooks/useVisitRequests';
import { format } from 'date-fns';
import { Calendar, Car, CheckCircle, Clock, ExternalLink, Eye, FileText, Loader2, Mail, Phone, Search, Trash2, XCircle } from 'lucide-react';

const REQUEST_TYPE_LABELS: Record<string, string> = {
  quote_request: 'Quote Request',
  vehicle_collection: 'Vehicle Collection',
  drop_off: 'Vehicle Drop-off',
  general_inquiry: 'General Inquiry',
};

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  completed: { label: 'Completed', variant: 'outline' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
};

export default function VisitRequests() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const { requests, isLoading, updateStatus, deleteRequest } = useVisitRequests(statusFilter);

  const filteredRequests = requests?.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.first_name.toLowerCase().includes(query) ||
      request.last_name.toLowerCase().includes(query) ||
      request.request_number.toLowerCase().includes(query) ||
      request.phone?.toLowerCase().includes(query) ||
      request.email?.toLowerCase().includes(query) ||
      request.vehicle_registration?.toLowerCase().includes(query)
    );
  });

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;

  const handleViewDetails = (request: VisitRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = (status: string) => {
    if (!selectedRequest) return;
    updateStatus.mutate({ 
      id: selectedRequest.id, 
      status,
      admin_notes: adminNotes 
    });
    setShowDetailDialog(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this request?')) {
      deleteRequest.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visit Requests</h1>
          <p className="text-muted-foreground">Manage online visit and quote requests from customers</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filteredRequests && filteredRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Preferred Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.request_number}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.first_name} {request.last_name}</p>
                        <p className="text-sm text-muted-foreground">{request.phone || request.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{REQUEST_TYPE_LABELS[request.request_type] || request.request_type}</TableCell>
                    <TableCell>
                      {request.preferred_date ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(request.preferred_date), 'MMM d, yyyy')}
                          {request.preferred_time_slot && (
                            <span className="text-muted-foreground">• {request.preferred_time_slot}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_CONFIG[request.status]?.variant || 'secondary'}>
                        {STATUS_CONFIG[request.status]?.label || request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(request.created_at), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(request)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(request.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No visit requests found</p>
              <p className="text-sm text-muted-foreground/70">
                Requests submitted by customers will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Visit Request Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                  {selectedRequest.phone && (
                    <p className="text-sm flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {selectedRequest.phone}
                    </p>
                  )}
                  {selectedRequest.email && (
                    <p className="text-sm flex items-center gap-2">
                      <Mail className="w-3 h-3" /> {selectedRequest.email}
                    </p>
                  )}
                  {selectedRequest.id_number && (
                    <p className="text-sm text-muted-foreground">ID: {selectedRequest.id_number}</p>
                  )}
                </div>
              </div>

              {/* Request Type */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Request Type</h4>
                <Badge variant="outline">{REQUEST_TYPE_LABELS[selectedRequest.request_type] || selectedRequest.request_type}</Badge>
              </div>

              {/* Vehicle Info */}
              {(selectedRequest.vehicle_registration || selectedRequest.vehicle_make) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Vehicle</h4>
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    {selectedRequest.vehicle_registration && (
                      <p className="font-mono">{selectedRequest.vehicle_registration}</p>
                    )}
                    {selectedRequest.vehicle_make && (
                      <p className="text-sm">
                        {selectedRequest.vehicle_make} {selectedRequest.vehicle_model} {selectedRequest.vehicle_year}
                        {selectedRequest.vehicle_color && ` • ${selectedRequest.vehicle_color}`}
                      </p>
                    )}
                    {selectedRequest.damage_description && (
                      <p className="text-sm text-muted-foreground mt-2">{selectedRequest.damage_description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preferred Time */}
              {(selectedRequest.preferred_date || selectedRequest.preferred_time_slot) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Preferred Visit Time</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    {selectedRequest.preferred_date && format(new Date(selectedRequest.preferred_date), 'MMMM d, yyyy')}
                    {selectedRequest.preferred_time_slot && ` at ${selectedRequest.preferred_time_slot}`}
                  </div>
                </div>
              )}

              {/* Message */}
              {selectedRequest.message && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                  <p className="text-sm p-3 bg-muted rounded-lg">{selectedRequest.message}</p>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this request..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <div className="flex gap-2 flex-1">
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleUpdateStatus('cancelled')}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => handleUpdateStatus('confirmed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Confirm
                  </Button>
                </>
              )}
              {selectedRequest?.status === 'confirmed' && (
                <Button 
                  className="flex-1"
                  onClick={() => handleUpdateStatus('completed')}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
