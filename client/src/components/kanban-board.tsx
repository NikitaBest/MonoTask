import { useState, useMemo } from "react";
import { useStore, Task, TaskStatus } from "@/lib/store";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  projectId: string;
  onAddTask: () => void;
}

const columns: { id: TaskStatus | "all"; title: string; status?: TaskStatus }[] = [
  { id: "all", title: "Все задачи" },
  { id: "planned", title: "Запланировано", status: "planned" },
  { id: "in-progress", title: "В работе", status: "in-progress" },
  { id: "completed", title: "Выполнено", status: "completed" },
];

export function KanbanBoard({ projectId, onAddTask }: KanbanBoardProps) {
  const allTasks = useStore((state) => state.tasks);
  const updateTask = useStore((state) => state.updateTask);
  
  const tasks = useMemo(() => 
    projectId ? allTasks.filter((t) => t.projectId === projectId) : [],
    [allTasks, projectId]
  );

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {
      all: tasks,
      planned: tasks.filter(t => t.status === "planned"),
      "in-progress": tasks.filter(t => t.status === "in-progress"),
      completed: tasks.filter(t => t.status === "completed"),
    };
    return grouped;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    console.log('Drag start:', task.id); // Для отладки
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id }));
    
    // Улучшаем визуализацию перетаскивания
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Проверяем, что мы действительно покинули колонку, а не перешли на дочерний элемент
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverColumn(null);
    
    const taskId = e.dataTransfer.getData("text/plain");
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      setDraggedTask(null);
      return;
    }

    const targetColumn = columns.find(col => col.id === columnId);
    if (!targetColumn || !targetColumn.status) {
      setDraggedTask(null);
      return;
    }

    // Не обновляем, если статус не изменился
    if (task.status === targetColumn.status) {
      setDraggedTask(null);
      return;
    }

    updateTask(task.id, { status: targetColumn.status });
    setDraggedTask(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Восстанавливаем прозрачность
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getColumnCount = (columnId: string) => {
    return tasksByStatus[columnId]?.length || 0;
  };

  return (
    <div className="h-full flex flex-col w-full">
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-4 scrollbar-hide">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map((column) => {
            const columnTasks = tasksByStatus[column.id] || [];
            const isDragOver = dragOverColumn === column.id;
            const canDrop = column.status && draggedTask && draggedTask.status !== column.status;

            return (
              <div
                key={column.id}
                className={cn(
                  "flex flex-col w-80 flex-shrink-0 rounded-lg border bg-card transition-all shadow-sm h-full",
                  isDragOver && canDrop && "ring-2 ring-primary ring-offset-2 bg-accent/30 border-primary",
                  isDragOver && !canDrop && "opacity-60"
                )}
                onDragLeave={handleDragLeave}
              >
                {/* Заголовок колонки */}
                <div className="p-3 border-b bg-muted/30 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                    <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full font-medium">
                      {getColumnCount(column.id)}
                    </span>
                  </div>
                </div>

                {/* Список задач */}
                <div 
                  className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-hide"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedTask) {
                      handleDragOver(e, column.id);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDrop(e, column.id);
                  }}
                >
                  {columnTasks.length === 0 ? (
                    <div className={cn(
                      "flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg transition-colors",
                      isDragOver && canDrop && "border-primary bg-primary/5"
                    )}>
                      <p className="text-xs text-center px-4">
                        {column.id === "all" 
                          ? "Нет задач в проекте"
                          : isDragOver && canDrop
                          ? "Отпустите, чтобы переместить"
                          : "Перетащите задачу сюда"}
                      </p>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard 
                        key={task.id}
                        task={task} 
                        compact={column.id === "all"}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedTask?.id === task.id}
                      />
                    ))
                  )}
                </div>

                {/* Кнопка добавления для колонки "Все задачи" */}
                {column.id === "all" && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAddTask}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить задачу
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

