import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface QuoteNote {
  id: string;
  noteType: "internal" | "insurer";
  content: string;
  createdBy: string;
  createdAt: string;
}

interface QuoteNotesTabProps {
  notes: QuoteNote[];
  onAddNote: (note: { noteType: string; content: string }) => void;
}

export function QuoteNotesTab({ notes, onAddNote }: QuoteNotesTabProps) {
  const [noteType, setNoteType] = useState<"internal" | "insurer">("internal");
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (!content.trim()) return;
    onAddNote({ noteType, content });
    setContent("");
  };

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={noteType}
            onValueChange={(v) => setNoteType(v as "internal" | "insurer")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="internal" id="internal" />
              <Label htmlFor="internal">Internal Note</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="insurer" id="insurer" />
              <Label htmlFor="insurer">Insurer-Facing Note</Label>
            </div>
          </RadioGroup>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your note..."
            rows={3}
          />

          <Button onClick={handleAdd} disabled={!content.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notes ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-muted/50 border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={note.noteType === "internal" ? "secondary" : "default"}>
                      {note.noteType === "internal" ? "Internal" : "Insurer"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {note.createdBy} • {format(new Date(note.createdAt), "dd MMM yyyy HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
