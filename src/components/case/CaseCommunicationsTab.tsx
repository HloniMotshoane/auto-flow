import { useState } from "react";
import { useCaseCommunications } from "@/hooks/useCaseCommunications";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Send, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react";
import { format } from "date-fns";

interface CaseCommunicationsTabProps {
  caseId: string;
}

export function CaseCommunicationsTab({ caseId }: CaseCommunicationsTabProps) {
  const { communications, isLoading, createCommunication } = useCaseCommunications(caseId);
  const { user } = useAuth();
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [toAddress, setToAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = async () => {
    if (!toAddress || !body) return;

    try {
      await createCommunication.mutateAsync({
        case_id: caseId,
        channel,
        direction: "outbound",
        to_address: toAddress,
        from_address: null,
        subject: channel === "email" ? subject : null,
        body,
        attachments: [],
        sent_by_user_id: user?.id || null,
      });
      setIsComposeDialogOpen(false);
      setToAddress("");
      setSubject("");
      setBody("");
    } catch (error) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Communications ({communications?.length || 0})</h3>
        <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Compose Message</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as "email" | "whatsapp")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder={channel === "email" ? "email@example.com" : "+27 123 456 7890"}
                />
              </div>

              {channel === "email" && (
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Message subject"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!toAddress || !body || createCommunication.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {createCommunication.isPending ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!communications || communications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No communications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {communications.map((comm) => (
            <Card key={comm.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${comm.direction === "outbound" ? "bg-primary/10" : "bg-muted"}`}>
                    {comm.direction === "outbound" ? (
                      <ArrowUpRight className="w-4 h-4 text-primary" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={comm.channel === "email" ? "default" : "secondary"}>
                        {comm.channel === "email" ? (
                          <><Mail className="w-3 h-3 mr-1" /> Email</>
                        ) : (
                          <><MessageSquare className="w-3 h-3 mr-1" /> WhatsApp</>
                        )}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {comm.direction === "outbound" ? `To: ${comm.to_address}` : `From: ${comm.from_address}`}
                      </span>
                    </div>
                    {comm.subject && (
                      <p className="font-medium mb-1">{comm.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{comm.body}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(comm.created_at), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
