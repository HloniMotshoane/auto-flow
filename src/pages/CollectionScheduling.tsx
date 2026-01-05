import { useState } from "react";
import { useCollectionSchedules } from "@/hooks/useCollectionSchedules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Phone, User, Car, CheckCircle, Loader2 } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { AppLayout } from "@/components/AppLayout";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
  no_show: "bg-orange-500",
};

export default function CollectionScheduling() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const { schedules, isLoading, confirmSchedule, completeSchedule } = useCollectionSchedules();

  const filteredSchedules = schedules.filter((s) => {
    if (!selectedDate) return true;
    return s.scheduled_date === selectedDate;
  });

  const todaySchedules = schedules.filter((s) => isToday(parseISO(s.scheduled_date)));
  const tomorrowSchedules = schedules.filter((s) => isTomorrow(parseISO(s.scheduled_date)));
  const pendingCount = schedules.filter((s) => s.status === "scheduled").length;

  const getDateLabel = (date: string) => {
    const parsed = parseISO(date);
    if (isToday(parsed)) return "Today";
    if (isTomorrow(parsed)) return "Tomorrow";
    return format(parsed, "EEE, MMM d");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection Scheduling</h1>
          <p className="text-muted-foreground">
            Manage vehicle collection appointments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Collections</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todaySchedules.length}</div>
              <p className="text-xs text-muted-foreground">
                {todaySchedules.filter((s) => s.status === "confirmed").length} confirmed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tomorrow</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tomorrowSchedules.length}</div>
              <p className="text-xs text-muted-foreground">scheduled pickups</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">awaiting customer confirmation</p>
            </CardContent>
          </Card>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scheduled Collections</CardTitle>
                <CardDescription>Filter by date to view scheduled pickups</CardDescription>
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No collections scheduled for {getDateLabel(selectedDate)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm text-muted-foreground">
                          {getDateLabel(schedule.scheduled_date)}
                        </p>
                        {schedule.scheduled_time && (
                          <p className="font-bold">
                            {format(parseISO(`2000-01-01T${schedule.scheduled_time}`), "h:mm a")}
                          </p>
                        )}
                      </div>
                      <div className="border-l pl-4">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {schedule.case?.vehicle?.registration || "N/A"}
                          </span>
                          <span className="text-muted-foreground">
                            {schedule.case?.vehicle?.make} {schedule.case?.vehicle?.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {schedule.contact_name || schedule.customer?.name}
                          </div>
                          {schedule.contact_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {schedule.contact_phone}
                            </div>
                          )}
                        </div>
                        {schedule.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{schedule.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[schedule.status]} text-white`}>
                        {schedule.status}
                      </Badge>
                      {schedule.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => confirmSchedule.mutate(schedule.id)}
                          disabled={confirmSchedule.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                      )}
                      {schedule.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => completeSchedule.mutate(schedule.id)}
                          disabled={completeSchedule.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
