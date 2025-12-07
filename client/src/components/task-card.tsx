import { format } from "date-fns";
import { Check, Clock, Trash2, Edit2, X, MoreHorizontal, PlayCircle, FolderKanban, GripVertical } from "lucide-react";
import { useStore, Task, TaskStatus } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { TaskForm } from "./task-form";
import { TaskTimer } from "./task-timer";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

const statusColors: Record<TaskStatus, string> = {
  planned: "bg-secondary text-secondary-foreground border-transparent",
  "in-progress": "bg-primary text-primary-foreground border-transparent",
  completed: "bg-muted text-muted-foreground line-through decoration-muted-foreground/50",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  medium: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

const priorityLabels: Record<string, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export function TaskCard({ 
  task, 
  compact = false, 
  draggable = false,
  onDragStart,
  onDragEnd,
  isDragging = false
}: TaskCardProps) {
  const updateTask = useStore((state) => state.updateTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const project = useStore((state) => 
    task.projectId ? state.projects.find((p) => p.id === task.projectId) : undefined
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
  };

  const handleDragStartInternal = (e: React.DragEvent) => {
    if (!draggable || !onDragStart) {
      e.preventDefault();
      return;
    }
    
    // Проверяем, не кликнули ли на интерактивный элемент
    const target = e.target as HTMLElement;
    const interactive = target.closest('button, a, [role="button"], input, textarea, select');
    
    // Если кликнули на интерактивный элемент (кроме иконки drag), отменяем drag
    if (interactive && !target.closest('[data-drag-handle]')) {
      e.preventDefault();
      return;
    }
    
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id }));
    
    // Устанавливаем визуализацию перетаскивания
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
    
    onDragStart(e, task);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    // Восстанавливаем прозрачность
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    
    if (draggable && onDragEnd) {
      e.stopPropagation();
      onDragEnd(e);
    }
  };

  if (compact) {
    return (
      <>
        <div 
          draggable={draggable}
          onDragStart={handleDragStartInternal}
          onDragEnd={handleDragEndInternal}
          className={cn(
            "p-2 rounded-md border text-xs cursor-pointer hover:shadow-sm transition-all group relative overflow-hidden",
            statusColors[task.status],
            draggable && "cursor-grab active:cursor-grabbing select-none",
            isDragging && "opacity-30 scale-95 pointer-events-none"
          )}
          onClick={() => setIsEditOpen(true)}
          style={draggable ? { userSelect: 'none', WebkitUserDrag: 'element' } : undefined}
        >
          <div className="font-medium truncate pr-4">{task.title}</div>
          {task.startTime && (
            <div className="text-[10px] opacity-80">{task.startTime}</div>
          )}
        </div>
        <TaskForm 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          taskToEdit={task} 
        />
      </>
    );
  }

  return (
    <>
      <div 
        draggable={draggable}
        onDragStart={handleDragStartInternal}
        onDragEnd={handleDragEndInternal}
        className={cn(
          "group relative flex flex-col gap-3 p-4 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/20",
          task.status === 'completed' && "opacity-60 bg-muted/30",
          draggable && "cursor-grab active:cursor-grabbing select-none",
          isDragging && "opacity-30 scale-95"
        )}
        style={draggable ? { 
          userSelect: 'none', 
          WebkitUserDrag: 'element',
          touchAction: 'none',
        } : undefined}
        onMouseDown={(e) => {
          if (!draggable) return;
          // Предотвращаем drag при клике на интерактивные элементы
          const target = e.target as HTMLElement;
          const interactive = target.closest('button, a, [role="button"], input, textarea, select, [data-drag-handle]');
          if (interactive && !interactive.hasAttribute('data-drag-handle')) {
            const element = e.currentTarget as HTMLElement;
            if (element) {
              element.setAttribute('draggable', 'false');
              setTimeout(() => {
                if (element) {
                  element.setAttribute('draggable', 'true');
                }
              }, 0);
            }
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
             <div className="flex items-center gap-2">
               {draggable && (
                 <div 
                   data-drag-handle
                   className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 touch-none"
                   draggable={true}
                   onDragStart={(e) => {
                     e.stopPropagation();
                     handleDragStartInternal(e);
                   }}
                   onDragEnd={handleDragEndInternal}
                   onMouseDown={(e) => {
                     e.stopPropagation();
                   }}
                 >
                   <GripVertical className="h-5 w-5" />
                 </div>
               )}
               <span className={cn(
                 "font-semibold text-lg leading-tight",
                 task.status === 'completed' && "line-through text-muted-foreground"
               )}>
                 {task.title}
               </span>
             </div>
             {task.description && (
               <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
             )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Статус</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleStatusChange("planned")}>
                <Clock className="mr-2 h-4 w-4" /> Запланировано
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>
                <PlayCircle className="mr-2 h-4 w-4" /> В работе
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                <Check className="mr-2 h-4 w-4" /> Выполнено
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange("cancelled")}>
                <X className="mr-2 h-4 w-4" /> Отменено
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" /> Изменить
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteTask(task.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3" draggable={false} onDragStart={(e) => e.stopPropagation()}>
          {/* Таймер */}
          <div draggable={false} onDragStart={(e) => e.stopPropagation()}>
            <TaskTimer taskId={task.id} compact={false} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs" draggable={false} onDragStart={(e) => e.stopPropagation()}>
             {project && (
               <Link href={`/projects/${project.id}`} draggable={false} onDragStart={(e) => e.stopPropagation()}>
                 <Badge 
                   variant="outline" 
                   className="cursor-pointer hover:bg-accent transition-colors flex items-center gap-1"
                   draggable={false}
                 >
                   <FolderKanban className="w-3 h-3" />
                   {project.name}
                 </Badge>
               </Link>
             )}

             <Badge variant="outline" className={cn("uppercase tracking-wider font-bold border-0 px-2 py-0.5 rounded-full", priorityColors[task.priority])}>
               {priorityLabels[task.priority]}
             </Badge>

             {(task.startTime || task.endTime) && (
               <div className="flex items-center text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                 <Clock className="w-3 h-3 mr-1" />
                 {task.startTime}{task.endTime && ` - ${task.endTime}`}
               </div>
             )}

             {task.tags.map(tag => (
               <span key={tag} className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                 #{tag}
               </span>
             ))}
          </div>
        </div>
      </div>

      <TaskForm 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        taskToEdit={task} 
      />
    </>
  );
}
