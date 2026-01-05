import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  useJobBookings,
  useCreateJobBooking,
  useUpdateJobBooking,
  useDeleteJobBooking,
  JobBooking,
} from "@/hooks/useJobBookings";
import {
  useWorkshopBaysWithAssignments,
  useCreateWorkshopBay,
  WorkshopBay,
} from "@/hooks/useWorkshopBays";
import { useWorkshopCases } from "@/hooks/useWorkshopCases";
import { useUserTenant } from "@/hooks/useUserTenant";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Car,
  Clock,
  MapPin,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bookingTypes = [
  { value: "repair", label: "Repair Work" },
  { value: "assessment", label: "Assessment" },
  { value: "collection", label: "Collection" },
  { value: "delivery", label: "Delivery" },
];

const priorities = [
  { value: "low", label: "Low", color: "bg-slate-500" },
  { value: "normal", label: "Normal", color: "bg-blue-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

export default function Scheduling() {
  const { tenantId } = useUserTenant();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isBayDialogOpen, setIsBayDialogOpen] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: bookings } = useJobBookings(
    format(weekStart, "yyyy-MM-dd"),
    format(weekEnd, "yyyy-MM-dd")
  );
  const { data: bays } = useWorkshopBaysWithAssignments();
  const { data: cases } = useWorkshopCases(tenantId);
  const createBooking = useCreateJobBooking();
  const updateBooking = useUpdateJobBooking();
  const deleteBooking = useDeleteJobBooking();
  const createBay = useCreateWorkshopBay();

  const [bookingForm, setBookingForm] = useState({
    case_id: "",
    bay_id: "",
    booking_date: "",
    estimated_days: 1,
    booking_type: "repair",
    priority: "normal",
    notes: "",
  });

  const [bayForm, setBayForm] = useState({
    name: "",
    code: "",
    bay_type: "general",
    capacity: 1,
  });

  const bookingsByDay = useMemo(() => {
    const map: Record<string, JobBooking[]> = {};
    bookings?.forEach((booking) => {
      const dateKey = booking.booking_date;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(booking);
    });
    return map;
  }, [bookings]);

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const handleToday = () => setCurrentDate(new Date());

  const handleOpenBookingDialog = (date?: Date) => {
    setBookingForm({
      case_id: "",
      bay_id: "",
      booking_date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      estimated_days: 1,
      booking_type: "repair",
      priority: "normal",
      notes: "",
    });
    setIsBookingDialogOpen(true);
  };

  const handleCreateBooking = async () => {
    await createBooking.mutateAsync({
      case_id: bookingForm.case_id || null,
      job_id: null,
      bay_id: bookingForm.bay_id || null,
      booking_date: bookingForm.booking_date,
      start_time: null,
      end_time: null,
      estimated_days: bookingForm.estimated_days,
      estimated_completion_date: format(
        addDays(new Date(bookingForm.booking_date), bookingForm.estimated_days),
        "yyyy-MM-dd"
      ),
      actual_completion_date: null,
      booking_type: bookingForm.booking_type,
      priority: bookingForm.priority,
      notes: bookingForm.notes || null,
      status: "scheduled",
      created_by: null,
    });
    setIsBookingDialogOpen(false);
  };

  const handleCreateBay = async () => {
    await createBay.mutateAsync({
      ...bayForm,
      is_active: true,
      notes: null,
      sort_order: bays?.length || 0,
      segment_id: null,
    });
    setIsBayDialogOpen(false);
    setBayForm({ name: "", code: "", bay_type: "general", capacity: 1 });
  };

  const getPriorityInfo = (priority: string) =>
    priorities.find((p) => p.value === priority) || priorities[1];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduling</h1>
          <p className="text-muted-foreground">
            Manage job bookings and bay allocations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsBayDialogOpen(true)}>
            <MapPin className="mr-2 h-4 w-4" />
            Add Bay
          </Button>
          <Button onClick={() => handleOpenBookingDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bays</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bays?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {bays?.filter((b) => b.current_assignment).length || 0} occupied
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookingsByDay[format(new Date(), "yyyy-MM-dd")]?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Bookings today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <Car className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings?.filter((b) => b.priority === "urgent").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">High priority jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
        </CardHeader>
        <CardContent>
          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayBookings = bookingsByDay[dateKey] || [];
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dateKey}
                  className={cn(
                    "min-h-[200px] border rounded-lg p-2",
                    isToday && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {format(day, "EEE")}
                      </div>
                      <div
                        className={cn(
                          "text-lg font-bold",
                          isToday && "text-primary"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleOpenBookingDialog(day)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {dayBookings.slice(0, 4).map((booking) => {
                      const priority = getPriorityInfo(booking.priority);
                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "text-xs p-1.5 rounded cursor-pointer hover:opacity-80",
                            priority.color,
                            "text-white"
                          )}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className="font-medium truncate">
                            {booking.case?.case_number || "No case"}
                          </div>
                          {booking.case?.vehicle && (
                            <div className="truncate opacity-80">
                              {booking.case.vehicle.make} {booking.case.vehicle.model}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayBookings.length > 4 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayBookings.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bay Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Bay Status</CardTitle>
        </CardHeader>
        <CardContent>
          {bays?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No bays configured. Add your first workshop bay.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              {bays?.map((bay) => (
                <div
                  key={bay.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    bay.current_assignment
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                      : "border-green-500 bg-green-50 dark:bg-green-950/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{bay.name}</span>
                    <Badge variant={bay.current_assignment ? "destructive" : "default"}>
                      {bay.current_assignment ? "Occupied" : "Available"}
                    </Badge>
                  </div>
                  {bay.code && (
                    <div className="text-sm text-muted-foreground">
                      Code: {bay.code}
                    </div>
                  )}
                  {bay.current_assignment?.vehicle && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium">
                        {bay.current_assignment.vehicle.make}{" "}
                        {bay.current_assignment.vehicle.model}
                      </div>
                      <div className="text-muted-foreground">
                        {bay.current_assignment.vehicle.registration_number}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Case</Label>
              <Select
                value={bookingForm.case_id}
                onValueChange={(value) =>
                  setBookingForm({ ...bookingForm, case_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a case" />
                </SelectTrigger>
                <SelectContent>
                  {cases?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} - {c.vehicle?.make} {c.vehicle?.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bay</Label>
              <Select
                value={bookingForm.bay_id}
                onValueChange={(value) =>
                  setBookingForm({ ...bookingForm, bay_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a bay (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {bays?.map((bay) => (
                    <SelectItem key={bay.id} value={bay.id}>
                      {bay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Input
                  type="date"
                  value={bookingForm.booking_date}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, booking_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Days</Label>
                <Input
                  type="number"
                  min={1}
                  value={bookingForm.estimated_days}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      estimated_days: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={bookingForm.booking_type}
                  onValueChange={(value) =>
                    setBookingForm({ ...bookingForm, booking_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={bookingForm.priority}
                  onValueChange={(value) =>
                    setBookingForm({ ...bookingForm, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={bookingForm.notes}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, notes: e.target.value })
                }
                placeholder="Optional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBooking}>Create Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bay Dialog */}
      <Dialog open={isBayDialogOpen} onOpenChange={setIsBayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Workshop Bay</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Bay Name</Label>
              <Input
                value={bayForm.name}
                onChange={(e) => setBayForm({ ...bayForm, name: e.target.value })}
                placeholder="e.g., Bay 1"
              />
            </div>
            <div className="space-y-2">
              <Label>Bay Code</Label>
              <Input
                value={bayForm.code}
                onChange={(e) => setBayForm({ ...bayForm, code: e.target.value })}
                placeholder="e.g., B1"
              />
            </div>
            <div className="space-y-2">
              <Label>Bay Type</Label>
              <Select
                value={bayForm.bay_type}
                onValueChange={(value) => setBayForm({ ...bayForm, bay_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="paint">Paint</SelectItem>
                  <SelectItem value="mechanical">Mechanical</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="assembly">Assembly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBayDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBay} disabled={!bayForm.name}>
              Add Bay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
