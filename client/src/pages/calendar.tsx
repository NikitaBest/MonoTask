import { useState, useMemo } from "react";
import { useStore, CalendarEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "@/components/event-form";
import { Plus, Calendar as CalendarIcon, Clock, Phone, Dumbbell, Briefcase, BookOpen, Users, Bell, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addWeeks, subWeeks, startOfDay, parseISO, addMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

const eventTypeConfig = {
  call: { label: "Созвон", icon: Phone, color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  workout: { label: "Тренировка", icon: Dumbbell, color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
  work: { label: "Работа", icon: Briefcase, color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  development: { label: "Развитие", icon: BookOpen, color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  meeting: { label: "Встреча", icon: Users, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  reminder: { label: "Напоминание", icon: Bell, color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  other: { label: "Другое", icon: MoreHorizontal, color: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800" },
};

function EventCard({ event }: { event: CalendarEvent }) {
  const config = eventTypeConfig[event.type] || eventTypeConfig.other;
  const Icon = config.icon;

  return (
    <Link href={`/calendar/${event.date}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-md border", config.color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{event.title}</h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {event.startTime}
                  {event.endTime && ` - ${event.endTime}`}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function DayView({ selectedDate, events }: { selectedDate: Date; events: CalendarEvent[] }) {
  const dayEvents = useMemo(() => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    return events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, events]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {format(selectedDate, "d MMMM yyyy", { locale: ru })}
        </h2>
        <Link href={`/calendar/${format(selectedDate, "yyyy-MM-dd")}`}>
          <Button variant="outline" size="sm">
            Подробнее
          </Button>
        </Link>
      </div>

      {dayEvents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Нет событий на этот день</p>
            <p className="text-sm">Создайте новое событие, чтобы начать планирование</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {dayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekView({ selectedDate, events }: { selectedDate: Date; events: CalendarEvent[] }) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const [currentWeek, setCurrentWeek] = useState(selectedDate);

  const weekStartDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEndDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });

  const weekEvents = useMemo(() => {
    return currentWeekDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        day,
        events: events
          .filter((e) => e.date === dateStr)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      };
    });
  }, [currentWeekDays, events]);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-bold ml-2">
            {format(weekStartDate, "d MMM", { locale: ru })} - {format(weekEndDate, "d MMM yyyy", { locale: ru })}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Сегодня
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekEvents.map(({ day, events: dayEvents }) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrentDay = isToday(day);

          return (
            <Card key={dateStr} className={cn("flex flex-col", isCurrentDay && "ring-2 ring-primary")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className={cn(isCurrentDay && "text-primary font-bold")}>
                    {format(day, "EEE", { locale: ru })}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isCurrentDay ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-2 space-y-1 overflow-y-auto max-h-[400px]">
                {dayEvents.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    Нет событий
                  </div>
                ) : (
                  dayEvents.slice(0, 3).map((event) => {
                    const config = eventTypeConfig[event.type] || eventTypeConfig.other;
                    return (
                      <Link key={event.id} href={`/calendar/${dateStr}`}>
                        <div
                          className={cn(
                            "text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all",
                            config.color
                          )}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-[10px] opacity-75 mt-0.5">
                            {event.startTime}
                            {event.endTime && `-${event.endTime}`}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
                {dayEvents.length > 3 && (
                  <Link href={`/calendar/${dateStr}`}>
                    <div className="text-xs text-center text-muted-foreground py-1 hover:text-foreground transition-colors">
                      +{dayEvents.length - 3} еще
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const events = useStore((state) => state.events);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week">("week");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  const markedDates = useMemo(() => {
    const dates = new Set(events.map((e) => e.date));
    return Array.from(dates).map((dateStr) => parseISO(dateStr));
  }, [events]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setView("day");
    }
  };

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setIsFormOpen(true);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Календарь</h1>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as "day" | "week")}>
            <TabsList>
              <TabsTrigger value="day">День</TabsTrigger>
              <TabsTrigger value="week">Неделя</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" /> Создать событие
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto">
          <div className="bg-card border rounded-lg p-2 flex-shrink-0 w-fit">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ru}
              modifiers={{
                hasEvents: markedDates,
              }}
              components={{
                DayButton: ({ day, modifiers, className, ...props }) => {
                  const hasEvents = modifiers.hasEvents;
                  return (
                    <div className="relative inline-flex items-center justify-center">
                      <CalendarDayButton
                        day={day}
                        modifiers={modifiers}
                        className={cn(
                          "h-7 w-7 text-[11px]",
                          className
                        )}
                        {...props}
                      />
                      {hasEvents && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-500" />
                      )}
                    </div>
                  );
                },
              }}
              classNames={{
                root: "w-fit p-0",
                months: "w-fit",
                month: "w-fit gap-2",
                caption: "text-xs font-medium mb-1 px-1",
                caption_label: "text-xs font-medium",
                nav: "gap-0.5",
                button_previous: "h-6 w-6",
                button_next: "h-6 w-6",
                month_caption: "h-6",
                table: "w-fit",
                head_row: "border-b border-border/50",
                head_cell: "text-[10px] font-normal text-muted-foreground pb-1 px-0.5",
                row: "mt-0.5",
                cell: "p-0",
                day: "h-7 w-7 text-[11px] relative",
                day_button: "h-7 w-7 text-[11px] relative",
              }}
              className="w-fit [--cell-size:1.75rem] !p-0"
            />
          </div>
          
          <div className="bg-card border rounded-lg p-2 flex-shrink-0 w-fit">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              defaultMonth={addMonths(selectedDate, 1)}
              locale={ru}
              modifiers={{
                hasEvents: markedDates,
              }}
              components={{
                DayButton: ({ day, modifiers, className, ...props }) => {
                  const hasEvents = modifiers.hasEvents;
                  return (
                    <div className="relative inline-flex items-center justify-center">
                      <CalendarDayButton
                        day={day}
                        modifiers={modifiers}
                        className={cn(
                          "h-7 w-7 text-[11px]",
                          className
                        )}
                        {...props}
                      />
                      {hasEvents && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-500" />
                      )}
                    </div>
                  );
                },
              }}
              classNames={{
                root: "w-fit p-0",
                months: "w-fit",
                month: "w-fit gap-2",
                caption: "text-xs font-medium mb-1 px-1",
                caption_label: "text-xs font-medium",
                nav: "gap-0.5",
                button_previous: "h-6 w-6",
                button_next: "h-6 w-6",
                month_caption: "h-6",
                table: "w-fit",
                head_row: "border-b border-border/50",
                head_cell: "text-[10px] font-normal text-muted-foreground pb-1 px-0.5",
                row: "mt-0.5",
                cell: "p-0",
                day: "h-7 w-7 text-[11px] relative",
                day_button: "h-7 w-7 text-[11px] relative",
              }}
              className="w-fit [--cell-size:1.75rem] !p-0"
            />
          </div>
        </div>

        <div className="lg:col-span-3 overflow-y-auto pr-2">
          {view === "day" ? (
            <DayView selectedDate={selectedDate} events={events} />
          ) : (
            <WeekView selectedDate={selectedDate} events={events} />
          )}
        </div>
      </div>

      <EventForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialDate={selectedDate}
        eventToEdit={selectedEvent}
      />
    </div>
  );
}

