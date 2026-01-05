import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, Trash2 } from "lucide-react";
import { TowingRecord, useTowingRecords } from "@/hooks/useTowingRecords";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TowClientVehicleTabProps {
  record: TowingRecord;
}

export default function TowClientVehicleTab({ record }: TowClientVehicleTabProps) {
  const navigate = useNavigate();
  const { updateRecord, deleteRecord } = useTowingRecords();
  const { suppliers } = useSuppliers();

  const { data: insuranceCompanies } = useQuery({
    queryKey: ["insurance-companies"],
    queryFn: async () => {
      const { data } = await supabase.from("insurance_companies").select("*").eq("is_active", true);
      return data || [];
    },
  });

  const [formData, setFormData] = useState({
    tow_type: record.tow_type,
    status: record.status,
    client_first_name: record.client_first_name || "",
    client_last_name: record.client_last_name || "",
    client_type: record.client_type || "individual",
    client_email: record.client_email || "",
    client_phone: record.client_phone || "",
    client_id_number: record.client_id_number || "",
    registration_number: record.registration_number || "",
    vin: record.vin || "",
    make: record.make || "",
    model: record.model || "",
    odometer: record.odometer || "",
    engine_size: record.engine_size || "",
    tow_company_id: record.tow_company_id || "",
    insurance_company_id: record.insurance_company_id || "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRecord.mutateAsync({
        id: record.id,
        ...formData,
        tow_company_id: formData.tow_company_id || null,
        insurance_company_id: formData.insurance_company_id || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteRecord.mutateAsync(record.id);
    navigate("/towing");
  };

  return (
    <div className="space-y-6">
      {/* Tow Type & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Tow Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tow Type</Label>
            <Select
              value={formData.tow_type}
              onValueChange={(value: "upliftment" | "tow_in" | "accident") =>
                setFormData({ ...formData, tow_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upliftment">Upliftment</SelectItem>
                <SelectItem value="tow_in">Tow-In</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "pending" | "in_progress" | "completed" | "written_off") =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="written_off">Written Off</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client Info */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              value={formData.client_first_name}
              onChange={(e) => setFormData({ ...formData, client_first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              value={formData.client_last_name}
              onChange={(e) => setFormData({ ...formData, client_last_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.client_type}
              onValueChange={(value: "individual" | "corporate") => setFormData({ ...formData, client_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>ID Number</Label>
            <Input
              value={formData.client_id_number}
              onChange={(e) => setFormData({ ...formData, client_id_number: e.target.value })}
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
            <Label>Registration</Label>
            <Input
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>VIN</Label>
            <Input
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Make</Label>
            <Input
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Input
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Odometer</Label>
            <Input
              value={formData.odometer}
              onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Engine Size</Label>
            <Input
              value={formData.engine_size}
              onChange={(e) => setFormData({ ...formData, engine_size: e.target.value })}
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

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that permanently affect this tow record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Tow Record
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the tow record
                  and all associated data including documents and images.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
