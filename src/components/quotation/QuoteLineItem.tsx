import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { operations, partDescriptions, getOperationColor } from "@/lib/partDescriptions";

export interface QuoteItem {
  id: string;
  sequenceNumber: number;
  operation: string;
  description: string;
  markupPercent: number;
  bettermentPercent: number;
  quantity: number;
  partCost: number;
  labourCost: number;
  paintCost: number;
  stripCost: number;
  frameCost: number;
  inhouseOutworkCost: number;
  lineTotal: number;
}

interface QuoteLineItemProps {
  item: QuoteItem;
  index: number;
  onUpdate: (id: string, field: keyof QuoteItem, value: string | number) => void;
  onAdd: (afterIndex: number) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function QuoteLineItem({
  item,
  index,
  onUpdate,
  onAdd,
  onEdit,
  onDuplicate,
  onDelete,
}: QuoteLineItemProps) {
  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="p-1.5 text-center text-muted-foreground text-xs w-8">
        {index + 1}
      </td>
      <td className="p-1.5 w-8">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onAdd(index)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </td>
      <td className="p-1.5 w-[110px]">
        <Select
          value={item.operation}
          onValueChange={(value) => onUpdate(item.id, "operation", value)}
        >
          <SelectTrigger className={cn("h-7 text-xs text-white border-0", getOperationColor(item.operation))}>
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
      </td>
      <td className="p-1.5 min-w-[160px]">
        <Select
          value={item.description}
          onValueChange={(value) => onUpdate(item.id, "description", value)}
        >
          <SelectTrigger className="h-7 text-xs bg-cyan-700 text-white border-0">
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
      </td>
      <td className="p-1.5 w-[65px]">
        <Input
          type="number"
          value={item.markupPercent}
          onChange={(e) => onUpdate(item.id, "markupPercent", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
        />
      </td>
      <td className="p-1.5 w-[65px]">
        <Input
          type="number"
          value={item.bettermentPercent}
          onChange={(e) => onUpdate(item.id, "bettermentPercent", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
        />
      </td>
      <td className="p-1.5 w-[50px]">
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, "quantity", parseInt(e.target.value) || 1)}
          className="h-7 text-xs text-center bg-purple-600 text-white border-0"
          min={1}
        />
      </td>
      <td className="p-1.5 w-[75px]">
        <Input
          type="number"
          value={item.partCost}
          onChange={(e) => onUpdate(item.id, "partCost", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
          step="0.01"
        />
      </td>
      <td className="p-1.5 w-[75px]">
        <Input
          type="number"
          value={item.labourCost}
          onChange={(e) => onUpdate(item.id, "labourCost", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
          step="0.01"
        />
      </td>
      <td className="p-1.5 w-[75px]">
        <Input
          type="number"
          value={item.paintCost}
          onChange={(e) => onUpdate(item.id, "paintCost", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
          step="0.01"
        />
      </td>
      <td className="p-1.5 w-[75px]">
        <Input
          type="number"
          value={item.stripCost}
          onChange={(e) => onUpdate(item.id, "stripCost", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
          step="0.01"
        />
      </td>
      <td className="p-1.5 w-[75px]">
        <Input
          type="number"
          value={item.frameCost}
          onChange={(e) => onUpdate(item.id, "frameCost", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
          step="0.01"
        />
      </td>
      <td className="p-1.5 w-[85px]">
        <Input
          type="number"
          value={item.inhouseOutworkCost}
          onChange={(e) => onUpdate(item.id, "inhouseOutworkCost", parseFloat(e.target.value) || 0)}
          className="h-7 text-xs text-center bg-slate-800 text-white border-0"
          step="0.01"
        />
      </td>
      <td className="p-1.5 w-[90px]">
        <div className="flex gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={() => onEdit(item.id)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={() => onDuplicate(item.id)}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
