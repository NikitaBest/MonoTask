import { useState, useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Edit2, FileText, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectNotesProps {
  projectId: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const project = useStore((state) =>
    state.projects.find((p) => p.id === projectId)
  );
  const updateProject = useStore((state) => state.updateProject);
  
  const [notes, setNotes] = useState(project?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (project?.notes !== undefined) {
      setNotes(project.notes);
    }
  }, [project?.notes]);

  useEffect(() => {
    // Пропускаем автосохранение при первой загрузке
    if (notes === project?.notes) {
      return;
    }

    setIsSaving(true);
    setIsSaved(false);
    
    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Сохраняем через 1.5 секунды после остановки ввода
    saveTimeoutRef.current = setTimeout(() => {
      updateProject(projectId, { notes });
      setIsSaving(false);
      setIsSaved(true);
      
      // Скрываем индикатор сохранения через 2 секунды
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    }, 1500);
    
    // Очистка таймера при размонтировании
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, project?.notes, projectId, updateProject]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setIsSaved(false);
  };

  if (!project) return null;

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Заметки проекта</h3>
        </div>
        <div className="flex items-center gap-3">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5 animate-spin" />
              Сохранение...
            </span>
          )}
          {isSaved && !isSaving && (
            <span className="text-xs text-green-600 flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Сохранено
            </span>
          )}
        </div>
      </div>
      
      <div className="rounded-lg border bg-card p-6 w-full">
        <Textarea
          value={notes}
          onChange={handleChange}
          placeholder="Добавьте заметки, идеи, вопросы по проекту...

Примеры:
- Идеи для улучшения
- Вопросы для обсуждения
- Важные моменты
- Ссылки и ресурсы

Поддерживается Markdown: **жирный**, *курсив*, `код`, списки и т.д."
          className="min-h-[500px] text-sm resize-none font-sans leading-relaxed w-full border-0 focus-visible:ring-0 shadow-none"
        />
        <div className="pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground">
            Изменения сохраняются автоматически через 1.5 секунды после остановки ввода
          </p>
        </div>
      </div>
    </div>
  );
}

