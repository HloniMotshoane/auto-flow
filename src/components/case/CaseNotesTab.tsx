import { useState } from "react";
import { CaseDetail } from "@/hooks/useCaseDetail";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save } from "lucide-react";
import { toast } from "sonner";

interface CaseNotesTabProps {
  caseDetail: CaseDetail;
}

export function CaseNotesTab({ caseDetail }: CaseNotesTabProps) {
  const [notes, setNotes] = useState(caseDetail.notes || "");
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const updateNotes = useMutation({
    mutationFn: async (newNotes: string) => {
      const { error } = await supabase
        .from("cases")
        .update({ notes: newNotes })
        .eq("id", caseDetail.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-detail", caseDetail.id] });
      setIsEditing(false);
      toast.success("Notes saved successfully");
    },
    onError: (error) => {
      toast.error("Failed to save notes");
      console.error(error);
    },
  });

  const handleSave = () => {
    updateNotes.mutate(notes);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Case Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Case Notes & Incident Description
            </CardTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNotes(caseDetail.notes || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateNotes.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateNotes.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit Notes
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this case, incident description, special instructions, etc..."
              rows={10}
              className="resize-none"
            />
          ) : (
            <div className="min-h-[200px] p-4 rounded-lg bg-muted/30">
              {notes ? (
                <p className="whitespace-pre-wrap">{notes}</p>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No notes added yet. Click "Edit Notes" to add incident description and other details.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Info Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vehicle Condition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">
              {caseDetail.condition_status?.replace(/_/g, " ") || "Not specified"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warranty Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium capitalize">
              {caseDetail.warranty_status?.replace(/_/g, " ") || "Not specified"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
