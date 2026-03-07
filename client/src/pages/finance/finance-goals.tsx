import { useState } from "react";
import { useStore, FinanceGoal } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { FinanceGoalForm } from "@/components/finance/finance-goal-form";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
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

export default function FinanceGoalsPage() {
  const financeGoals = useStore((s) => s.financeGoals);
  const deleteFinanceGoal = useStore((s) => s.deleteFinanceGoal);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinanceGoal | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditingGoal(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Финансовые цели</h2>
        <Button onClick={() => { setEditingGoal(undefined); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить цель
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Накопления</CardTitle>
          <p className="text-sm text-muted-foreground">
            Отслеживайте прогресс по целям: подушка безопасности, отпуск, крупные покупки.
          </p>
        </CardHeader>
        <CardContent>
          {financeGoals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Нет целей. Создайте первую — например, финансовую подушку или отпуск.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {financeGoals.map((g) => {
                const progress = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                const isCompleted = g.currentAmount >= g.targetAmount;

                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-lg border ${isCompleted ? "border-green-500/50 bg-green-500/5" : "border-border"}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{g.title}</h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingGoal(g); setIsFormOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(g.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-2xl font-bold mb-1">
                      {g.currentAmount.toLocaleString("ru-RU")} / {g.targetAmount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                    </p>
                    <Progress value={progress} className="h-2 mb-2" />
                    {g.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Срок: {format(new Date(g.deadline), "d MMM yyyy", { locale: ru })}
                      </p>
                    )}
                    {isCompleted && (
                      <p className="text-sm text-green-600 font-medium mt-2">Цель достигнута!</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <FinanceGoalForm open={isFormOpen} onOpenChange={handleCloseForm} goalToEdit={editingGoal} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить цель?</AlertDialogTitle>
            <AlertDialogDescription>Прогресс накоплений будет удалён.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteId) {
                  deleteFinanceGoal(deleteId);
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
