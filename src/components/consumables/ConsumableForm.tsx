import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useConsumable, 
  useConsumableCategories, 
  useCreateConsumable, 
  useUpdateConsumable,
  useDeleteConsumable 
} from "@/hooks/useConsumables";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  category_id: z.string().optional(),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  current_stock: z.coerce.number().min(0, "Stock cannot be negative"),
  minimum_stock_level: z.coerce.number().min(0, "Minimum level cannot be negative"),
  unit_cost: z.coerce.number().min(0, "Unit cost cannot be negative"),
});

type FormData = z.infer<typeof formSchema>;

interface ConsumableFormProps {
  consumableId?: string | null;
  onClose: () => void;
}

const unitOptions = [
  { value: "each", label: "Each" },
  { value: "liter", label: "Liter" },
  { value: "ml", label: "Milliliter" },
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "meter", label: "Meter" },
  { value: "cm", label: "Centimeter" },
  { value: "roll", label: "Roll" },
  { value: "sheet", label: "Sheet" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
];

export function ConsumableForm({ consumableId, onClose }: ConsumableFormProps) {
  const { data: consumable, isLoading: isLoadingConsumable } = useConsumable(consumableId || undefined);
  const { data: categories } = useConsumableCategories();
  const createConsumable = useCreateConsumable();
  const updateConsumable = useUpdateConsumable();
  const deleteConsumable = useDeleteConsumable();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      category_id: "",
      unit_of_measure: "each",
      current_stock: 0,
      minimum_stock_level: 0,
      unit_cost: 0,
    },
  });

  useEffect(() => {
    if (consumable) {
      form.reset({
        name: consumable.name,
        description: consumable.description || "",
        sku: consumable.sku || "",
        category_id: consumable.category_id || "",
        unit_of_measure: consumable.unit_of_measure,
        current_stock: consumable.current_stock,
        minimum_stock_level: consumable.minimum_stock_level,
        unit_cost: consumable.unit_cost,
      });
    }
  }, [consumable, form]);

  const onSubmit = async (data: FormData) => {
    try {
      if (consumableId) {
        await updateConsumable.mutateAsync({
          id: consumableId,
          ...data,
          category_id: data.category_id || null,
        });
      } else {
        await createConsumable.mutateAsync({
          ...data,
          category_id: data.category_id || null,
        });
      }
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!consumableId) return;
    if (confirm("Are you sure you want to deactivate this consumable?")) {
      await deleteConsumable.mutateAsync(consumableId);
      onClose();
    }
  };

  const isSubmitting = createConsumable.isPending || updateConsumable.isPending;

  if (consumableId && isLoadingConsumable) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Clear Coat 2K" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., CC-2K-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Optional description..."
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit_of_measure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit of Measure *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Cost (R) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Stock *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minimum_stock_level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Stock Level *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          {consumableId && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConsumable.isPending}
            >
              Deactivate
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {consumableId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
