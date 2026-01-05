import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, UserCheck } from "lucide-react";
import { useAssessor, useAssessorMutations } from "@/hooks/useAssessors";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

interface AssessorFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  cell_number: string;
  company: string;
  insurance_company_id: string;
  is_active: boolean;
  notes: string;
}

const initialFormData: AssessorFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  cell_number: "",
  company: "",
  insurance_company_id: "",
  is_active: true,
  notes: "",
};

export default function AssessorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { organizationId } = useOrganization();

  const { data: assessor, isLoading } = useAssessor(id);
  const { createMutation, updateMutation } = useAssessorMutations();

  const [formData, setFormData] = useState<AssessorFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AssessorFormData, string>>>({});

  const { data: insuranceCompanies = [] } = useQuery({
    queryKey: ["insurance-companies", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_companies")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  useEffect(() => {
    if (assessor) {
      setFormData({
        first_name: assessor.first_name || "",
        last_name: assessor.last_name || "",
        email: assessor.email || "",
        phone: assessor.phone || "",
        cell_number: assessor.cell_number || "",
        company: assessor.company || "",
        insurance_company_id: assessor.insurance_company_id || "",
        is_active: assessor.is_active ?? true,
        notes: assessor.notes || "",
      });
    }
  }, [assessor]);

  const updateField = (field: keyof AssessorFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AssessorFormData, string>> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || null,
      phone: formData.phone || null,
      cell_number: formData.cell_number || null,
      company: formData.company || null,
      insurance_company_id: formData.insurance_company_id || null,
      is_active: formData.is_active,
      notes: formData.notes || null,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id, ...payload },
        { onSuccess: () => navigate("/assessors") }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate("/assessors"),
      });
    }
  };

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading assessor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/assessors")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? "Edit Assessor" : "Add Assessor"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update assessor details" : "Create a new assessor contact"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    placeholder="John"
                    className={errors.first_name ? "border-destructive" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-destructive">{errors.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    placeholder="Doe"
                    className={errors.last_name ? "border-destructive" : ""}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-destructive">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="john.doe@company.co.za"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="011 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cell_number">Cell Number</Label>
                  <Input
                    id="cell_number"
                    value={formData.cell_number}
                    onChange={(e) => updateField("cell_number", e.target.value)}
                    placeholder="082 123 4567"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Inactive assessors won't appear in selection lists
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => updateField("is_active", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company & Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Company & Additional Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  placeholder="Assessment Company (Pty) Ltd"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance_company_id">Linked Insurance Company</Label>
                <Select
                  value={formData.insurance_company_id}
                  onValueChange={(v) => updateField("insurance_company_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select insurance company (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {insuranceCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Additional notes about this assessor..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/assessors")}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Save className="mr-2 h-4 w-4" />
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : isEditing
              ? "Save Changes"
              : "Create Assessor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
