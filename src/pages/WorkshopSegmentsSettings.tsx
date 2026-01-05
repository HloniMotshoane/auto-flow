import { useState } from "react";
import { useWorkshopSegments, useCreateWorkshopSegment, useUpdateWorkshopSegment, useDeleteWorkshopSegment, type WorkshopSegmentInsert } from "@/hooks/useWorkshopSegments";
import { useSegmentTasks, useCreateSegmentTask, useUpdateSegmentTask, useDeleteSegmentTask, type SegmentTaskInsert } from "@/hooks/useSegmentTasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil, GripVertical, ListTodo } from "lucide-react";

const COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16",
  "#22C55E", "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9",
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#D946EF",
  "#EC4899", "#F43F5E", "#6B7280"
];

export default function WorkshopSegmentsSettings() {
  const { data: segments, isLoading } = useWorkshopSegments();
  const { data: allTasks } = useSegmentTasks();
  const createSegment = useCreateWorkshopSegment();
  const updateSegment = useUpdateWorkshopSegment();
  const deleteSegment = useDeleteWorkshopSegment();
  const createTask = useCreateSegmentTask();
  const updateTask = useUpdateSegmentTask();
  const deleteTask = useDeleteSegmentTask();

  const [isAddSegmentOpen, setIsAddSegmentOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<string | null>(null);

  const [segmentForm, setSegmentForm] = useState<WorkshopSegmentInsert>({
    segment_name: "",
    description: "",
    color: "#3B82F6",
    sort_order: 0,
    is_active: true,
  });

  const [taskForm, setTaskForm] = useState<SegmentTaskInsert>({
    segment_id: "",
    task_name: "",
    description: "",
    is_active: true,
  });

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    const maxOrder = Math.max(0, ...(segments?.map(s => s.sort_order) ?? [0]));
    await createSegment.mutateAsync({ ...segmentForm, sort_order: maxOrder + 1 });
    setIsAddSegmentOpen(false);
    setSegmentForm({ segment_name: "", description: "", color: "#3B82F6", sort_order: 0, is_active: true });
  };

  const handleUpdateSegment = async (id: string, updates: Partial<WorkshopSegmentInsert>) => {
    await updateSegment.mutateAsync({ id, ...updates });
    setEditingSegment(null);
  };

  const handleDeleteSegment = async (id: string) => {
    await deleteSegment.mutateAsync(id);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync(taskForm);
    setIsAddTaskOpen(null);
    setTaskForm({ segment_id: "", task_name: "", description: "", is_active: true });
  };

  const handleDeleteTask = async (id: string) => {
    await deleteTask.mutateAsync(id);
  };

  const getTasksForSegment = (segmentId: string) => {
    return allTasks?.filter(t => t.segment_id === segmentId) ?? [];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workshop Segments</h1>
          <p className="text-muted-foreground">Define custom workshop locations and tasks</p>
        </div>
        <Dialog open={isAddSegmentOpen} onOpenChange={setIsAddSegmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Segment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Workshop Segment</DialogTitle>
              <DialogDescription>Create a new workshop location for tracking vehicle progress.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSegment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment_name">Segment Name *</Label>
                <Input
                  id="segment_name"
                  value={segmentForm.segment_name}
                  onChange={(e) => setSegmentForm({ ...segmentForm, segment_name: e.target.value })}
                  placeholder="e.g., Panel Shop, Paint Shop, Assembly"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={segmentForm.description ?? ""}
                  onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                  placeholder="Optional description of this segment"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${segmentForm.color === color ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSegmentForm({ ...segmentForm, color })}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={segmentForm.is_active}
                  onCheckedChange={(checked) => setSegmentForm({ ...segmentForm, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddSegmentOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createSegment.isPending}>
                  {createSegment.isPending ? "Creating..." : "Create Segment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workshop Segments</CardTitle>
          <CardDescription>Drag to reorder. Click on a segment to manage its tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          {(!segments || segments.length === 0) ? (
            <div className="text-center py-8 text-muted-foreground">
              No segments created yet. Add your first segment to get started.
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-2">
              {segments.map((segment) => (
                <AccordionItem key={segment.id} value={segment.id} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: segment.color ?? "#6B7280" }}
                      />
                      <span className="font-medium">{segment.segment_name}</span>
                      <Badge variant={segment.is_active ? "default" : "secondary"} className="ml-2">
                        {segment.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="ml-auto mr-4">
                        {getTasksForSegment(segment.id).length} tasks
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {segment.description && (
                        <p className="text-sm text-muted-foreground">{segment.description}</p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateSegment(segment.id, { is_active: !segment.is_active })}
                        >
                          {segment.is_active ? "Deactivate" : "Activate"}
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
                              <AlertDialogTitle>Delete Segment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the segment "{segment.segment_name}" and all its tasks.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSegment(segment.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium flex items-center gap-2">
                            <ListTodo className="h-4 w-4" />
                            Tasks
                          </h4>
                          <Dialog open={isAddTaskOpen === segment.id} onOpenChange={(open) => {
                            setIsAddTaskOpen(open ? segment.id : null);
                            if (open) setTaskForm({ ...taskForm, segment_id: segment.id });
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Task
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Task to {segment.segment_name}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleCreateTask} className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Task Name *</Label>
                                  <Input
                                    value={taskForm.task_name}
                                    onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })}
                                    placeholder="e.g., Welding, Priming, Sanding"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={taskForm.description ?? ""}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                  />
                                </div>
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => setIsAddTaskOpen(null)}>Cancel</Button>
                                  <Button type="submit" disabled={createTask.isPending}>Add Task</Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>

                        <div className="space-y-2">
                          {getTasksForSegment(segment.id).map((task) => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div>
                                <span className="font-medium">{task.task_name}</span>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={task.is_active}
                                  onCheckedChange={(checked) => updateTask.mutate({ id: task.id, is_active: checked })}
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {getTasksForSegment(segment.id).length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                              No tasks defined. Add tasks that technicians can log.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
