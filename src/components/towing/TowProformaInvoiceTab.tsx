import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Printer } from "lucide-react";
import { TowingRecord, useTowingRecords } from "@/hooks/useTowingRecords";

interface TowProformaInvoiceTabProps {
  record: TowingRecord;
}

export default function TowProformaInvoiceTab({ record }: TowProformaInvoiceTabProps) {
  const { updateRecord } = useTowingRecords();

  const [formData, setFormData] = useState({
    storage_days: record.storage_days || 0,
    admin_days: record.admin_days || 0,
    security_days: record.security_days || 0,
    car_rate: record.car_rate || 0,
    truck_rate: record.truck_rate || 0,
    security_rate: record.security_rate || 0,
    admin_rate: record.admin_rate || 0,
    towing_fee: record.towing_fee || 0,
    release_fee: record.release_fee || 0,
    discount_percentage: record.discount_percentage || 0,
    payment_status: record.payment_status || "unpaid",
    payment_method: record.payment_method || "",
    invoice_comments: record.invoice_comments || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  // Calculate totals
  const totals = useMemo(() => {
    const storageTotal = formData.storage_days * formData.car_rate;
    const truckTotal = formData.storage_days * formData.truck_rate;
    const adminTotal = formData.admin_days * formData.admin_rate;
    const securityTotal = formData.security_days * formData.security_rate;
    const subtotal = storageTotal + truckTotal + adminTotal + securityTotal + formData.towing_fee + formData.release_fee;
    const discountAmount = subtotal * (formData.discount_percentage / 100);
    const total = subtotal - discountAmount;

    return {
      storageTotal,
      truckTotal,
      adminTotal,
      securityTotal,
      subtotal,
      discountAmount,
      total,
    };
  }, [formData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRecord.mutateAsync({
        id: record.id,
        ...formData,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Daily Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Rates</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Car Rate (per day)</Label>
            <Input
              type="number"
              value={formData.car_rate}
              onChange={(e) => setFormData({ ...formData, car_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Truck Rate (per day)</Label>
            <Input
              type="number"
              value={formData.truck_rate}
              onChange={(e) => setFormData({ ...formData, truck_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Security Rate (per day)</Label>
            <Input
              type="number"
              value={formData.security_rate}
              onChange={(e) => setFormData({ ...formData, security_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Admin Rate (per day)</Label>
            <Input
              type="number"
              value={formData.admin_rate}
              onChange={(e) => setFormData({ ...formData, admin_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Storage Days</Label>
              <Input
                type="number"
                value={formData.storage_days}
                onChange={(e) => setFormData({ ...formData, storage_days: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Days</Label>
              <Input
                type="number"
                value={formData.admin_days}
                onChange={(e) => setFormData({ ...formData, admin_days: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Security Days</Label>
              <Input
                type="number"
                value={formData.security_days}
                onChange={(e) => setFormData({ ...formData, security_days: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Towing Fee</Label>
              <Input
                type="number"
                value={formData.towing_fee}
                onChange={(e) => setFormData({ ...formData, towing_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Release Fee</Label>
              <Input
                type="number"
                value={formData.release_fee}
                onChange={(e) => setFormData({ ...formData, release_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Discount %</Label>
              <Input
                type="number"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Storage ({formData.storage_days} days × R{formData.car_rate})</span>
              <span>R {totals.storageTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Truck ({formData.storage_days} days × R{formData.truck_rate})</span>
              <span>R {totals.truckTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Admin ({formData.admin_days} days × R{formData.admin_rate})</span>
              <span>R {totals.adminTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Security ({formData.security_days} days × R{formData.security_rate})</span>
              <span>R {totals.securityTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Towing Fee</span>
              <span>R {formData.towing_fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Release Fee</span>
              <span>R {formData.release_fee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>R {totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Discount ({formData.discount_percentage}%)</span>
              <span>- R {totals.discountAmount.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>R {totals.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value: "unpaid" | "partial" | "paid") => setFormData({ ...formData, payment_status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Input
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              placeholder="e.g., Cash, EFT, Card"
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.invoice_comments}
            onChange={(e) => setFormData({ ...formData, invoice_comments: e.target.value })}
            placeholder="Add any comments for the invoice..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Invoice"}
        </Button>
      </div>
    </div>
  );
}
