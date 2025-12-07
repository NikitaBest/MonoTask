import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStore, Project } from "@/lib/store";
import { FolderKanban } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(1, "Название проекта обязательно"),
  description: z.string().optional(),
  category: z.string().min(1, "Категория обязательна"),
});

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectToEdit?: Project;
}

const defaultCategories = ['работа', 'личное', 'тренировки', 'учеба', 'другое'];

export function ProjectForm({ open, onOpenChange, projectToEdit }: ProjectFormProps) {
  const addProject = useStore((state) => state.addProject);
  const updateProject = useStore((state) => state.updateProject);
  const projects = useStore((state) => state.projects);
  
  // Объединяем дефолтные категории с существующими (мемоизируем)
  const allCategories = useMemo(() => {
    const existingCategories = new Set(projects.map((p) => p.category));
    return Array.from(new Set([...defaultCategories, ...existingCategories])).sort();
  }, [projects]);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
    },
  });

  // Сбрасываем форму при изменении projectToEdit или open
  useEffect(() => {
    if (open) {
      form.reset({
        name: projectToEdit?.name || "",
        description: projectToEdit?.description || "",
        category: projectToEdit?.category || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectToEdit?.id]);

  const onSubmit = (values: z.infer<typeof projectSchema>) => {
    if (projectToEdit) {
      updateProject(projectToEdit.id, {
        name: values.name,
        description: values.description,
        category: values.category,
      });
    } else {
      addProject({
        name: values.name,
        description: values.description,
        category: values.category,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            {projectToEdit ? "Редактировать проект" : "Новый проект"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название проекта</Label>
            <Input 
              id="name"
              placeholder="Например: Разработка сайта" 
              {...form.register("name")} 
              autoFocus
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Категория</Label>
            <Select 
              value={form.watch("category")}
              onValueChange={(val) => form.setValue("category", val)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea 
              id="description"
              placeholder="Опишите проект, его цели и задачи..." 
              {...form.register("description")} 
              className="resize-none min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {projectToEdit ? "Сохранить" : "Создать проект"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

