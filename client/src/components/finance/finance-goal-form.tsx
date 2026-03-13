import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore, FinanceGoal } from "@/lib/store";
import type { FinanceGoalPriority } from "@/lib/store";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(1, "Укажите название цели"),
  targetAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Сумма больше 0"),
  currentAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Сумма ≥ 0"),
  priority: z.enum(["high", "medium", "low"]),
  deadline: z.date().optional(),
});

type FormValues = z.infer<typeof schema>;

interface FinanceGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalToEdit?: FinanceGoal;
}

export function FinanceGoalForm({ open, onOpenChange, goalToEdit }: FinanceGoalFormProps) {
  const addFinanceGoal = useStore((s) => s.addFinanceGoal);
  const updateFinanceGoal = useStore((s) => s.updateFinanceGoal);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      targetAmount: "",
      currentAmount: "0",
      priority: "medium" as const,
      deadline: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: goalToEdit?.title ?? "",
        targetAmount: goalToEdit ? String(goalToEdit.targetAmount) : "",
        currentAmount: goalToEdit ? String(goalToEdit.currentAmount) : "0",
        priority: (goalToEdit?.priority ?? "medium") as "high" | "medium" | "low",
        deadline: goalToEdit?.deadline ? new Date(goalToEdit.deadline) : undefined,
      });
    }
  }, [open, goalToEdit?.id]);

  const onSubmit = (values: FormValues) => {
    const targetAmount = Number(values.targetAmount);
    const currentAmount = Number(values.currentAmount);
    const deadline = values.deadline ? format(values.deadline, "yyyy-MM-dd") : undefined;
    const priority = values.priority as FinanceGoalPriority;

    if (goalToEdit) {
      updateFinanceGoal(goalToEdit.id, {
        title: values.title,
        targetAmount,
        currentAmount,
        priority,
        deadline,
      });
    } else {
      addFinanceGoal({
        title: values.title,
        targetAmount,
        currentAmount,
        currency: DEFAULT_CURRENCY,
        priority,
        deadline,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goalToEdit ? "Редактировать цель" : "Новая финансовая цель"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input placeholder="Например: Отпуск, Подушка безопасности" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Целевая сумма ({DEFAULT_CURRENCY})</Label>
            <Input type="number" step="0.01" {...form.register("targetAmount")} />
            {form.formState.errors.targetAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.targetAmount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Накоплено ({DEFAULT_CURRENCY})</Label>
            <Input type="number" step="0.01" {...form.register("currentAmount")} />
            {form.formState.errors.currentAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.currentAmount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Приоритет</Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(v: "high" | "medium" | "low") => form.setValue("priority", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" /> Высокий — участвует в блоке «Баланс и цели»</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" /> Средний — участвует в блоке «Баланс и цели»</span>
                </SelectItem>
                <SelectItem value="low">
                  <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" /> Низкий — только отображается, в расчёт не входит</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Срок (необязательно)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start", !form.watch("deadline") && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("deadline") ? format(form.watch("deadline")!, "dd.MM.yyyy") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("deadline")}
                  onSelect={(d) => form.setValue("deadline", d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">{goalToEdit ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
