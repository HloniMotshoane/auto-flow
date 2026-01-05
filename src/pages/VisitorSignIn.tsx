import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Car, 
  Briefcase, 
  ClipboardCheck, 
  Package, 
  Users, 
  Search, 
  Truck,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  PenTool
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DEFAULT_CATEGORIES = [
  { id: "client-quote", name: "Client – Requesting a Quote", icon: Car, requiresVehicle: true },
  { id: "client-collect", name: "Client – Collecting Vehicle", icon: Car, requiresVehicle: false },
  { id: "assessor", name: "Insurance Assessor / Auditor", icon: ClipboardCheck, requiresCompany: true },
  { id: "supplier", name: "Supplier / Parts Representative", icon: Package, requiresCompany: true },
  { id: "meeting", name: "Meeting with Staff", icon: Users, requiresHost: true },
  { id: "inspection", name: "Site Inspection", icon: Search, requiresCompany: true },
  { id: "delivery", name: "Delivery / Courier", icon: Truck, requiresCompany: true },
  { id: "other", name: "Other", icon: HelpCircle, requiresNotes: true },
];

const HOST_DEPARTMENTS = [
  "Workshop Manager",
  "Estimator",
  "Panel Shop Supervisor",
  "Accounts",
  "Admin",
  "Director",
  "Assessor",
];

interface VisitorForm {
  firstName: string;
  lastName: string;
  idPassport: string;
  phone: string;
  email: string;
  company: string;
  purposeDetails: string;
  hostDepartment: string;
  hostStaffName: string;
  vehicleRegistration: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleReason: string;
  notes: string;
}

export default function VisitorSignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant");
  const tabletId = searchParams.get("tablet") || "ENTRY01";
  
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof DEFAULT_CATEGORIES[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [form, setForm] = useState<VisitorForm>({
    firstName: "",
    lastName: "",
    idPassport: "",
    phone: "",
    email: "",
    company: "",
    purposeDetails: "",
    hostDepartment: "",
    hostStaffName: "",
    vehicleRegistration: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleReason: "",
    notes: "",
  });

  const updateForm = (field: keyof VisitorForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ("touches" in e) {
      e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
  };

  const handleSubmit = async () => {
    if (!tenantId) {
      toast({ title: "Error", description: "Tenant ID is required", variant: "destructive" });
      return;
    }

    if (!form.firstName || !form.lastName) {
      toast({ title: "Error", description: "First and last name are required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate visitor number
      const { data: countData } = await supabase
        .from("visitors")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

      const visitorNumber = `VIS${String((countData as unknown as number) || 0 + 1).padStart(4, "0")}`;

      const { error } = await supabase.from("visitors").insert({
        tenant_id: tenantId,
        visitor_number: visitorNumber,
        first_name: form.firstName,
        last_name: form.lastName,
        id_passport: form.idPassport || null,
        phone: form.phone || null,
        email: form.email || null,
        company: form.company || null,
        visit_type: selectedCategory?.name || "Other",
        purpose_details: form.purposeDetails || null,
        host_staff_name: form.hostStaffName || null,
        host_department: form.hostDepartment || null,
        vehicle_registration: form.vehicleRegistration || null,
        vehicle_make: form.vehicleMake || null,
        vehicle_model: form.vehicleModel || null,
        vehicle_color: form.vehicleColor || null,
        vehicle_reason: form.vehicleReason || null,
        signature_data: signatureData || null,
        tablet_id: tabletId,
        notes: form.notes || null,
        timestamp_in: new Date().toISOString(),
      });

      if (error) throw error;

      setStep(4); // Success step
    } catch (error) {
      console.error("Error signing in visitor:", error);
      toast({ title: "Error", description: "Failed to sign in. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCategory(null);
    setForm({
      firstName: "",
      lastName: "",
      idPassport: "",
      phone: "",
      email: "",
      company: "",
      purposeDetails: "",
      hostDepartment: "",
      hostStaffName: "",
      vehicleRegistration: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      vehicleReason: "",
      notes: "",
    });
    setSignatureData("");
    clearSignature();
  };

  if (!tenantId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <HelpCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Configuration Required</h2>
            <p className="text-muted-foreground">
              This tablet needs to be configured. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for signing in, {form.firstName}. Your visit has been recorded.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Please take a seat and someone will be with you shortly.
            </p>
            <Button onClick={resetForm} size="lg" className="w-full">
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Visitor Sign-In</h1>
          <p className="text-muted-foreground">Please complete the sign-in process</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Select Category */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Why are you visiting today?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DEFAULT_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedCategory?.id === category.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent className="p-6 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-3 text-primary" />
                      <p className="text-sm font-medium">{category.name}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedCategory}
                size="lg"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Visitor Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => updateForm("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => updateForm("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="idPassport">ID / Passport Number</Label>
                  <Input
                    id="idPassport"
                    value={form.idPassport}
                    onChange={(e) => updateForm("idPassport", e.target.value)}
                    placeholder="Optional"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={form.company}
                    onChange={(e) => updateForm("company", e.target.value)}
                    placeholder={selectedCategory?.requiresCompany ? "Required" : "Optional"}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Host Selection */}
              {selectedCategory?.requiresHost && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Who are you here to see?
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {HOST_DEPARTMENTS.map((dept) => (
                      <Button
                        key={dept}
                        variant={form.hostDepartment === dept ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateForm("hostDepartment", dept)}
                      >
                        {dept}
                      </Button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="hostStaffName">Staff Member Name (if known)</Label>
                    <Input
                      id="hostStaffName"
                      value={form.hostStaffName}
                      onChange={(e) => updateForm("hostStaffName", e.target.value)}
                      placeholder="Enter staff member name"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Vehicle Details */}
              {selectedCategory?.requiresVehicle && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-medium flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vehicleRegistration">Registration Number</Label>
                      <Input
                        id="vehicleRegistration"
                        value={form.vehicleRegistration}
                        onChange={(e) => updateForm("vehicleRegistration", e.target.value.toUpperCase())}
                        placeholder="e.g. ND 123 456"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleMake">Make</Label>
                      <Input
                        id="vehicleMake"
                        value={form.vehicleMake}
                        onChange={(e) => updateForm("vehicleMake", e.target.value)}
                        placeholder="e.g. Toyota"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleModel">Model</Label>
                      <Input
                        id="vehicleModel"
                        value={form.vehicleModel}
                        onChange={(e) => updateForm("vehicleModel", e.target.value)}
                        placeholder="e.g. Corolla"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleColor">Colour</Label>
                      <Input
                        id="vehicleColor"
                        value={form.vehicleColor}
                        onChange={(e) => updateForm("vehicleColor", e.target.value)}
                        placeholder="e.g. White"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vehicleReason">Reason for bringing vehicle</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {["Quote", "Rework", "Inspection", "Delivery"].map((reason) => (
                        <Button
                          key={reason}
                          variant={form.vehicleReason === reason ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateForm("vehicleReason", reason)}
                        >
                          {reason}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Purpose Details */}
              <div className="pt-4 border-t">
                <Label htmlFor="purposeDetails">Additional Notes</Label>
                <Textarea
                  id="purposeDetails"
                  value={form.purposeDetails}
                  onChange={(e) => updateForm("purposeDetails", e.target.value)}
                  placeholder="Any additional details about your visit..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)} size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!form.firstName || !form.lastName}
                  size="lg"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Signature */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Sign to Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Please sign below to confirm your details and complete sign-in.
              </p>

              <div className="border rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border rounded cursor-crosshair touch-none"
                  style={{ touchAction: "none" }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              <Button variant="outline" onClick={clearSignature} size="sm">
                Clear Signature
              </Button>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)} size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? "Signing In..." : "Complete Sign-In"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
