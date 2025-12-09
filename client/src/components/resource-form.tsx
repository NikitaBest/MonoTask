import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link as LinkIcon, Lock, FileText, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStore, ProjectResource, ResourceType } from "@/lib/store";

const resourceSchema = z.object({
  type: z.enum(["link", "credentials", "note", "file"] as const),
  title: z.string().min(1, "Название обязательно"),
  url: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Неверный URL",
  }),
  username: z.string().optional(),
  password: z.string().optional(),
  content: z.string().optional(),
  description: z.string().optional(),
});

interface ResourceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  resourceToEdit?: ProjectResource;
}

const resourceTypes: { value: ResourceType; label: string; icon: React.ReactNode }[] = [
  { value: 'link', label: 'Ссылка', icon: <LinkIcon className="w-4 h-4" /> },
  { value: 'credentials', label: 'Пароль/Логин', icon: <Lock className="w-4 h-4" /> },
  { value: 'note', label: 'Заметка', icon: <FileText className="w-4 h-4" /> },
  { value: 'file', label: 'Файл/Документ', icon: <ExternalLink className="w-4 h-4" /> },
];

export function ResourceForm({ open, onOpenChange, projectId, resourceToEdit }: ResourceFormProps) {
  const addResource = useStore((state) => state.addResource);
  const updateResource = useStore((state) => state.updateResource);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      type: "link",
      title: "",
      url: "",
      username: "",
      password: "",
      content: "",
      description: "",
    },
  });

  const resourceType = form.watch("type");

  useEffect(() => {
    if (open) {
      form.reset({
        type: resourceToEdit?.type || "link",
        title: resourceToEdit?.title || "",
        url: resourceToEdit?.url || "",
        username: resourceToEdit?.username || "",
        password: resourceToEdit?.password || "",
        content: resourceToEdit?.content || "",
        description: resourceToEdit?.description || "",
      });
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resourceToEdit?.id]);

  const onSubmit = (values: z.infer<typeof resourceSchema>) => {
    if (resourceToEdit) {
      updateResource(resourceToEdit.id, {
        type: values.type,
        title: values.title,
        url: values.url || undefined,
        username: values.username || undefined,
        password: values.password || undefined,
        content: values.content || undefined,
        description: values.description || undefined,
      });
    } else {
      addResource({
        projectId,
        type: values.type,
        title: values.title,
        url: values.url || undefined,
        username: values.username || undefined,
        password: values.password || undefined,
        content: values.content || undefined,
        description: values.description || undefined,
      });
    }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {resourceTypes.find(t => t.value === resourceType)?.icon}
            {resourceToEdit ? "Редактировать ресурс" : "Новый ресурс"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Тип ресурса</Label>
            <Select 
              value={form.watch("type")}
              onValueChange={(val) => form.setValue("type", val as ResourceType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Название *</Label>
            <Input 
              id="title"
              placeholder="Название ресурса..." 
              {...form.register("title")} 
              autoFocus
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {resourceType === 'link' && (
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input 
                id="url"
                type="url"
                placeholder="https://example.com" 
                {...form.register("url")} 
              />
              {form.formState.errors.url && (
                <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
              )}
            </div>
          )}

          {resourceType === 'file' && (
            <div className="space-y-2">
              <Label htmlFor="url">Ссылка на файл/документ *</Label>
              <Input 
                id="url"
                type="url"
                placeholder="https://docs.google.com/document/..." 
                {...form.register("url")} 
              />
              {form.formState.errors.url && (
                <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
              )}
            </div>
          )}

          {resourceType === 'credentials' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input 
                  id="username"
                  placeholder="username или email" 
                  {...form.register("username")} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    {...form.register("password")} 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (если есть)</Label>
                <Input 
                  id="url"
                  type="url"
                  placeholder="https://example.com/login" 
                  {...form.register("url")} 
                />
              </div>
            </>
          )}

          {resourceType === 'note' && (
            <div className="space-y-2">
              <Label htmlFor="content">Содержимое</Label>
              <Textarea 
                id="content"
                placeholder="Текст заметки..." 
                {...form.register("content")} 
                className="resize-none min-h-[150px]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Описание/Комментарий</Label>
            <Textarea 
              id="description"
              placeholder="Дополнительная информация..." 
              {...form.register("description")} 
              className="resize-none min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {resourceToEdit ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

