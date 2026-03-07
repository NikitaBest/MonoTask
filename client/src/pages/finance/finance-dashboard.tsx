import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, ArrowRight, Wallet, CheckCircle2, AlertCircle, PiggyBank } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { getIncomeCategoryLabel } from "@/lib/finance-categories";
import { getExpenseCategoryLabel } from "@/lib/finance-categories";
import { Progress } from "@/components/ui/progress";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import { QuickAddBlock } from "@/components/finance/quick-add-block";
import { PlannedIncomeBlock } from "@/components/finance/planned-income-block";
import { Target } from "lucide-react";

/** Яркая палитра для круговой диаграммы расходов по категориям */
const PIE_COLORS = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#a855f7",
];

export default function FinanceDashboardPage() {
  const getTotalIncomeByMonth = useStore((s) => s.getTotalIncomeByMonth);
  const getTotalExpenseByMonth = useStore((s) => s.getTotalExpenseByMonth);
  const getFinanceIncomesByMonth = useStore((s) => s.getFinanceIncomesByMonth);
  const getFinanceExpensesByMonth = useStore((s) => s.getFinanceExpensesByMonth);
  const getExpensesByCategoryForMonth = useStore((s) => s.getExpensesByCategoryForMonth);
  const getFinanceBudgetsForMonth = useStore((s) => s.getFinanceBudgetsForMonth);
  const getTotalPlannedSpendingForMonth = useStore((s) => s.getTotalPlannedSpendingForMonth);
  const getTotalPlannedIncome = useStore((s) => s.getTotalPlannedIncome);
  const financeGoals = useStore((s) => s.financeGoals);

  const month = format(new Date(), "yyyy-MM");

  const totalIncome = getTotalIncomeByMonth(month);
  const totalExpense = getTotalExpenseByMonth(month);
  const balance = totalIncome - totalExpense;
  const totalPlannedSpending = getTotalPlannedSpendingForMonth(month);
  const totalExpectedIncome = getTotalPlannedIncome();
  const balanceWithExpected = balance + totalExpectedIncome;
  const withinLimits = totalPlannedSpending > 0 && totalExpense <= totalPlannedSpending;
  const canSave = totalPlannedSpending > 0 ? Math.max(0, totalIncome - totalPlannedSpending) : totalIncome - totalExpense;
  const expectedEnoughForPlan =
    totalPlannedSpending > 0 && totalIncome + totalExpectedIncome >= totalPlannedSpending;
  const activeGoals = financeGoals.filter((g) => g.currentAmount < g.targetAmount);

  const lastTransactions = useMemo(() => {
    const incomes = getFinanceIncomesByMonth(month).map((i) => ({
      id: i.id,
      type: "income" as const,
      amount: i.amount,
      label: i.comment || getIncomeCategoryLabel(i.categoryId),
      date: i.date,
    }));
    const expenses = getFinanceExpensesByMonth(month).map((e) => ({
      id: e.id,
      type: "expense" as const,
      amount: -e.amount,
      label: e.comment || getExpenseCategoryLabel(e.categoryId),
      date: e.date,
    }));
    return [...incomes, ...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [month, getFinanceIncomesByMonth, getFinanceExpensesByMonth]);

  const expenseByCategory = useMemo(() => {
    const data = getExpensesByCategoryForMonth(month);
    const total = data.reduce((s, d) => s + d.total, 0);
    if (total === 0) return [];
    return data.map((d) => ({
      name: getExpenseCategoryLabel(d.categoryId),
      value: d.total,
      percent: Math.round((d.total / total) * 100),
    }));
  }, [month, getExpensesByCategoryForMonth]);

  const monthlyBudget = useMemo(() => {
    const budgets = getFinanceBudgetsForMonth(month);
    const general = budgets.find((b) => b.categoryId === null);
    if (!general) return null;
    const spent = totalExpense;
    return {
      limit: general.limitAmount,
      spent,
      left: Math.max(0, general.limitAmount - spent),
      percent: general.limitAmount > 0 ? Math.min(100, Math.round((spent / general.limitAmount) * 100)) : 0,
    };
  }, [month, getFinanceBudgetsForMonth, totalExpense]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Доходы за месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(month + "-01"), "LLLL yyyy", { locale: ru })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Расходы за месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {totalExpense.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(month + "-01"), "LLLL yyyy", { locale: ru })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Остаток
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {balance.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Доходы − Расходы (текущий баланс)</p>
          </CardContent>
        </Card>
      </div>

      {/* Быстрый ввод доходов и расходов прямо на главной */}
      <QuickAddBlock />

      {/* Ожидаемые поступления + баланс с учётом них + цели */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PlannedIncomeBlock />
        </div>
        <div className="space-y-4">
          {totalExpectedIncome > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  С учётом ожидаемых поступлений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-xl font-bold ${balanceWithExpected >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {balanceWithExpected.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Текущий баланс + ожидаемые поступления
                </p>
              </CardContent>
            </Card>
          )}
          {activeGoals.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Цели (куда отложить)
                </CardTitle>
                <Link href="/finance/goals">
                  <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                    Все
                  </span>
                </Link>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {activeGoals.slice(0, 3).map((g) => {
                    const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
                    return (
                      <li key={g.id} className="text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium truncate">{g.title}</span>
                          <span className="text-muted-foreground shrink-0 ml-2">
                            {g.currentAmount.toLocaleString("ru-RU")} / {g.targetAmount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                          </span>
                        </div>
                        <Progress value={pct} className="h-1.5 mt-1" />
                      </li>
                    );
                  })}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Цели накоплений — видно, сколько уже отложено и сколько осталось.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* По запланированным лимитам: вхожу / не вхожу, сколько можно отложить */}
      {totalPlannedSpending > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              По вашим запланированным расходам
            </CardTitle>
            <Link href="/finance/budgets">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Лимиты
              </span>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Запланировано расходов</p>
                <p className="text-lg font-semibold">{totalPlannedSpending.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Уже потрачено</p>
                <p className="text-lg font-semibold">{totalExpense.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 rounded-lg p-3 ${withinLimits ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-destructive/10 text-destructive"}`}>
              {withinLimits ? (
                <>
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="font-medium">Вы в рамках лимитов</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">
                    Превышение на {(totalExpense - totalPlannedSpending).toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                  </span>
                </>
              )}
            </div>
            {totalExpectedIncome > 0 && (
              <div className={`rounded-lg p-3 ${expectedEnoughForPlan ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                {expectedEnoughForPlan ? (
                  <span className="text-sm font-medium">
                    Ожидаемых поступлений хватит, чтобы уложиться в план.
                  </span>
                ) : (
                  <span className="text-sm font-medium">
                    С учётом ожидаемых поступлений в план уложиться можно. Если они не придут — превышение.
                  </span>
                )}
              </div>
            )}
            <div className="rounded-lg p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Сколько можно отложить</p>
              <p className="text-xl font-bold">
                {canSave.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                При ваших доходах и запланированных расходах эту сумму можно безопасно отложить, не выходя за рамки плана.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div>
              <CardTitle>Последние операции</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Зелёные — доходы, красные — расходы</p>
            </div>
            <Link href="/finance/expenses">
              <span className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer shrink-0">
                Все <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </CardHeader>
          <CardContent>
            {lastTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Нет операций за этот месяц. Добавьте доход или расход.
              </p>
            ) : (
              <ul className="space-y-2">
                {lastTransactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-sm truncate flex-1 mr-2">{t.label}</span>
                    <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                      {t.type === "income" ? "+" : ""}
                      {t.amount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Расходы по категориям</CardTitle>
            <p className="text-sm text-muted-foreground">
              На что потратили в этом месяце — так видно, куда уходят деньги. Категории задаются при добавлении расхода.
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(month + "-01"), "LLLL yyyy", { locale: ru })}
            </p>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Нет расходов за этот месяц.
              </p>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={0}
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                      label={({ name, percent }) => `${name} — ${percent}%`}
                      labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                    >
                      {expenseByCategory.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString("ru-RU")} ${DEFAULT_CURRENCY}`, "Сумма"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {monthlyBudget && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Бюджет месяца
            </CardTitle>
            <Link href="/finance/budgets">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Настроить
              </span>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>Бюджет: {monthlyBudget.limit.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</span>
              <span>Потрачено: {monthlyBudget.spent.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</span>
            </div>
            <Progress value={monthlyBudget.percent} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">
              Осталось: <span className="font-medium text-foreground">{monthlyBudget.left.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
