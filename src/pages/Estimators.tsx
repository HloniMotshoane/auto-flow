import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CheckCircle } from "lucide-react";
import { EstimatorOverviewTab } from "@/components/estimators/EstimatorOverviewTab";
import { UnquotedJobsTab } from "@/components/estimators/UnquotedJobsTab";
import { AuthorisedQuotesTab } from "@/components/estimators/AuthorisedQuotesTab";
import { useUnquotedJobs } from "@/hooks/useUnquotedJobs";
import { useAuthorisedQuotes } from "@/hooks/useAuthorisedQuotes";

export default function Estimators() {
  const { unquotedJobs } = useUnquotedJobs();
  const { data: authorisedQuotes } = useAuthorisedQuotes();

  return (
    <div className="p-4 lg:p-6 space-y-6 min-h-screen bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Estimators</h1>
          <p className="text-muted-foreground">Manage estimators and track their performance</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-[600px] grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="unquoted" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Unquoted Jobs
            {unquotedJobs.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {unquotedJobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="authorised" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Authorised
            {authorisedQuotes && authorisedQuotes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {authorisedQuotes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EstimatorOverviewTab />
        </TabsContent>

        <TabsContent value="unquoted">
          <UnquotedJobsTab />
        </TabsContent>

        <TabsContent value="authorised">
          <AuthorisedQuotesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
