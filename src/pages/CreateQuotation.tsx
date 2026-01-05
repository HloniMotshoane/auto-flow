import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/hooks/useOrganization";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Save, UserSearch } from "lucide-react";
import { ClientDetailsCard } from "@/components/intake/ClientDetailsCard";
import { VehicleDetailsCard } from "@/components/intake/VehicleDetailsCard";
import { InsuranceDetailsCard } from "@/components/intake/InsuranceDetailsCard";
import { TowDetailsCard } from "@/components/intake/TowDetailsCard";
import { ReturningClientDialog } from "@/components/intake/ReturningClientDialog";

export interface IntakeFormData {
  // Client details
  firstName: string;
  lastName: string;
  idNumber: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  streetAddress: string;
  suburb: string;
  city: string;
  estimatorId: string;
  branchId: string;
  
  // Vehicle details
  registration: string;
  vin: string;
  engineNumber: string;
  make: string;
  model: string;
  color: string;
  year: string;
  odometer: string;
  bookingDate: string;
  quoteDate: string;
  
  // Insurance details
  insuranceType: string;
  insurerId: string;
  insuranceNumber: string;
  insuranceEmail: string;
  claimNumber: string;
  clerkReference: string;
  assessorId: string;
  assessorEmail: string;
  assessorPhone: string;
  assessorCompany: string;
  warrantyStatus: string;
  conditionStatus: string;
  
  // Tow details
  wasTowed: boolean;
  towedBy: string;
  towContactNumber: string;
  towEmail: string;
  towFee: string;
}

const initialFormData: IntakeFormData = {
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
  registration: "",
  vin: "",
  engineNumber: "",
  make: "",
  model: "",
  color: "",
  year: "",
  odometer: "",
  bookingDate: new Date().toISOString().split("T")[0],
  quoteDate: new Date().toISOString().split("T")[0],
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
  wasTowed: false,
  towedBy: "",
  towContactNumber: "",
  towEmail: "",
  towFee: "0",
};

export default function CreateQuotation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const { tenantId } = useUserTenant();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<IntakeFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeFormData, string>>>({});
  const [returningClientOpen, setReturningClientOpen] = useState(false);
  const [existingCustomerId, setExistingCustomerId] = useState<string | null>(null);

  const updateField = (field: keyof IntakeFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof IntakeFormData, string>> = {};
    
    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    
    // Phone validation (SA format)
    const phoneRegex = /^(\+27|0)[0-9]{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Invalid SA phone number format";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    
    // Date of birth validation
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = "Date of birth cannot be in the future";
    }
    
    // Odometer validation
    if (formData.odometer && isNaN(Number(formData.odometer))) {
      newErrors.odometer = "Odometer must be a number";
    }
    
    // Year validation
    const currentYear = new Date().getFullYear();
    if (formData.year) {
      const yearNum = parseInt(formData.year);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear) {
        newErrors.year = `Year must be between 1900 and ${currentYear}`;
      }
    }
    
    // VIN validation (17 characters if provided)
    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = "VIN must be exactly 17 characters";
    }
    
    // Tow fields required if towed
    if (formData.wasTowed) {
      if (!formData.towedBy.trim()) newErrors.towedBy = "Tow company is required";
      if (!formData.towContactNumber.trim()) newErrors.towContactNumber = "Tow contact is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateQuoteNumber = () => `QT-${Date.now().toString(36).toUpperCase()}`;

  const createIntakeMutation = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organization not found");
      if (!tenantId) throw new Error("Tenant not found");

      // 1. Create or update customer
      const customerData = {
        organization_id: organizationId,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        first_name: formData.firstName,
        last_name: formData.lastName,
        id_number: formData.idNumber || null,
        date_of_birth: formData.dateOfBirth || null,
        phone: formData.phone,
        email: formData.email || null,
        address: formData.streetAddress || null,
        suburb: formData.suburb || null,
        city: formData.city || null,
        estimator_id: formData.estimatorId || null,
        branch_id: formData.branchId || null,
      };

      let customerId = existingCustomerId;
      
      if (existingCustomerId) {
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", existingCustomerId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("customers")
          .insert(customerData)
          .select("id")
          .single();
        if (error) throw error;
        customerId = data.id;
      }

      // 2. Create vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from("vehicles")
        .insert({
          organization_id: organizationId,
          customer_id: customerId,
          registration: formData.registration || null,
          vin: formData.vin || null,
          engine_number: formData.engineNumber || null,
          make: formData.make || "Unknown",
          model: formData.model || "Unknown",
          color: formData.color || null,
          year: formData.year ? parseInt(formData.year) : null,
          odometer: formData.odometer ? parseInt(formData.odometer) : null,
          booking_date: formData.bookingDate || null,
          quote_date: formData.quoteDate || null,
          tenant_id: tenantId,
        })
        .select("id")
        .single();
      if (vehicleError) throw vehicleError;

      // 3. Generate case number
      const { data: caseNumberData, error: caseNumberError } = await supabase
        .rpc("generate_case_number", { p_tenant_id: tenantId });
      if (caseNumberError) throw caseNumberError;

      // 4. Create case
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .insert({
          tenant_id: tenantId,
          case_number: caseNumberData,
          customer_id: customerId,
          vehicle_id: vehicleData.id,
          insurance_company_id: formData.insurerId || null,
          insurance_type: formData.insuranceType,
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
        .select("id")
        .single();
      if (caseError) throw caseError;

      // 5. Create quotation shell
      const quoteNumber = generateQuoteNumber();
      const { data: quotationData, error: quotationError } = await supabase
        .from("quotations")
        .insert({
          organization_id: organizationId,
          quote_number: quoteNumber,
          customer_id: customerId,
          vehicle_id: vehicleData.id,
          case_id: caseData.id,
          claim_number: formData.claimNumber || null,
          status: "draft",
          created_by: user?.id,
        })
        .select("id")
        .single();
      if (quotationError) throw quotationError;

      // 6. Notify estimators about new quote
      const customerName = `${formData.firstName} ${formData.lastName}`.trim();
      const vehicleDetails = [formData.make, formData.model, formData.year].filter(Boolean).join(" ") || "Unknown Vehicle";
      
      try {
        await supabase.functions.invoke("notify-estimators-new-quote", {
          body: {
            quotationId: quotationData.id,
            quoteNumber,
            customerName,
            vehicleDetails,
            caseNumber: caseNumberData,
          },
        });
        console.log("Estimator notification sent successfully");
      } catch (notifyError) {
        console.error("Failed to notify estimators:", notifyError);
        // Don't throw - notification failure shouldn't block quote creation
      }

      return { quotationId: quotationData.id, caseId: caseData.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Intake created successfully");
      navigate(`/quotations/${data.quotationId}`);
    },
    onError: (error) => {
      console.error("Intake creation error:", error);
      toast.error(`Failed to create intake: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }
    createIntakeMutation.mutate();
  };

  const handleSelectReturningClient = (customer: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    name: string | null;
    id_number: string | null;
    date_of_birth: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    suburb: string | null;
    city: string | null;
    estimator_id: string | null;
    branch_id: string | null;
  }) => {
    setExistingCustomerId(customer.id);
    setFormData(prev => ({
      ...prev,
      firstName: customer.first_name || customer.name?.split(" ")[0] || "",
      lastName: customer.last_name || customer.name?.split(" ").slice(1).join(" ") || "",
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
    setReturningClientOpen(false);
    toast.success("Client data loaded");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/quotations")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Client & Vehicle Intake</h1>
            <p className="text-muted-foreground">Enter client and vehicle details to create a new quotation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setReturningClientOpen(true)}>
            <UserSearch className="h-4 w-4 mr-2" />
            Returning Client
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={createIntakeMutation.isPending}
            className="gradient-primary text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {createIntakeMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Form Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
        />
      </div>

      {/* Returning Client Dialog */}
      <ReturningClientDialog
        open={returningClientOpen}
        onOpenChange={setReturningClientOpen}
        onSelect={handleSelectReturningClient}
      />
    </div>
  );
}
