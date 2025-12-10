import { useRoute, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";
import { ProjectNotes } from "@/components/project-notes";
import { ProjectStats } from "@/components/project-stats";
import { ProjectPayments } from "@/components/project-payments";
import { ProjectResources } from "@/components/project-resources";
import { KanbanBoard } from "@/components/kanban-board";
import { ArrowLeft, Plus, FolderKanban, CheckSquare, FileText, PieChart, DollarSign, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function ProjectDetailPage() {
  const [, params] = useRoute("/projects/:id");
  const [location] = useLocation();
  const projectId = params?.id;
  
  const project = useStore((state) => 
    state.projects.find((p) => p.id === projectId)
  );
  const allTasks = useStore((state) => state.tasks);
  
  const tasks = useMemo(() => 
    projectId ? allTasks.filter((t) => t.projectId === projectId) : [],
    [allTasks, projectId]
  );
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Определяем активную вкладку из хеша URL
  const getActiveTabFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['tasks', 'notes', 'payments', 'resources', 'stats'];
    return validTabs.includes(hash) ? hash : 'tasks';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromHash);
  
  // Обновляем активную вкладку при изменении хеша
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['tasks', 'notes', 'payments', 'resources', 'stats'];
    if (validTabs.includes(hash)) {
      setActiveTab(hash);
    }
  }, [location]);
  
  // Обновляем хеш в URL при изменении вкладки
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    window.location.hash = value;
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Проект не найден</h2>
          <p className="text-muted-foreground mb-4">Проект с таким ID не существует</p>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к проектам
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getTotalTimeForProject = useStore((state) => state.getTotalTimeForProject);
  const getTotalEstimatedTimeForProject = useStore((state) => state.getTotalEstimatedTimeForProject);
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const plannedTasks = tasks.filter(t => t.status === 'planned').length;
  
  const totalTimeMs = projectId ? getTotalTimeForProject(projectId) : 0;
  const totalHours = Math.floor(totalTimeMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  const totalEstimatedMinutes = projectId ? getTotalEstimatedTimeForProject(projectId) : 0;
  const estimatedHours = Math.floor(totalEstimatedMinutes / 60);
  const estimatedMinutes = totalEstimatedMinutes % 60;

  const categoryColors: Record<string, string> = {
    'работа': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'личное': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'тренировки': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'учеба': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  const defaultColor = 'bg-secondary text-secondary-foreground';

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      {/* Компактный заголовок */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate">{project.name}</h1>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize flex-shrink-0 text-xs",
                  categoryColors[project.category.toLowerCase()] || defaultColor
                )}
              >
                {project.category}
              </Badge>
            </div>
          </div>
          
          {/* Компактная статистика в одну строку */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totalTasks}</span> задач
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{completedTasks}</span> выполнено
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{inProgressTasks}</span> в работе
            </div>
            <div className="text-xs text-muted-foreground">
              Прогресс: <span className="font-semibold text-foreground">{progress}%</span>
            </div>
            {totalEstimatedMinutes > 0 && (
              <div className="text-xs text-muted-foreground font-mono">
                Оценка: {estimatedHours > 0 ? `${estimatedHours}ч` : ''} {estimatedMinutes}м
              </div>
            )}
            {totalTimeMs > 0 && (
              <div className="text-xs text-muted-foreground font-mono">
                Факт: {totalHours > 0 ? `${totalHours}ч` : ''} {totalMinutes}м
              </div>
            )}
          </div>
          
          <Button onClick={() => setIsFormOpen(true)} size="sm" className="flex-shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Добавить
          </Button>
        </div>
      </div>

      {/* Вкладки: Задачи, Заметки и Статистика */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col overflow-hidden h-full">
          <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b bg-background/95 backdrop-blur-sm z-10">
            <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-secondary border p-1">
              <TabsTrigger 
                value="tasks" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <CheckSquare className="h-4 w-4" />
                Задачи
              </TabsTrigger>
              <TabsTrigger 
                value="notes" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Заметки
              </TabsTrigger>
              <TabsTrigger 
                value="payments" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <DollarSign className="h-4 w-4" />
                Финансы
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <LinkIcon className="h-4 w-4" />
                Ресурсы
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-6 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <PieChart className="h-4 w-4" />
                Статистика
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="tasks" className="flex-1 overflow-hidden mt-0 h-full">
            <KanbanBoard 
              projectId={projectId!} 
              onAddTask={() => setIsFormOpen(true)}
            />
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-y-auto px-4 py-4 mt-0">
            <ProjectNotes projectId={projectId!} />
          </TabsContent>

          <TabsContent value="payments" className="flex-1 overflow-hidden mt-0 h-full">
            <ProjectPayments projectId={projectId!} />
          </TabsContent>

          <TabsContent value="resources" className="flex-1 overflow-hidden mt-0 h-full">
            <ProjectResources projectId={projectId!} />
          </TabsContent>

          <TabsContent value="stats" className="flex-1 overflow-hidden mt-0 h-full">
            <ProjectStats projectId={projectId!} />
          </TabsContent>
        </Tabs>
      </div>

      <TaskForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialProjectId={projectId}
      />
    </div>
  );
}
