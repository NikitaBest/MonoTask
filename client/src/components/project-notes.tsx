import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Edit2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectNotesProps {
  projectId: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const project = useStore((state) =>
    state.projects.find((p) => p.id === projectId)
  );
  const updateProject = useStore((state) => state.updateProject);
  
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(project?.notes || "");

  useEffect(() => {
    if (project?.notes !== undefined) {
      setNotes(project.notes);
    }
  }, [project?.notes]);

  const handleSave = () => {
    updateProject(projectId, { notes });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNotes(project?.notes || "");
    setIsEditing(false);
  };

  if (!project) return null;

  return (
    <div className="space-y-4">
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Редактирование заметок</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="rounded-lg border bg-card p-4 space-y-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Добавьте заметки, идеи, вопросы по проекту...

Примеры:
- Идеи для улучшения
- Вопросы для обсуждения
- Важные моменты
- Ссылки и ресурсы"
              className="min-h-[400px] text-sm resize-none font-sans leading-relaxed"
              autoFocus
            />
            <div className="flex items-center justify-between pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Поддерживается Markdown: **жирный**, *курсив*, `код`, списки и т.д.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Заметки проекта</h3>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-9"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          </div>

          <div
            className={cn(
              "rounded-lg border bg-card p-6 min-h-[400px]",
              !notes && "flex items-center justify-center text-muted-foreground"
            )}
          >
            {notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground">
                  {notes.split('\n').map((line, idx) => {
                    // Простая обработка Markdown
                    let processedLine = line;
                    
                    // Жирный текст **text**
                    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
                    
                    // Курсив *text*
                    processedLine = processedLine.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                    
                    // Код `text`
                    processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
                    
                    // Заголовки
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                    }
                    
                    // Списки
                    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                      return <div key={idx} className="ml-4 my-1">• {line.replace(/^[-*]\s+/, '')}</div>;
                    }
                    
                    if (line.trim() === '') {
                      return <br key={idx} />;
                    }
                    
                    return (
                      <div 
                        key={idx} 
                        className="my-1"
                        dangerouslySetInnerHTML={{ __html: processedLine }}
                      />
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium mb-2">Нет заметок</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Добавьте заметки, идеи и вопросы по проекту
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Добавить заметки
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

