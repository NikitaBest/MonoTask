"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INCOME_CATEGORIES, ALL_EXPENSE_CATEGORIES, DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";

export function QuickAddBlock() {
  const addFinanceIncome = useStore((s) => s.addFinanceIncome);
  const addFinanceExpense = useStore((s) => s.addFinanceExpense);

  const today = format(new Date(), "yyyy-MM-dd");

  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [incomeDate, setIncomeDate] = useState(today);
  const [incomeComment, setIncomeComment] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseDate, setExpenseDate] = useState(today);
  const [expenseComment, setExpenseComment] = useState("");

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(incomeAmount.replace(",", "."));
    if (!amount || amount <= 0 || !incomeCategory) return;
    addFinanceIncome({
      amount,
      categoryId: incomeCategory,
      date: incomeDate,
      comment: incomeComment.trim() || undefined,
      currency: DEFAULT_CURRENCY,
    });
    setIncomeAmount("");
    setIncomeComment("");
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(expenseAmount.replace(",", "."));
    if (!amount || amount <= 0 || !expenseCategory) return;
    addFinanceExpense({
      amount,
      categoryId: expenseCategory,
      date: expenseDate,
      comment: expenseComment.trim() || undefined,
      paymentMethod: "card",
      currency: DEFAULT_CURRENCY,
    });
    setExpenseAmount("");
    setExpenseComment("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Доход — зелёный блок */}
      <Card className="border-green-500/30 bg-green-500/5 dark:bg-green-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700 dark:text-green-400">
            <TrendingUp className="h-4 w-4" />
            Добавить доход
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Сумма и тип поступления (зарплата, фриланс и т.д.)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddIncome} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Сумма"
                value={incomeAmount}
                onChange={(e) => setIncomeAmount(e.target.value)}
                className="w-24 font-medium"
              />
              <span className="self-center text-muted-foreground">{DEFAULT_CURRENCY}</span>
              <Select value={incomeCategory} onValueChange={setIncomeCategory}>
                <SelectTrigger className="flex-1 min-w-[140px]">
                  <SelectValue placeholder="Тип дохода" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Дата</label>
              <Input
                type="date"
                value={incomeDate}
                onChange={(e) => setIncomeDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Input
              placeholder="Комментарий (необязательно)"
              value={incomeComment}
              onChange={(e) => setIncomeComment(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
              Добавить доход
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Расход — красный блок */}
      <Card className="border-red-500/30 bg-red-500/5 dark:bg-red-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
            <TrendingDown className="h-4 w-4" />
            Добавить расход
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Сумма и на что потратили (продукты, транспорт и т.д.)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Сумма"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-24 font-medium"
              />
              <span className="self-center text-muted-foreground">{DEFAULT_CURRENCY}</span>
              <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                <SelectTrigger className="flex-1 min-w-[140px]">
                  <SelectValue placeholder="На что потратили" />
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
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Дата</label>
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Input
              placeholder="Комментарий (необязательно)"
              value={expenseComment}
              onChange={(e) => setExpenseComment(e.target.value)}
              className="text-sm"
            />
            <Button type="submit" variant="destructive" className="w-full">
              Добавить расход
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
