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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useConsumable, useConsumableMovements, useCreateMovement } from "@/hooks/useConsumables";
import { Loader2, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  movement_type: z.enum(["in", "out", "adjustment"]),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface StockMovementDialogProps {
  consumableId: string | null;
  onClose: () => void;
}

export function StockMovementDialog({ consumableId, onClose }: StockMovementDialogProps) {
  const { data: consumable, isLoading: isLoadingConsumable } = useConsumable(consumableId || undefined);
  const { data: movements, isLoading: isLoadingMovements } = useConsumableMovements(consumableId || undefined);
  const createMovement = useCreateMovement();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      movement_type: "in",
      quantity: 1,
      reason: "",
      notes: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!consumableId) return;

    try {
      await createMovement.mutateAsync({
        consumable_id: consumableId,
        ...data,
      });
      form.reset();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "in":
        return <ArrowDownCircle className="h-4 w-4 text-success" />;
      case "out":
        return <ArrowUpCircle className="h-4 w-4 text-destructive" />;
      default:
        return <RefreshCw className="h-4 w-4 text-warning" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "in":
        return <Badge className="bg-success">Stock In</Badge>;
      case "out":
        return <Badge variant="destructive">Stock Out</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Adjustment</Badge>;
    }
  };

  return (
    <Dialog open={!!consumableId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Stock Management: {consumable?.name}</DialogTitle>
        </DialogHeader>

        {isLoadingConsumable ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="add" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="add">Add Movement</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="add" className="mt-4">
              <div className="mb-4 p-4 rounded-lg bg-muted">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Stock</div>
                    <div className="text-2xl font-bold">{consumable?.current_stock}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Minimum Level</div>
                    <div className="text-2xl font-bold">{consumable?.minimum_stock_level}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Unit</div>
                    <div className="text-2xl font-bold capitalize">{consumable?.unit_of_measure}</div>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="movement_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Movement Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="in">Stock In (Receiving)</SelectItem>
                              <SelectItem value="out">Stock Out (Usage/Write-off)</SelectItem>
                              <SelectItem value="adjustment">Adjustment</SelectItem>
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
                          <FormLabel>Quantity *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" min="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Purchase order #123, Damaged stock, Stocktake correction" {...field} />
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
                            placeholder="Additional notes..."
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Close
                    </Button>
                    <Button type="submit" disabled={createMovement.isPending}>
                      {createMovement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Record Movement
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="history" className="mt-4 flex-1 overflow-auto">
              {isLoadingMovements ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : movements?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No movement history
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements?.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(movement.created_at), "dd MMM yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMovementIcon(movement.movement_type)}
                            {getMovementBadge(movement.movement_type)}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          movement.movement_type === "in" ? "text-success" : 
                          movement.movement_type === "out" ? "text-destructive" : ""
                        }`}>
                          {movement.movement_type === "in" ? "+" : "-"}{movement.quantity}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {movement.reason}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
