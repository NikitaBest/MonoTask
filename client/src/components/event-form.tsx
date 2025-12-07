import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Tag, Bell, Phone, Users, CheckSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  startTime: z.string().min(1, "Время начала обязательно"),
  endTime: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(["reminder", "meeting", "call", "task"] as const),
});

const eventTypeLabels = {
  reminder: "Напоминание",
  meeting: "Созвон",
  call: "Звонок",
  task: "Задача",
};

const eventTypeIcons = {
  reminder: Bell,
  meeting: Users,
  call: Phone,
  task: CheckSquare,
};

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  eventToEdit?: CalendarEvent;
}

export function EventForm({ open, onOpenChange, initialDate, initialTime, eventToEdit }: EventFormProps) {
  const addEvent = useStore((state) => state.addEvent);
  const updateEvent = useStore((state) => state.updateEvent);

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      startTime: "",
      endTime: "",
      description: "",
      type: "reminder",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: eventToEdit?.title || "",
        date: eventToEdit ? new Date(eventToEdit.date) : (initialDate || new Date()),
        startTime: eventToEdit?.startTime || initialTime || "",
        endTime: eventToEdit?.endTime || "",
        description: eventToEdit?.description || "",
        type: eventToEdit?.type || "reminder",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventToEdit?.id, initialDate, initialTime]);

  const onSubmit = (values: z.infer<typeof eventSchema>) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");

    if (eventToEdit) {
      updateEvent(eventToEdit.id, {
        title: values.title,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime,
        description: values.description,
        type: values.type,
      });
    } else {
      addEvent({
        title: values.title,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime,
        description: values.description,
        type: values.type,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  const selectedType = form.watch("type");
  const TypeIcon = eventTypeIcons[selectedType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <DialogHeader>
          <DialogTitle>{eventToEdit ? "Редактировать событие" : "Новое событие"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input 
              placeholder="Название события..." 
              {...form.register("title")} 
              className="text-lg font-medium border-0 px-0 focus-visible:ring-0 shadow-none border-b border-input rounded-none"
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Дата
              </label>
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
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TypeIcon className="w-4 h-4" /> Тип
              </label>
              <Select 
                value={form.watch("type")}
                onValueChange={(val) => form.setValue("type", val as CalendarEvent['type'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Напоминание
                    </span>
                  </SelectItem>
                  <SelectItem value="meeting">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Созвон
                    </span>
                  </SelectItem>
                  <SelectItem value="call">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Звонок
                    </span>
                  </SelectItem>
                  <SelectItem value="task">
                    <span className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" />
                      Задача
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Начало
              </label>
              <Input type="time" {...form.register("startTime")} required />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Окончание (необязательно)
              </label>
              <Input type="time" {...form.register("endTime")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea 
              id="description"
              placeholder="Добавьте детали события..." 
              {...form.register("description")} 
              className="resize-none min-h-[100px]"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit">{eventToEdit ? "Сохранить" : "Создать событие"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

