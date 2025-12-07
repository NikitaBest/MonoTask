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
import { ChevronLeft, ChevronRight, Plus, Bell, Phone, Users, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Task, CalendarEvent } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { EventForm } from "./event-form";
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

  const tasks = useStore((state) => state.tasks);
  const events = useStore((state) => state.events);
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
    setSelectedSlot({ date, hour, minute });
    setIsEventFormOpen(true);
  };

  // Получаем задачи и события для даты
  const getItemsForDate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    
    // Задачи с зафиксированным временем (startTime и endTime)
    const dayTasks = tasks.filter(t => {
      if (!isSameDay(new Date(t.date), date)) return false;
      if (!t.startTime || !t.endTime) return false;
      const hasCompletedSession = t.timeSessions?.some(s => s.startTime && s.endTime);
      return hasCompletedSession === true;
    });

    // События для этой даты
    const dayEvents = events.filter(e => e.date === dateString);

    return { tasks: dayTasks, events: dayEvents };
  };

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
    const { tasks: dayTasks, events: dayEvents } = getItemsForDate(currentDate);
    
    return (
      <div className="flex flex-col h-full overflow-y-auto pr-2">
         {timeSlots.map((slot) => {
           const timeString = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`;
           const isFullHour = slot.minute === 0;
           
           // Находим задачи и события, которые попадают в этот временной слот
           const slotTasks = dayTasks.filter(t => 
             t.startTime && t.endTime && isTimeInRange(slot.minutes, t.startTime, t.endTime)
           );
           
           const slotEvents = dayEvents.filter(e => 
             isTimeInRange(slot.minutes, e.startTime, e.endTime)
           );
           
           return (
             <div key={`${slot.hour}-${slot.minute}`} className={cn(
               "flex border-b border-dashed relative group",
               isFullHour ? "h-12" : "h-6"
             )}>
               <div className={cn(
                 "w-16 flex-shrink-0 text-xs text-muted-foreground pt-1 text-right pr-4 sticky left-0 bg-background/50 z-10",
                 !isFullHour && "text-[10px] opacity-60"
               )}>
                 {timeString}
               </div>
               <div 
                 className="flex-1 relative p-0.5 hover:bg-secondary/20 transition-colors cursor-pointer"
                 onClick={() => handleSlotClick(currentDate, slot.hour, slot.minute)}
               >
                 {/* Отображаем события */}
                 {slotEvents.map(event => {
                   const eventTypeIcons = {
                     reminder: Bell,
                     meeting: Users,
                     call: Phone,
                     task: CheckSquare,
                   };
                   const Icon = eventTypeIcons[event.type];
                   const eventTypeColors = {
                     reminder: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400",
                     meeting: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400",
                     call: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400",
                     task: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400",
                   };
                   
                   return (
                     <div 
                       key={event.id} 
                       onClick={(e) => e.stopPropagation()} 
                       className={cn(
                         "mb-1 p-2 rounded-md border text-xs font-medium flex items-center gap-2",
                         eventTypeColors[event.type]
                       )}
                     >
                       <Icon className="w-3 h-3 flex-shrink-0" />
                       <span className="truncate">{event.title}</span>
                       {event.startTime && event.endTime && (
                         <span className="text-[10px] opacity-70 ml-auto">
                           {event.startTime} - {event.endTime}
                         </span>
                       )}
                     </div>
                   );
                 })}
                 
                 {/* Отображаем задачи */}
                 {slotTasks.map(task => (
                   <div key={task.id} onClick={(e) => e.stopPropagation()} className="mb-1">
                     <TaskCard task={task} compact />
                   </div>
                 ))}
               </div>
             </div>
           );
         })}
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
                  const { tasks: dayTasks, events: dayEvents } = getItemsForDate(day);
                  
                  const slotTasks = dayTasks.filter(t => 
                    t.startTime && t.endTime && isTimeInRange(slot.minutes, t.startTime, t.endTime)
                  );
                  
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
                       
                       return (
                         <div 
                           key={event.id} 
                           onClick={(e) => e.stopPropagation()} 
                           className="mb-0.5 p-1 rounded text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 truncate flex items-center gap-1"
                         >
                           <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                           <span className="truncate">{event.title}</span>
                         </div>
                       );
                     })}
                     {slotTasks.map(task => (
                       <div key={task.id} onClick={(e) => e.stopPropagation()} className="mb-0.5">
                         <TaskCard task={task} compact />
                       </div>
                     ))}
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
             const { tasks: dayTasks, events: dayEvents } = getItemsForDate(day);
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
                   {dayEvents.slice(0, 2).map(event => {
                     const eventTypeIcons = {
                       reminder: Bell,
                       meeting: Users,
                       call: Phone,
                       task: CheckSquare,
                     };
                     const Icon = eventTypeIcons[event.type];
                     
                     return (
                       <div 
                         key={event.id} 
                         className="text-[10px] p-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 truncate flex items-center gap-1"
                       >
                         <Icon className="w-2.5 h-2.5 flex-shrink-0" />
                         <span className="truncate">{event.title}</span>
                       </div>
                     );
                   })}
                   {dayTasks.slice(0, 3 - dayEvents.length).map(task => (
                     <TaskCard key={task.id} task={task} compact />
                   ))}
                   {(dayTasks.length + dayEvents.length) > 3 && (
                     <div className="text-xs text-muted-foreground text-center pt-1">
                       + ещё {(dayTasks.length + dayEvents.length) - 3}
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
        onOpenChange={setIsEventFormOpen} 
        initialDate={selectedSlot?.date}
        initialTime={selectedSlot?.hour !== undefined && selectedSlot?.minute !== undefined 
          ? `${selectedSlot.hour.toString().padStart(2, '0')}:${selectedSlot.minute.toString().padStart(2, '0')}`
          : undefined}
      />
    </div>
  );
}

