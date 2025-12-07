import { useState, useMemo } from "react";
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
  getHours,
  setHours,
  isToday
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, Task } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";

type ViewMode = "day" | "week" | "month";

export function CalendarView() {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date, time?: string } | null>(null);

  const tasks = useStore((state) => state.tasks);
  const { dayStartHour, dayEndHour, startOfWeek: startOfWeekSetting } = useStore((state) => state.settings);

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

  const handleSlotClick = (date: Date, hour?: number) => {
    const timeString = hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : undefined;
    setSelectedSlot({ date, time: timeString });
    setIsFormOpen(true);
  };

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
        <Button size="sm" onClick={() => { setSelectedSlot({ date: currentDate }); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Задача
        </Button>
      </div>
    </div>
  );

  const getTasksForDate = (date: Date) => {
    return tasks.filter(t => isSameDay(new Date(t.date), date));
  };

  const hours = Array.from({ length: dayEndHour - dayStartHour + 1 }, (_, i) => i + dayStartHour);

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    
    return (
      <div className="flex flex-col h-full overflow-y-auto pr-2">
         {hours.map(hour => (
           <div key={hour} className="flex min-h-[80px] border-b border-dashed relative group">
             <div className="w-16 flex-shrink-0 text-xs text-muted-foreground pt-2 text-right pr-4 sticky left-0 bg-background/50">
               {hour}:00
             </div>
             <div 
               className="flex-1 relative p-1 hover:bg-secondary/20 transition-colors cursor-pointer"
               onClick={() => handleSlotClick(currentDate, hour)}
             >
                {/* Render tasks that start in this hour */}
                {dayTasks
                  .filter(t => {
                    if (!t.startTime) return hour === dayStartHour; // Show all-day/untimed tasks at start
                    const taskHour = parseInt(t.startTime.split(':')[0]);
                    return taskHour === hour;
                  })
                  .map(task => (
                    <div key={task.id} onClick={(e) => e.stopPropagation()} className="mb-2">
                      <TaskCard task={task} />
                    </div>
                  ))
                }
             </div>
           </div>
         ))}
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
          {hours.map(hour => (
            <div key={hour} className="flex min-h-[60px] border-b border-dashed">
              <div className="w-16 flex-shrink-0 text-xs text-muted-foreground pt-1 text-right pr-2 sticky left-0 bg-background">
                {hour}:00
              </div>
              {days.map(day => {
                const dayTasks = getTasksForDate(day);
                const hourTasks = dayTasks.filter(t => {
                   if (!t.startTime) return hour === dayStartHour; 
                   const taskHour = parseInt(t.startTime.split(':')[0]);
                   return taskHour === hour;
                });

                return (
                  <div 
                    key={`${day}-${hour}`} 
                    className="flex-1 border-l p-0.5 hover:bg-secondary/20 transition-colors cursor-pointer min-w-[100px]"
                    onClick={() => handleSlotClick(day, hour)}
                  >
                     {hourTasks.map(task => (
                       <div key={task.id} onClick={(e) => e.stopPropagation()} className="mb-1">
                         <TaskCard task={task} compact />
                       </div>
                     ))}
                  </div>
                );
              })}
            </div>
          ))}
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
             const dayTasks = getTasksForDate(day);
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
                   {dayTasks.slice(0, 3).map(task => (
                     <TaskCard key={task.id} task={task} compact />
                   ))}
                   {dayTasks.length > 3 && (
                     <div className="text-xs text-muted-foreground text-center pt-1">
                       + ещё {dayTasks.length - 3}
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

      <TaskForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        initialDate={selectedSlot?.date}
        initialTime={selectedSlot?.time}
      />
    </div>
  );
}
