import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Car, Clock, MapPin, Phone, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface PortalData {
  case: {
    case_number: string;
    status: string;
    created_at: string;
    notes: string | null;
    current_stage?: {
      name: string;
      description: string;
    };
  };
  vehicle: {
    registration_number: string;
    make: string;
    model: string;
    color: string;
    year: number;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  booking?: {
    estimated_completion_date: string;
    status: string;
  };
  stageHistory: Array<{
    id: string;
    stage_name: string;
    entered_at: string;
    completed_at: string | null;
  }>;
  tenant: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
}

const statusColors: Record<string, string> = {
  awaiting_reception: "bg-yellow-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  delivered: "bg-gray-500",
  on_hold: "bg-orange-500",
};

export default function CustomerPortal() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PortalData | null>(null);

  useEffect(() => {
    async function fetchPortalData() {
      if (!token) {
        setError("Invalid portal link");
        setLoading(false);
        return;
      }

      try {
        // Call edge function to get portal data (public access)
        const { data: portalData, error: fetchError } = await supabase.functions.invoke(
          "get-customer-portal-data",
          { body: { token } }
        );

        if (fetchError) throw fetchError;
        if (!portalData || portalData.error) {
          throw new Error(portalData?.error || "Failed to load portal data");
        }

        setData(portalData);
      } catch (err: unknown) {
        console.error("Portal error:", err);
        setError(err instanceof Error ? err.message : "Failed to load repair status");
      } finally {
        setLoading(false);
      }
    }

    fetchPortalData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your repair status...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Unable to Load Status</CardTitle>
            <CardDescription>
              {error || "This link may have expired or is invalid. Please contact the repair shop for a new link."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">{data.tenant.name}</h1>
          <p className="text-muted-foreground">Vehicle Repair Status Portal</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Case #{data.case.case_number}</CardTitle>
                <CardDescription>
                  Started {format(new Date(data.case.created_at), "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <Badge className={`${statusColors[data.case.status] || "bg-gray-500"} text-white`}>
                {data.case.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {data.case.current_stage && (
              <div className="bg-primary/10 rounded-lg p-4 mb-4">
                <p className="font-semibold text-primary">Current Stage</p>
                <p className="text-lg font-bold">{data.case.current_stage.name}</p>
                {data.case.current_stage.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {data.case.current_stage.description}
                  </p>
                )}
              </div>
            )}

            {data.booking?.estimated_completion_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Estimated completion:{" "}
                  <strong className="text-foreground">
                    {format(new Date(data.booking.estimated_completion_date), "MMMM d, yyyy")}
                  </strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Registration</p>
                <p className="font-semibold">{data.vehicle.registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Make & Model</p>
                <p className="font-semibold">{data.vehicle.make} {data.vehicle.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-semibold">{data.vehicle.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-semibold">{data.vehicle.color}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        {data.stageHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Repair Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.stageHistory.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stage.completed_at ? "bg-green-500" : "bg-primary"
                        }`}
                      >
                        {stage.completed_at ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                      {index < data.stageHistory.length - 1 && (
                        <div className="w-0.5 h-8 bg-border mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{stage.stage_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Started: {format(new Date(stage.entered_at), "MMM d, yyyy h:mm a")}
                      </p>
                      {stage.completed_at && (
                        <p className="text-sm text-green-600">
                          Completed: {format(new Date(stage.completed_at), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Have questions about your repair?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tenant.phone && (
              <a
                href={`tel:${data.tenant.phone}`}
                className="flex items-center gap-3 text-primary hover:underline"
              >
                <Phone className="h-4 w-4" />
                {data.tenant.phone}
              </a>
            )}
            {data.tenant.email && (
              <a
                href={`mailto:${data.tenant.email}`}
                className="flex items-center gap-3 text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {data.tenant.email}
              </a>
            )}
            {data.tenant.address && (
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                {data.tenant.address}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        <p className="text-center text-sm text-muted-foreground">
          This page automatically updates. Last checked: {format(new Date(), "h:mm a")}
        </p>
      </main>
    </div>
  );
}
