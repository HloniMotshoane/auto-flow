import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MessageSquare, MapPin, Calendar, CreditCard } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  suburb: string | null;
  city: string | null;
  postal_code: string | null;
  customer_type: string | null;
  id_number: string | null;
  date_of_birth: string | null;
}

interface CaseCustomerTabProps {
  customer: Customer | null;
}

export function CaseCustomerTab({ customer }: CaseCustomerTabProps) {
  if (!customer) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No customer information available.</p>
        </CardContent>
      </Card>
    );
  }

  const fullAddress = [customer.address, customer.suburb, customer.city, customer.postal_code]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer Type</p>
              <p className="font-medium capitalize">{customer.customer_type || "Individual"}</p>
            </div>
            {customer.first_name && (
              <div>
                <p className="text-sm text-muted-foreground">First Name</p>
                <p className="font-medium">{customer.first_name}</p>
              </div>
            )}
            {customer.last_name && (
              <div>
                <p className="text-sm text-muted-foreground">Last Name</p>
                <p className="font-medium">{customer.last_name}</p>
              </div>
            )}
            {customer.id_number && (
              <div>
                <p className="text-sm text-muted-foreground">ID Number</p>
                <p className="font-medium">{customer.id_number}</p>
              </div>
            )}
            {customer.date_of_birth && (
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{customer.date_of_birth}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {customer.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{customer.phone}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${customer.phone}`}>Call</a>
                </Button>
              </div>
            )}

            {customer.whatsapp_number && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{customer.whatsapp_number}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://wa.me/${customer.whatsapp_number.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    Message
                  </a>
                </Button>
              </div>
            )}

            {customer.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{customer.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${customer.email}`}>Email</a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fullAddress ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {customer.address && (
                <div>
                  <p className="text-sm text-muted-foreground">Street Address</p>
                  <p className="font-medium">{customer.address}</p>
                </div>
              )}
              {customer.suburb && (
                <div>
                  <p className="text-sm text-muted-foreground">Suburb</p>
                  <p className="font-medium">{customer.suburb}</p>
                </div>
              )}
              {customer.city && (
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium">{customer.city}</p>
                </div>
              )}
              {customer.postal_code && (
                <div>
                  <p className="text-sm text-muted-foreground">Postal Code</p>
                  <p className="font-medium">{customer.postal_code}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No address information available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
