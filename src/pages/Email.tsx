import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { Plus, Search, Mail, Inbox, Send, Trash2, MailOpen, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Email {
  id: string;
  job_id: string | null;
  direction: string;
  from_address: string;
  to_address: string;
  subject: string | null;
  body: string | null;
  is_read: boolean;
  received_at: string;
  created_at: string;
}

export default function EmailPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeData, setComposeData] = useState({
    to_address: "",
    subject: "",
    body: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ["emails", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emails")
        .select("*")
        .order("received_at", { ascending: false });
      if (error) throw error;
      return data as Email[];
    },
    enabled: !!organizationId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emails").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (data: typeof composeData) => {
      const { error } = await supabase.from("emails").insert({
        organization_id: organizationId,
        direction: "outbound",
        from_address: "noreply@ais-system.com",
        to_address: data.to_address,
        subject: data.subject,
        body: data.body,
        is_read: true,
        received_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      toast({ title: "Email sent" });
      setComposeOpen(false);
      setComposeData({ to_address: "", subject: "", body: "" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emails").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      setSelectedEmail(null);
      toast({ title: "Email deleted" });
    },
  });

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (!email.is_read) {
      markAsReadMutation.mutate(email.id);
    }
  };

  const inboxEmails = emails.filter((e) => e.direction === "inbound");
  const sentEmails = emails.filter((e) => e.direction === "outbound");
  const unreadCount = inboxEmails.filter((e) => !e.is_read).length;

  const filteredEmails = (activeTab === "inbox" ? inboxEmails : sentEmails).filter(
    (email) =>
      email.subject?.toLowerCase().includes(search.toLowerCase()) ||
      email.from_address.toLowerCase().includes(search.toLowerCase()) ||
      email.to_address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email</h1>
          <p className="text-muted-foreground">Manage email communications</p>
        </div>
        <Button onClick={() => setComposeOpen(true)} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" /> Compose
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inboxEmails.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentEmails.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="inbox" className="flex-1">
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No emails found</div>
              ) : (
                <div className="divide-y">
                  {filteredEmails.map((email) => (
                    <div
                      key={email.id}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedEmail?.id === email.id && "bg-muted",
                        !email.is_read && "bg-primary/5"
                      )}
                      onClick={() => handleSelectEmail(email)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {!email.is_read && <div className="h-2 w-2 rounded-full bg-primary" />}
                            <span className={cn("text-sm truncate", !email.is_read && "font-semibold")}>
                              {activeTab === "inbox" ? email.from_address : email.to_address}
                            </span>
                          </div>
                          <p className={cn("text-sm truncate mt-1", !email.is_read && "font-medium")}>
                            {email.subject || "(No subject)"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {email.body?.substring(0, 50)}...
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(parseISO(email.received_at), "MMM d")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {selectedEmail ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedEmail.subject || "(No subject)"}</h2>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span>From: {selectedEmail.from_address}</span>
                      <span>•</span>
                      <span>To: {selectedEmail.to_address}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(selectedEmail.received_at), "PPpp")}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMutation.mutate(selectedEmail.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                    {selectedEmail.body || "(No content)"}
                  </div>
                </div>
                {selectedEmail.direction === "inbound" && (
                  <div className="border-t pt-4">
                    <Button
                      onClick={() => {
                        setComposeData({
                          to_address: selectedEmail.from_address,
                          subject: `Re: ${selectedEmail.subject || ""}`,
                          body: "",
                        });
                        setComposeOpen(true);
                      }}
                    >
                      Reply
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <MailOpen className="h-12 w-12 mb-4" />
                <p>Select an email to read</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                value={composeData.to_address}
                onChange={(e) => setComposeData({ ...composeData, to_address: e.target.value })}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                rows={10}
                placeholder="Write your message..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => sendEmailMutation.mutate(composeData)}
              disabled={!composeData.to_address || sendEmailMutation.isPending}
              className="gradient-primary"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
