import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStore, FinanceBudget } from "@/lib/store";
import { ALL_EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { format } from "date-fns";

const schema = z.object({
  categoryId: z.string(), // "general" for overall budget
  limitAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Укажите сумму"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Формат: ГГГГ-ММ"),
});

type FormValues = z.infer<typeof schema>;

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budgetToEdit?: FinanceBudget;
  defaultMonth?: string;
}

export function BudgetForm({ open, onOpenChange, budgetToEdit, defaultMonth }: BudgetFormProps) {
  const addFinanceBudget = useStore((s) => s.addFinanceBudget);
  const updateFinanceBudget = useStore((s) => s.updateFinanceBudget);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      categoryId: "general",
      limitAmount: "",
      month: defaultMonth || format(new Date(), "yyyy-MM"),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        categoryId: (budgetToEdit?.categoryId === null || budgetToEdit?.categoryId === undefined) ? "general" : budgetToEdit.categoryId,
        limitAmount: budgetToEdit ? String(budgetToEdit.limitAmount) : "",
        month: budgetToEdit?.month ?? defaultMonth ?? format(new Date(), "yyyy-MM"),
      });
    }
  }, [open, budgetToEdit?.id, defaultMonth]);

  const onSubmit = (values: FormValues) => {
    const limitAmount = Number(values.limitAmount);
    const categoryId = values.categoryId === "general" ? null : values.categoryId;

    if (budgetToEdit) {
      updateFinanceBudget(budgetToEdit.id, {
        categoryId,
        limitAmount,
        month: values.month,
      });
    } else {
      addFinanceBudget({
        categoryId,
        limitAmount,
        month: values.month,
        currency: DEFAULT_CURRENCY,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{budgetToEdit ? "Редактировать бюджет" : "Добавить бюджет"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Период (месяц)</Label>
            <Input type="month" {...form.register("month")} />
            {form.formState.errors.month && (
              <p className="text-sm text-destructive">{form.formState.errors.month.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(v) => form.setValue("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Общий бюджет на месяц</SelectItem>
                {ALL_EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.groupLabel} → {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Лимит ({DEFAULT_CURRENCY})</Label>
            <Input type="number" step="0.01" min="0" {...form.register("limitAmount")} />
            {form.formState.errors.limitAmount && (
              <p className="text-sm text-destructive">{form.formState.errors.limitAmount.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">{budgetToEdit ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
