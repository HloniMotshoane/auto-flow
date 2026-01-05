import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useActiveAssessors, useAssessorMutations } from "@/hooks/useAssessors";
import { useUserTenant } from "@/hooks/useUserTenant";
import { IntakeFormData } from "@/pages/CreateQuotation";
import { toast } from "sonner";

interface InsuranceDetailsCardProps {
  formData: IntakeFormData;
  errors: Partial<Record<keyof IntakeFormData, string>>;
  updateField: (field: keyof IntakeFormData, value: string | boolean) => void;
}

export function InsuranceDetailsCard({ formData, errors, updateField }: InsuranceDetailsCardProps) {
  const { organizationId } = useOrganization();
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();
  const { data: assessors = [] } = useActiveAssessors();
  const { createMutation: createAssessorMutation } = useAssessorMutations();
  
  const [createInsurerOpen, setCreateInsurerOpen] = useState(false);
  const [newInsurerName, setNewInsurerName] = useState("");
  const [createAssessorOpen, setCreateAssessorOpen] = useState(false);
  const [newAssessorFirstName, setNewAssessorFirstName] = useState("");
  const [newAssessorLastName, setNewAssessorLastName] = useState("");

  const { data: insurers = [] } = useQuery({
    queryKey: ["insurance-companies", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_companies")
        .select("id, name, email")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!organizationId,
  });

  const createInsurerMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!organizationId) throw new Error("Organization not found");
      const { data, error } = await supabase
        .from("insurance_companies")
        .insert({ name, organization_id: organizationId })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["insurance-companies"] });
      updateField("insurerId", data.id);
      setCreateInsurerOpen(false);
      setNewInsurerName("");
      toast.success("Insurer created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create insurer: ${error.message}`);
    },
  });

  const handleCreateInsurer = () => {
    if (!newInsurerName.trim()) {
      toast.error("Please enter an insurer name");
      return;
    }
    createInsurerMutation.mutate(newInsurerName);
  };

  const handleInsurerChange = (insurerId: string) => {
    updateField("insurerId", insurerId);
    const insurer = insurers.find(i => i.id === insurerId);
    if (insurer?.email) {
      updateField("insuranceEmail", insurer.email);
    }
  };

  const handleAssessorChange = (assessorId: string) => {
    updateField("assessorId", assessorId);
    const assessor = assessors.find(e => e.id === assessorId);
    if (assessor) {
      updateField("assessorEmail", assessor.email || "");
      updateField("assessorPhone", assessor.phone || assessor.cell_number || "");
      updateField("assessorCompany", assessor.company || "");
    }
  };

  const handleCreateAssessor = () => {
    if (!newAssessorFirstName.trim() || !newAssessorLastName.trim()) {
      toast.error("Please enter first and last name");
      return;
    }
    createAssessorMutation.mutate(
      { first_name: newAssessorFirstName, last_name: newAssessorLastName },
      {
        onSuccess: (data) => {
          updateField("assessorId", data.id);
          setCreateAssessorOpen(false);
          setNewAssessorFirstName("");
          setNewAssessorLastName("");
        }
      }
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Insurance Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm">Insurance Type</Label>
          <Select value={formData.insuranceType} onValueChange={(v) => updateField("insuranceType", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="broker">Broker</SelectItem>
              <SelectItem value="dealership">Dealership</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Select Insurer</Label>
            <Dialog open={createInsurerOpen} onOpenChange={setCreateInsurerOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Insurer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Insurer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Insurer Name</Label>
                    <Input
                      value={newInsurerName}
                      onChange={(e) => setNewInsurerName(e.target.value)}
                      placeholder="Enter insurer name"
                    />
                  </div>
                  <Button onClick={handleCreateInsurer} disabled={createInsurerMutation.isPending}>
                    {createInsurerMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Select value={formData.insurerId} onValueChange={handleInsurerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select insurer" />
            </SelectTrigger>
            <SelectContent>
              {insurers.map((insurer) => (
                <SelectItem key={insurer.id} value={insurer.id}>
                  {insurer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="insuranceNumber" className="text-sm">Insurance Number</Label>
          <Input
            id="insuranceNumber"
            value={formData.insuranceNumber}
            onChange={(e) => updateField("insuranceNumber", e.target.value)}
            placeholder="POL-123456"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="insuranceEmail" className="text-sm">Insurance Email</Label>
          <Input
            id="insuranceEmail"
            type="email"
            value={formData.insuranceEmail}
            onChange={(e) => updateField("insuranceEmail", e.target.value)}
            placeholder="claims@insurer.co.za"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="claimNumber" className="text-sm">Claim Number</Label>
          <Input
            id="claimNumber"
            value={formData.claimNumber}
            onChange={(e) => updateField("claimNumber", e.target.value)}
            placeholder="CLM-2024-001"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clerkReference" className="text-sm">Clerk Reference</Label>
          <Input
            id="clerkReference"
            value={formData.clerkReference}
            onChange={(e) => updateField("clerkReference", e.target.value)}
            placeholder="REF-001"
          />
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="font-medium text-sm">Assessor Information</h4>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Select Assessor</Label>
              <Dialog open={createAssessorOpen} onOpenChange={setCreateAssessorOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Assessor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Assessor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={newAssessorFirstName}
                        onChange={(e) => setNewAssessorFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={newAssessorLastName}
                        onChange={(e) => setNewAssessorLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                    <Button onClick={handleCreateAssessor} disabled={createAssessorMutation.isPending}>
                      {createAssessorMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Select value={formData.assessorId} onValueChange={handleAssessorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select assessor" />
              </SelectTrigger>
              <SelectContent>
                {assessors.map((assessor) => (
                  <SelectItem key={assessor.id} value={assessor.id}>
                    {assessor.first_name} {assessor.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assessorEmail" className="text-sm">Assessor Email</Label>
            <Input
              id="assessorEmail"
              type="email"
              value={formData.assessorEmail}
              onChange={(e) => updateField("assessorEmail", e.target.value)}
              placeholder="assessor@company.co.za"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assessorPhone" className="text-sm">Assessor Number</Label>
            <Input
              id="assessorPhone"
              value={formData.assessorPhone}
              onChange={(e) => updateField("assessorPhone", e.target.value)}
              placeholder="0821234567"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="assessorCompany" className="text-sm">Assessor Company</Label>
            <Input
              id="assessorCompany"
              value={formData.assessorCompany}
              onChange={(e) => updateField("assessorCompany", e.target.value)}
              placeholder="Assessment Co."
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Warranty Status</Label>
            <Select value={formData.warrantyStatus} onValueChange={(v) => updateField("warrantyStatus", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="warranty">Warranty</SelectItem>
                <SelectItem value="out_of_warranty">Out of Warranty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Condition Status</Label>
            <Select value={formData.conditionStatus} onValueChange={(v) => updateField("conditionStatus", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="structural">Structural</SelectItem>
                <SelectItem value="non_structural">Non-Structural</SelectItem>
                <SelectItem value="cosmetic_only">Cosmetic Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
