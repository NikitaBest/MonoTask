import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DollarSign, Calendar as CalendarIcon, FileText, Link as LinkIcon, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useStore, Expense } from "@/lib/store";
import { cn } from "@/lib/utils";

const expenseSchema = z.object({
  amount: z.string().min(1, "Сумма обязательна").refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Сумма должна быть положительным числом",
  }),
  currency: z.string().min(1, "Валюта обязательна"),
  date: z.date(),
  description: z.string().optional(),
  category: z.string().optional(),
  documentUrl: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Неверный URL",
  }),
});

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  expenseToEdit?: Expense;
}

const currencies = [
  { value: 'RUB', label: '₽ Рубли (RUB)' },
  { value: 'USD', label: '$ Доллары (USD)' },
  { value: 'EUR', label: '€ Евро (EUR)' },
  { value: 'GBP', label: '£ Фунты (GBP)' },
];

const expenseCategories = [
  'Разработчик',
  'Дизайнер',
  'Сервер',
  'Сервис',
  'Хостинг',
  'Домен',
  'Инструменты',
  'Другое',
];

export function ExpenseForm({ open, onOpenChange, projectId, expenseToEdit }: ExpenseFormProps) {
  const addExpense = useStore((state) => state.addExpense);
  const updateExpense = useStore((state) => state.updateExpense);
  
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      currency: "RUB",
      date: new Date(),
      description: "",
      category: "",
      documentUrl: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: expenseToEdit ? String(expenseToEdit.amount) : "",
        currency: expenseToEdit?.currency || "RUB",
        date: expenseToEdit ? new Date(expenseToEdit.date) : new Date(),
        description: expenseToEdit?.description || "",
        category: expenseToEdit?.category || "",
        documentUrl: expenseToEdit?.documentUrl || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expenseToEdit?.id]);

  const onSubmit = (values: z.infer<typeof expenseSchema>) => {
    const formattedDate = format(values.date, "yyyy-MM-dd");
    const amount = parseFloat(values.amount);

    if (expenseToEdit) {
      updateExpense(expenseToEdit.id, {
        amount,
        currency: values.currency,
        date: formattedDate,
        description: values.description || undefined,
        category: values.category || undefined,
        documentUrl: values.documentUrl || undefined,
      });
    } else {
      addExpense({
        projectId,
        amount,
        currency: values.currency,
        date: formattedDate,
        description: values.description || undefined,
        category: values.category || undefined,
        documentUrl: values.documentUrl || undefined,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {expenseToEdit ? "Редактировать расход" : "Новый расход"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Сумма
              </Label>
              <Input 
                id="amount"
                type="number"
                step="0.01"
                placeholder="5000" 
                {...form.register("amount")} 
                autoFocus
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Select 
                value={form.watch("currency")}
                onValueChange={(val) => form.setValue("currency", val)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Выберите валюту" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Дата расхода
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
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="w-4 h-4" /> Категория
              </Label>
              <Select 
                value={form.watch("category") || "none"}
                onValueChange={(val) => form.setValue("category", val === "none" ? "" : val)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без категории</SelectItem>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Описание (необязательно)
            </Label>
            <Textarea 
              id="description"
              placeholder="Описание расхода, комментарии..." 
              {...form.register("description")} 
              className="resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUrl" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Ссылка на документ (необязательно)
            </Label>
            <Input 
              id="documentUrl"
              type="url"
              placeholder="https://example.com/receipt.pdf" 
              {...form.register("documentUrl")} 
            />
            {form.formState.errors.documentUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.documentUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ссылка на чек, счет, документ об оплате и т.д.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {expenseToEdit ? "Сохранить" : "Добавить расход"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

