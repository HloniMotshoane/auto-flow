import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Plus, Trash2, Save } from "lucide-react";
import { TowingRecord } from "@/hooks/useTowingRecords";
import { useTowingInvoices } from "@/hooks/useTowingInvoices";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useBranches } from "@/hooks/useBranches";
import { format } from "date-fns";

interface TowCostTabProps {
  record: TowingRecord;
}

export default function TowCostTab({ record }: TowCostTabProps) {
  const { invoices, createInvoice, deleteInvoice } = useTowingInvoices(record.id);
  const { suppliers } = useSuppliers();
  const { data: branches } = useBranches();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    branch_id: "",
    destination: "",
    vat_type: "vat" as "vat" | "non_vat",
    supplier_id: "",
    invoice_date: "",
    description: "",
    invoice_number: "",
    sub_total: 0,
    vat_percentage: 15,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedAmount = formData.vat_type === "vat"
    ? formData.sub_total * (1 + formData.vat_percentage / 100)
    : formData.sub_total;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createInvoice.mutateAsync({
        ...formData,
        branch_id: formData.branch_id || null,
        supplier_id: formData.supplier_id || null,
        amount: calculatedAmount,
      });
      // Reset form
      setFormData({
        branch_id: "",
        destination: "",
        vat_type: "vat",
        supplier_id: "",
        invoice_date: "",
        description: "",
        invoice_number: "",
        sub_total: 0,
        vat_percentage: 15,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoice Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Towing Invoice Capture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Click to upload invoice document</p>
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Invoice Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                value={formData.branch_id}
                onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches?.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Destination</Label>
              <Input
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Enter destination"
              />
            </div>
            <div className="space-y-2">
              <Label>VAT Type</Label>
              <Select
                value={formData.vat_type}
                onValueChange={(value: "vat" | "non_vat") => setFormData({ ...formData, vat_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vat">VAT</SelectItem>
                  <SelectItem value="non_vat">Non-VAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.supplier_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Input
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                placeholder="Enter invoice number"
              />
            </div>
            <div className="space-y-2">
              <Label>Sub Total</Label>
              <Input
                type="number"
                value={formData.sub_total}
                onChange={(e) => setFormData({ ...formData, sub_total: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {formData.vat_type === "vat" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>VAT %</Label>
                <Input
                  type="number"
                  value={formData.vat_percentage}
                  onChange={(e) => setFormData({ ...formData, vat_percentage: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount (incl. VAT)</Label>
                <Input
                  type="number"
                  value={calculatedAmount.toFixed(2)}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              <Plus className="h-4 w-4" />
              {isSubmitting ? "Adding..." : "Add Invoice"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Captured Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {invoice.invoice_date ? format(new Date(invoice.invoice_date), "dd/MM/yyyy") : "-"}
                    </TableCell>
                    <TableCell>{invoice.invoice_number || "-"}</TableCell>
                    <TableCell>{invoice.description || "-"}</TableCell>
                    <TableCell>{invoice.supplier?.supplier_name || "-"}</TableCell>
                    <TableCell className="text-right">
                      R {(invoice.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteInvoice.mutate(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
