import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  FolderKanban, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  FileText, 
  Clock, 
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Circle,
  CheckCircle2
} from "lucide-react";
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

function RecentProjects() {
  const projects = useStore((state) => state.projects);
  
  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }, [projects]);

  if (recentProjects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Недавние проекты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет проектов. Создайте первый проект, чтобы начать работу.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5" />
          Недавние проекты
        </CardTitle>
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            Все проекты <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentProjects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{project.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Обновлено {format(new Date(project.updatedAt), "d MMM yyyy", { locale: ru })}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TodayActivities() {
  const tasks = useStore((state) => state.tasks);
  const events = useStore((state) => state.events);
  const today = format(new Date(), "yyyy-MM-dd");

  const todayTasks = useMemo(() => {
    return tasks
      .filter((t) => t.date === today && t.status !== "completed" && t.status !== "cancelled")
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  }, [tasks, today]);

  const todayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5);
  }, [events, today]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Задачи на сегодня
          </CardTitle>
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              Все <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет активных задач на сегодня
            </p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <Link key={task.id} href={`/projects/${task.projectId}`}>
                  <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <div className="mt-0.5">
                      {task.status === "in-progress" ? (
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            task.priority === "high" && "border-red-500 text-red-500",
                            task.priority === "medium" && "border-yellow-500 text-yellow-500",
                            task.priority === "low" && "border-blue-500 text-blue-500"
                          )}
                        >
                          {task.priority === "high" ? "Высокий" : task.priority === "medium" ? "Средний" : "Низкий"}
                        </Badge>
                        {task.startTime && (
                          <span className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {task.startTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            События на сегодня
          </CardTitle>
          <Link href="/calendar">
            <Button variant="ghost" size="sm">
              Все <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {todayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет событий на сегодня
            </p>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <Link key={event.id} href={`/calendar/${event.date}`}>
                  <div className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WeeklyStats() {
  const tasks = useStore((state) => state.tasks);
  const getTotalTimeForProject = useStore((state) => state.getTotalTimeForProject);
  const projects = useStore((state) => state.projects);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weekStats = useMemo(() => {
    return weekDays.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === "completed").length;
      const total = dayTasks.length;
      
      return {
        date: format(day, "EEE", { locale: ru }),
        dateFull: format(day, "d MMM", { locale: ru }),
        completed,
        total,
        isToday: isToday(day),
      };
    });
  }, [tasks]);

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthStats = useMemo(() => {
    const completed = tasks.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate >= monthStart && taskDate <= monthEnd && t.status === "completed";
    }).length;
    const total = tasks.filter((t) => {
      const taskDate = new Date(t.date);
      return taskDate >= monthStart && taskDate <= monthEnd;
    }).length;
    
    const totalTime = projects.reduce((sum, project) => {
      return sum + getTotalTimeForProject(project.id);
    }, 0);
    const totalHours = Math.floor(totalTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

    return {
      completed,
      total,
      totalHours,
      totalMinutes,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks, projects, getTotalTimeForProject, monthStart, monthEnd]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Статистика за неделю
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weekStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span className="text-muted-foreground">Выполнено</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted" />
              <span className="text-muted-foreground">Всего</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Статистика за месяц
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Выполнено задач</p>
                <p className="text-2xl font-bold">{monthStats.completed}</p>
                <p className="text-xs text-muted-foreground">из {monthStats.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Прогресс</p>
                <p className="text-2xl font-bold">{monthStats.completionRate}%</p>
                <p className="text-xs text-muted-foreground">завершено</p>
              </div>
            </div>
            {monthStats.totalHours > 0 || monthStats.totalMinutes > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Время работы</p>
                <p className="text-2xl font-bold font-mono">
                  {monthStats.totalHours > 0 && `${monthStats.totalHours}ч `}
                  {monthStats.totalMinutes}м
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RecentNotes() {
  const notes = useStore((state) => state.notes);

  const recentNotes = useMemo(() => {
    return [...notes]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);
  }, [notes]);

  if (recentNotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Последние заметки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет заметок. Создайте первую заметку.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Последние заметки
        </CardTitle>
        <Link href="/list">
          <Button variant="ghost" size="sm">
            Все заметки <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentNotes.map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`}>
              <div className="flex items-start justify-between p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{note.title || "Без названия"}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {note.content || "Нет содержимого"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(note.updatedAt), "d MMM yyyy, HH:mm", { locale: ru })}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductivityChart() {
  const tasks = useStore((state) => state.tasks);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === "completed").length;
      const inProgress = dayTasks.filter((t) => t.status === "in-progress").length;
      const planned = dayTasks.filter((t) => t.status === "planned").length;
      
      return {
        date: format(date, "EEE", { locale: ru }),
        dateFull: format(date, "d MMM", { locale: ru }),
        completed,
        inProgress,
        planned,
        total: dayTasks.length,
      };
    });
  }, [tasks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Продуктивность за последние 7 дней
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Выполнено"
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="inProgress" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="В работе"
              dot={{ fill: "hsl(var(--accent))", r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="hsl(var(--muted-foreground))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Всего задач"
              dot={{ fill: "hsl(var(--muted-foreground))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-muted-foreground mt-1">
          Обзор всех ваших активностей и статистика
        </p>
      </div>

      <div className="space-y-6">
        <TodayActivities />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentProjects />
          <RecentNotes />
        </div>

        <WeeklyStats />
        
        <ProductivityChart />
      </div>
    </div>
  );
}

