import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Tag, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useStore, Note } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const noteSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  content: z.string().optional(),
  tags: z.string().optional(), // Теги через запятую
});

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteToEdit?: Note;
}

export function NoteForm({ open, onOpenChange, noteToEdit }: NoteFormProps) {
  const addNote = useStore((state) => state.addNote);
  const updateNote = useStore((state) => state.updateNote);
  
  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: noteToEdit?.title || "",
        content: noteToEdit?.content || "",
        tags: noteToEdit?.tags.join(", ") || "",
      });
    }
  }, [open, noteToEdit?.id, form]);

  const onSubmit = (values: z.infer<typeof noteSchema>) => {
    const tagsArray = values.tags 
      ? values.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    if (noteToEdit) {
      updateNote(noteToEdit.id, {
        title: values.title,
        content: values.content || "",
        tags: tagsArray,
      });
    } else {
      addNote({
        title: values.title,
        content: values.content || "",
        tags: tagsArray,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] lg:max-w-[1200px] gap-6 max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {noteToEdit ? "Редактировать заметку" : "Новая заметка"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col space-y-4 overflow-hidden">
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="title">Название</Label>
            <Input 
              id="title"
              placeholder="Название заметки..." 
              {...form.register("title")} 
              autoFocus
              className="text-lg"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <Label htmlFor="content">Содержимое</Label>
            <Textarea 
              id="content"
              placeholder="Начните писать заметку...

Поддерживается Markdown:
- **жирный текст**
- *курсив*
- `код`
- Списки
- И многое другое..." 
              {...form.register("content")} 
              className="resize-none flex-1 font-mono text-sm min-h-[400px]"
            />
          </div>

          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="tags" className="flex items-center gap-2">
              <Tag className="w-4 h-4" /> Теги (через запятую)
            </Label>
            <Input 
              id="tags"
              placeholder="работа, идеи, важное" 
              {...form.register("tags")} 
            />
            <p className="text-xs text-muted-foreground">
              Добавьте теги для удобной категоризации заметок
            </p>
          </div>

          <DialogFooter className="flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {noteToEdit ? "Сохранить" : "Создать заметку"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

