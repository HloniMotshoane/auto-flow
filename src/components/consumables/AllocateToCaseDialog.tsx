import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConsumable, useAddCaseConsumable } from "@/hooks/useConsumables";
import { useWorkshopCases } from "@/hooks/useWorkshopCases";
import { useUserTenant } from "@/hooks/useUserTenant";
import { Loader2, Package, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  case_id: z.string().min(1, "Please select a case/job"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AllocateToCaseDialogProps {
  consumableId: string | null;
  onClose: () => void;
}

export function AllocateToCaseDialog({ consumableId, onClose }: AllocateToCaseDialogProps) {
  const { tenantId } = useUserTenant();
  const { data: consumable, isLoading: isLoadingConsumable } = useConsumable(consumableId || undefined);
  const { data: cases, isLoading: isLoadingCases } = useWorkshopCases(tenantId || undefined);
  const addCaseConsumable = useAddCaseConsumable();

  // Filter to only show active cases
  const activeCases = cases?.filter(c => 
    c.status !== 'completed' && c.status !== 'delivered' && c.status !== 'cancelled'
  ) || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case_id: "",
      quantity: 1,
      notes: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (consumableId) {
      form.reset({
        case_id: "",
        quantity: 1,
        notes: "",
      });
    }
  }, [consumableId, form]);

  const onSubmit = async (data: FormData) => {
    if (!consumableId || !consumable) return;

    // Check if there's enough stock
    if (data.quantity > consumable.current_stock) {
      form.setError("quantity", { 
        message: `Not enough stock. Available: ${consumable.current_stock}` 
      });
      return;
    }

    try {
      await addCaseConsumable.mutateAsync({
        case_id: data.case_id,
        consumable_id: consumableId,
        quantity: data.quantity,
        unit_cost: consumable.unit_cost,
        notes: data.notes || null,
      });
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const isLoading = isLoadingConsumable || isLoadingCases;

  return (
    <Dialog open={!!consumableId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Allocate to Job/Case
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Consumable Info */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{consumable?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {consumable?.sku && `SKU: ${consumable.sku} • `}
                    R{consumable?.unit_cost.toFixed(2)} per {consumable?.unit_of_measure}
                  </div>
                </div>
                <Badge variant={consumable && consumable.current_stock <= consumable.minimum_stock_level ? "destructive" : "secondary"}>
                  Stock: {consumable?.current_stock}
                </Badge>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="case_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Job/Case *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a case/job..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activeCases.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No active cases found
                            </div>
                          ) : (
                            activeCases.map((caseItem) => (
                              <SelectItem key={caseItem.id} value={caseItem.id}>
                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4" />
                                  <span className="font-medium">{caseItem.case_number}</span>
                                  {caseItem.vehicle && (
                                    <span className="text-muted-foreground">
                                      - {caseItem.vehicle.make} {caseItem.vehicle.model}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity ({consumable?.unit_of_measure}) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0.01" 
                          max={consumable?.current_stock}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Optional notes about usage..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cost Preview */}
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-medium">
                      R{((form.watch("quantity") || 0) * (consumable?.unit_cost || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addCaseConsumable.isPending || activeCases.length === 0}>
                    {addCaseConsumable.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Allocate to Job
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}