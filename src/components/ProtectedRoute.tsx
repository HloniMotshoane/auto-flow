import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHasPermission } from "@/hooks/useCurrentUserPermissions";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useTenantAdmin } from "@/hooks/useTenantAdmin";
import { Loader2, ShieldX } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { hasViewPermission, permissions, isLoading: isLoadingPermissions } = useHasPermission();
  const { isSuperAdmin, isLoading: isLoadingSuperAdmin } = useSuperAdmin();
  const { data: isTenantAdmin, isLoading: isLoadingTenantAdmin } = useTenantAdmin();

  if (isLoading || isLoadingSuperAdmin || isLoadingTenantAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Super admins and tenant admins bypass permission checks
  if (isSuperAdmin || isTenantAdmin) {
    return <>{children}</>;
  }

  // Wait for permissions to load before checking
  if (isLoadingPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If user has permissions configured, check if they can view this route
  const hasPermissionsConfigured = permissions && permissions.length > 0;
  
  if (hasPermissionsConfigured && !hasViewPermission(location.pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}