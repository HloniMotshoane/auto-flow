import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Building2 } from "lucide-react";

interface SLACompanySectionProps {
  data: {
    name: string;
    email: string;
    telephone: string;
    cellphone: string;
    street: string;
    suburb: string;
    city: string;
    is_active: boolean;
  };
  onChange: (data: SLACompanySectionProps["data"]) => void;
}

export function SLACompanySection({ data, onChange }: SLACompanySectionProps) {
  const handleChange = (field: keyof typeof data, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card id="company">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="company@example.com"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telephone">Telephone</Label>
            <Input
              id="telephone"
              value={data.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
              placeholder="+27 11 XXX XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cellphone">Cellphone</Label>
            <Input
              id="cellphone"
              value={data.cellphone}
              onChange={(e) => handleChange("cellphone", e.target.value)}
              placeholder="+27 XX XXX XXXX"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={data.street}
            onChange={(e) => handleChange("street", e.target.value)}
            placeholder="123 Main Street"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="suburb">Suburb</Label>
            <Input
              id="suburb"
              value={data.suburb}
              onChange={(e) => handleChange("suburb", e.target.value)}
              placeholder="Enter suburb"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-city">City</Label>
            <Input
              id="company-city"
              value={data.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Enter city"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={data.is_active}
            onCheckedChange={(checked) => handleChange("is_active", checked)}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
      </CardContent>
    </Card>
  );
}
