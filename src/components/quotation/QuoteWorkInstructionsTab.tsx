import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkInstruction {
  id: string;
  instructionType: string;
  content: string;
  partNumber?: string;
  supplier?: string;
  createdAt: string;
}

interface QuoteWorkInstructionsTabProps {
  instructions: WorkInstruction[];
  onAdd: (instruction: Omit<WorkInstruction, "id" | "createdAt">) => void;
  onDelete: (id: string) => void;
}

const instructionTypes = [
  { value: "work_instruction", label: "Work Instruction" },
  { value: "part_sourcing", label: "Part Sourcing" },
  { value: "supplier_allocation", label: "Supplier Allocation" },
  { value: "special_note", label: "Special Note" },
];

export function QuoteWorkInstructionsTab({
  instructions,
  onAdd,
  onDelete,
}: QuoteWorkInstructionsTabProps) {
  const [instructionType, setInstructionType] = useState("work_instruction");
  const [content, setContent] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [supplier, setSupplier] = useState("");

  const handleAdd = () => {
    if (!content.trim()) return;
    onAdd({
      instructionType,
      content,
      partNumber: partNumber || undefined,
      supplier: supplier || undefined,
    });
    setContent("");
    setPartNumber("");
    setSupplier("");
  };

  const getTypeLabel = (type: string) => {
    return instructionTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-4">
      {/* Add Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Work Instruction / Part Sourcing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={instructionType} onValueChange={setInstructionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-lg z-50">
                  {instructionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Part Number (Optional)</Label>
              <Input
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g., 12345-ABC"
              />
            </div>
            <div className="space-y-2">
              <Label>Supplier (Optional)</Label>
              <Input
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="e.g., OEM Parts SA"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter work instruction or part sourcing details..."
              rows={3}
            />
          </div>

          <Button onClick={handleAdd} disabled={!content.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </CardContent>
      </Card>

      {/* Instructions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Work Instructions & PSMS ({instructions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {instructions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No work instructions or part sourcing entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {instructions.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-muted/50 border space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{getTypeLabel(item.instructionType)}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.createdAt), "dd MMM yyyy HH:mm")}
                        </span>
                      </div>
                      {(item.partNumber || item.supplier) && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {item.partNumber && <span>Part: {item.partNumber}</span>}
                          {item.supplier && <span>Supplier: {item.supplier}</span>}
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => onDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
