import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Car, CheckCircle, ChevronLeft, ChevronRight, FileText, HelpCircle, Package, User } from 'lucide-react';
import { useCreateVisitRequest } from '@/hooks/useVisitRequests';

const REQUEST_TYPES = [
  { id: 'quote_request', label: 'Get a Quote', description: 'Request a repair estimate', icon: FileText },
  { id: 'vehicle_collection', label: 'Vehicle Collection', description: 'Pick up your repaired vehicle', icon: Car },
  { id: 'drop_off', label: 'Vehicle Drop-off', description: 'Bring your vehicle for repair', icon: Package },
  { id: 'general_inquiry', label: 'General Inquiry', description: 'Ask questions or get info', icon: HelpCircle },
];

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
];

export default function CustomerVisitForm() {
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get('tenant');
  
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');
  
  const [formData, setFormData] = useState({
    request_type: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    id_number: '',
    vehicle_registration: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_color: '',
    damage_description: '',
    preferred_date: null as Date | null,
    preferred_time_slot: '',
    message: '',
  });

  const createRequest = useCreateVisitRequest();

  const updateField = (field: keyof typeof formData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRequestNumber = () => {
    const date = new Date();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `VR${format(date, 'yyMMdd')}-${random}`;
  };

  const handleSubmit = async () => {
    if (!tenantId) {
      alert('Invalid form link. Please contact the business.');
      return;
    }

    const reqNumber = generateRequestNumber();
    
    try {
      await createRequest.mutateAsync({
        tenant_id: tenantId,
        request_number: reqNumber,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        email: formData.email || null,
        id_number: formData.id_number || null,
        request_type: formData.request_type,
        vehicle_registration: formData.vehicle_registration || null,
        vehicle_make: formData.vehicle_make || null,
        vehicle_model: formData.vehicle_model || null,
        vehicle_year: formData.vehicle_year || null,
        vehicle_color: formData.vehicle_color || null,
        damage_description: formData.damage_description || null,
        preferred_date: formData.preferred_date ? format(formData.preferred_date, 'yyyy-MM-dd') : null,
        preferred_time_slot: formData.preferred_time_slot || null,
        message: formData.message || null,
      });
      
      setRequestNumber(reqNumber);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!formData.request_type;
      case 2:
        return !!formData.first_name && !!formData.last_name && (!!formData.phone || !!formData.email);
      case 3:
        return true; // Vehicle details are optional
      case 4:
        return true; // Date/message are optional
      default:
        return false;
    }
  };

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              This form link is invalid. Please contact the business for a valid link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-primary">Request Submitted!</CardTitle>
            <CardDescription>
              Your visit request has been received. We'll contact you shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Your Reference Number</p>
              <p className="text-2xl font-bold text-foreground">{requestNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Please save this reference number for your records.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Request a Visit</h1>
          <p className="text-muted-foreground mt-2">Fill out the form below to schedule your visit</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step >= s 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    step > s ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Request Type */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">What do you need?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REQUEST_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => updateField('request_type', type.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all",
                        formData.request_type === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <type.icon className={cn(
                        "w-6 h-6 mb-2",
                        formData.request_type === type.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <p className="font-medium text-foreground">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Your Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => updateField('first_name', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => updateField('last_name', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="082 123 4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="id_number">ID Number (optional)</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => updateField('id_number', e.target.value)}
                    placeholder="8801015009087"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Vehicle Details */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Vehicle Details (Optional)</h2>
                <p className="text-sm text-muted-foreground">
                  Provide your vehicle details if relevant to your visit.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_registration">Registration Number</Label>
                    <Input
                      id="vehicle_registration"
                      value={formData.vehicle_registration}
                      onChange={(e) => updateField('vehicle_registration', e.target.value.toUpperCase())}
                      placeholder="CA 123 456"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_make">Make</Label>
                    <Input
                      id="vehicle_make"
                      value={formData.vehicle_make}
                      onChange={(e) => updateField('vehicle_make', e.target.value)}
                      placeholder="Toyota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_model">Model</Label>
                    <Input
                      id="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={(e) => updateField('vehicle_model', e.target.value)}
                      placeholder="Corolla"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_year">Year</Label>
                    <Input
                      id="vehicle_year"
                      value={formData.vehicle_year}
                      onChange={(e) => updateField('vehicle_year', e.target.value)}
                      placeholder="2022"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="vehicle_color">Color</Label>
                    <Input
                      id="vehicle_color"
                      value={formData.vehicle_color}
                      onChange={(e) => updateField('vehicle_color', e.target.value)}
                      placeholder="White"
                    />
                  </div>
                </div>
                {(formData.request_type === 'quote_request' || formData.request_type === 'drop_off') && (
                  <div className="space-y-2">
                    <Label htmlFor="damage_description">Damage Description</Label>
                    <Textarea
                      id="damage_description"
                      value={formData.damage_description}
                      onChange={(e) => updateField('damage_description', e.target.value)}
                      placeholder="Describe the damage or repairs needed..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Schedule & Message */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Preferred Visit Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.preferred_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.preferred_date ? format(formData.preferred_date, "PPP") : "Select a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.preferred_date || undefined}
                          onSelect={(date) => updateField('preferred_date', date)}
                          disabled={(date) => date < new Date() || date.getDay() === 0}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Time</Label>
                    <select
                      value={formData.preferred_time_slot}
                      onChange={(e) => updateField('preferred_time_slot', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Select a time slot</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Notes</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateField('message', e.target.value)}
                    placeholder="Any additional information you'd like us to know..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createRequest.isPending}
                >
                  {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
