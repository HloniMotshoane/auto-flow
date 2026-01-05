import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, UserSearch } from "lucide-react";
import { toast } from "sonner";
import { ClientDetailsCard } from "@/components/intake/ClientDetailsCard";
import { VehicleDetailsCard } from "@/components/intake/VehicleDetailsCard";
import { InsuranceDetailsCard } from "@/components/intake/InsuranceDetailsCard";
import { TowDetailsCard } from "@/components/intake/TowDetailsCard";
import { ReturningClientDialog } from "@/components/intake/ReturningClientDialog";
import { IntakeFormData } from "@/pages/CreateQuotation";

const initialFormData: IntakeFormData = {
  // Client fields
  firstName: "",
  lastName: "",
  idNumber: "",
  dateOfBirth: "",
  phone: "",
  email: "",
  streetAddress: "",
  suburb: "",
  city: "",
  estimatorId: "",
  branchId: "",
  
  // Vehicle fields
  registration: "",
  vin: "",
  engineNumber: "",
  make: "",
  model: "",
  odometer: "",
  color: "",
  year: "",
  bookingDate: new Date().toISOString().split("T")[0],
  quoteDate: new Date().toISOString().split("T")[0],
  
  // Insurance fields
  insuranceType: "private",
  insurerId: "",
  insuranceNumber: "",
  insuranceEmail: "",
  claimNumber: "",
  clerkReference: "",
  assessorId: "",
  assessorEmail: "",
  assessorPhone: "",
  assessorCompany: "",
  warrantyStatus: "out_of_warranty",
  conditionStatus: "non_structural",
  
  // Tow fields
  wasTowed: false,
  towedBy: "",
  towContactNumber: "",
  towEmail: "",
  towFee: "0",
};

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<IntakeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeFormData, string>>>({});
  const [selectedIntakeId, setSelectedIntakeId] = useState<string | null>(null);
  const [returningClientOpen, setReturningClientOpen] = useState(false);

  // Fetch existing customer if editing
  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Populate form when customer data is loaded
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        firstName: customer.first_name || "",
        lastName: customer.last_name || "",
        idNumber: customer.id_number || "",
        dateOfBirth: customer.date_of_birth || "",
        phone: customer.phone || "",
        email: customer.email || "",
        streetAddress: customer.address || "",
        suburb: customer.suburb || "",
        city: customer.city || "",
        estimatorId: customer.estimator_id || "",
        branchId: customer.branch_id || "",
      }));
    }
  }, [customer]);

  const updateField = (field: keyof IntakeFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IntakeFormData, string>> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.make) newErrors.make = "Make is required";
    if (!formData.model) newErrors.model = "Model is required";
    
    if (formData.wasTowed) {
      if (!formData.towedBy.trim()) newErrors.towedBy = "Tow company is required";
      if (!formData.towContactNumber.trim()) newErrors.towContactNumber = "Contact number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createIntakeMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organization not found");

      // 1. Create customer
      const customerName = `${formData.firstName} ${formData.lastName}`.trim();
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .insert({
          organization_id: organizationId,
          name: customerName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          id_number: formData.idNumber || null,
          date_of_birth: formData.dateOfBirth || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.streetAddress || null,
          suburb: formData.suburb || null,
          city: formData.city || null,
          estimator_id: formData.estimatorId || null,
          branch_id: formData.branchId || null,
          customer_type: "individual",
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. Create vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          organization_id: organizationId,
          tenant_id: tenantId,
          customer_id: customerData.id,
          registration: formData.registration || null,
          vin: formData.vin || null,
          engine_number: formData.engineNumber || null,
          make: formData.make,
          model: formData.model,
          odometer: formData.odometer ? parseInt(formData.odometer) : null,
          color: formData.color || null,
          year: formData.year ? parseInt(formData.year) : null,
          booking_date: formData.bookingDate || null,
          quote_date: formData.quoteDate || null,
        })
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // 3. Create case (linked to intake if selected)
      const { data: caseNumber } = await supabase.rpc("generate_case_number", {
        p_tenant_id: tenantId,
      });

      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .insert({
          tenant_id: tenantId!,
          case_number: caseNumber || `CASE-${Date.now()}`,
          customer_id: customerData.id,
          vehicle_id: vehicleData.id,
          intake_id: selectedIntakeId || null,
          insurance_type: formData.insuranceType,
          insurance_company_id: formData.insurerId || null,
          insurance_number: formData.insuranceNumber || null,
          insurance_email: formData.insuranceEmail || null,
          claim_reference: formData.claimNumber || null,
          clerk_reference: formData.clerkReference || null,
          assessor_id: formData.assessorId || null,
          assessor_email: formData.assessorEmail || null,
          assessor_phone: formData.assessorPhone || null,
          assessor_company: formData.assessorCompany || null,
          warranty_status: formData.warrantyStatus,
          condition_status: formData.conditionStatus,
          was_towed: formData.wasTowed,
          tow_company: formData.towedBy || null,
          tow_contact_number: formData.towContactNumber || null,
          tow_email: formData.towEmail || null,
          tow_fee: formData.towFee ? parseFloat(formData.towFee) : 0,
          status: "awaiting_reception",
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // 4. Create quotation shell
      const quoteNumber = `Q-${Date.now()}`;
      const { data: quotationData, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          organization_id: organizationId,
          quote_number: quoteNumber,
          customer_id: customerData.id,
          vehicle_id: vehicleData.id,
          case_id: caseData.id,
          claim_number: formData.claimNumber || null,
          status: "draft",
        })
        .select()
        .single();

      if (quotationError) throw quotationError;

      // 5. Update intake status if linked
      if (selectedIntakeId) {
        await supabase
          .from("vehicle_intakes")
          .update({ status: "completed" })
          .eq("id", selectedIntakeId);
      }

      return { customer: customerData, vehicle: vehicleData, case: caseData, quotation: quotationData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["pending-intakes"] });
      toast.success("Customer intake created successfully");
      navigate(`/quotations/${data.quotation.id}`);
    },
    onError: (error) => {
      console.error("Intake creation error:", error);
      toast.error(error.message || "Failed to create intake");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const customerName = `${formData.firstName} ${formData.lastName}`.trim();
      const { error } = await supabase
        .from("customers")
        .update({
          name: customerName,
          first_name: formData.firstName,
          last_name: formData.lastName,
          id_number: formData.idNumber || null,
          date_of_birth: formData.dateOfBirth || null,
          phone: formData.phone || null,
          email: formData.email || null,
          address: formData.streetAddress || null,
          suburb: formData.suburb || null,
          city: formData.city || null,
          estimator_id: formData.estimatorId || null,
          branch_id: formData.branchId || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer updated successfully");
      navigate("/customers");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createIntakeMutation.mutate();
    }
  };

  const handleSelectReturningClient = (customer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    suburb: string | null;
    city: string | null;
    id_number: string | null;
    date_of_birth: string | null;
  }) => {
    setFormData(prev => ({
      ...prev,
      firstName: customer.first_name || "",
      lastName: customer.last_name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      streetAddress: customer.address || "",
      suburb: customer.suburb || "",
      city: customer.city || "",
      idNumber: customer.id_number || "",
      dateOfBirth: customer.date_of_birth || "",
    }));
    setReturningClientOpen(false);
    toast.success("Client details loaded");
  };

  if (isEditing && isLoading) {
    return <div className="p-8 text-center">Loading customer...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customers")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Edit Customer" : "New Customer Intake"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update customer information" : "Enter client, vehicle, and insurance details"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setReturningClientOpen(true)}>
              <UserSearch className="h-4 w-4 mr-2" />
              Returning Client
            </Button>
          )}
          <Button
            onClick={() => handleSubmit()}
            disabled={createIntakeMutation.isPending || updateMutation.isPending}
            className="gradient-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update Customer" : "Save Intake"}
          </Button>
        </div>
      </div>

      {/* Required fields indicator */}
      <p className="text-sm text-destructive">* Indicates required fields</p>

      {/* Returning Client Dialog */}
      <ReturningClientDialog
        open={returningClientOpen}
        onOpenChange={setReturningClientOpen}
        onSelect={handleSelectReturningClient}
      />

      {/* Form - 4 Column Grid */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <ClientDetailsCard 
            formData={formData} 
            errors={errors} 
            updateField={updateField} 
          />
          <VehicleDetailsCard 
            formData={formData} 
            errors={errors} 
            updateField={updateField} 
          />
          <InsuranceDetailsCard 
            formData={formData} 
            errors={errors} 
            updateField={updateField} 
          />
          <TowDetailsCard 
            formData={formData} 
            errors={errors} 
            updateField={updateField}
            selectedIntakeId={selectedIntakeId || undefined}
            onIntakeSelect={setSelectedIntakeId}
            showIntakeLinking={!isEditing}
          />
        </div>

        {/* Mobile Save Button */}
        <div className="xl:hidden mt-6">
          <Button
            type="submit"
            className="w-full gradient-primary text-primary-foreground"
            disabled={createIntakeMutation.isPending || updateMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Update Customer" : "Save Intake"}
          </Button>
        </div>
      </form>
    </div>
  );
}
