import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useBranches } from "@/hooks/useBranches";
import { useEstimators } from "@/hooks/useEstimators";
import { IntakeFormData } from "@/pages/CreateQuotation";

interface ClientDetailsCardProps {
  formData: IntakeFormData;
  errors: Partial<Record<keyof IntakeFormData, string>>;
  updateField: (field: keyof IntakeFormData, value: string | boolean) => void;
}

export function ClientDetailsCard({ formData, errors, updateField }: ClientDetailsCardProps) {
  const { data: branches = [] } = useBranches();
  const { data: estimators = [] } = useEstimators();

  // Auto-select branch if there's only one
  useEffect(() => {
    if (branches.length === 1 && !formData.branchId) {
      updateField("branchId", branches[0].id);
    }
  }, [branches, formData.branchId, updateField]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-primary" />
          Client Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-sm">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            placeholder="John"
            className={cn(errors.firstName && "border-destructive")}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-sm">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            placeholder="Doe"
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="idNumber" className="text-sm">ID Number / Passport</Label>
          <Input
            id="idNumber"
            value={formData.idNumber}
            onChange={(e) => updateField("idNumber", e.target.value)}
            placeholder="8801015009087"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.dateOfBirth && "text-muted-foreground",
                  errors.dateOfBirth && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined}
                onSelect={(date) => updateField("dateOfBirth", date ? date.toISOString().split("T")[0] : "")}
                disabled={(date) => date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="0821234567"
            className={cn(errors.phone && "border-destructive")}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="john@example.com"
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="streetAddress" className="text-sm">Street Address</Label>
          <Input
            id="streetAddress"
            value={formData.streetAddress}
            onChange={(e) => updateField("streetAddress", e.target.value)}
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="suburb" className="text-sm">Suburb</Label>
            <Input
              id="suburb"
              value={formData.suburb}
              onChange={(e) => updateField("suburb", e.target.value)}
              placeholder="Sandton"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="Johannesburg"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Estimator</Label>
          <Select value={formData.estimatorId} onValueChange={(v) => updateField("estimatorId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select estimator" />
            </SelectTrigger>
            <SelectContent>
              {estimators.map((est) => (
                <SelectItem key={est.id} value={est.id}>
                  {est.first_name} {est.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Only show branch selector if company has more than one branch */}
        {branches.length > 1 && (
          <div className="space-y-1.5">
            <Label className="text-sm">Branch</Label>
            <Select value={formData.branchId} onValueChange={(v) => updateField("branchId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
