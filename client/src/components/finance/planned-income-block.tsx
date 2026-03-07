"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Clock, Trash2 } from "lucide-react";

export function PlannedIncomeBlock() {
  const plannedIncomes = useStore((s) => s.plannedIncomes);
  const addPlannedIncome = useStore((s) => s.addPlannedIncome);
  const deletePlannedIncome = useStore((s) => s.deletePlannedIncome);
  const getTotalPlannedIncome = useStore((s) => s.getTotalPlannedIncome);

  const today = format(new Date(), "yyyy-MM-dd");
  const [amount, setAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState(today);
  const [source, setSource] = useState("");
  const [comment, setComment] = useState("");

  const totalPlanned = getTotalPlannedIncome();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!value || value <= 0 || !source.trim()) return;
    addPlannedIncome({
      amount: value,
      expectedDate,
      source: source.trim(),
      comment: comment.trim() || undefined,
      currency: DEFAULT_CURRENCY,
    });
    setAmount("");
    setSource("");
    setComment("");
  };

  const sorted = [...plannedIncomes].sort(
    (a, b) => new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime()
  );

  return (
    <Card className="border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          Ожидаемые поступления
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Доходы, которые ещё должны прийти (кто должен, за что, когда). Не влияют на фактический баланс, но показывают «с учётом ожидаемых».
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Сумма"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-24 font-medium"
            />
            <span className="self-center text-muted-foreground">{DEFAULT_CURRENCY}</span>
            <Input
              placeholder="От кого / за что (обязательно)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="flex-1 min-w-[160px]"
            />
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Ожидаемая дата</label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="secondary" className="shrink-0">
              Добавить
            </Button>
          </div>
          <Input
            placeholder="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="text-sm"
          />
        </form>

        {sorted.length > 0 && (
          <>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Всего ожидается:</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                +{totalPlanned.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
              </span>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {sorted.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.source}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(p.expectedDate), "d MMM yyyy", { locale: ru })}
                      {p.comment && ` · ${p.comment}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      +{p.amount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deletePlannedIncome(p.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
