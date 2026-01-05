import { useNavigate } from "react-router-dom";
import { useAuthorisedQuotes } from "@/hooks/useAuthorisedQuotes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CheckCircle, Car, User, Calendar, Eye, Briefcase } from "lucide-react";

export function AuthorisedQuotesTab() {
  const navigate = useNavigate();
  const { data: authorisedQuotes, isLoading } = useAuthorisedQuotes();

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authorised Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Authorised Quotes
          <Badge variant="secondary" className="ml-2">{authorisedQuotes?.length || 0}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!authorisedQuotes || authorisedQuotes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No authorised quotes</p>
            <p className="text-sm">Quotes that are approved will appear here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Estimator</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead>Authorised</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authorisedQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.quote_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{quote.customer?.name || "Unknown"}</div>
                        {quote.customer?.phone && (
                          <div className="text-xs text-muted-foreground">{quote.customer.phone}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {[quote.vehicle?.make, quote.vehicle?.model].filter(Boolean).join(" ") || "Unknown"}
                        </div>
                        {quote.vehicle?.registration && (
                          <div className="text-xs text-muted-foreground">{quote.vehicle.registration}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {quote.estimator ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {`${quote.estimator.first_name || ""} ${quote.estimator.last_name || ""}`.trim() || quote.estimator.email}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(quote.total_amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(quote.updated_at), "dd MMM yyyy")}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/quotations/${quote.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {quote.case_id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/cases/${quote.case_id}`)}
                        >
                          <Briefcase className="h-4 w-4 mr-1" />
                          View Case
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
