import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, Target, Plus, Trash2, GripVertical, CheckCircle2, Circle, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useStore, Goal, GoalPeriod, GoalStep } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const goalSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  period: z.enum(["week", "month", "year"] as const),
  startDate: z.date(),
  endDate: z.date(),
  category: z.string().optional(),
});

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: Goal;
}

export function GoalForm({ open, onOpenChange, goalToEdit }: GoalFormProps) {
  const addGoal = useStore((state) => state.addGoal);
  const updateGoal = useStore((state) => state.updateGoal);
  const addGoalStep = useStore((state) => state.addGoalStep);
  const updateGoalStep = useStore((state) => state.updateGoalStep);
  const deleteGoalStep = useStore((state) => state.deleteGoalStep);
  const toggleGoalStep = useStore((state) => state.toggleGoalStep);
  
  const [steps, setSteps] = useState<Array<{ id: string; title: string; description: string; completed: boolean; order: number }>>([]);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [editingStepTitle, setEditingStepTitle] = useState("");
  const [editingStepDescription, setEditingStepDescription] = useState("");

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      period: "month",
      startDate: new Date(),
      endDate: new Date(),
      category: "",
    },
  });

  // Получаем актуальные шаги
  const goals = useStore((state) => state.goals);
  const currentGoal = goalToEdit ? goals.find(g => g.id === goalToEdit.id) : null;

  // Вычисляем даты на основе периода
  const calculateDates = (period: GoalPeriod) => {
    const now = new Date();
    switch (period) {
      case "week":
        return {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        };
      case "month":
        return {
          start: startOfMonth(now),
          end: endOfMonth(now),
        };
      case "year":
        return {
          start: startOfYear(now),
          end: endOfYear(now),
        };
    }
  };

  // Сбрасываем форму при изменении goalToEdit или open
  useEffect(() => {
    if (open) {
      if (goalToEdit) {
        const dates = calculateDates(goalToEdit.period);
        form.reset({
          title: goalToEdit.title,
          description: goalToEdit.description || "",
          period: goalToEdit.period,
          startDate: new Date(goalToEdit.startDate),
          endDate: new Date(goalToEdit.endDate),
          category: goalToEdit.category || "",
        });
        // Шаги будут браться из store через currentSteps
      } else {
        const period = form.watch("period") || "month";
        const dates = calculateDates(period as GoalPeriod);
        form.reset({
          title: "",
          description: "",
          period: period as GoalPeriod,
          startDate: dates.start,
          endDate: dates.end,
          category: "",
        });
        setSteps([]);
      }
      setNewStepTitle("");
      setNewStepDescription("");
      setEditingStepId(null);
      setEditingStepTitle("");
      setEditingStepDescription("");
    }
  }, [open, goalToEdit?.id]);

  // Обновляем локальные шаги при изменении цели в store
  useEffect(() => {
    if (open && goalToEdit && currentGoal) {
      setSteps(currentGoal.steps.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || "",
        completed: s.completed,
        order: s.order,
      })).sort((a, b) => a.order - b.order));
    }
  }, [open, currentGoal, goalToEdit?.id]);

  // Обновляем даты при изменении периода
  useEffect(() => {
    if (open && !goalToEdit) {
      const period = form.watch("period");
      if (period) {
        const dates = calculateDates(period);
        form.setValue("startDate", dates.start);
        form.setValue("endDate", dates.end);
      }
    }
  }, [form.watch("period"), open, goalToEdit]);

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;

    if (goalToEdit) {
      // Если редактируем существующую цель, добавляем шаг через store
      addGoalStep(goalToEdit.id, {
        title: newStepTitle,
        description: newStepDescription || undefined,
        completed: false,
      });
    } else {
      // Если создаем новую цель, добавляем шаг локально
      const maxOrder = steps.length > 0 ? Math.max(...steps.map(s => s.order)) : -1;
      setSteps([...steps, {
        id: crypto.randomUUID(),
        title: newStepTitle,
        description: newStepDescription,
        completed: false,
        order: maxOrder + 1,
      }]);
    }
    setNewStepTitle("");
    setNewStepDescription("");
  };

  const handleDeleteStep = (stepId: string) => {
    if (goalToEdit) {
      deleteGoalStep(goalToEdit.id, stepId);
    } else {
      setSteps(steps.filter(s => s.id !== stepId));
    }
  };

  const handleToggleStep = (stepId: string) => {
    if (goalToEdit) {
      toggleGoalStep(goalToEdit.id, stepId);
    } else {
      setSteps(steps.map(s => 
        s.id === stepId ? { ...s, completed: !s.completed } : s
      ));
    }
  };

  const handleUpdateStep = (stepId: string, title: string, description: string) => {
    if (!title.trim()) return;
    if (goalToEdit) {
      updateGoalStep(goalToEdit.id, stepId, { title, description: description || undefined });
    } else {
      setSteps(steps.map(s => 
        s.id === stepId ? { ...s, title, description } : s
      ));
    }
    setEditingStepId(null);
    setEditingStepTitle("");
    setEditingStepDescription("");
  };

  const handleStartEditStep = (stepId: string) => {
    const step = currentSteps.find(s => s.id === stepId);
    if (step) {
      setEditingStepId(stepId);
      setEditingStepTitle(step.title);
      setEditingStepDescription(step.description || "");
    }
  };

  const onSubmit = (values: z.infer<typeof goalSchema>) => {
    const formattedStartDate = format(values.startDate, "yyyy-MM-dd");
    const formattedEndDate = format(values.endDate, "yyyy-MM-dd");

    if (goalToEdit) {
      // Обновляем существующую цель
      updateGoal(goalToEdit.id, {
        title: values.title,
        description: values.description,
        period: values.period,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        category: values.category || undefined,
      });
    } else {
      // Создаем новую цель
      const goalSteps: GoalStep[] = steps.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description || undefined,
        completed: s.completed,
        order: s.order,
        createdAt: Date.now(),
      }));

      addGoal({
        title: values.title,
        description: values.description,
        period: values.period,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        status: "active",
        steps: goalSteps,
        category: values.category || undefined,
      });
    }
    onOpenChange(false);
    form.reset();
    setSteps([]);
  };

  // Определяем текущие шаги для отображения
  const currentSteps = goalToEdit && currentGoal
    ? currentGoal.steps
    : steps;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {goalToEdit ? "Редактировать цель" : "Новая цель"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название цели</Label>
            <Input 
              id="title"
              placeholder="Например: Изучить React" 
              {...form.register("title")} 
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Период</Label>
              <Select 
                value={form.watch("period")}
                onValueChange={(val) => {
                  form.setValue("period", val as GoalPeriod);
                  const dates = calculateDates(val as GoalPeriod);
                  form.setValue("startDate", dates.start);
                  form.setValue("endDate", dates.end);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Категория (необязательно)</Label>
              <Input 
                placeholder="работа, личное, учеба..." 
                {...form.register("category")} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("startDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("startDate") ? format(form.watch("startDate"), "PPP", { locale: ru }) : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("startDate")}
                    onSelect={(date) => date && form.setValue("startDate", date)}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("endDate") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("endDate") ? format(form.watch("endDate"), "PPP", { locale: ru }) : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("endDate")}
                    onSelect={(date) => date && form.setValue("endDate", date)}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea 
              id="description"
              placeholder="Опишите вашу цель..." 
              {...form.register("description")} 
              className="resize-none min-h-[80px]"
            />
          </div>

          {/* Шаги для выполнения */}
          <div className="space-y-3">
            <Label>Шаги для выполнения</Label>
            
            {/* Список шагов */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {currentSteps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Нет шагов. Добавьте первый шаг для выполнения цели.
                </p>
              ) : (
                currentSteps
                  .sort((a, b) => a.order - b.order)
                  .map((step) => (
                    <div key={step.id} className="flex items-start gap-2 p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-2 flex-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        {editingStepId === step.id ? (
                          <div className="flex-1 space-y-2">
                            <Input
                              value={editingStepTitle}
                              onChange={(e) => setEditingStepTitle(e.target.value)}
                              placeholder="Название шага"
                              autoFocus
                            />
                            <Textarea
                              value={editingStepDescription}
                              onChange={(e) => setEditingStepDescription(e.target.value)}
                              placeholder="Описание (необязательно)"
                              className="resize-none min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleUpdateStep(step.id, editingStepTitle, editingStepDescription)}
                              >
                                Сохранить
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingStepId(null);
                                  setEditingStepTitle("");
                                  setEditingStepDescription("");
                                }}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={step.completed}
                                onCheckedChange={() => handleToggleStep(step.id)}
                              />
                              <span className={cn(
                                "flex-1",
                                step.completed && "line-through text-muted-foreground"
                              )}>
                                {step.title}
                              </span>
                            </div>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mt-1 ml-6">
                                {step.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {editingStepId !== step.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEditStep(step.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Добавление нового шага */}
            <div className="flex gap-2">
              <Input
                placeholder="Название шага"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddStep}
                disabled={!newStepTitle.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {newStepDescription && (
              <Textarea
                placeholder="Описание шага (необязательно)"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
                className="resize-none min-h-[60px]"
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {goalToEdit ? "Сохранить" : "Создать цель"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

