import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useOrganization } from "@/hooks/useOrganization";
import { Plus, Search, Edit, Trash2, Car, ChevronDown, ChevronRight, Globe } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CarMake {
  id: string;
  name: string;
  country: string | null;
  is_active: boolean;
}

interface CarModel {
  id: string;
  make_id: string;
  name: string;
  is_active: boolean;
}

export default function CarMakes() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [editingMake, setEditingMake] = useState<CarMake | null>(null);
  const [editingModel, setEditingModel] = useState<CarModel | null>(null);
  const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
  const [expandedMakes, setExpandedMakes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({ name: "", country: "" });
  const [modelFormData, setModelFormData] = useState({ name: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organizationId } = useOrganization();

  const { data: makes = [], isLoading } = useQuery({
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

  const saveMakeMutation = useMutation({
    mutationFn: async (data: { name: string; country: string }) => {
      if (editingMake) {
        const { error } = await supabase
          .from("car_makes")
          .update({ name: data.name, country: data.country || null })
          .eq("id", editingMake.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("car_makes").insert({
          name: data.name,
          country: data.country || null,
          organization_id: organizationId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-makes"] });
      toast({ title: editingMake ? "Make updated" : "Make created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const saveModelMutation = useMutation({
    mutationFn: async (data: { name: string; make_id: string }) => {
      if (editingModel) {
        const { error } = await supabase
          .from("car_models")
          .update({ name: data.name })
          .eq("id", editingModel.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("car_models").insert({
          name: data.name,
          make_id: data.make_id,
          organization_id: organizationId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-models"] });
      toast({ title: editingModel ? "Model updated" : "Model created" });
      setModelDialogOpen(false);
      resetModelForm();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMakeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("car_makes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-makes"] });
      queryClient.invalidateQueries({ queryKey: ["car-models"] });
      toast({ title: "Make deleted" });
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("car_models").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-models"] });
      toast({ title: "Model deleted" });
    },
  });

  const resetForm = () => {
    setEditingMake(null);
    setFormData({ name: "", country: "" });
  };

  const resetModelForm = () => {
    setEditingModel(null);
    setSelectedMakeId(null);
    setModelFormData({ name: "" });
  };

  const openEditMake = (make: CarMake) => {
    setEditingMake(make);
    setFormData({ name: make.name, country: make.country || "" });
    setDialogOpen(true);
  };

  const openAddModel = (makeId: string) => {
    setSelectedMakeId(makeId);
    setEditingModel(null);
    setModelFormData({ name: "" });
    setModelDialogOpen(true);
  };

  const openEditModel = (model: CarModel) => {
    setEditingModel(model);
    setSelectedMakeId(model.make_id);
    setModelFormData({ name: model.name });
    setModelDialogOpen(true);
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

  const filteredMakes = makes.filter((make) =>
    make.name.toLowerCase().includes(search.toLowerCase())
  );

  const getModelsForMake = (makeId: string) =>
    models.filter((model) => model.make_id === makeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Car Makes</h1>
          <p className="text-muted-foreground">Manage vehicle makes and models</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Make
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search makes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredMakes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No makes found</div>
          ) : (
            <div className="space-y-2">
              {filteredMakes.map((make) => (
                <Collapsible
                  key={make.id}
                  open={expandedMakes.has(make.id)}
                  onOpenChange={() => toggleExpanded(make.id)}
                >
                  <div className="border rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                          {expandedMakes.has(make.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
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
                        </Button>
                      </CollapsibleTrigger>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAddModel(make.id)}>
                          <Plus className="h-3 w-3 mr-1" /> Model
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEditMake(make)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMakeMutation.mutate(make.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="border-t px-4 py-2 bg-muted/50">
                        {getModelsForMake(make.id).length === 0 ? (
                          <p className="text-sm text-muted-foreground py-2">No models added yet</p>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Model Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getModelsForMake(make.id).map((model) => (
                                <TableRow key={model.id}>
                                  <TableCell>{model.name}</TableCell>
                                  <TableCell>
                                    <Badge variant={model.is_active ? "default" : "secondary"}>
                                      {model.is_active ? "Active" : "Inactive"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => openEditModel(model)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => deleteModelMutation.mutate(model.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
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

      {/* Make Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMake ? "Edit Make" : "Add Make"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Make Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Toyota"
              />
            </div>
            <div>
              <Label htmlFor="country">Country of Origin</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g., Japan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => saveMakeMutation.mutate(formData)}
              disabled={!formData.name || saveMakeMutation.isPending}
              className="gradient-primary"
            >
              {editingMake ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model Dialog */}
      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModel ? "Edit Model" : "Add Model"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={modelFormData.name}
                onChange={(e) => setModelFormData({ name: e.target.value })}
                placeholder="e.g., Corolla"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModelDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>
                saveModelMutation.mutate({
                  name: modelFormData.name,
                  make_id: selectedMakeId!,
                })
              }
              disabled={!modelFormData.name || !selectedMakeId || saveModelMutation.isPending}
              className="gradient-primary"
            >
              {editingModel ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
