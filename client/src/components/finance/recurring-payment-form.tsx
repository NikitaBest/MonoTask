import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStore, RecurringPayment } from "@/lib/store";
import { ALL_EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from "@/lib/finance-categories";

const schema = z.object({
  title: z.string().min(1, "Укажите название"),
  amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Сумма больше 0"),
  categoryId: z.string().min(1, "Выберите категорию"),
  frequency: z.enum(["monthly", "weekly", "yearly"]),
});

type FormValues = z.infer<typeof schema>;

interface RecurringPaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentToEdit?: RecurringPayment;
}

export function RecurringPaymentForm({ open, onOpenChange, paymentToEdit }: RecurringPaymentFormProps) {
  const addRecurringPayment = useStore((s) => s.addRecurringPayment);
  const updateRecurringPayment = useStore((s) => s.updateRecurringPayment);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      amount: "",
      categoryId: "",
      frequency: "monthly",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: paymentToEdit?.title ?? "",
        amount: paymentToEdit ? String(paymentToEdit.amount) : "",
        categoryId: paymentToEdit?.categoryId ?? "",
        frequency: paymentToEdit?.frequency ?? "monthly",
      });
    }
  }, [open, paymentToEdit?.id]);

  const onSubmit = (values: FormValues) => {
    const amount = Number(values.amount);

    if (paymentToEdit) {
      updateRecurringPayment(paymentToEdit.id, {
        title: values.title,
        amount,
        categoryId: values.categoryId,
        frequency: values.frequency,
      });
    } else {
      addRecurringPayment({
        title: values.title,
        amount,
        categoryId: values.categoryId,
        frequency: values.frequency,
        currency: DEFAULT_CURRENCY,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{paymentToEdit ? "Редактировать платёж" : "Добавить повторяющийся платёж"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input placeholder="Например: Netflix, Аренда" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Сумма ({DEFAULT_CURRENCY})</Label>
            <Input type="number" step="0.01" {...form.register("amount")} />
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Select value={form.watch("categoryId")} onValueChange={(v) => form.setValue("categoryId", v)}>
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
          </div>
          <div className="space-y-2">
            <Label>Периодичность</Label>
            <Select value={form.watch("frequency")} onValueChange={(v) => form.setValue("frequency", v as "monthly" | "weekly" | "yearly")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Каждый месяц</SelectItem>
                <SelectItem value="weekly">Каждую неделю</SelectItem>
                <SelectItem value="yearly">Каждый год</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">{paymentToEdit ? "Сохранить" : "Добавить"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
