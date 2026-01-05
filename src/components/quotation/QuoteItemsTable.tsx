import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuoteLineItem, QuoteItem } from "./QuoteLineItem";
import { QuoteQuickAdd } from "./QuoteQuickAdd";
import { Plus } from "lucide-react";

interface QuoteItemsTableProps {
  items: QuoteItem[];
  onUpdateItem: (id: string, field: keyof QuoteItem, value: string | number) => void;
  onAddItem: (afterIndex: number) => void;
  onQuickAdd: (item: Omit<QuoteItem, "id" | "sequenceNumber" | "lineTotal">) => void;
  onEditItem: (id: string) => void;
  onDuplicateItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export function QuoteItemsTable({
  items,
  onUpdateItem,
  onAddItem,
  onQuickAdd,
  onEditItem,
  onDuplicateItem,
  onDeleteItem,
}: QuoteItemsTableProps) {
  const totals = items.reduce(
    (acc, item) => ({
      parts: acc.parts + item.partCost * item.quantity,
      labour: acc.labour + item.labourCost * item.quantity,
      paint: acc.paint + item.paintCost * item.quantity,
      strip: acc.strip + item.stripCost * item.quantity,
      frame: acc.frame + item.frameCost * item.quantity,
      outwork: acc.outwork + item.inhouseOutworkCost * item.quantity,
    }),
    { parts: 0, labour: 0, paint: 0, strip: 0, frame: 0, outwork: 0 }
  );

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      {/* Quick Add Row */}
      <QuoteQuickAdd onAdd={onQuickAdd} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900 text-xs font-medium text-slate-300">
                  <th className="p-2 text-center w-8">#</th>
                  <th className="p-2 w-8"></th>
                  <th className="p-2 text-left">Oper</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-center">Mark Up</th>
                  <th className="p-2 text-center">Bett</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-center">Part</th>
                  <th className="p-2 text-center">Labor</th>
                  <th className="p-2 text-center">Paint</th>
                  <th className="p-2 text-center">Strip</th>
                  <th className="p-2 text-center">Frame</th>
                  <th className="p-2 text-center">Inhouse/Outwork</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="p-8 text-center text-muted-foreground">
                      <p className="mb-2">No items added yet</p>
                      <p className="text-sm">Use the quick-add row above or click below to add items</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => onAddItem(-1)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <QuoteLineItem
                      key={item.id}
                      item={item}
                      index={index}
                      onUpdate={onUpdateItem}
                      onAdd={onAddItem}
                      onEdit={onEditItem}
                      onDuplicate={onDuplicateItem}
                      onDelete={onDeleteItem}
                    />
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-800 font-semibold text-sm text-white">
                    <td colSpan={7} className="p-3 text-right">
                      Totals:
                    </td>
                    <td className="p-3 text-center">R{totals.parts.toFixed(2)}</td>
                    <td className="p-3 text-center">R{totals.labour.toFixed(2)}</td>
                    <td className="p-3 text-center">R{totals.paint.toFixed(2)}</td>
                    <td className="p-3 text-center">R{totals.strip.toFixed(2)}</td>
                    <td className="p-3 text-center">R{totals.frame.toFixed(2)}</td>
                    <td className="p-3 text-center">R{totals.outwork.toFixed(2)}</td>
                    <td className="p-3 text-center font-bold text-green-400">
                      R{grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
