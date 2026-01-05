import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Search, Pencil, Trash2, Car, ChevronDown, ChevronRight, Globe, Fuel, Cog } from "lucide-react";
import { toast } from "sonner";

type Vehicle = {
  id: string;
  customer_id: string | null;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  registration: string | null;
  color: string | null;
  created_at: string;
  customers?: { name: string } | null;
};

type Customer = { id: string; name: string };

interface CarMake {
  id: string;
  name: string;
  country: string | null;
  is_active: boolean;
  logo_url: string | null;
}

interface CarModel {
  id: string;
  make_id: string;
  name: string;
  is_active: boolean;
  year_from: number | null;
  year_to: number | null;
  engine_size: string | null;
  fuel_type: string | null;
  body_type: string | null;
  transmission: string | null;
}

export default function Vehicles() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [makeSearch, setMakeSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [expandedMakes, setExpandedMakes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    customer_id: "",
    make: "",
    model: "",
    year: "",
    vin: "",
    registration: "",
    color: "",
  });

  // Customer vehicles query
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: !!organizationId,
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["customers-list", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!organizationId,
  });

  // Car makes & models queries
  const { data: makes = [], isLoading: makesLoading } = useQuery({
    queryKey: ["car-makes", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_makes")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CarMake[];
    },
    enabled: !!organizationId,
  });

  const { data: models = [] } = useQuery({
    queryKey: ["car-models", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_models")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as CarModel[];
    },
    enabled: !!organizationId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("vehicles").insert({
        organization_id: organizationId,
        customer_id: data.customer_id || null,
        make: data.make,
        model: data.model,
        year: data.year ? parseInt(data.year) : null,
        vin: data.vin || null,
        registration: data.registration || null,
        color: data.color || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle created successfully");
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("vehicles").update({
        customer_id: data.customer_id || null,
        make: data.make,
        model: data.model,
        year: data.year ? parseInt(data.year) : null,
        vin: data.vin || null,
        registration: data.registration || null,
        color: data.color || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
      resetForm();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetForm = () => {
    setFormData({ customer_id: "", make: "", model: "", year: "", vin: "", registration: "", color: "" });
    setEditingVehicle(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      customer_id: vehicle.customer_id || "",
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year?.toString() || "",
      vin: vehicle.vin || "",
      registration: vehicle.registration || "",
      color: vehicle.color || "",
    });
    setIsDialogOpen(true);
  };

  const toggleExpanded = (makeId: string) => {
    setExpandedMakes((prev) => {
      const next = new Set(prev);
      if (next.has(makeId)) {
        next.delete(makeId);
      } else {
        next.add(makeId);
      }
      return next;
    });
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.registration?.toLowerCase().includes(search.toLowerCase()) ||
      v.vin?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMakes = makes.filter((make) =>
    make.name.toLowerCase().includes(makeSearch.toLowerCase())
  );

  const getModelsForMake = (makeId: string) =>
    models.filter((model) => model.make_id === makeId);

  const getFuelTypeColor = (fuelType: string | null) => {
    switch (fuelType?.toLowerCase()) {
      case 'petrol': return 'bg-amber-500/20 text-amber-700 dark:text-amber-400';
      case 'diesel': return 'bg-slate-500/20 text-slate-700 dark:text-slate-400';
      case 'electric': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'hybrid': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getBodyTypeColor = (bodyType: string | null) => {
    switch (bodyType?.toLowerCase()) {
      case 'suv': return 'bg-purple-500/20 text-purple-700 dark:text-purple-400';
      case 'sedan': return 'bg-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'hatchback': return 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400';
      case 'bakkie': return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case 'coupe': return 'bg-pink-500/20 text-pink-700 dark:text-pink-400';
      case 'mpv': return 'bg-teal-500/20 text-teal-700 dark:text-teal-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <p className="text-muted-foreground">Manage vehicles and car database</p>
        </div>
      </div>

      <Tabs defaultValue="customer-vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customer-vehicles">Customer Vehicles</TabsTrigger>
          <TabsTrigger value="car-database">Car Database</TabsTrigger>
        </TabsList>

        {/* Customer Vehicles Tab */}
        <TabsContent value="customer-vehicles" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer_id">Owner (Customer)</Label>
                    <Select
                      value={formData.customer_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No owner</SelectItem>
                        {customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        min="1900"
                        max="2099"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registration">Registration</Label>
                    <Input
                      id="registration"
                      value={formData.registration}
                      onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input
                      id="vin"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      maxLength={17}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingVehicle ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search vehicles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="h-4 w-4" />
                  <span>{vehicles.length} vehicles</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : filteredVehicles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No vehicles found</TableCell>
                    </TableRow>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          {vehicle.make} {vehicle.model}
                          {vehicle.color && <span className="text-muted-foreground ml-2">({vehicle.color})</span>}
                        </TableCell>
                        <TableCell>{vehicle.year || "-"}</TableCell>
                        <TableCell>{vehicle.registration || "-"}</TableCell>
                        <TableCell className="font-mono text-xs">{vehicle.vin || "-"}</TableCell>
                        <TableCell>{vehicle.customers?.name || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(vehicle.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Car Database Tab */}
        <TabsContent value="car-database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Makes</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{makes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Models</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{models.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Countries</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(makes.map((m) => m.country).filter(Boolean)).size}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search makes..."
                    value={makeSearch}
                    onChange={(e) => setMakeSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {makesLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredMakes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No makes found matching your search</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMakes.map((make) => (
                    <Collapsible
                      key={make.id}
                      open={expandedMakes.has(make.id)}
                      onOpenChange={() => toggleExpanded(make.id)}
                    >
                      <div className="border rounded-lg">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              {expandedMakes.has(make.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              {make.logo_url ? (
                                <img 
                                  src={make.logo_url} 
                                  alt={`${make.name} logo`} 
                                  className="h-8 w-8 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                                  <Car className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <span className="font-medium">{make.name}</span>
                              {make.country && (
                                <Badge variant="outline" className="ml-2">
                                  {make.country}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="ml-2">
                                {getModelsForMake(make.id).length} models
                              </Badge>
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border-t px-4 py-2 bg-muted/50">
                            {getModelsForMake(make.id).length === 0 ? (
                              <p className="text-sm text-muted-foreground py-2">No models added yet</p>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Years</TableHead>
                                    <TableHead>Engine</TableHead>
                                    <TableHead>Fuel</TableHead>
                                    <TableHead>Body</TableHead>
                                    <TableHead>Transmission</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {getModelsForMake(make.id).map((model) => (
                                    <TableRow key={model.id}>
                                      <TableCell className="font-medium">{model.name}</TableCell>
                                      <TableCell>
                                        {model.year_from ? (
                                          <span className="text-sm">
                                            {model.year_from}{model.year_to ? ` - ${model.year_to}` : '+'}
                                          </span>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {model.engine_size ? (
                                          <div className="flex items-center gap-1">
                                            <Cog className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{model.engine_size}</span>
                                          </div>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {model.fuel_type ? (
                                          <Badge variant="secondary" className={getFuelTypeColor(model.fuel_type)}>
                                            <Fuel className="h-3 w-3 mr-1" />
                                            {model.fuel_type}
                                          </Badge>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {model.body_type ? (
                                          <Badge variant="secondary" className={getBodyTypeColor(model.body_type)}>
                                            {model.body_type}
                                          </Badge>
                                        ) : '-'}
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                          {model.transmission || '-'}
                                        </span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}