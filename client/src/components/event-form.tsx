import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Phone, Dumbbell, Briefcase, BookOpen, Users, Bell, MoreHorizontal, Link as LinkIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useStore, CalendarEvent } from "@/lib/store";
import { cn } from "@/lib/utils";

const eventSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Формат: HH:mm"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Формат: HH:mm").optional().or(z.literal("")),
  description: z.string().optional(),
  url: z.string().optional().or(z.literal("")).refine((val) => {
    if (!val || val === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Неверный формат ссылки",
  }),
  type: z.enum(["call", "workout", "work", "development", "meeting", "reminder", "other"] as const),
});

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  eventToEdit?: CalendarEvent;
}

const eventTypeConfig = {
  call: { label: "Созвон", icon: Phone, color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  workout: { label: "Тренировка", icon: Dumbbell, color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  work: { label: "Работа", icon: Briefcase, color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  development: { label: "Развитие", icon: BookOpen, color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  meeting: { label: "Встреча", icon: Users, color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  reminder: { label: "Напоминание", icon: Bell, color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  other: { label: "Другое", icon: MoreHorizontal, color: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400" },
};

export function EventForm({ open, onOpenChange, initialDate, eventToEdit }: EventFormProps) {
  const addEvent = useStore((state) => state.addEvent);
  const updateEvent = useStore((state) => state.updateEvent);
  
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      startTime: "09:00",
      endTime: "",
      description: "",
      url: "",
      type: "call",
    },
  });

  useEffect(() => {
    if (open) {
      if (eventToEdit) {
        form.reset({
          title: eventToEdit.title,
          date: new Date(eventToEdit.date),
          startTime: eventToEdit.startTime,
          endTime: eventToEdit.endTime || "",
          description: eventToEdit.description || "",
          url: eventToEdit.url || "",
          type: eventToEdit.type,
        });
      } else {
        const defaultDate = initialDate || new Date();
        form.reset({
          title: "",
          date: defaultDate,
          startTime: format(new Date(), "HH:mm"),
          endTime: "",
          description: "",
          url: "",
          type: "call",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventToEdit?.id, initialDate]);

  const onSubmit = (values: z.infer<typeof eventSchema>) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title: values.title,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime || undefined,
        description: values.description,
        url: values.url || undefined,
        type: values.type,
      });
    } else {
      addEvent({
        title: values.title,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime || undefined,
        description: values.description,
        url: values.url || undefined,
        type: values.type,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? "Редактировать событие" : "Новое событие"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input 
              placeholder="Название события" 
              {...form.register("title")} 
              className="text-lg font-medium"
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Дата
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    {form.watch("date") ? format(form.watch("date"), "PPP", { locale: ru }) : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Тип
              </Label>
              <Select 
                value={form.watch("type")}
                onValueChange={(val) => form.setValue("type", val as z.infer<typeof eventSchema>["type"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(eventTypeConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Начало
              </Label>
              <Input 
                id="startTime"
                type="time"
                {...form.register("startTime")}
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Конец (необязательно)
              </Label>
              <Input 
                id="endTime"
                type="time"
                {...form.register("endTime")}
              />
              {form.formState.errors.endTime && (
                <p className="text-sm text-destructive">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea 
              id="description"
              placeholder="Добавьте описание события..." 
              {...form.register("description")} 
              className="resize-none min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Ссылка (необязательно)
            </Label>
            <Input 
              id="url"
              type="url"
              placeholder="https://zoom.us/j/..." 
              {...form.register("url")} 
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Добавьте ссылку на видеозвонок, встречу или другой ресурс
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {eventToEdit ? "Сохранить" : "Создать событие"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

