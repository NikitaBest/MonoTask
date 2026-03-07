import { useState, useMemo } from "react";
import { useStore, FinanceExpense } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { ExpenseForm } from "@/components/finance/expense-form";
import { getExpenseCategoryLabel } from "@/lib/finance-categories";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DEFAULT_CURRENCY, PAYMENT_METHODS } from "@/lib/finance-categories";
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

export default function FinanceExpensesPage() {
  const financeExpenses = useStore((s) => s.financeExpenses);
  const deleteFinanceExpense = useStore((s) => s.deleteFinanceExpense);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FinanceExpense | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const paymentMethodLabel = (id: string) => PAYMENT_METHODS.find((p) => p.id === id)?.label ?? id;

  const filtered = useMemo(() => {
    if (!search.trim())
      return [...financeExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const q = search.toLowerCase();
    return financeExpenses
      .filter(
        (e) =>
          getExpenseCategoryLabel(e.categoryId).toLowerCase().includes(q) ||
          (e.comment?.toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financeExpenses, search]);

  const handleEdit = (expense: FinanceExpense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingExpense(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="text-lg font-semibold">Расходы</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по категории или комментарию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить расход
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список расходов</CardTitle>
          <p className="text-sm text-muted-foreground">
            Всего: {filtered.length} записей
          </p>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search ? "Ничего не найдено" : "Нет расходов. Добавьте первую запись."}
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-red-600">
                      −{e.amount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getExpenseCategoryLabel(e.categoryId)}
                      {e.comment && ` · ${e.comment}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(e.date), "d MMM yyyy", { locale: ru })} · {paymentMethodLabel(e.paymentMethod)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(e)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(e.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ExpenseForm open={isFormOpen} onOpenChange={handleCloseForm} expenseToEdit={editingExpense} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить расход?</AlertDialogTitle>
            <AlertDialogDescription>
              Эта запись будет удалена без возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteId) {
                  deleteFinanceExpense(deleteId);
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
