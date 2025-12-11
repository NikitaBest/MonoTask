import { useState, useMemo, useEffect } from "react";
import { useStore, CalendarEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "@/components/event-form";
import { Plus, Calendar as CalendarIcon, Clock, Phone, Dumbbell, Briefcase, BookOpen, Users, Bell, MoreHorizontal, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
    <div className="h-full flex flex-col space-y-4 min-h-0">
      <div className="flex items-center justify-between flex-shrink-0">
        <h2 className="text-2xl font-bold">
          {format(selectedDate, "d MMMM yyyy", { locale: ru })}
        </h2>
        <Link href={`/calendar/${format(selectedDate, "yyyy-MM-dd")}`}>
          <Button variant="outline" size="sm">
            Подробнее
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
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
    </div>
  );
}

function WeekView({ selectedDate, events }: { selectedDate: Date; events: CalendarEvent[] }) {
  const [currentWeek, setCurrentWeek] = useState(selectedDate);
  const [selectedDay, setSelectedDay] = useState<Date>(selectedDate);

  const weekStartDate = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEndDate = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({ start: weekStartDate, end: weekEndDate });

  const weekEvents = useMemo(() => {
    return currentWeekDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return {
        day,
        dateStr,
        events: events
          .filter((e) => e.date === dateStr)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      };
    });
  }, [currentWeekDays, events]);

  const selectedDayEvents = useMemo(() => {
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    return events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDay, events]);

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeek(today);
    setSelectedDay(today);
  };

  // Обновляем выбранный день при изменении недели, если выбранный день не в текущей неделе
  useEffect(() => {
    const selectedDayInWeek = currentWeekDays.find(
      (day) => format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd")
    );
    if (!selectedDayInWeek) {
      setSelectedDay(currentWeekDays[0]);
    }
  }, [currentWeekDays, selectedDay]);

  return (
    <div className="h-full flex flex-col space-y-4 min-h-0">
      <div className="flex items-center justify-between flex-shrink-0">
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
        {/* Левая колонка: дни недели */}
        <div className="lg:col-span-1 space-y-2 overflow-y-auto min-h-0 pr-2 pl-1">
          {weekEvents.map(({ day, dateStr, events: dayEvents }) => {
            const isCurrentDay = isToday(day);
            const isSelected = format(day, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");

            return (
              <Card
                key={dateStr}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "bg-primary/5 shadow-[inset_0_0_0_2px_hsl(var(--primary))]",
                  isCurrentDay && !isSelected && "bg-primary/5 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.5)]"
                )}
                onClick={() => setSelectedDay(day)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected && "text-primary font-bold",
                          isCurrentDay && !isSelected && "text-primary"
                        )}>
                          {format(day, "EEE", { locale: ru })}
                        </span>
                        {isCurrentDay && (
                          <Badge variant="outline" className="text-xs">
                            Сегодня
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-lg font-bold",
                          isSelected && "text-primary"
                        )}>
                          {format(day, "d")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(day, "MMMM", { locale: ru })}
                        </span>
                      </div>
                    </div>
                    {dayEvents.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "ml-2",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                      >
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Правая колонка: события выбранного дня */}
        <div className="lg:col-span-3 flex flex-col min-h-0 overflow-hidden">
          <Card className="flex flex-col h-full min-h-0">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {format(selectedDay, "d MMMM yyyy", { locale: ru })}
                </CardTitle>
                <Link href={`/calendar/${format(selectedDay, "yyyy-MM-dd")}`}>
                  <Button variant="outline" size="sm">
                    Подробнее <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto min-h-0">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Нет событий на этот день</p>
                  <p className="text-sm mt-1">Выберите другой день или создайте новое событие</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => {
                    const config = eventTypeConfig[event.type] || eventTypeConfig.other;
                    const Icon = config.icon;
                    return (
                      <Link key={event.id} href={`/calendar/${format(selectedDay, "yyyy-MM-dd")}`}>
                        <Card className="hover:shadow-md transition-all cursor-pointer group">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className={cn("p-3 rounded-lg border flex-shrink-0", config.color)}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-lg mb-1">{event.title}</h4>
                                <div className="flex items-center gap-4 flex-wrap">
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {event.startTime}
                                      {event.endTime && ` - ${event.endTime}`}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className={cn("capitalize", config.color)}>
                                    {config.label}
                                  </Badge>
                                </div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                    {event.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
        <div className="lg:col-span-1 flex flex-col gap-3 overflow-y-auto min-h-0">
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

        <div className="lg:col-span-3 overflow-y-auto pr-2 min-h-0">
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

