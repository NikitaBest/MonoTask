import { useState, useMemo } from "react";
import { useStore, FinanceBudget } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Repeat } from "lucide-react";
import { BudgetForm } from "@/components/finance/budget-form";
import { getExpenseCategoryLabel } from "@/lib/finance-categories";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { Progress } from "@/components/ui/progress";
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
import { RecurringPaymentsCard } from "@/components/finance/recurring-payments-card";
import { cn } from "@/lib/utils";

export default function FinanceBudgetsPage() {
  const financeBudgets = useStore((s) => s.financeBudgets);
  const getTotalExpenseByMonth = useStore((s) => s.getTotalExpenseByMonth);
  const getExpensesByCategoryForMonth = useStore((s) => s.getExpensesByCategoryForMonth);
  const deleteFinanceBudget = useStore((s) => s.deleteFinanceBudget);

  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<FinanceBudget | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const budgetsForMonth = useMemo(
    () => financeBudgets.filter((b) => b.month === month),
    [financeBudgets, month]
  );

  const categorySpent = useMemo(
    () => getExpensesByCategoryForMonth(month),
    [month, getExpensesByCategoryForMonth]
  );
  const totalSpent = getTotalExpenseByMonth(month);

  const getSpentForBudget = (b: FinanceBudget) => {
    if (b.categoryId === null) return totalSpent;
    return categorySpent.find((c) => c.categoryId === b.categoryId)?.total ?? 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Бюджеты</h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <Button onClick={() => { setEditingBudget(undefined); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить бюджет
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Лимиты на {format(new Date(month + "-01"), "LLLL yyyy", { locale: ru })}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Установите общий или по категориям. При превышении лимита отобразится предупреждение.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetsForMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Нет бюджетов на этот месяц. Добавьте общий бюджет или по категориям.
            </p>
          ) : (
            budgetsForMonth.map((b) => {
              const spent = getSpentForBudget(b);
              const left = Math.max(0, b.limitAmount - spent);
              const percent = b.limitAmount > 0 ? Math.min(100, Math.round((spent / b.limitAmount) * 100)) : 0;
              const isOver = spent > b.limitAmount;

              return (
                <div
                  key={b.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    isOver ? "border-destructive bg-destructive/5" : "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {b.categoryId === null ? "Общий бюджет" : getExpenseCategoryLabel(b.categoryId)}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingBudget(b); setIsFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(b.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Лимит: {b.limitAmount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</span>
                    <span>Потрачено: {spent.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</span>
                  </div>
                  <Progress value={percent} className={cn("h-2", isOver && "[&>div]:bg-destructive")} />
                  <p className={cn("text-sm mt-1", isOver ? "text-destructive font-medium" : "text-muted-foreground")}>
                    {isOver
                      ? `Превышение на ${(spent - b.limitAmount).toLocaleString("ru-RU")} ${DEFAULT_CURRENCY}`
                      : `Осталось: ${left.toLocaleString("ru-RU")} ${DEFAULT_CURRENCY}`}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <RecurringPaymentsCard />

      <BudgetForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        budgetToEdit={editingBudget}
        defaultMonth={month}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить бюджет?</AlertDialogTitle>
            <AlertDialogDescription>Лимит будет удалён. Данные о расходах не изменятся.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteId) {
                  deleteFinanceBudget(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

