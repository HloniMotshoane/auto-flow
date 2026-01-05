import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useTenant, useCreateTenant, useUpdateTenant, TenantStatus } from "@/hooks/useTenants";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { Skeleton } from "@/components/ui/skeleton";

const tenantSchema = z.object({
  branch_name: z.string().min(1, "Branch name is required").max(100),
  company_name: z.string().min(1, "Company name is required").max(100),
  status: z.enum(["active", "suspended", "archived", "pending"]),
  contact_person: z.string().max(100).optional(),
  email: z.string().email("Invalid email address").max(255).optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address_line_1: z.string().max(200).optional(),
  address_line_2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  province: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  vat_number: z.string().max(50).optional(),
  registration_number: z.string().max(50).optional(),
  credits: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function TenantForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { isSuperAdmin, isLoading: isCheckingAdmin } = useSuperAdmin();
  const { data: tenant, isLoading: isLoadingTenant } = useTenant(id);
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const form = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      branch_name: "",
      company_name: "",
      status: "active",
      contact_person: "",
      email: "",
      phone: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      province: "",
      country: "",
      vat_number: "",
      registration_number: "",
      credits: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (tenant) {
      form.reset({
        branch_name: tenant.branch_name,
        company_name: tenant.company_name,
        status: tenant.status,
        contact_person: tenant.contact_person || "",
        email: tenant.email || "",
        phone: tenant.phone || "",
        address_line_1: tenant.address_line_1 || "",
        address_line_2: tenant.address_line_2 || "",
        city: tenant.city || "",
        province: tenant.province || "",
        country: tenant.country || "",
        vat_number: tenant.vat_number || "",
        registration_number: tenant.registration_number || "",
        credits: tenant.credits,
        notes: tenant.notes || "",
      });
    }
  }, [tenant, form]);

  const onSubmit = async (data: TenantFormData) => {
    if (isEditing && id) {
      await updateTenant.mutateAsync({
        id,
        branch_name: data.branch_name,
        company_name: data.company_name,
        status: data.status,
        credits: data.credits,
        email: data.email || null,
        contact_person: data.contact_person || null,
        phone: data.phone || null,
        address_line_1: data.address_line_1 || null,
        address_line_2: data.address_line_2 || null,
        city: data.city || null,
        province: data.province || null,
        country: data.country || null,
        vat_number: data.vat_number || null,
        registration_number: data.registration_number || null,
        notes: data.notes || null,
      });
    } else {
      await createTenant.mutateAsync({
        branch_name: data.branch_name,
        company_name: data.company_name,
        status: data.status,
        credits: data.credits,
        email: data.email || undefined,
        contact_person: data.contact_person || undefined,
        phone: data.phone || undefined,
        address_line_1: data.address_line_1 || undefined,
        address_line_2: data.address_line_2 || undefined,
        city: data.city || undefined,
        province: data.province || undefined,
        country: data.country || undefined,
        vat_number: data.vat_number || undefined,
        registration_number: data.registration_number || undefined,
        notes: data.notes || undefined,
      });
    }
    navigate("/tenants");
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Ban className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have permission to manage tenants.
        </p>
      </div>
    );
  }

  if (isEditing && isLoadingTenant) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Edit Tenant" : "Create Tenant"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update tenant information"
              : "Add a new branch/company that will use the platform"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/tenants")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tenants
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createTenant.isPending || updateTenant.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isEditing ? "Save" : "Save Tenant"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Essentials</CardTitle>
              <CardDescription>Basic identification & access</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="branch_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Branch / Tenant Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MAG Pretoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Company Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Registered company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Account Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contacts</CardTitle>
              <CardDescription>Primary person and communication</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="name@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+27 82 000 0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Address</CardTitle>
              <CardDescription>Branch physical address</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address_line_1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line_2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Suite / Unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province / State</FormLabel>
                    <FormControl>
                      <Input placeholder="Province / State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Compliance & Billing</CardTitle>
              <CardDescription>Numbers & starting balance</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="vat_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 4XX0..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Registration #</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20XX/XXXXXX/07" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Starting Credits <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
              <CardDescription>Internal notes for this tenant</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Anything the team should know..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Bottom Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate("/tenants")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTenant.isPending || updateTenant.isPending}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isEditing ? "Save Tenant" : "Save Tenant"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
