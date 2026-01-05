import { useState } from "react";
import { useTabletAssignments, useCreateTabletAssignment, useUpdateTabletAssignment, useDeleteTabletAssignment, useTabletUsers, useAddTabletUser, useRemoveTabletUser, type TabletAssignmentInsert } from "@/hooks/useTabletAssignments";
import { useTabletCapabilities, useToggleTabletCapability, useTabletInstalledApps, useAddTabletApp, useRemoveTabletApp, useToggleTabletApp, CAPABILITY_TYPES } from "@/hooks/useTabletCapabilities";
import { useActiveWorkshopSegments } from "@/hooks/useWorkshopSegments";
import { useShopUsers } from "@/hooks/useShopUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Tablet, MapPin, Users, ChevronDown, UserPlus, X, Settings2, AppWindow, Wrench } from "lucide-react";

export default function TabletManagement() {
  const { data: tablets, isLoading } = useTabletAssignments();
  const { data: segments } = useActiveWorkshopSegments();
  const { data: allUsers } = useShopUsers();
  const createTablet = useCreateTabletAssignment();
  const updateTablet = useUpdateTabletAssignment();
  const deleteTablet = useDeleteTabletAssignment();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedTablet, setExpandedTablet] = useState<string | null>(null);

  const [formData, setFormData] = useState<TabletAssignmentInsert>({
    tablet_identifier: "",
    segment_id: "",
    location_description: "",
    is_active: true,
  });

  const handleCreateTablet = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTablet.mutateAsync(formData);
    setIsAddDialogOpen(false);
    setFormData({ tablet_identifier: "", segment_id: "", location_description: "", is_active: true });
  };

  const handleDeleteTablet = async (id: string) => {
    await deleteTablet.mutateAsync(id);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await updateTablet.mutateAsync({ id, is_active: !currentStatus });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tablets & Devices</h1>
          <p className="text-muted-foreground">Manage physical devices, capabilities, and installed apps</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
              <DialogDescription>Register a tablet or device for workshop use.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTablet} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tablet_identifier">Device Identifier *</Label>
                <Input
                  id="tablet_identifier"
                  value={formData.tablet_identifier}
                  onChange={(e) => setFormData({ ...formData, tablet_identifier: e.target.value })}
                  placeholder="e.g., TAB-001, Panel-Tablet-1"
                  required
                />
                <p className="text-xs text-muted-foreground">A unique name to identify this device</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment_id">Assigned Segment *</Label>
                <Select
                  value={formData.segment_id}
                  onValueChange={(value) => setFormData({ ...formData, segment_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent>
                    {segments?.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color ?? "#6B7280" }}
                          />
                          {segment.segment_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_description">Location / Assignment</Label>
                <Input
                  id="location_description"
                  value={formData.location_description ?? ""}
                  onChange={(e) => setFormData({ ...formData, location_description: e.target.value })}
                  placeholder="e.g., Near bay 3, Assigned to John"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTablet.isPending}>
                  {createTablet.isPending ? "Adding..." : "Add Device"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tablet className="h-5 w-5" />
            Registered Devices
          </CardTitle>
          <CardDescription>
            {tablets?.length ?? 0} devices registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(!tablets || tablets.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              No devices registered yet. Add a device to assign it to a workshop segment.
            </div>
          ) : (
            <div className="space-y-3">
              {tablets.map((tablet) => (
                <Collapsible
                  key={tablet.id}
                  open={expandedTablet === tablet.id}
                  onOpenChange={(open) => setExpandedTablet(open ? tablet.id : null)}
                >
                  <div className="border rounded-lg">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Tablet className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{tablet.tablet_identifier}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {tablet.workshop_segments && (
                                <Badge
                                  variant="outline"
                                  style={{
                                    borderColor: tablet.workshop_segments.color ?? "#6B7280",
                                    color: tablet.workshop_segments.color ?? "#6B7280"
                                  }}
                                >
                                  {tablet.workshop_segments.segment_name}
                                </Badge>
                              )}
                              {tablet.location_description && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {tablet.location_description}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={tablet.is_active ? "default" : "secondary"}>
                            {tablet.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedTablet === tablet.id ? "rotate-180" : ""}`} />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t p-4 space-y-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleActive(tablet.id, tablet.is_active)}
                          >
                            {tablet.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Device?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove "{tablet.tablet_identifier}" and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTablet(tablet.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        <Tabs defaultValue="capabilities" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="capabilities" className="flex items-center gap-1">
                              <Settings2 className="h-3 w-3" />
                              Tasks
                            </TabsTrigger>
                            <TabsTrigger value="apps" className="flex items-center gap-1">
                              <AppWindow className="h-3 w-3" />
                              Apps
                            </TabsTrigger>
                            <TabsTrigger value="users" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Users
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="capabilities" className="mt-4">
                            <TabletCapabilitiesSection tabletId={tablet.id} />
                          </TabsContent>
                          <TabsContent value="apps" className="mt-4">
                            <TabletAppsSection tabletId={tablet.id} />
                          </TabsContent>
                          <TabsContent value="users" className="mt-4">
                            <TabletUsersList tabletId={tablet.id} allUsers={allUsers ?? []} />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TabletCapabilitiesSection({ tabletId }: { tabletId: string }) {
  const { data: capabilities, isLoading } = useTabletCapabilities(tabletId);
  const toggleCapability = useToggleTabletCapability();

  const getCapabilityEnabled = (type: string) => {
    const cap = capabilities?.find(c => c.capability_type === type);
    return cap?.is_enabled ?? false;
  };

  const handleToggle = (type: string, enabled: boolean) => {
    toggleCapability.mutate({ tabletId, capabilityType: type, isEnabled: enabled });
  };

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-3">Define what tasks this device can perform:</p>
      <div className="grid grid-cols-2 gap-2">
        {CAPABILITY_TYPES.map((cap) => (
          <div key={cap.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-lg">{cap.icon}</span>
              <div>
                <div className="text-sm font-medium">{cap.label}</div>
                <div className="text-xs text-muted-foreground">{cap.description}</div>
              </div>
            </div>
            <Switch
              checked={getCapabilityEnabled(cap.id)}
              onCheckedChange={(checked) => handleToggle(cap.id, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TabletAppsSection({ tabletId }: { tabletId: string }) {
  const { data: apps, isLoading } = useTabletInstalledApps(tabletId);
  const addApp = useAddTabletApp();
  const removeApp = useRemoveTabletApp();
  const toggleApp = useToggleTabletApp();
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newApp, setNewApp] = useState({ name: "", description: "", version: "" });

  const handleAddApp = () => {
    if (!newApp.name.trim()) return;
    addApp.mutate({ tabletId, appName: newApp.name, appDescription: newApp.description, appVersion: newApp.version });
    setNewApp({ name: "", description: "", version: "" });
    setIsAddingApp(false);
  };

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Installed apps and services:</p>
        <Button size="sm" variant="outline" onClick={() => setIsAddingApp(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Add App
        </Button>
      </div>

      {isAddingApp && (
        <div className="p-3 border rounded-lg space-y-3 bg-muted/50">
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="App name *"
              value={newApp.name}
              onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newApp.description}
              onChange={(e) => setNewApp({ ...newApp, description: e.target.value })}
            />
            <Input
              placeholder="Version"
              value={newApp.version}
              onChange={(e) => setNewApp({ ...newApp, version: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddApp} disabled={!newApp.name.trim()}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setIsAddingApp(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {apps && apps.length > 0 ? (
        <div className="space-y-2">
          {apps.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <AppWindow className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{app.app_name}</div>
                  {app.app_description && <div className="text-xs text-muted-foreground">{app.app_description}</div>}
                </div>
                {app.app_version && <Badge variant="outline" className="text-xs">v{app.app_version}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={app.is_active}
                  onCheckedChange={(checked) => toggleApp.mutate({ id: app.id, isActive: checked })}
                />
                <Button size="icon" variant="ghost" onClick={() => removeApp.mutate(app.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No apps registered.</p>
      )}
    </div>
  );
}

function TabletUsersList({ tabletId, allUsers }: { tabletId: string; allUsers: { user_id: string; first_name: string | null; last_name: string | null; email: string }[] }) {
  const { data: tabletUsers, isLoading } = useTabletUsers(tabletId);
  const addUser = useAddTabletUser();
  const removeUser = useRemoveTabletUser();
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const assignedUserIds = tabletUsers?.map(u => u.user_id) ?? [];
  const availableUsers = allUsers.filter(u => !assignedUserIds.includes(u.user_id));

  const handleAddUser = async () => {
    if (!selectedUserId) return;
    await addUser.mutateAsync({ tabletAssignmentId: tabletId, userId: selectedUserId });
    setSelectedUserId("");
  };

  const handleRemoveUser = async (id: string) => {
    await removeUser.mutateAsync(id);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-3">Users authorized to work on this device:</p>
      <div className="flex gap-2">
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select user to add" />
          </SelectTrigger>
          <SelectContent>
            {availableUsers.map((user) => (
              <SelectItem key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddUser} disabled={!selectedUserId || addUser.isPending}>
          <UserPlus className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : tabletUsers && tabletUsers.length > 0 ? (
        <div className="space-y-2">
          {tabletUsers.map((tu) => {
            const user = allUsers.find(u => u.user_id === tu.user_id);
            return (
              <div key={tu.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <span>{user ? `${user.first_name} ${user.last_name}` : tu.user_id}</span>
                <Button size="icon" variant="ghost" onClick={() => handleRemoveUser(tu.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No users assigned.
        </p>
      )}
    </div>
  );
}
