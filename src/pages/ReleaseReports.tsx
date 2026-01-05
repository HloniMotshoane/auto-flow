import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useReleaseReports } from '@/hooks/useReleaseReports';
import { FileText, Search, Car, CheckCircle, Clock, XCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  ready: { label: 'Ready', icon: CheckCircle, color: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  released: { label: 'Released', icon: Car, color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/20 text-red-600 border-red-500/30' },
};

export default function ReleaseReports() {
  const { releaseReports, isLoading } = useReleaseReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReports = releaseReports.filter((report) => {
    const matchesSearch = report.report_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: releaseReports.filter((r) => r.status === 'pending').length,
    ready: releaseReports.filter((r) => r.status === 'ready').length,
    released: releaseReports.filter((r) => r.status === 'released').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Release Reports</h1>
          <p className="text-muted-foreground">Manage vehicle release documentation</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('pending')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Release</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('ready')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready for Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.ready}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('released')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Released This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{stats.released}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by report number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'ready', 'released'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p>No release reports found</p>
              <p className="text-sm">Reports are generated when jobs are completed</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report #</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => {
                  const StatusIcon = statusConfig[report.status].icon;
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-mono font-medium">{report.report_number}</TableCell>
                      <TableCell>{format(new Date(report.generated_at), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        {report.payment_verified ? (
                          <Badge variant="outline" className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        R {Number(report.total_amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[report.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[report.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.released_at ? format(new Date(report.released_at), 'dd MMM yyyy HH:mm') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
