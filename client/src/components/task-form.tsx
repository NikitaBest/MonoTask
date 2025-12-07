import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Tag, Flag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useStore, Task, Priority, TaskStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const taskSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  date: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"] as const),
  tags: z.string().optional(),
});

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  taskToEdit?: Task;
}

export function TaskForm({ open, onOpenChange, initialDate, initialTime, taskToEdit }: TaskFormProps) {
  const addTask = useStore((state) => state.addTask);
  const updateTask = useStore((state) => state.updateTask);
  
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: taskToEdit?.title || "",
      date: taskToEdit ? new Date(taskToEdit.date) : (initialDate || new Date()),
      startTime: taskToEdit?.startTime || initialTime || "",
      endTime: taskToEdit?.endTime || "",
      description: taskToEdit?.description || "",
      priority: taskToEdit?.priority || "medium",
      tags: taskToEdit?.tags.join(", ") || "",
    },
  });

  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");
    const tagsArray = values.tags ? values.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: values.title,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime,
        description: values.description,
        priority: values.priority,
        tags: tagsArray,
      });
    } else {
      addTask({
        title: values.title,
        date: formattedDate,
        startTime: values.startTime,
        endTime: values.endTime,
        description: values.description,
        priority: values.priority,
        tags: tagsArray,
        status: "planned",
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Редактировать задачу" : "Новая задача"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input 
              placeholder="Что нужно сделать?" 
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
                 <Flag className="w-4 h-4" /> Приоритет
              </label>
              <Select 
                onValueChange={(val) => form.setValue("priority", val as Priority)}
                defaultValue={form.watch("priority")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Низкий</SelectItem>
                  <SelectItem value="medium">Средний</SelectItem>
                  <SelectItem value="high">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Начало
              </label>
              <Input type="time" {...form.register("startTime")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Окончание
              </label>
              <Input type="time" {...form.register("endTime")} />
            </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" /> Теги (через запятую)
              </label>
             <Input placeholder="работа, проект, встреча" {...form.register("tags")} />
          </div>

          <div className="space-y-2">
            <Textarea 
              placeholder="Добавьте детали, заметки или подзадачи..." 
              {...form.register("description")} 
              className="resize-none min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button type="submit">{taskToEdit ? "Сохранить" : "Создать задачу"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
