import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Tags,
  Wallet,
  Target,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const financeNavItems = [
  { icon: LayoutDashboard, label: "Обзор", href: "/finance" },
  { icon: TrendingUp, label: "Доходы", href: "/finance/incomes" },
  { icon: TrendingDown, label: "Расходы", href: "/finance/expenses" },
  { icon: Tags, label: "Категории", href: "/finance/categories" },
  { icon: Wallet, label: "Бюджеты", href: "/finance/budgets" },
  { icon: Target, label: "Цели", href: "/finance/goals" },
  { icon: BarChart3, label: "Аналитика", href: "/finance/analytics" },
];

export function FinanceLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-border bg-muted/30 px-4 py-2">
        <h1 className="text-xl font-semibold mb-3">Финансы</h1>
        <nav className="flex flex-wrap gap-1">
          {financeNavItems.map((item) => {
            const isActive =
              location === item.href ||
              (item.href === "/finance" && location === "/finance");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
