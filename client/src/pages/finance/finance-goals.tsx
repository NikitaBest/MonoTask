import { useState } from "react";
import { useStore, FinanceGoal } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
            Отслеживайте прогресс по целям. Приоритет высокий и средний участвуют в блоке «Баланс и цели» на главной, низкий — только отображаются.
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
                const priority = g.priority ?? "medium";
                const priorityLabel = { high: "Высокий", medium: "Средний", low: "Низкий" }[priority];
                const priorityBadgeClass = {
                  high: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/40",
                  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40",
                  low: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/40",
                }[priority];
                const priorityBorderClass = { high: "border-l-red-500", medium: "border-l-amber-500", low: "border-l-green-500" }[priority];

                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-lg border border-border border-l-4 ${priorityBorderClass} ${isCompleted ? "bg-green-500/5" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${priority === "high" ? "bg-red-500" : priority === "medium" ? "bg-amber-500" : "bg-green-500"}`} aria-hidden />
                        <h3 className="font-medium">{g.title}</h3>
                        <Badge variant="outline" className={`text-xs border ${priorityBadgeClass}`}>
                          {priorityLabel}
                        </Badge>
                      </div>
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
