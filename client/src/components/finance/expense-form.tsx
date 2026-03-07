import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useStore, FinanceExpense } from "@/lib/store";
import { ALL_EXPENSE_CATEGORIES, PAYMENT_METHODS, DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const schema = z.object({
  amount: z.string().min(1, "Укажите сумму").refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Сумма должна быть больше 0"),
  categoryId: z.string().min(1, "Выберите категорию"),
  date: z.date(),
  comment: z.string().optional(),
  paymentMethod: z.enum(["card", "cash", "transfer"]),
});

type FormValues = z.infer<typeof schema>;

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseToEdit?: FinanceExpense;
}

export function ExpenseForm({ open, onOpenChange, expenseToEdit }: ExpenseFormProps) {
  const addFinanceExpense = useStore((s) => s.addFinanceExpense);
  const updateFinanceExpense = useStore((s) => s.updateFinanceExpense);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      categoryId: "",
      date: new Date(),
      comment: "",
      paymentMethod: "card",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: expenseToEdit ? String(expenseToEdit.amount) : "",
        categoryId: expenseToEdit?.categoryId ?? "",
        date: expenseToEdit ? new Date(expenseToEdit.date) : new Date(),
        comment: expenseToEdit?.comment ?? "",
        paymentMethod: expenseToEdit?.paymentMethod ?? "card",
      });
    }
  }, [open, expenseToEdit?.id]);

  const onSubmit = (values: FormValues) => {
    const amount = Number(values.amount);
    const dateStr = format(values.date, "yyyy-MM-dd");

    if (expenseToEdit) {
      updateFinanceExpense(expenseToEdit.id, {
        amount,
        categoryId: values.categoryId,
        date: dateStr,
        comment: values.comment || undefined,
        paymentMethod: values.paymentMethod,
      });
    } else {
      addFinanceExpense({
        amount,
        categoryId: values.categoryId,
        date: dateStr,
        comment: values.comment || undefined,
        paymentMethod: values.paymentMethod,
        currency: DEFAULT_CURRENCY,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Редактировать расход" : "Добавить расход"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Сумма ({DEFAULT_CURRENCY})</Label>
            <Input type="number" step="0.01" placeholder="0" {...form.register("amount")} />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(v) => form.setValue("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {ALL_EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.groupLabel} → {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-destructive">{form.formState.errors.categoryId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Дата</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start", !form.watch("date") && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date") ? format(form.watch("date"), "dd.MM.yyyy") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(d) => d && form.setValue("date", d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>Способ оплаты</Label>
            <Select
              value={form.watch("paymentMethod")}
              onValueChange={(v) => form.setValue("paymentMethod", v as "card" | "cash" | "transfer")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Комментарий</Label>
            <Textarea placeholder="Необязательно" {...form.register("comment")} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">{expenseToEdit ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
