import { useState } from "react";
import { useSuppliers, Supplier, SUPPLIER_TYPES, SERVICE_CATEGORIES } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Pencil, Trash2, Building2, Phone, Mail, Send, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Suppliers() {
  const { suppliers, isLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rfqDialogOpen, setRfqDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    delivery_time_estimate: "",
    notes: "",
    is_active: true,
    supplier_type: "parts",
    service_categories: [] as string[],
  });
  const [rfqData, setRfqData] = useState({
    subject: "",
    items: "",
    notes: "",
  });

  const filteredSuppliers = suppliers.filter(s =>
    s.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        supplier_name: supplier.supplier_name,
        contact_person: supplier.contact_person || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        delivery_time_estimate: supplier.delivery_time_estimate?.toString() || "",
        notes: supplier.notes || "",
        is_active: supplier.is_active ?? true,
        supplier_type: supplier.supplier_type || "parts",
        service_categories: supplier.service_categories || [],
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        supplier_name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        delivery_time_estimate: "",
        notes: "",
        is_active: true,
        supplier_type: "parts",
        service_categories: [],
      });
    }
    setDialogOpen(true);
  };

  const handleOpenRfqDialog = (supplier: Supplier) => {
    if (!supplier.email) {
      toast({ title: "Error", description: "Supplier has no email address configured", variant: "destructive" });
      return;
    }
    setSelectedSupplier(supplier);
    setRfqData({
      subject: `Request for Quotation - ${new Date().toLocaleDateString()}`,
      items: "",
      notes: "",
    });
    setRfqDialogOpen(true);
  };

  const handleSendRfq = () => {
    if (!selectedSupplier?.email) return;
    if (!rfqData.items.trim()) {
      toast({ title: "Error", description: "Please enter items to quote", variant: "destructive" });
      return;
    }

    // Construct mailto link with RFQ details
    const body = `Dear ${selectedSupplier.contact_person || selectedSupplier.supplier_name},

We would like to request a quotation for the following items:

${rfqData.items}

${rfqData.notes ? `Additional Notes:\n${rfqData.notes}\n` : ""}
Please provide pricing, availability, and estimated delivery times.

Thank you.`;

    const mailtoLink = `mailto:${selectedSupplier.email}?subject=${encodeURIComponent(rfqData.subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, "_blank");
    
    toast({ title: "Success", description: "RFQ email opened in your email client" });
    setRfqDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!formData.supplier_name.trim()) {
      toast({ title: "Error", description: "Supplier name is required", variant: "destructive" });
      return;
    }

    const payload = {
      supplier_name: formData.supplier_name,
      contact_person: formData.contact_person || null,
      email: formData.email || null,
      phone: formData.phone || null,
      address: formData.address || null,
      delivery_time_estimate: formData.delivery_time_estimate ? parseInt(formData.delivery_time_estimate) : null,
      notes: formData.notes || null,
      is_active: formData.is_active,
      supplier_type: formData.supplier_type,
      service_categories: formData.service_categories,
    };

    if (editingSupplier) {
      updateSupplier.mutate({ id: editingSupplier.id, ...payload }, {
        onSuccess: () => setDialogOpen(false),
      });
    } else {
      createSupplier.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDelete = (supplier: Supplier) => {
    if (confirm(`Are you sure you want to delete ${supplier.supplier_name}?`)) {
      deleteSupplier.mutate(supplier.id);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      service_categories: prev.service_categories.includes(category)
        ? prev.service_categories.filter(c => c !== category)
        : [...prev.service_categories, category],
    }));
  };

  const getSupplierTypeLabel = (type: string | null) => {
    return SUPPLIER_TYPES.find(t => t.value === type)?.label || type || "Parts Supplier";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Manage your parts and service suppliers</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Suppliers ({filteredSuppliers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{supplier.supplier_name}</span>
                        {supplier.service_categories && supplier.service_categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {supplier.service_categories.slice(0, 2).map(cat => (
                              <Badge key={cat} variant="outline" className="text-xs">
                                {SERVICE_CATEGORIES.find(c => c.value === cat)?.label || cat}
                              </Badge>
                            ))}
                            {supplier.service_categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{supplier.service_categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getSupplierTypeLabel(supplier.supplier_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{supplier.contact_person || "-"}</TableCell>
                  <TableCell>
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3" />
                        {supplier.email}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="w-3 h-3" />
                        {supplier.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={supplier.is_active ? "default" : "secondary"}>
                      {supplier.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenRfqDialog(supplier)}
                        title="Send RFQ"
                      >
                        <FileText className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(supplier)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No suppliers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Supplier Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="supplier_name">Supplier Name *</Label>
                <Input
                  id="supplier_name"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  placeholder="e.g., AutoParts Express"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier_type">Supplier Type</Label>
                <Select
                  value={formData.supplier_type}
                  onValueChange={(value) => setFormData({ ...formData, supplier_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPLIER_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Service Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md bg-muted/30">
                {SERVICE_CATEGORIES.map(category => (
                  <div key={category.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.value}
                      checked={formData.service_categories.includes(category.value)}
                      onCheckedChange={() => handleCategoryToggle(category.value)}
                    />
                    <label
                      htmlFor={category.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="delivery_time_estimate">Delivery Time Estimate (days)</Label>
              <Input
                id="delivery_time_estimate"
                type="number"
                value={formData.delivery_time_estimate}
                onChange={(e) => setFormData({ ...formData, delivery_time_estimate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createSupplier.isPending || updateSupplier.isPending}
            >
              {editingSupplier ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RFQ Dialog */}
      <Dialog open={rfqDialogOpen} onOpenChange={setRfqDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send RFQ to {selectedSupplier?.supplier_name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="rfq_subject">Subject</Label>
              <Input
                id="rfq_subject"
                value={rfqData.subject}
                onChange={(e) => setRfqData({ ...rfqData, subject: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq_items">Items to Quote *</Label>
              <Textarea
                id="rfq_items"
                value={rfqData.items}
                onChange={(e) => setRfqData({ ...rfqData, items: e.target.value })}
                placeholder="Enter parts/items you need pricing for (one per line)&#10;e.g.,&#10;- Front bumper for Toyota Corolla 2020&#10;- Headlight assembly LH&#10;- Radiator grille"
                rows={6}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rfq_notes">Additional Notes</Label>
              <Textarea
                id="rfq_notes"
                value={rfqData.notes}
                onChange={(e) => setRfqData({ ...rfqData, notes: e.target.value })}
                placeholder="Any special requirements, urgency, etc."
                rows={2}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              This will open your email client with the RFQ pre-filled. The email will be sent to: <strong>{selectedSupplier?.email}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRfqDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendRfq}>
              <Send className="w-4 h-4 mr-2" />
              Send RFQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}