import { CaseDetail } from "@/hooks/useCaseDetail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Phone, Mail, FileText, DollarSign } from "lucide-react";

interface CaseInsuranceTabProps {
  caseDetail: CaseDetail;
}

export function CaseInsuranceTab({ caseDetail }: CaseInsuranceTabProps) {
  const hasInsurance = caseDetail.insurance_company_id || caseDetail.policy_number || caseDetail.claim_reference;

  if (!hasInsurance) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No insurance information available.</p>
          <p className="text-sm text-muted-foreground mt-2">This may be a private/cash job.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Insurance Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Insurance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Insurance Type</p>
              <Badge variant="outline" className="capitalize mt-1">
                {caseDetail.insurance_type || "Private"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Insurance Number</p>
              <p className="font-medium">{caseDetail.insurance_number || "—"}</p>
            </div>
            {caseDetail.insurance_email && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Insurance Email</p>
                <p className="font-medium">{caseDetail.insurance_email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Policy & Claim Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Policy & Claim
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Policy Number</p>
              <p className="font-medium">{caseDetail.policy_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Claim Reference</p>
              <p className="font-medium">{caseDetail.claim_reference || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Authorization Number</p>
              <p className="font-medium">{caseDetail.authorization_number || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Clerk Reference</p>
              <p className="font-medium">{caseDetail.clerk_reference || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Excess Amount</p>
              <p className="font-medium text-lg">
                R {(caseDetail.excess_amount || 0).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessor Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Assessor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {caseDetail.assessor_id || caseDetail.assessor_company ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company</p>
                <p className="font-medium">{caseDetail.assessor_company || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{caseDetail.assessor_phone || "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{caseDetail.assessor_email || "—"}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No assessor assigned.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
