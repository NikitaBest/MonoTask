import { useState, useMemo } from "react";
import { useStore, Payment, Expense } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, DollarSign, TrendingDown, TrendingUp, Link as LinkIcon, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PaymentForm } from "./payment-form";
import { ExpenseForm } from "./expense-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface ProjectPaymentsProps {
  projectId: string;
}

export function ProjectPayments({ projectId }: ProjectPaymentsProps) {
  const allPayments = useStore((state) => state.payments);
  const allExpenses = useStore((state) => state.expenses);
  const deletePayment = useStore((state) => state.deletePayment);
  const deleteExpense = useStore((state) => state.deleteExpense);
  
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>();
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();

  // Получаем оплаты для проекта с мемоизацией
  const payments = useMemo(() => {
    return allPayments
      .filter((p) => p.projectId === projectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allPayments, projectId]);

  // Получаем расходы для проекта с мемоизацией
  const expenses = useMemo(() => {
    return allExpenses
      .filter((e) => e.projectId === projectId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allExpenses, projectId]);

  // Группируем по валютам
  const paymentsByCurrency = useMemo(() => {
    const grouped: Record<string, Payment[]> = {};
    payments.forEach((payment) => {
      if (!grouped[payment.currency]) {
        grouped[payment.currency] = [];
      }
      grouped[payment.currency].push(payment);
    });
    return grouped;
  }, [payments]);

  // Группируем расходы по валютам
  const expensesByCurrency = useMemo(() => {
    const grouped: Record<string, Expense[]> = {};
    expenses.forEach((expense) => {
      if (!grouped[expense.currency]) {
        grouped[expense.currency] = [];
      }
      grouped[expense.currency].push(expense);
    });
    return grouped;
  }, [expenses]);

  const totalsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.keys(paymentsByCurrency).forEach((currency) => {
      totals[currency] = paymentsByCurrency[currency].reduce((sum, p) => sum + p.amount, 0);
    });
    return totals;
  }, [paymentsByCurrency]);

  const expenseTotalsByCurrency = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.keys(expensesByCurrency).forEach((currency) => {
      totals[currency] = expensesByCurrency[currency].reduce((sum, e) => sum + e.amount, 0);
    });
    return totals;
  }, [expensesByCurrency]);

  // Баланс (доходы - расходы) по валютам
  const balanceByCurrency = useMemo(() => {
    const balance: Record<string, number> = {};
    const allCurrencies = new Set([...Object.keys(totalsByCurrency), ...Object.keys(expenseTotalsByCurrency)]);
    allCurrencies.forEach((currency) => {
      balance[currency] = (totalsByCurrency[currency] || 0) - (expenseTotalsByCurrency[currency] || 0);
    });
    return balance;
  }, [totalsByCurrency, expenseTotalsByCurrency]);

  const handleCreatePayment = () => {
    setSelectedPayment(undefined);
    setIsPaymentFormOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPaymentFormOpen(true);
  };

  const handleDeletePayment = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту оплату?")) {
      deletePayment(id);
    }
  };

  const handleCreateExpense = () => {
    setSelectedExpense(undefined);
    setIsExpenseFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот расход?")) {
      deleteExpense(id);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Финансы</h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCreateExpense}>
            <TrendingDown className="mr-2 h-4 w-4" /> Расход
          </Button>
          <Button onClick={handleCreatePayment}>
            <Plus className="mr-2 h-4 w-4" /> Доход
          </Button>
        </div>
      </div>

      {/* Общая статистика */}
      {Object.keys(balanceByCurrency).length > 0 && (
        <div className="space-y-4">
          {Object.keys(balanceByCurrency).map((currency) => {
            const income = totalsByCurrency[currency] || 0;
            const expense = expenseTotalsByCurrency[currency] || 0;
            const balance = balanceByCurrency[currency];
            
            return (
              <div key={currency} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Доходы</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(income, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {paymentsByCurrency[currency]?.length || 0} {paymentsByCurrency[currency]?.length === 1 ? 'оплата' : 'оплат'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Расходы</CardTitle>
                    <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(expense, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {expensesByCurrency[currency]?.length || 0} {expensesByCurrency[currency]?.length === 1 ? 'расход' : 'расходов'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Баланс</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={cn(
                      "text-2xl font-bold",
                      balance >= 0 ? "text-foreground" : "text-destructive"
                    )}>
                      {formatCurrency(balance, currency)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {balance >= 0 ? "Прибыль" : "Убыток"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Вкладки: Доходы и Расходы */}
      <Tabs defaultValue="income" className="space-y-6">
        <TabsList>
          <TabsTrigger value="income" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Доходы
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Расходы
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-6">
          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <div className="p-4 rounded-full bg-secondary mb-4">
                <TrendingUp className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-medium">Нет доходов</p>
              <p className="text-sm">Добавьте первую оплату от заказчика</p>
              <Button onClick={handleCreatePayment} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Добавить доход
              </Button>
            </div>
          ) : (
            Object.keys(paymentsByCurrency).map((currency) => (
              <div key={currency} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {currency === 'RUB' ? 'Рубли' : currency === 'USD' ? 'Доллары' : currency === 'EUR' ? 'Евро' : currency}
                  </h2>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {formatCurrency(totalsByCurrency[currency], currency)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {paymentsByCurrency[currency].map((payment) => (
                    <Card 
                      key={payment.id} 
                      className="group relative hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold">
                                {formatCurrency(payment.amount, payment.currency)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(payment.date), "d MMM yyyy", { locale: ru })}
                              </Badge>
                            </div>
                            
                            {payment.description && (
                              <p className="text-sm text-muted-foreground">
                                {payment.description}
                              </p>
                            )}
                            
                            {payment.documentUrl && (
                              <a
                                href={payment.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-foreground hover:underline"
                              >
                                <LinkIcon className="w-4 h-4" />
                                Открыть документ
                              </a>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPayment(payment)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeletePayment(payment.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <div className="p-4 rounded-full bg-secondary mb-4">
                <TrendingDown className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-lg font-medium">Нет расходов</p>
              <p className="text-sm">Добавьте первый расход для отслеживания затрат</p>
              <Button onClick={handleCreateExpense} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Добавить расход
              </Button>
            </div>
          ) : (
            Object.keys(expensesByCurrency).map((currency) => (
              <div key={currency} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {currency === 'RUB' ? 'Рубли' : currency === 'USD' ? 'Доллары' : currency === 'EUR' ? 'Евро' : currency}
                  </h2>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {formatCurrency(expenseTotalsByCurrency[currency], currency)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {expensesByCurrency[currency].map((expense) => (
                    <Card 
                      key={expense.id} 
                      className="group relative hover:shadow-md transition-all"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-bold">
                                {formatCurrency(expense.amount, expense.currency)}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(expense.date), "d MMM yyyy", { locale: ru })}
                              </Badge>
                              {expense.category && (
                                <Badge variant="outline" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {expense.category}
                                </Badge>
                              )}
                            </div>
                            
                            {expense.description && (
                              <p className="text-sm text-muted-foreground">
                                {expense.description}
                              </p>
                            )}
                            
                            {expense.documentUrl && (
                              <a
                                href={expense.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-foreground hover:underline"
                              >
                                <LinkIcon className="w-4 h-4" />
                                Открыть документ
                              </a>
                            )}
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                                <Edit2 className="mr-2 h-4 w-4" /> Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteExpense(expense.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <PaymentForm 
        open={isPaymentFormOpen}
        onOpenChange={setIsPaymentFormOpen}
        projectId={projectId}
        paymentToEdit={selectedPayment}
      />

      <ExpenseForm 
        open={isExpenseFormOpen}
        onOpenChange={setIsExpenseFormOpen}
        projectId={projectId}
        expenseToEdit={selectedExpense}
      />
    </div>
  );
}

