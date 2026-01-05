import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  ClipboardList, 
  Clock, 
  Car,
  Settings
} from "lucide-react";

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profile?.first_name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening in your shop today.
        </p>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No recent activity yet. Activity will appear here as you use the system.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate("/quotations/new")} className="w-full justify-start gap-3" variant="outline">
              <FileText className="h-4 w-4" />
              Create New Quote
            </Button>
            <Button onClick={() => navigate("/jobs")} className="w-full justify-start gap-3" variant="outline">
              <ClipboardList className="h-4 w-4" />
              View Jobs
            </Button>
            <Button onClick={() => navigate("/customers/new")} className="w-full justify-start gap-3" variant="outline">
              <Users className="h-4 w-4" />
              Add Customer
            </Button>
            <Button onClick={() => navigate("/vehicles")} className="w-full justify-start gap-3" variant="outline">
              <Car className="h-4 w-4" />
              Vehicles
            </Button>
            <Button onClick={() => navigate("/settings")} className="w-full justify-start gap-3" variant="outline">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
