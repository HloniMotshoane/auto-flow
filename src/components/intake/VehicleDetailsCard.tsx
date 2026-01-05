import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Car } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IntakeFormData } from "@/pages/CreateQuotation";

interface VehicleDetailsCardProps {
  formData: IntakeFormData;
  errors: Partial<Record<keyof IntakeFormData, string>>;
  updateField: (field: keyof IntakeFormData, value: string | boolean) => void;
}

export function VehicleDetailsCard({ formData, errors, updateField }: VehicleDetailsCardProps) {
  const { data: makes = [] } = useQuery({
    queryKey: ["car-makes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_makes")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", formData.make],
    queryFn: async () => {
      if (!formData.make) return [];
      const { data, error } = await supabase
        .from("car_models")
        .select("id, name")
        .eq("make_id", formData.make)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!formData.make,
  });

  const handleMakeChange = (makeId: string) => {
    updateField("make", makeId);
    updateField("model", ""); // Reset model when make changes
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Car className="h-5 w-5 text-primary" />
          Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="registration" className="text-sm">Registration Number</Label>
          <Input
            id="registration"
            value={formData.registration}
            onChange={(e) => updateField("registration", e.target.value.toUpperCase())}
            placeholder="CA 123-456"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="vin" className="text-sm">VIN Number</Label>
          <Input
            id="vin"
            value={formData.vin}
            onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
            placeholder="1HGBH41JXMN109186"
            maxLength={17}
            className={cn(errors.vin && "border-destructive")}
          />
          {errors.vin && <p className="text-xs text-destructive">{errors.vin}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="engineNumber" className="text-sm">Engine Number</Label>
          <Input
            id="engineNumber"
            value={formData.engineNumber}
            onChange={(e) => updateField("engineNumber", e.target.value.toUpperCase())}
            placeholder="ABC123456"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Make</Label>
          <Select value={formData.make} onValueChange={handleMakeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select make" />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Model</Label>
          <Select 
            value={formData.model} 
            onValueChange={(v) => updateField("model", v)}
            disabled={!formData.make}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.make ? "Select model" : "Select make first"} />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="odometer" className="text-sm">Odometer</Label>
          <Input
            id="odometer"
            type="number"
            value={formData.odometer}
            onChange={(e) => updateField("odometer", e.target.value)}
            placeholder="50000"
            className={cn(errors.odometer && "border-destructive")}
          />
          {errors.odometer && <p className="text-xs text-destructive">{errors.odometer}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color" className="text-sm">Colour</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => updateField("color", e.target.value)}
            placeholder="White"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year" className="text-sm">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => updateField("year", e.target.value)}
            placeholder="2023"
            min="1900"
            max={new Date().getFullYear()}
            className={cn(errors.year && "border-destructive")}
          />
          {errors.year && <p className="text-xs text-destructive">{errors.year}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Booking Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.bookingDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.bookingDate ? format(new Date(formData.bookingDate), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.bookingDate ? new Date(formData.bookingDate) : undefined}
                onSelect={(date) => updateField("bookingDate", date ? date.toISOString().split("T")[0] : "")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Quote Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.quoteDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.quoteDate ? format(new Date(formData.quoteDate), "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.quoteDate ? new Date(formData.quoteDate) : undefined}
                onSelect={(date) => updateField("quoteDate", date ? date.toISOString().split("T")[0] : "")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
    </Card>
  );
}
