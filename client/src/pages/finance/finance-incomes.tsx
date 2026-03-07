import { useState, useMemo } from "react";
import { useStore, FinanceIncome } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { IncomeForm } from "@/components/finance/income-form";
import { getIncomeCategoryLabel } from "@/lib/finance-categories";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
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

export default function FinanceIncomesPage() {
  const financeIncomes = useStore((s) => s.financeIncomes);
  const deleteFinanceIncome = useStore((s) => s.deleteFinanceIncome);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<FinanceIncome | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return [...financeIncomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const q = search.toLowerCase();
    return financeIncomes
      .filter(
        (i) =>
          getIncomeCategoryLabel(i.categoryId).toLowerCase().includes(q) ||
          (i.comment?.toLowerCase().includes(q)) ||
          (i.source?.toLowerCase().includes(q))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [financeIncomes, search]);

  const handleEdit = (income: FinanceIncome) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingIncome(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingIncome(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="text-lg font-semibold">Доходы</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по категории, комментарию, источнику..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить доход
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список доходов</CardTitle>
          <p className="text-sm text-muted-foreground">
            Всего: {filtered.length} записей
          </p>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {search ? "Ничего не найдено" : "Нет доходов. Добавьте первую запись."}
            </p>
          ) : (
            <ul className="space-y-2">
              {filtered.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-green-600">
                      +{i.amount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getIncomeCategoryLabel(i.categoryId)}
                      {i.comment && ` · ${i.comment}`}
                      {i.source && ` · ${i.source}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(i.date), "d MMM yyyy", { locale: ru })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(i)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(i.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <IncomeForm open={isFormOpen} onOpenChange={handleCloseForm} incomeToEdit={editingIncome} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить доход?</AlertDialogTitle>
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
                  deleteFinanceIncome(deleteId);
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
