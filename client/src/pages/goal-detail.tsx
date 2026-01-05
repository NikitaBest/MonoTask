import { useRoute, Link } from "wouter";
import { useStore, Goal } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GoalForm } from "@/components/goal-form";
import { ArrowLeft, Edit2, Trash2, Plus, CheckCircle2, Circle, Target, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusLabels: Record<string, string> = {
  active: "Активная",
  completed: "Выполнено",
  paused: "Приостановлено",
  cancelled: "Отменено",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  completed: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  paused: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  cancelled: "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

export default function GoalDetailPage() {
  const [, params] = useRoute("/goals/:id");
  const goalId = params?.id;
  
  const goal = useStore((state) => 
    goalId ? state.goals.find((g) => g.id === goalId) : undefined
  );
  
  const updateGoal = useStore((state) => state.updateGoal);
  const deleteGoal = useStore((state) => state.deleteGoal);
  const addGoalStep = useStore((state) => state.addGoalStep);
  const updateGoalStep = useStore((state) => state.updateGoalStep);
  const deleteGoalStep = useStore((state) => state.deleteGoalStep);
  const toggleGoalStep = useStore((state) => state.toggleGoalStep);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepDescription, setNewStepDescription] = useState("");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepTitle, setEditingStepTitle] = useState("");
  const [editingStepDescription, setEditingStepDescription] = useState("");

  const { completedSteps, totalSteps } = useMemo(() => {
    if (!goal) return { completedSteps: 0, totalSteps: 0 };
    const completed = goal.steps.filter((s) => s.completed).length;
    const total = goal.steps.length;
    return { completedSteps: completed, totalSteps: total };
  }, [goal]);

  if (!goal) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Цель не найдена</h2>
          <p className="text-muted-foreground mb-4">Цель с таким ID не существует</p>
          <Link href="/goals">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к целям
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddStep = () => {
    if (!newStepTitle.trim()) return;
    addGoalStep(goal.id, {
      title: newStepTitle,
      description: newStepDescription || undefined,
      completed: false,
    });
    setNewStepTitle("");
    setNewStepDescription("");
  };

  const handleDeleteStep = (stepId: string) => {
    deleteGoalStep(goal.id, stepId);
  };

  const handleToggleStep = (stepId: string) => {
    toggleGoalStep(goal.id, stepId);
  };

  const handleStartEditStep = (stepId: string) => {
    const step = goal.steps.find(s => s.id === stepId);
    if (step) {
      setEditingStepId(stepId);
      setEditingStepTitle(step.title);
      setEditingStepDescription(step.description || "");
    }
  };

  const handleSaveStep = (stepId: string) => {
    if (!editingStepTitle.trim()) return;
    updateGoalStep(goal.id, stepId, {
      title: editingStepTitle,
      description: editingStepDescription || undefined,
    });
    setEditingStepId(null);
    setEditingStepTitle("");
    setEditingStepDescription("");
  };

  const handleCancelEdit = () => {
    setEditingStepId(null);
    setEditingStepTitle("");
    setEditingStepDescription("");
  };

  const handleDelete = () => {
    deleteGoal(goal.id);
    setIsDeleteDialogOpen(false);
  };

  const sortedSteps = [...goal.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      {/* Заголовок */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href="/goals">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <Target className="h-5 w-5 text-primary flex-shrink-0" />
              <h1 className="text-xl font-bold tracking-tight truncate">{goal.title}</h1>
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize flex-shrink-0 text-xs",
                  statusColors[goal.status] || "bg-secondary text-secondary-foreground"
                )}
              >
                {statusLabels[goal.status] || goal.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={() => setIsFormOpen(true)} size="sm" variant="outline">
              <Edit2 className="mr-2 h-4 w-4" /> Редактировать
            </Button>
            <Button 
              onClick={() => setIsDeleteDialogOpen(true)} 
              size="sm" 
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Удалить
            </Button>
          </div>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Описание */}
          {goal.description && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {goal.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Информация о цели */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Период</div>
                <div className="text-lg font-semibold capitalize">{goal.period === 'week' ? 'Неделя' : goal.period === 'month' ? 'Месяц' : 'Год'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Даты</div>
                <div className="text-sm font-medium">
                  {format(new Date(goal.startDate), "d MMM", { locale: ru })} - {format(new Date(goal.endDate), "d MMM yyyy", { locale: ru })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Прогресс</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {goal.progress}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Прогресс */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Прогресс выполнения</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {completedSteps} из {totalSteps} шагов
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={goal.progress} className="h-3" />
            </CardContent>
          </Card>

          {/* Шаги */}
          <Card>
            <CardHeader>
              <CardTitle>Шаги для выполнения</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedSteps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Нет шагов</p>
                  <p className="text-sm">Добавьте первый шаг для выполнения цели</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-start gap-3 p-4 rounded-lg border transition-all",
                        step.completed 
                          ? "bg-muted/30 opacity-75" 
                          : "bg-card hover:shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={step.completed}
                          onCheckedChange={() => handleToggleStep(step.id)}
                          className="mt-1"
                        />
                        {editingStepId === step.id ? (
                          <div className="flex-1 space-y-2">
                            <Input
                              value={editingStepTitle}
                              onChange={(e) => setEditingStepTitle(e.target.value)}
                              placeholder="Название шага"
                              autoFocus
                            />
                            <Textarea
                              value={editingStepDescription}
                              onChange={(e) => setEditingStepDescription(e.target.value)}
                              placeholder="Описание (необязательно)"
                              className="resize-none min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveStep(step.id)}
                                disabled={!editingStepTitle.trim()}
                              >
                                Сохранить
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Отмена
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono">
                                #{index + 1}
                              </span>
                              <span className={cn(
                                "font-medium",
                                step.completed && "line-through text-muted-foreground"
                              )}>
                                {step.title}
                              </span>
                            </div>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mt-1 ml-6">
                                {step.description}
                              </p>
                            )}
                            {step.completed && step.completedAt && (
                              <p className="text-xs text-muted-foreground mt-1 ml-6">
                                Выполнено: {format(new Date(step.completedAt), "d MMM yyyy, HH:mm", { locale: ru })}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {editingStepId !== step.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEditStep(step.id)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Добавление нового шага */}
              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Название шага"
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddStep();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddStep}
                    disabled={!newStepTitle.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Добавить
                  </Button>
                </div>
                {newStepDescription && (
                  <Textarea
                    placeholder="Описание шага (необязательно)"
                    value={newStepDescription}
                    onChange={(e) => setNewStepDescription(e.target.value)}
                    className="resize-none min-h-[60px] mt-2"
                  />
                )}
                {!newStepDescription && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setNewStepDescription(" ")}
                  >
                    + Добавить описание
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <GoalForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        goalToEdit={goal}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить цель?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить цель "{goal.title}"? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

