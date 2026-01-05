import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useTenantAdmin } from "@/hooks/useTenantAdmin";
import { useUserTenant } from "@/hooks/useUserTenant";
import { useTenants } from "@/hooks/useTenants";
import { useBranches } from "@/hooks/useBranches";
import { useWorkflowStages } from "@/hooks/useWorkflowStages";
import {
  useTenantUser,
  useUserDashboardPermissions,
  useUserSpecialActions,
  useUpdateTenantUser,
} from "@/hooks/useTenantUsers";
import { useUserStageAssignments, useUpdateUserStageAssignments } from "@/hooks/useWorkflowStages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { PermissionMatrix, PermissionState } from "@/components/users/PermissionMatrix";
import { SpecialActionsSection, SpecialActionsState } from "@/components/users/SpecialActionsSection";
import { StageAssignmentSection } from "@/components/users/StageAssignmentSection";
import { PasswordValidator, validatePassword } from "@/components/users/PasswordValidator";
import { ArrowLeft, Save, Shield, User, Briefcase, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

const userFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  is_active: z.boolean().default(true),
  job_role: z.string().optional(),
  department: z.string().optional(),
  company_code: z.string().optional(),
  cell_number: z.string().optional(),
  pin: z.string().max(4, "PIN must be 4 digits").optional(),
  tenant_id: z.string().min(1, "Tenant is required"),
  branch_id: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

const JOB_ROLES = [
  "General Worker",
  "Technician",
  "Manager",
  "Admin",
  "Receptionist",
  "Accountant",
];

const DEPARTMENTS = [
  "Motor Accident Group",
  "Mechanical",
  "Claims",
  "Reception",
  "Accounts",
  "Management",
];

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { isSuperAdmin, isLoading: isLoadingSuperAdmin } = useSuperAdmin();
  const { data: isTenantAdmin, isLoading: isLoadingTenantAdmin } = useTenantAdmin();
  const { tenantId: userTenantId } = useUserTenant();
  const { data: tenants, isLoading: isLoadingTenants } = useTenants();
  const { data: user, isLoading: isLoadingUser } = useTenantUser(id);
  const { data: existingPermissions } = useUserDashboardPermissions(id);
  const { data: existingSpecialActions } = useUserSpecialActions(id);
  const { data: stageAssignments, isLoading: isLoadingStages } = useUserStageAssignments(id);

  const updateUser = useUpdateTenantUser();
  const updateStages = useUpdateUserStageAssignments();

  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [specialActions, setSpecialActions] = useState<SpecialActionsState>({});
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);

  // For tenant admins, use their tenant by default
  const effectiveTenantId = isSuperAdmin ? selectedTenantId : (userTenantId || selectedTenantId);
  
  const { data: branches, isLoading: isLoadingBranches } = useBranches(effectiveTenantId);
  const { data: stages } = useWorkflowStages(effectiveTenantId);
  
  const hasAccess = isSuperAdmin || isTenantAdmin;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      is_active: true,
      job_role: "",
      department: "",
      company_code: "",
      cell_number: "",
      pin: "",
      tenant_id: "",
      branch_id: "",
    },
  });

  const password = form.watch("password");

  // Set tenant_id for tenant admins
  useEffect(() => {
    if (!isSuperAdmin && userTenantId && !isEditing) {
      form.setValue("tenant_id", userTenantId);
      setSelectedTenantId(userTenantId);
    }
  }, [isSuperAdmin, userTenantId, isEditing, form]);

  // Populate form with existing user data
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        is_active: user.is_active ?? true,
        job_role: user.job_role || "",
        department: user.department || "",
        company_code: user.company_code || "",
        cell_number: user.cell_number || "",
        pin: user.pin || "",
        tenant_id: user.tenant_id || "",
        branch_id: user.branch_id || "",
      });
      if (user.tenant_id) {
        setSelectedTenantId(user.tenant_id);
      }
    }
  }, [user, form]);

  // Populate existing permissions
  useEffect(() => {
    if (existingPermissions) {
      const permState: PermissionState = {};
      existingPermissions.forEach((p) => {
        permState[p.module] = {
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        };
      });
      setPermissions(permState);
    }
  }, [existingPermissions]);

  // Populate existing special actions
  useEffect(() => {
    if (existingSpecialActions) {
      const actionsState: SpecialActionsState = {};
      existingSpecialActions.forEach((a) => {
        actionsState[a.action_name] = a.is_enabled;
      });
      setSpecialActions(actionsState);
    }
  }, [existingSpecialActions]);

  // Populate existing stage assignments
  useEffect(() => {
    if (stageAssignments) {
      setSelectedStageIds(stageAssignments.map((a: { stage_id: string }) => a.stage_id));
    }
  }, [stageAssignments]);

  // Update selectedTenantId when form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "tenant_id" && value.tenant_id) {
        setSelectedTenantId(value.tenant_id);
        form.setValue("branch_id", "");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: UserFormData) => {
    if (!isEditing) {
      toast.error("Creating new users is not yet implemented. Please use the existing auth flow.");
      return;
    }

    if (!id) return;

    // Validate password if provided
    if (data.password && !validatePassword(data.password)) {
      toast.error("Password does not meet requirements");
      return;
    }

    // Convert permissions to array format
    const permissionsArray = Object.entries(permissions).map(([module, perms]) => ({
      module,
      ...perms,
    }));

    // Convert special actions to array format
    const specialActionsArray = Object.entries(specialActions).map(([action_name, is_enabled]) => ({
      action_name,
      is_enabled,
    }));

    try {
      await updateUser.mutateAsync({
        userId: id,
        profile: {
          first_name: data.first_name,
          last_name: data.last_name,
          is_active: data.is_active,
          job_role: data.job_role,
          department: data.department,
          company_code: data.company_code,
          cell_number: data.cell_number,
          pin: data.pin,
          tenant_id: data.tenant_id,
          branch_id: data.branch_id || null,
        },
        permissions: permissionsArray,
        specialActions: specialActionsArray,
      });

      // Update stage assignments
      if (data.tenant_id) {
        await updateStages.mutateAsync({
          userId: id,
          tenantId: data.tenant_id,
          stageIds: selectedStageIds,
        });
      }

      navigate("/users");
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  if (isLoadingSuperAdmin || isLoadingTenantAdmin) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to manage users. This feature is restricted to Admins and Managers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isEditing && isLoadingUser) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? "Edit User" : "Create User"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Update user profile and permissions"
                : "Add a new user to a tenant"}
            </p>
          </div>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={updateUser.isPending}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Essentials */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Essentials</CardTitle>
              </div>
              <CardDescription>Identity and access credentials</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isEditing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <PasswordValidator password={password || ""} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive users cannot log in
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Job Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Job Info & Assignment</CardTitle>
              </div>
              <CardDescription>Role, department, and branch assignment</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="tenant_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenant *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoadingTenants || !isSuperAdmin}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isSuperAdmin ? (
                          tenants?.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.branch_name} ({tenant.company_name})
                            </SelectItem>
                          ))
                        ) : (
                          userTenantId && (
                            <SelectItem value={userTenantId}>
                              {tenants?.find(t => t.id === userTenantId)?.branch_name || "Your Tenant"}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {!isSuperAdmin && (
                      <FormDescription>
                        Users will be added to your organization
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={!selectedTenantId || isLoadingBranches}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
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
                name="job_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Role</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {JOB_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
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
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
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
                name="company_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Unique code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cell_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cell Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+27..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN (4 digits)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        maxLength={4}
                        placeholder="****"
                      />
                    </FormControl>
                    <FormDescription>Secure PIN for sensitive operations</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dashboard Access */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Dashboard Access</CardTitle>
              </div>
              <CardDescription>
                Define which dashboards this user can access and what actions they can perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionMatrix
                permissions={permissions}
                onChange={setPermissions}
              />
            </CardContent>
          </Card>

          {/* Special Actions */}
          <SpecialActionsSection
            actions={specialActions}
            onChange={setSpecialActions}
          />

          {/* Stage Assignment */}
          <StageAssignmentSection
            stages={stages || []}
            selectedStageIds={selectedStageIds}
            isLoading={isLoadingStages}
            onChange={setSelectedStageIds}
          />
        </form>
      </Form>
    </div>
  );
}
