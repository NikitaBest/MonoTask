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
import { CheckCircle2, Circle, Clock, XCircle, TrendingUp } from "lucide-react";

interface ProjectStatsProps {
  projectId: string;
}

export function ProjectStats({ projectId }: ProjectStatsProps) {
  const allTasks = useStore((state) => state.tasks);
  const getTotalTimeForProject = useStore((state) => state.getTotalTimeForProject);
  
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
    </div>
  );
}

