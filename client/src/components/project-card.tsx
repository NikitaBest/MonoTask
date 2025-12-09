import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Project } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit2, Trash2, CheckCircle2, Circle, Clock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Link } from "wouter";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  const deleteProject = useStore((state) => state.deleteProject);
  const getTotalTimeForProject = useStore((state) => state.getTotalTimeForProject);
  // Получаем все задачи один раз
  const allTasks = useStore((state) => state.tasks);
  
  // Мемоизируем фильтрацию задач по проекту
  const tasks = useMemo(() => 
    allTasks.filter((t) => t.projectId === project.id),
    [allTasks, project.id]
  );
  
  const { completedTasks, totalTasks, progress, inProgressTasks } = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const prog = total > 0 ? Math.round((completed / total) * 100) : 0;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    return { completedTasks: completed, totalTasks: total, progress: prog, inProgressTasks: inProgress };
  }, [tasks]);

  const totalTimeMs = useMemo(() => getTotalTimeForProject(project.id), [getTotalTimeForProject, project.id]);
  const totalHours = Math.floor(totalTimeMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  const categoryColors: Record<string, string> = {
    'работа': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'личное': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'тренировки': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'учеба': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const defaultColor = 'bg-secondary text-secondary-foreground';

  return (
    <Card className="group relative flex flex-col hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{project.name}</CardTitle>
            {project.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {project.description}
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
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit2 className="mr-2 h-4 w-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => deleteProject(project.id)}
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
            className={cn(
              "capitalize",
              categoryColors[project.category.toLowerCase()] || defaultColor
            )}
          >
            {project.category}
          </Badge>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3" />
              <span>{totalTasks}</span>
            </div>
            {inProgressTasks > 0 && (
              <div className="flex items-center gap-1">
                <PlayCircle className="h-3 w-3" />
                <span>{inProgressTasks}</span>
              </div>
            )}
            {completedTasks > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>{completedTasks}</span>
              </div>
            )}
          </div>
          {totalTimeMs > 0 && (
            <div className="flex items-center gap-1 font-mono text-xs">
              <Clock className="h-3 w-3" />
              <span>{totalHours > 0 ? `${totalHours}ч ` : ''}{totalMinutes}м</span>
            </div>
          )}
        </div>

        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" className="w-full mt-auto">
            Открыть проект
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

