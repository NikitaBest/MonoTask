import { useState, useMemo } from "react";
import { useStore, Goal, GoalPeriod, GoalStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Target, Search, Filter, Calendar, TrendingUp } from "lucide-react";
import { GoalCard } from "@/components/goal-card";
import { GoalForm } from "@/components/goal-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addWeeks, addMonths, addYears } from "date-fns";
import { ru } from "date-fns/locale";

export default function GoalsPage() {
  const goals = useStore((state) => state.goals);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<GoalPeriod | "all">("all");
  const [statusFilter, setStatusFilter] = useState<GoalStatus | "all">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [activeTab, setActiveTab] = useState<GoalPeriod | "all">("all");

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const matchesSearch = goal.title.toLowerCase().includes(search.toLowerCase()) ||
                           goal.description?.toLowerCase().includes(search.toLowerCase());
      const matchesPeriod = periodFilter === "all" || goal.period === periodFilter;
      const matchesStatus = statusFilter === "all" || goal.status === statusFilter;
      const matchesTab = activeTab === "all" || goal.period === activeTab;
      return matchesSearch && matchesPeriod && matchesStatus && matchesTab;
    });
  }, [goals, search, periodFilter, statusFilter, activeTab]);

  const goalsByPeriod = useMemo(() => {
    const grouped: Record<GoalPeriod, Goal[]> = {
      week: [],
      month: [],
      year: [],
    };
    filteredGoals.forEach((goal) => {
      if (goal.period in grouped) {
        grouped[goal.period].push(goal);
      }
    });
    return grouped;
  }, [filteredGoals]);

  const stats = useMemo(() => {
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const avgProgress = total > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / total)
      : 0;
    return { total, active, completed, avgProgress };
  }, [goals]);

  const handleCreateGoal = () => {
    setSelectedGoal(undefined);
    setIsFormOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsFormOpen(true);
  };

  const getPeriodDates = (period: GoalPeriod) => {
    const now = new Date();
    switch (period) {
      case "week":
        return {
          start: format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
          end: format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        };
      case "month":
        return {
          start: format(startOfMonth(now), "yyyy-MM-dd"),
          end: format(endOfMonth(now), "yyyy-MM-dd"),
        };
      case "year":
        return {
          start: format(startOfYear(now), "yyyy-MM-dd"),
          end: format(endOfYear(now), "yyyy-MM-dd"),
        };
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Цели и планы</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Планируйте на неделю, месяц или год
            </p>
          </div>
        </div>
        
        <Button onClick={handleCreateGoal}>
          <Plus className="mr-2 h-4 w-4" /> Новая цель
        </Button>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground mb-1">Всего целей</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground mb-1">Активных</div>
          <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground mb-1">Выполнено</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="text-sm text-muted-foreground mb-1">Средний прогресс</div>
          <div className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {stats.avgProgress}%
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:w-auto max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск целей..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as GoalPeriod | "all")}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{periodFilter === 'all' ? 'Все периоды' : periodFilter === 'week' ? 'Неделя' : periodFilter === 'month' ? 'Месяц' : 'Год'}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все периоды</SelectItem>
            <SelectItem value="week">Неделя</SelectItem>
            <SelectItem value="month">Месяц</SelectItem>
            <SelectItem value="year">Год</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GoalStatus | "all")}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>
                {statusFilter === 'all' ? 'Все статусы' : 
                 statusFilter === 'active' ? 'Активные' :
                 statusFilter === 'completed' ? 'Выполнено' :
                 statusFilter === 'paused' ? 'Приостановлено' : 'Отменено'}
              </span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="completed">Выполнено</SelectItem>
            <SelectItem value="paused">Приостановлено</SelectItem>
            <SelectItem value="cancelled">Отменено</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Вкладки по периодам */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as GoalPeriod | "all")} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value="week">Неделя</TabsTrigger>
          <TabsTrigger value="month">Месяц</TabsTrigger>
          <TabsTrigger value="year">Год</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="all" className="mt-0">
            {filteredGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <div className="p-4 rounded-full bg-secondary mb-4">
                  <Target className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-lg font-medium">
                  {goals.length === 0 ? "Нет целей" : "Цели не найдены"}
                </p>
                <p className="text-sm">
                  {goals.length === 0 
                    ? "Создайте свою первую цель для планирования" 
                    : "Попробуйте изменить фильтры или условия поиска"}
                </p>
                {goals.length === 0 && (
                  <Button onClick={handleCreateGoal} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Создать цель
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal}
                    onEdit={handleEditGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <div className="mb-4 text-sm text-muted-foreground">
              Период: {(() => {
                const dates = getPeriodDates("week");
                return `${format(new Date(dates.start), "d MMM", { locale: ru })} - ${format(new Date(dates.end), "d MMM yyyy", { locale: ru })}`;
              })()}
            </div>
            {goalsByPeriod.week.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Target className="w-8 h-8 opacity-50 mb-4" />
                <p className="text-lg font-medium">Нет целей на неделю</p>
                <Button onClick={handleCreateGoal} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Создать цель на неделю
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalsByPeriod.week.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal}
                    onEdit={handleEditGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="month" className="mt-0">
            <div className="mb-4 text-sm text-muted-foreground">
              Период: {(() => {
                const dates = getPeriodDates("month");
                return format(new Date(dates.start), "MMMM yyyy", { locale: ru });
              })()}
            </div>
            {goalsByPeriod.month.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Target className="w-8 h-8 opacity-50 mb-4" />
                <p className="text-lg font-medium">Нет целей на месяц</p>
                <Button onClick={handleCreateGoal} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Создать цель на месяц
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalsByPeriod.month.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal}
                    onEdit={handleEditGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="year" className="mt-0">
            <div className="mb-4 text-sm text-muted-foreground">
              Период: {(() => {
                const dates = getPeriodDates("year");
                return format(new Date(dates.start), "yyyy", { locale: ru });
              })()}
            </div>
            {goalsByPeriod.year.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Target className="w-8 h-8 opacity-50 mb-4" />
                <p className="text-lg font-medium">Нет целей на год</p>
                <Button onClick={handleCreateGoal} className="mt-4" variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Создать цель на год
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goalsByPeriod.year.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal}
                    onEdit={handleEditGoal}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>

      <GoalForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        goalToEdit={selectedGoal}
      />
    </div>
  );
}

