import { CaseDetail } from "@/hooks/useCaseDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, Phone, Mail, Calendar, DollarSign, MapPin } from "lucide-react";
import { format } from "date-fns";

interface CaseTowingTabProps {
  caseDetail: CaseDetail;
}

export function CaseTowingTab({ caseDetail }: CaseTowingTabProps) {
  if (!caseDetail.was_towed) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Vehicle was not towed.</p>
          <p className="text-sm text-muted-foreground mt-2">
            This vehicle was self-driven to the workshop.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tow Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Tow Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{caseDetail.tow_company || "—"}</p>
            </div>
            {caseDetail.tow_contact_number && (
              <div className="flex items-center justify-between col-span-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contact Number</p>
                    <p className="font-medium">{caseDetail.tow_contact_number}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`tel:${caseDetail.tow_contact_number}`}>Call</a>
                </Button>
              </div>
            )}
            {caseDetail.tow_email && (
              <div className="flex items-center justify-between col-span-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{caseDetail.tow_email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${caseDetail.tow_email}`}>Email</a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tow Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tow Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tow In Date</p>
              <p className="font-medium">
                {caseDetail.tow_in_date 
                  ? format(new Date(caseDetail.tow_in_date), "dd MMM yyyy")
                  : "—"
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Towed</p>
              <Badge variant={caseDetail.was_towed ? "default" : "secondary"}>
                {caseDetail.was_towed ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Tow Costs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tow Fee</p>
              <p className="font-medium text-lg">
                R {(caseDetail.tow_fee || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Storage Days</p>
              <p className="font-medium text-lg">{caseDetail.storage_days || 0} days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
