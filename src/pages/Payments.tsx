import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { usePayments, Payment } from '@/hooks/usePayments';
import { CreditCard, Banknote, Building2, FileText, Plus, Search, Receipt, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const paymentMethodIcons = {
  card: CreditCard,
  eft: Building2,
  cash: Banknote,
  cheque: FileText,
};

const paymentMethodLabels = {
  card: 'Card',
  eft: 'EFT',
  cash: 'Cash',
  cheque: 'Cheque',
};

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  completed: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  failed: 'bg-red-500/20 text-red-600 border-red-500/30',
  refunded: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
};

export default function Payments() {
  const { payments, isLoading, createPayment } = usePayments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');

  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'card' as Payment['payment_method'],
    reference_number: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment.mutateAsync({
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method,
      payment_date: new Date().toISOString(),
      reference_number: formData.reference_number || null,
      notes: formData.notes || null,
      job_id: null,
      case_id: null,
      customer_id: null,
      received_by: null,
      receipt_number: null,
      status: 'completed',
    });
    setFormData({ amount: '', payment_method: 'card', reference_number: '', notes: '' });
    setIsDialogOpen(false);
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || payment.payment_method === filterMethod;
    return matchesSearch && matchesMethod;
  });

  const totalToday = payments
    .filter((p) => format(new Date(p.payment_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalThisMonth = payments
    .filter((p) => format(new Date(p.payment_date), 'yyyy-MM') === format(new Date(), 'yyyy-MM'))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage reception payments and receipts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['card', 'eft', 'cash', 'cheque'] as const).map((method) => {
                    const Icon = paymentMethodIcons[method];
                    return (
                      <Button
                        key={method}
                        type="button"
                        variant={formData.payment_method === method ? 'default' : 'outline'}
                        className="flex flex-col items-center gap-1 h-auto py-3"
                        onClick={() => setFormData({ ...formData, payment_method: method })}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{paymentMethodLabels[method]}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                  placeholder="Optional reference"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPayment.isPending}>
                  {createPayment.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">R {totalToday.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">R {totalThisMonth.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{payments.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by receipt or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterMethod} onValueChange={setFilterMethod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="eft">EFT</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Receipt className="h-12 w-12 mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const MethodIcon = paymentMethodIcons[payment.payment_method];
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono font-medium">{payment.receipt_number || '-'}</TableCell>
                      <TableCell>{format(new Date(payment.payment_date), 'dd MMM yyyy HH:mm')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MethodIcon className="h-4 w-4 text-muted-foreground" />
                          {paymentMethodLabels[payment.payment_method]}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference_number || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[payment.status]}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        R {Number(payment.amount).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
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
