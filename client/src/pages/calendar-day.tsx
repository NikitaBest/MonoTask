import { useRoute, Link } from "wouter";
import { useStore, CalendarEvent } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventForm } from "@/components/event-form";
import { ArrowLeft, Plus, Edit2, Trash2, Clock, Phone, Dumbbell, Briefcase, BookOpen, Users, Bell, MoreHorizontal } from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { ru } from "date-fns/locale";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const eventTypeConfig = {
  call: { label: "Созвон", icon: Phone, color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  workout: { label: "Тренировка", icon: Dumbbell, color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800" },
  work: { label: "Работа", icon: Briefcase, color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  development: { label: "Развитие", icon: BookOpen, color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  meeting: { label: "Встреча", icon: Users, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  reminder: { label: "Напоминание", icon: Bell, color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  other: { label: "Другое", icon: MoreHorizontal, color: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800" },
};

function EventCard({ event, onEdit, onDelete }: { event: CalendarEvent; onEdit: () => void; onDelete: () => void }) {
  const config = eventTypeConfig[event.type] || eventTypeConfig.other;
  const Icon = config.icon;

  return (
    <Card className="group relative hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg border flex-shrink-0", config.color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
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
                  <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{event.description}</p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="mr-2 h-4 w-4" /> Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CalendarDayPage() {
  const [, params] = useRoute("/calendar/:date");
  const dateStr = params?.date;
  
  const events = useStore((state) => state.events);
  const deleteEvent = useStore((state) => state.deleteEvent);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | undefined>();

  if (!dateStr) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Неверная дата</h2>
          <Link href="/calendar">
            <Button variant="outline">Вернуться к календарю</Button>
          </Link>
        </div>
      </div>
    );
  }

  let date: Date;
  try {
    date = parseISO(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
  } catch {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Неверный формат даты</h2>
          <Link href="/calendar">
            <Button variant="outline">Вернуться к календарю</Button>
          </Link>
        </div>
      </div>
    );
  }

  const dayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, dateStr]);

  const getDateLabel = () => {
    if (isToday(date)) return "Сегодня";
    if (isTomorrow(date)) return "Завтра";
    if (isYesterday(date)) return "Вчера";
    return format(date, "d MMMM yyyy", { locale: ru });
  };

  const handleCreateEvent = () => {
    setSelectedEvent(undefined);
    setIsFormOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (event: CalendarEvent) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      setDeleteDialogOpen(false);
      setEventToDelete(undefined);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-4xl mx-auto w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/calendar">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{getDateLabel()}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {format(date, "EEEE, d MMMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>
        <Button onClick={handleCreateEvent}>
          <Plus className="mr-2 h-4 w-4" /> Создать событие
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {dayEvents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium mb-2">Нет событий на этот день</p>
              <p className="text-sm mb-4">Создайте новое событие, чтобы начать планирование</p>
              <Button onClick={handleCreateEvent}>
                <Plus className="mr-2 h-4 w-4" /> Создать событие
              </Button>
            </CardContent>
          </Card>
        ) : (
          dayEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={() => handleEditEvent(event)}
              onDelete={() => handleDeleteClick(event)}
            />
          ))
        )}
      </div>

      <EventForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialDate={date}
        eventToEdit={selectedEvent}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить событие?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить событие "{eventToDelete?.title}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

