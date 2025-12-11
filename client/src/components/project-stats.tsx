import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { CheckCircle2, Circle, Clock, XCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ProjectStatsProps {
  projectId: string;
}

export function ProjectStats({ projectId }: ProjectStatsProps) {
  const allTasks = useStore((state) => state.tasks);
  const getTotalTimeForProject = useStore((state) => state.getTotalTimeForProject);
  const getTotalTimeForTask = useStore((state) => state.getTotalTimeForTask);
  
  const tasks = useMemo(() => 
    allTasks.filter((t) => t.projectId === projectId),
    [allTasks, projectId]
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const plannedTasks = tasks.filter(t => t.status === 'planned').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const totalTimeMs = getTotalTimeForProject(projectId);
  const totalHours = Math.floor(totalTimeMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  // Задачи с превышением оценочного времени
  const tasksExceedingTime = useMemo(() => {
    return tasks
      .filter((task) => {
        // Проверяем только задачи с оценочным временем
        if (!task.estimatedTime || task.estimatedTime === 0) return false;
        
        // Получаем фактическое время в миллисекундах
        const actualTimeMs = getTotalTimeForTask(task.id);
        // Конвертируем оценочное время из минут в миллисекунды
        const estimatedTimeMs = task.estimatedTime * 60 * 1000;
        
        // Возвращаем задачи, где фактическое время превысило оценочное
        return actualTimeMs > estimatedTimeMs;
      })
      .map((task) => {
        const actualTimeMs = getTotalTimeForTask(task.id);
        const estimatedTimeMs = task.estimatedTime! * 60 * 1000;
        const exceededTimeMs = actualTimeMs - estimatedTimeMs;
        
        const actualMinutes = Math.floor(actualTimeMs / (1000 * 60));
        const estimatedMinutes = task.estimatedTime!;
        const exceededMinutes = Math.floor(exceededTimeMs / (1000 * 60));
        
        return {
          task,
          actualMinutes,
          estimatedMinutes,
          exceededMinutes,
          exceededPercent: Math.round((exceededTimeMs / estimatedTimeMs) * 100),
        };
      })
      .sort((a, b) => b.exceededPercent - a.exceededPercent); // Сортируем по проценту превышения
  }, [tasks, getTotalTimeForTask]);

  const statusData = [
    { name: 'Запланировано', value: plannedTasks, color: '#94a3b8' }, // Slate gray
    { name: 'В работе', value: inProgressTasks, color: '#3b82f6' }, // Blue
    { name: 'Выполнено', value: completedTasks, color: '#22c55e' }, // Green
    { name: 'Отменено', value: cancelledTasks, color: '#ef4444' }, // Red
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'Низкий', count: tasks.filter(t => t.priority === 'low').length, color: '#60a5fa' }, // Light blue
    { name: 'Средний', count: tasks.filter(t => t.priority === 'medium').length, color: '#f59e0b' }, // Amber/Orange
    { name: 'Высокий', count: tasks.filter(t => t.priority === 'high').length, color: '#f97316' }, // Orange/Red
  ];

  if (totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Нет данных для статистики</p>
        <p className="text-sm">Создайте задачи в проекте, чтобы увидеть статистику</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto w-full space-y-6 overflow-y-auto h-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего задач</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Выполнено</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{inProgressTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Прогресс</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Время работы */}
      {totalTimeMs > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Время работы над проектом
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {totalHours > 0 && `${totalHours}ч `}{totalMinutes}м
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Общее время, потраченное на все задачи проекта
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Chart */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Задачи по приоритетам</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={priorityData}>
                 <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                 <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                 />
                 <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                   {priorityData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Задачи с превышением времени */}
      {tasksExceedingTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Задачи с превышением оценочного времени
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Задачи, у которых фактическое время выполнения превысило оценочное время
            </p>
            <div className="space-y-3">
              {tasksExceedingTime.map(({ task, actualMinutes, estimatedMinutes, exceededMinutes, exceededPercent }) => {
                const actualHours = Math.floor(actualMinutes / 60);
                const actualMins = actualMinutes % 60;
                const estimatedHours = Math.floor(estimatedMinutes / 60);
                const estimatedMins = estimatedMinutes % 60;
                const exceededHours = Math.floor(exceededMinutes / 60);
                const exceededMins = exceededMinutes % 60;

                return (
                  <Link key={task.id} href={`/projects/${projectId}`}>
                    <div className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base mb-2">{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Оценка:</span>
                              <span className="font-medium">
                                {estimatedHours > 0 && `${estimatedHours}ч `}{estimatedMins}м
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Фактически:</span>
                              <span className="font-medium text-orange-600 dark:text-orange-400">
                                {actualHours > 0 && `${actualHours}ч `}{actualMins}м
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Превышение:</span>
                              <Badge variant="destructive" className="font-medium">
                                +{exceededHours > 0 && `${exceededHours}ч `}{exceededMins}м ({exceededPercent}%)
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            task.status === 'completed' && "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                            task.status === 'in-progress' && "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                            task.status === 'planned' && "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                          )}
                        >
                          {task.status === 'completed' ? 'Выполнено' : 
                           task.status === 'in-progress' ? 'В работе' : 
                           task.status === 'planned' ? 'Запланировано' : 'Отменено'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

