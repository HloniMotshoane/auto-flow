import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { operations, partDescriptions, getOperationColor } from "@/lib/partDescriptions";
import { QuoteItem } from "./QuoteLineItem";

interface QuoteQuickAddProps {
  onAdd: (item: Omit<QuoteItem, "id" | "sequenceNumber" | "lineTotal">) => void;
}

export function QuoteQuickAdd({ onAdd }: QuoteQuickAddProps) {
  const [operation, setOperation] = useState("labour");
  const [description, setDescription] = useState("");
  const [markupPercent, setMarkupPercent] = useState(0);
  const [bettermentPercent, setBettermentPercent] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [partCost, setPartCost] = useState(0);
  const [labourCost, setLabourCost] = useState(0);
  const [paintCost, setPaintCost] = useState(0);
  const [stripCost, setStripCost] = useState(0);
  const [frameCost, setFrameCost] = useState(0);
  const [inhouseOutworkCost, setInhouseOutworkCost] = useState(0);

  const handleAdd = () => {
    if (!description) return;
    
    onAdd({
      operation,
      description,
      markupPercent,
      bettermentPercent,
      quantity,
      partCost,
      labourCost,
      paintCost,
      stripCost,
      frameCost,
      inhouseOutworkCost,
    });

    // Reset form
    setDescription("");
    setMarkupPercent(0);
    setBettermentPercent(0);
    setQuantity(1);
    setPartCost(0);
    setLabourCost(0);
    setPaintCost(0);
    setStripCost(0);
    setFrameCost(0);
    setInhouseOutworkCost(0);
  };

  return (
    <div className="bg-card border rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Operation Dropdown */}
        <Select value={operation} onValueChange={setOperation}>
          <SelectTrigger className={cn("w-[120px] h-9 text-xs text-white border-0", getOperationColor(operation))}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg z-50">
            {operations.map((op) => (
              <SelectItem key={op.value} value={op.value}>
                {op.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Description Dropdown */}
        <Select value={description} onValueChange={setDescription}>
          <SelectTrigger className="w-[200px] h-9 text-xs bg-cyan-700 text-white border-0">
            <SelectValue placeholder="Select part..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-lg z-50 max-h-[300px]">
            {partDescriptions.map((part) => (
              <SelectItem key={part.value} value={part.label}>
                {part.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Numeric Inputs */}
        <Input
          type="number"
          value={markupPercent}
          onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
          className="w-[70px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Mark%"
        />
        <Input
          type="number"
          value={bettermentPercent}
          onChange={(e) => setBettermentPercent(parseFloat(e.target.value) || 0)}
          className="w-[70px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Bett%"
        />
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-[60px] h-9 text-xs text-center bg-purple-600 text-white border-0"
          min={1}
        />
        <Input
          type="number"
          value={partCost}
          onChange={(e) => setPartCost(parseFloat(e.target.value) || 0)}
          className="w-[80px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Part"
          step="0.01"
        />
        <Input
          type="number"
          value={labourCost}
          onChange={(e) => setLabourCost(parseFloat(e.target.value) || 0)}
          className="w-[80px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Labor"
          step="0.01"
        />
        <Input
          type="number"
          value={paintCost}
          onChange={(e) => setPaintCost(parseFloat(e.target.value) || 0)}
          className="w-[80px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Paint"
          step="0.01"
        />
        <Input
          type="number"
          value={stripCost}
          onChange={(e) => setStripCost(parseFloat(e.target.value) || 0)}
          className="w-[80px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Strip"
          step="0.01"
        />
        <Input
          type="number"
          value={frameCost}
          onChange={(e) => setFrameCost(parseFloat(e.target.value) || 0)}
          className="w-[80px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Frame"
          step="0.01"
        />
        <Input
          type="number"
          value={inhouseOutworkCost}
          onChange={(e) => setInhouseOutworkCost(parseFloat(e.target.value) || 0)}
          className="w-[90px] h-9 text-xs text-center bg-slate-800 text-white border-0"
          placeholder="Outwork"
          step="0.01"
        />

        {/* Save Button */}
        <Button
          onClick={handleAdd}
          disabled={!description}
          className="h-9 bg-green-600 hover:bg-green-700 text-white px-4"
        >
          <Check className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>
    </div>
  );
}
