import { useState, useMemo, useEffect } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  addWeeks, 
  addMonths, 
  subDays, 
  subWeeks, 
  subMonths,
  isToday
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Bell, Phone, Users, CheckSquare, Edit2, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, CalendarEvent } from "@/lib/store";
import { cn } from "@/lib/utils";
import { EventForm } from "./event-form";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

type ViewMode = "day" | "week" | "month";

// Функция для преобразования времени в минуты от начала дня
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Функция для проверки, попадает ли временной слот в период задачи/события
const isTimeInRange = (slotMinutes: number, startTime: string, endTime?: string): boolean => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = endTime ? timeToMinutes(endTime) : startMinutes + 30; // По умолчанию 30 минут
  
  return slotMinutes >= startMinutes && slotMinutes < endMinutes;
};

export function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; hour?: number; minute?: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();

  const events = useStore((state) => state.events);
  const deleteEvent = useStore((state) => state.deleteEvent);
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  
  // Убеждаемся, что настройки времени обновлены для полных суток
  useEffect(() => {
    if (settings.dayStartHour !== 0 || settings.dayEndHour !== 23) {
      updateSettings({ dayStartHour: 0, dayEndHour: 23 });
    }
  }, [settings.dayStartHour, settings.dayEndHour, updateSettings]);
  
  const { dayStartHour, dayEndHour, startOfWeek: startOfWeekSetting } = settings;
  const weekStartsOn = startOfWeekSetting === 'sunday' ? 0 : 1;

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === "day") setCurrentDate(subDays(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleSlotClick = (date: Date, hour?: number, minute?: number) => {
    setSelectedEvent(undefined);
    setSelectedSlot({ date, hour, minute });
    setIsEventFormOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsEventFormOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Вы уверены, что хотите удалить это событие?")) {
      deleteEvent(eventId);
    }
  };

  // Получаем события для даты
  const getItemsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // События для этой даты, отсортированные по времени начала
    const dayEvents = events
      .filter(e => e.date === dateString)
      .sort((a, b) => {
        const timeA = timeToMinutes(a.startTime);
        const timeB = timeToMinutes(b.startTime);
        return timeA - timeB;
      });

    return { events: dayEvents };
  };

  // Получаем все события для текущего дня (для боковой панели)
  const dayEventsList = useMemo(() => {
    return getItemsForDate(currentDate).events;
  }, [currentDate, events]);

  // Генерируем получасовые интервалы
  const timeSlots = useMemo(() => {
    const slots: { hour: number; minute: number; minutes: number }[] = [];
    for (let hour = dayStartHour; hour <= dayEndHour; hour++) {
      slots.push({ hour, minute: 0, minutes: hour * 60 });
      slots.push({ hour, minute: 30, minutes: hour * 60 + 30 });
    }
    return slots;
  }, [dayStartHour, dayEndHour]);

  // Renderers
  const renderHeader = () => (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sticky top-0 bg-background/95 backdrop-blur-sm z-20 py-4 border-b">
      <div className="flex items-center gap-2">
         <div className="flex items-center bg-secondary/50 rounded-lg p-1 border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode("day")}
              className={cn("h-8 rounded-md px-3", viewMode === "day" && "bg-background shadow-sm")}
            >
              День
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode("week")}
              className={cn("h-8 rounded-md px-3", viewMode === "week" && "bg-background shadow-sm")}
            >
              Неделя
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setViewMode("month")}
              className={cn("h-8 rounded-md px-3", viewMode === "month" && "bg-background shadow-sm")}
            >
              Месяц
            </Button>
         </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="w-32 text-center font-semibold text-lg capitalize">
            {viewMode === "day" && format(currentDate, "MMM d", { locale: ru })}
            {viewMode === "week" && `Нед ${format(currentDate, "w")}, ${format(currentDate, "MMM", { locale: ru })}`}
            {viewMode === "month" && format(currentDate, "MMMM yyyy", { locale: ru })}
          </div>
          <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8 rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday} className="hidden sm:flex">Сегодня</Button>
        <Button size="sm" onClick={() => { setSelectedSlot({ date: currentDate }); setIsEventFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Событие
        </Button>
      </div>
    </div>
  );

  const renderDayView = () => {
    const { events: dayEvents } = getItemsForDate(currentDate);
    
    // Группируем события по времени начала для лучшего отображения
    const eventsBySlot: Record<string, CalendarEvent[]> = {};
    dayEvents.forEach(event => {
      const startMinutes = timeToMinutes(event.startTime);
      const slotKey = `${Math.floor(startMinutes / 30)}`;
      if (!eventsBySlot[slotKey]) {
        eventsBySlot[slotKey] = [];
      }
      eventsBySlot[slotKey].push(event);
    });
    
    return (
      <div className="flex h-full gap-4">
        {/* Основная область с временными слотами */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto pr-2">
          {timeSlots.map((slot) => {
            const timeString = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`;
            const isFullHour = slot.minute === 0;
            const slotKey = `${Math.floor(slot.minutes / 30)}`;
            const slotEvents = eventsBySlot[slotKey] || [];
            
            // Находим события, которые начинаются в этом слоте
            const startingEvents = slotEvents.filter(e => {
              const eventStart = timeToMinutes(e.startTime);
              return eventStart >= slot.minutes && eventStart < slot.minutes + 30;
            });
            
            return (
              <div key={`${slot.hour}-${slot.minute}`} className={cn(
                "flex border-b border-dashed relative group",
                isFullHour ? "h-16" : "h-8"
              )}>
                <div className={cn(
                  "w-20 flex-shrink-0 text-xs text-muted-foreground pt-1 text-right pr-4 sticky left-0 bg-background z-10",
                  !isFullHour && "text-[10px] opacity-60"
                )}>
                  {isFullHour && timeString}
                </div>
                <div 
                  className="flex-1 relative p-1 hover:bg-secondary/20 transition-colors cursor-pointer"
                  onClick={() => handleSlotClick(currentDate, slot.hour, slot.minute)}
                >
                  {startingEvents.map(event => {
                    const eventTypeIcons = {
                      reminder: Bell,
                      meeting: Users,
                      call: Phone,
                      task: CheckSquare,
                    };
                    const Icon = eventTypeIcons[event.type];
                    const eventTypeColors = {
                      reminder: "bg-blue-500/90 text-white border-blue-600 dark:bg-blue-600 dark:text-white shadow-sm",
                      meeting: "bg-purple-500/90 text-white border-purple-600 dark:bg-purple-600 dark:text-white shadow-sm",
                      call: "bg-green-500/90 text-white border-green-600 dark:bg-green-600 dark:text-white shadow-sm",
                      task: "bg-orange-500/90 text-white border-orange-600 dark:bg-orange-600 dark:text-white shadow-sm",
                    };
                    
                    const startMinutes = timeToMinutes(event.startTime);
                    const endMinutes = event.endTime ? timeToMinutes(event.endTime) : startMinutes + 30;
                    const duration = endMinutes - startMinutes;
                    const height = Math.max(duration / 30 * 32, 32); // Минимум 32px, каждый 30 минут = 32px
                    
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className={cn(
                          "absolute left-1 right-1 rounded-md border p-2 text-xs font-medium flex flex-col gap-1 cursor-pointer hover:shadow-md transition-all z-20",
                          eventTypeColors[event.type]
                        )}
                        style={{
                          top: `${((startMinutes - slot.minutes) / 30) * 32}px`,
                          height: `${height}px`,
                          minHeight: '32px'
                        }}
                      >
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="font-semibold truncate">{event.title}</span>
                        </div>
                        <div className="text-[10px] opacity-90 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                        </div>
                        {event.description && (
                          <div className="text-[10px] opacity-80 line-clamp-1 truncate">
                            {event.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Боковая панель со списком событий */}
        {dayEventsList.length > 0 && (
          <div className="w-80 flex-shrink-0 border-l bg-muted/30 p-4 overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                События дня ({dayEventsList.length})
              </h3>
              {dayEventsList.map(event => {
                const eventTypeIcons = {
                  reminder: Bell,
                  meeting: Users,
                  call: Phone,
                  task: CheckSquare,
                };
                const Icon = eventTypeIcons[event.type];
                const eventTypeColors = {
                  reminder: "bg-blue-500 text-white",
                  meeting: "bg-purple-500 text-white",
                  call: "bg-green-500 text-white",
                  task: "bg-orange-500 text-white",
                };
                
                return (
                  <Card 
                    key={event.id} 
                    className="cursor-pointer hover:shadow-md transition-all group"
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("p-1 rounded", eventTypeColors[event.type])}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className="font-semibold text-sm truncate">{event.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.startTime}{event.endTime && ` - ${event.endTime}`}</span>
                          </div>
                          {event.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event, e);
                            }}>
                              <Edit2 className="mr-2 h-4 w-4" /> Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: weekStartsOn as 0 | 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: weekStartsOn as 0 | 1 });
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Row */}
        <div className="flex border-b">
          <div className="w-16 flex-shrink-0"></div>
          {days.map(day => (
            <div 
              key={day.toString()} 
              className={cn(
                "flex-1 text-center py-2 text-sm font-medium border-l truncate capitalize",
                isToday(day) && "bg-secondary text-primary"
              )}
            >
              <div>{format(day, "EEE", { locale: ru })}</div>
              <div className={cn("text-lg", isToday(day) && "font-bold")}>{format(day, "d")}</div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto">
          {timeSlots.map((slot) => {
            const timeString = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`;
            const isFullHour = slot.minute === 0;
            
            return (
              <div key={`${slot.hour}-${slot.minute}`} className={cn(
                "flex border-b border-dashed",
                isFullHour ? "h-10" : "h-5"
              )}>
                <div className={cn(
                  "w-16 flex-shrink-0 text-xs text-muted-foreground pt-0.5 text-right pr-2 sticky left-0 bg-background z-10",
                  !isFullHour && "text-[10px] opacity-60"
                )}>
                  {timeString}
                </div>
                {days.map(day => {
                  const { events: dayEvents } = getItemsForDate(day);
                  
                  const slotEvents = dayEvents.filter(e => 
                    isTimeInRange(slot.minutes, e.startTime, e.endTime)
                  );

                  return (
                    <div 
                      key={`${day}-${slot.hour}-${slot.minute}`} 
                      className="flex-1 border-l p-0.5 hover:bg-secondary/20 transition-colors cursor-pointer min-w-[100px]"
                      onClick={() => handleSlotClick(day, slot.hour, slot.minute)}
                    >
                     {slotEvents.map(event => {
                       const eventTypeIcons = {
                         reminder: Bell,
                         meeting: Users,
                         call: Phone,
                         task: CheckSquare,
                       };
                       const Icon = eventTypeIcons[event.type];
                       const eventTypeColors = {
                         reminder: "bg-blue-500/90 text-white",
                         meeting: "bg-purple-500/90 text-white",
                         call: "bg-green-500/90 text-white",
                         task: "bg-orange-500/90 text-white",
                       };
                       
                       return (
                         <div 
                           key={event.id} 
                           onClick={(e) => handleEventClick(event, e)} 
                           className={cn(
                             "mb-0.5 p-1.5 rounded text-[10px] font-medium truncate flex items-center gap-1 cursor-pointer hover:shadow-sm transition-all",
                             eventTypeColors[event.type]
                           )}
                         >
                           <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                           <span className="truncate">{event.title}</span>
                         </div>
                       );
                     })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const startDate = startOfWeek(start, { weekStartsOn: weekStartsOn as 0 | 1 });
    const endDate = endOfWeek(end, { weekStartsOn: weekStartsOn as 0 | 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = weekStartsOn === 1 
      ? ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
      : ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

    return (
      <div className="h-full flex flex-col">
        {/* Week Headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((d, i) => (
             <div key={i} className="py-2 text-center text-sm font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, idx) => {
             const { events: dayEvents } = getItemsForDate(day);
             const isCurrentMonth = isSameMonth(day, currentDate);
             
             return (
               <div 
                 key={day.toString()} 
                 className={cn(
                   "border-b border-r p-2 min-h-[100px] hover:bg-secondary/10 transition-colors flex flex-col gap-1 cursor-pointer",
                   !isCurrentMonth && "bg-muted/10 text-muted-foreground opacity-50",
                   isToday(day) && "bg-secondary/20"
                 )}
                 onClick={() => handleSlotClick(day)}
               >
                 <div className="text-right text-sm font-medium mb-1">
                   <span className={cn(
                     isToday(day) && "bg-primary text-primary-foreground w-6 h-6 rounded-full inline-flex items-center justify-center"
                   )}>
                     {format(day, "d")}
                   </span>
                 </div>
                 
                 <div className="flex-1 overflow-hidden space-y-1">
                   {dayEvents.slice(0, 3).map(event => {
                     const eventTypeIcons = {
                       reminder: Bell,
                       meeting: Users,
                       call: Phone,
                       task: CheckSquare,
                     };
                     const Icon = eventTypeIcons[event.type];
                     const eventTypeColors = {
                       reminder: "bg-blue-500/90 text-white",
                       meeting: "bg-purple-500/90 text-white",
                       call: "bg-green-500/90 text-white",
                       task: "bg-orange-500/90 text-white",
                     };
                     
                     return (
                       <div 
                         key={event.id}
                         onClick={(e) => {
                           e.stopPropagation();
                           handleEventClick(event, e);
                         }}
                         className={cn(
                           "text-[10px] p-1.5 rounded font-medium truncate flex items-center gap-1 cursor-pointer hover:shadow-sm transition-all",
                           eventTypeColors[event.type]
                         )}
                       >
                         <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                         <span className="truncate">{event.title}</span>
                       </div>
                     );
                   })}
                   {dayEvents.length > 3 && (
                     <div className="text-xs text-muted-foreground text-center pt-1">
                       + ещё {dayEvents.length - 3}
                     </div>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-screen p-4 md:p-6 overflow-hidden">
      {renderHeader()}
      
      <div className="flex-1 overflow-hidden rounded-xl border bg-card/50 shadow-sm relative">
         {viewMode === "day" && renderDayView()}
         {viewMode === "week" && renderWeekView()}
         {viewMode === "month" && renderMonthView()}
      </div>

      <EventForm 
        open={isEventFormOpen} 
        onOpenChange={(open) => {
          setIsEventFormOpen(open);
          if (!open) {
            setSelectedEvent(undefined);
            setSelectedSlot(null);
          }
        }}
        initialDate={selectedSlot?.date}
        initialTime={selectedSlot?.hour !== undefined && selectedSlot?.minute !== undefined 
          ? `${selectedSlot.hour.toString().padStart(2, '0')}:${selectedSlot.minute.toString().padStart(2, '0')}`
          : undefined}
        eventToEdit={selectedEvent}
      />
    </div>
  );
}

