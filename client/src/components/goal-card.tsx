import { useMemo } from "react";
import { useStore, Goal, GoalPeriod, GoalStatus } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, CheckCircle2, Circle, Pause, X, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "wouter";

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
}

const periodLabels: Record<GoalPeriod, string> = {
  week: "Неделя",
  month: "Месяц",
  year: "Год",
};

const statusLabels: Record<GoalStatus, string> = {
  active: "Активная",
  completed: "Выполнено",
  paused: "Приостановлено",
  cancelled: "Отменено",
};

const statusColors: Record<GoalStatus, string> = {
  active: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  completed: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  paused: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  cancelled: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const deleteGoal = useStore((state) => state.deleteGoal);
  const updateGoal = useStore((state) => state.updateGoal);

  const { completedSteps, totalSteps } = useMemo(() => {
    const completed = goal.steps.filter((s) => s.completed).length;
    const total = goal.steps.length;
    return { completedSteps: completed, totalSteps: total };
  }, [goal.steps]);

  const handleStatusChange = (status: GoalStatus) => {
    updateGoal(goal.id, { 
      status,
      completedAt: status === 'completed' ? Date.now() : undefined,
    });
  };

  const handleDelete = () => {
    if (confirm(`Вы уверены, что хотите удалить цель "${goal.title}"?`)) {
      deleteGoal(goal.id);
    }
  };

  return (
    <Card className="group relative flex flex-col hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
              <Target className="h-4 w-4 text-primary flex-shrink-0" />
              {goal.title}
            </CardTitle>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Edit2 className="mr-2 h-4 w-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Статус</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange("active")}>
                <Circle className="mr-2 h-4 w-4" /> Активная
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Выполнено
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("paused")}>
                <Pause className="mr-2 h-4 w-4" /> Приостановлено
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
                <X className="mr-2 h-4 w-4" /> Отменено
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className={cn("capitalize", statusColors[goal.status])}
          >
            {statusLabels[goal.status]}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {periodLabels[goal.period]}
          </Badge>
          {goal.category && (
            <Badge variant="outline" className="capitalize">
              {goal.category}
            </Badge>
          )}
        </div>

        {/* Прогресс */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
          {totalSteps > 0 && (
            <div className="text-xs text-muted-foreground">
              {completedSteps} из {totalSteps} шагов выполнено
            </div>
          )}
        </div>

        {/* Даты */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            {format(new Date(goal.startDate), "d MMM", { locale: ru })} - {format(new Date(goal.endDate), "d MMM yyyy", { locale: ru })}
          </span>
        </div>

        <Link href={`/goals/${goal.id}`}>
          <Button variant="outline" className="w-full mt-auto">
            Открыть цель
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

