import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload } from "lucide-react";
import { useTowingRecords } from "@/hooks/useTowingRecords";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserTenant } from "@/hooks/useUserTenant";

export default function TowingUpliftmentForm() {
  const navigate = useNavigate();
  const { createRecord } = useTowingRecords();
  const { suppliers } = useSuppliers();
  const { tenantId } = useUserTenant();

  const { data: insuranceCompanies } = useQuery({
    queryKey: ["insurance-companies"],
    queryFn: async () => {
      const { data } = await supabase.from("insurance_companies").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const [formData, setFormData] = useState({
    client_first_name: "",
    client_last_name: "",
    client_phone: "",
    client_email: "",
    registration_number: "",
    vin: "",
    make: "",
    model: "",
    odometer: "",
    tow_company_id: "",
    insurance_company_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRecord.mutateAsync({
        ...formData,
        tow_type: "upliftment",
        tow_company_id: formData.tow_company_id || null,
        insurance_company_id: formData.insurance_company_id || null,
      });
      navigate("/towing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/towing")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Upload className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">New Upliftment</h1>
            <p className="text-sm text-muted-foreground">Create a new upliftment towing record</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_first_name">First Name</Label>
              <Input
                id="client_first_name"
                value={formData.client_first_name}
                onChange={(e) => setFormData({ ...formData, client_first_name: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_last_name">Last Name</Label>
              <Input
                id="client_last_name"
                value={formData.client_last_name}
                onChange={(e) => setFormData({ ...formData, client_last_name: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_phone">Phone</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                placeholder="Enter registration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                placeholder="Enter VIN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Enter make"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Enter model"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="odometer">Odometer</Label>
              <Input
                id="odometer"
                value={formData.odometer}
                onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                placeholder="Enter odometer reading"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tow & Insurance */}
        <Card>
          <CardHeader>
            <CardTitle>Tow & Insurance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tow Company</Label>
              <Select
                value={formData.tow_company_id}
                onValueChange={(value) => setFormData({ ...formData, tow_company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tow company" />
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
            <div className="space-y-2">
              <Label>Insurance Company</Label>
              <Select
                value={formData.insurance_company_id}
                onValueChange={(value) => setFormData({ ...formData, insurance_company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select insurance company" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceCompanies?.map((ic) => (
                    <SelectItem key={ic.id} value={ic.id}>
                      {ic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Upload Images */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You can upload images after creating the tow record
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Car License Image</p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Client Images</p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Tow Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/towing")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Tow"}
          </Button>
        </div>
      </form>
    </div>
  );
}
