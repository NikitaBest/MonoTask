import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenseCategoryLabel } from "@/lib/finance-categories";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ru } from "date-fns/locale";
import { DEFAULT_CURRENCY } from "@/lib/finance-categories";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTHS_BACK = 6;

export default function FinanceAnalyticsPage() {
  const financeIncomes = useStore((s) => s.financeIncomes);
  const financeExpenses = useStore((s) => s.financeExpenses);

  const { byMonth, categoryTotals, stats, insights } = useMemo(() => {
    const end = endOfMonth(new Date());
    const start = startOfMonth(subMonths(new Date(), MONTHS_BACK));
    const months = eachMonthOfInterval({ start, end }).map((d) => format(d, "yyyy-MM"));

    const byMonth = months.map((month) => {
      const income = financeIncomes
        .filter((i) => i.date.startsWith(month))
        .reduce((s, i) => s + i.amount, 0);
      const expense = financeExpenses
        .filter((e) => e.date.startsWith(month))
        .reduce((s, e) => s + e.amount, 0);
      return {
        month,
        label: format(new Date(month + "-01"), "MMM yy", { locale: ru }),
        income,
        expense,
        balance: income - expense,
      };
    });

    const categoryTotals: Record<string, number> = {};
    financeExpenses.forEach((e) => {
      categoryTotals[e.categoryId] = (categoryTotals[e.categoryId] ?? 0) + e.amount;
    });
    const categoryList = Object.entries(categoryTotals)
      .map(([categoryId, total]) => ({ categoryId, total, name: getExpenseCategoryLabel(categoryId) }))
      .sort((a, b) => b.total - a.total);

    const totalIncome = financeIncomes.reduce((s, i) => s + i.amount, 0);
    const totalExpense = financeExpenses.reduce((s, e) => s + e.amount, 0);
    const avgIncomePerMonth = byMonth.length ? totalIncome / byMonth.length : 0;
    const avgExpensePerMonth = byMonth.length ? totalExpense / byMonth.length : 0;
    const topCategory = categoryList[0];
    const largestExpense = financeExpenses.length
      ? financeExpenses.reduce((max, e) => (e.amount > max.amount ? e : max), financeExpenses[0])
      : null;

    const insights: string[] = [];
    if (byMonth.length >= 2) {
      const prev = byMonth[byMonth.length - 2];
      const curr = byMonth[byMonth.length - 1];
      if (prev.expense > 0 && curr.expense > prev.expense) {
        const pct = Math.round(((curr.expense - prev.expense) / prev.expense) * 100);
        insights.push(`Расходы в текущем месяце выросли на ${pct}% по сравнению с прошлым.`);
      }
    }
    categoryList.slice(0, 5).forEach((c) => {
      const prevMonth = format(subMonths(new Date(), 1), "yyyy-MM");
      const currMonth = format(new Date(), "yyyy-MM");
      const prevSum = financeExpenses
        .filter((e) => e.date.startsWith(prevMonth) && e.categoryId === c.categoryId)
        .reduce((s, e) => s + e.amount, 0);
      const currSum = financeExpenses
        .filter((e) => e.date.startsWith(currMonth) && e.categoryId === c.categoryId)
        .reduce((s, e) => s + e.amount, 0);
      if (prevSum > 0 && currSum > prevSum) {
        const pct = Math.round(((currSum - prevSum) / prevSum) * 100);
        insights.push(`Расходы на «${c.name}» выросли на ${pct}% по сравнению с прошлым месяцем.`);
      }
    });

    return {
      byMonth,
      categoryTotals: categoryList,
      stats: {
        avgIncomePerMonth,
        avgExpensePerMonth,
        topCategory,
        largestExpense,
      },
      insights,
    };
  }, [financeIncomes, financeExpenses]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Аналитика</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средние доходы в месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {stats.avgIncomePerMonth.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {DEFAULT_CURRENCY}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Средние расходы в месяц
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">
              {stats.avgExpensePerMonth.toLocaleString("ru-RU", { maximumFractionDigits: 0 })} {DEFAULT_CURRENCY}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Самая затратная категория
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold truncate">
              {stats.topCategory ? getExpenseCategoryLabel(stats.topCategory.categoryId) : "—"}
            </p>
            {stats.topCategory && (
              <p className="text-sm text-muted-foreground">
                {stats.topCategory.total.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Крупнейшая покупка
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.largestExpense ? (
              <>
                <p className="text-lg font-bold">
                  {stats.largestExpense.amount.toLocaleString("ru-RU")} {DEFAULT_CURRENCY}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {getExpenseCategoryLabel(stats.largestExpense.categoryId)}
                  {stats.largestExpense.comment && ` · ${stats.largestExpense.comment}`}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Доходы и расходы по месяцам</CardTitle>
          <p className="text-sm text-muted-foreground">Динамика за последние месяцы</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  formatter={(value: number) => [value.toLocaleString("ru-RU") + " " + DEFAULT_CURRENCY, ""]}
                  labelFormatter={(_, payload) => payload[0]?.payload?.label}
                />
                <Legend />
                <Bar dataKey="income" name="Доходы" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Расходы" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Расходы по категориям</CardTitle>
          <p className="text-sm text-muted-foreground">За весь период</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryTotals.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={95} />
                <Tooltip formatter={(v: number) => [v.toLocaleString("ru-RU") + " " + DEFAULT_CURRENCY, "Сумма"]} />
                <Bar dataKey="total" name="Сумма" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Выводы</CardTitle>
            <p className="text-sm text-muted-foreground">На основе ваших данных</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insights.map((text, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
