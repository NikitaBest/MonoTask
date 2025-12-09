import { useRoute, useLocation, Link } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Tag, Trash2, Save } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
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

const noteSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  content: z.string().optional(),
  tags: z.string().optional(),
});

export default function NoteDetailPage() {
  const [, params] = useRoute("/notes/:id");
  const [, setLocation] = useLocation();
  const noteId = params?.id;
  
  const notes = useStore((state) => state.notes);
  const updateNote = useStore((state) => state.updateNote);
  const deleteNote = useStore((state) => state.deleteNote);
  
  const note = notes.find((n) => n.id === noteId);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  // Автоматическое изменение высоты textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Сбрасываем высоту для правильного расчета scrollHeight
      textarea.style.height = '0px';
      // Получаем scrollHeight (реальная высота содержимого)
      const scrollHeight = textarea.scrollHeight;
      // Устанавливаем новую высоту (минимум 400px)
      const newHeight = Math.max(scrollHeight, 400);
      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (note) {
      form.reset({
        title: note.title,
        content: note.content,
        tags: note.tags.join(", "),
      });
      setHasChanges(false);
      // Подождать, чтобы textarea отрендерился
      setTimeout(() => {
        adjustTextareaHeight();
      }, 150);
    }
  }, [note, form, adjustTextareaHeight]);

  // Обработчик для автоматического изменения высоты при вводе
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange();
    // Сразу обновляем высоту
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  const handleChange = () => {
    setHasChanges(true);
  };

  const onSubmit = (values: z.infer<typeof noteSchema>) => {
    if (!note) return;
    
    const tagsArray = values.tags 
      ? values.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    updateNote(note.id, {
      title: values.title,
      content: values.content || "",
      tags: tagsArray,
    });
    
    setHasChanges(false);
  };

  const handleDelete = () => {
    if (!note) return;
    deleteNote(note.id);
    setIsDeleteDialogOpen(false);
    setLocation("/list");
  };

  if (!note) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Заметка не найдена</h2>
          <p className="text-muted-foreground mb-4">
            Заметка с таким ID не существует или была удалена
          </p>
          <Link href="/list">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к заметкам
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full overflow-y-auto scrollbar-hide">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/list">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Заметка</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {hasChanges && (
            <span className="text-sm text-muted-foreground">Есть несохраненные изменения</span>
          )}
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Удалить
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={!hasChanges}
          >
            <Save className="mr-2 h-4 w-4" /> Сохранить
          </Button>
        </div>
      </div>

      {/* Форма */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-2 flex-shrink-0">
          <Label htmlFor="title" className="text-lg">Название</Label>
          <Input 
            id="title"
            placeholder="Название заметки..." 
            {...form.register("title", { onChange: handleChange })} 
            className="text-xl font-semibold"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2 flex-shrink-0">
          <Label htmlFor="content" className="text-lg">Содержимое</Label>
          <Textarea 
            id="content"
            ref={textareaRef}
            placeholder="Начните писать заметку...

Поддерживается Markdown:
- **жирный текст**
- *курсив*
- `код`
- Списки
- И многое другое..." 
            value={form.watch("content") || ""}
            onChange={(e) => {
              form.setValue("content", e.target.value, { shouldDirty: true });
              handleContentChange(e);
            }}
            onInput={adjustTextareaHeight}
            onKeyUp={adjustTextareaHeight}
            onPaste={(e) => {
              setTimeout(adjustTextareaHeight, 0);
            }}
            className="resize-none font-mono text-sm w-full"
            style={{ 
              minHeight: '400px',
              height: '400px',
              overflow: 'hidden',
              lineHeight: '1.5',
              maxHeight: 'none'
            }}
          />
        </div>

        <div className="space-y-2 flex-shrink-0">
          <Label htmlFor="tags" className="flex items-center gap-2 text-lg">
            <Tag className="w-4 h-4" /> Теги (через запятую)
          </Label>
          <Input 
            id="tags"
            placeholder="работа, идеи, важное" 
            {...form.register("tags", { onChange: handleChange })} 
          />
          {(() => {
            const tagsValue = form.watch("tags") || "";
            const tagsArray = tagsValue 
              ? tagsValue.split(",").map(t => t.trim()).filter(Boolean)
              : [];
            
            return tagsArray.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {tagsArray.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null;
          })()}
          <p className="text-xs text-muted-foreground">
            Добавьте теги для удобной категоризации заметок
          </p>
        </div>

        <div className="flex-shrink-0 pt-4 border-t text-sm text-muted-foreground">
          <p>Создано: {format(new Date(note.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}</p>
          <p>Обновлено: {format(new Date(note.updatedAt), "d MMM yyyy, HH:mm", { locale: ru })}</p>
        </div>
      </form>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заметку?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить эту заметку? Это действие нельзя отменить.
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

