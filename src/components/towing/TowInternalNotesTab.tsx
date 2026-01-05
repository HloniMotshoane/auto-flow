import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { TowingRecord, useTowingRecords } from "@/hooks/useTowingRecords";

interface TowInternalNotesTabProps {
  record: TowingRecord;
}

export default function TowInternalNotesTab({ record }: TowInternalNotesTabProps) {
  const { updateRecord } = useTowingRecords();
  const [notes, setNotes] = useState(record.internal_notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRecord.mutateAsync({
        id: record.id,
        internal_notes: notes,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Notes</CardTitle>
        <CardDescription>
          Document any updates relevant to claims and repairs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter internal notes..."
          className="min-h-[300px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
