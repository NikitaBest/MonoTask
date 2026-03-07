import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { RecurringPaymentForm } from "./recurring-payment-form";
import { getExpenseCategoryLabel } from "@/lib/finance-categories";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import type { RecurringPayment } from "@/lib/store";
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

const FREQ_LABELS: Record<string, string> = {
  monthly: "каждый месяц",
  weekly: "каждую неделю",
  yearly: "каждый год",
};

export function RecurringPaymentsCard() {
  const recurringPayments = useStore((s) => s.recurringPayments);
  const deleteRecurringPayment = useStore((s) => s.deleteRecurringPayment);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringPayment | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCloseForm = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) setEditing(undefined);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Повторяющиеся платежи</CardTitle>
          <Button variant="outline" size="sm" onClick={() => { setEditing(undefined); setIsFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Аренда, подписки, коммунальные — операции, которые повторяются регулярно.
          </p>
          {recurringPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет повторяющихся платежей.
            </p>
          ) : (
            <ul className="space-y-2">
              {recurringPayments.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.amount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY} / {FREQ_LABELS[r.frequency] ?? r.frequency}
                      {" · "}
                      {getExpenseCategoryLabel(r.categoryId)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setIsFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <RecurringPaymentForm open={isFormOpen} onOpenChange={handleCloseForm} paymentToEdit={editing} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить повторяющийся платёж?</AlertDialogTitle>
            <AlertDialogDescription>Запись будет удалена.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => {
                if (deleteId) {
                  deleteRecurringPayment(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
