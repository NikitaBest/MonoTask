import { useRoute, useLocation, Link } from "wouter";
import { useStore, ProjectResource } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Link as LinkIcon, Lock, FileText, ExternalLink, Trash2, Save, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
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

const resourceSchema = z.object({
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

const resourceTypeIcons: Record<string, React.ReactNode> = {
  link: <LinkIcon className="w-4 h-4" />,
  credentials: <Lock className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  file: <ExternalLink className="w-4 h-4" />,
};

const resourceTypeLabels: Record<string, string> = {
  link: 'Ссылка',
  credentials: 'Пароль/Логин',
  note: 'Заметка',
  file: 'Файл/Документ',
};

export default function ResourceDetailPage() {
  const [, params] = useRoute("/projects/:projectId/resources/:id");
  const [, setLocation] = useLocation();
  const resourceId = params?.id;
  const projectId = params?.projectId;
  
  const allResources = useStore((state) => state.resources);
  const updateResource = useStore((state) => state.updateResource);
  const deleteResource = useStore((state) => state.deleteResource);
  const projects = useStore((state) => state.projects);
  const { toast } = useToast();
  
  const resource = allResources.find((r) => r.id === resourceId);
  const project = projects.find((p) => p.id === projectId);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      url: "",
      username: "",
      password: "",
      content: "",
      description: "",
    },
  });

  // Автоматическое изменение высоты textarea для заметок
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea && resource?.type === 'note') {
      textarea.style.height = '0px';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(scrollHeight, 400);
      textarea.style.height = `${newHeight}px`;
    }
  }, [resource?.type]);

  useEffect(() => {
    if (resource) {
      form.reset({
        title: resource.title,
        url: resource.url || "",
        username: resource.username || "",
        password: resource.password || "",
        content: resource.content || "",
        description: resource.description || "",
      });
      setHasChanges(false);
      if (resource.type === 'note') {
        setTimeout(() => {
          adjustTextareaHeight();
        }, 150);
      }
    }
  }, [resource, form, adjustTextareaHeight]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange();
    if (resource?.type === 'note') {
      adjustTextareaHeight();
    }
  }, [adjustTextareaHeight, resource?.type]);

  const handleChange = () => {
    setHasChanges(true);
  };

  const onSubmit = (values: z.infer<typeof resourceSchema>) => {
    if (!resource) return;
    
    updateResource(resource.id, {
      title: values.title,
      url: values.url || undefined,
      username: values.username || undefined,
      password: values.password || undefined,
      content: values.content || undefined,
      description: values.description || undefined,
    });
    
    setHasChanges(false);
    toast({
      title: "Сохранено",
      description: "Ресурс успешно обновлен",
    });
  };

  const handleDelete = () => {
    if (!resource) return;
    deleteResource(resource.id);
    setIsDeleteDialogOpen(false);
    if (projectId) {
      setLocation(`/projects/${projectId}#resources`);
    } else {
      setLocation("/projects");
    }
  };

  const handleCopyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => {
        setCopiedItem(null);
      }, 2000);
      toast({
        title: "Скопировано",
        description: `${label} скопирован в буфер обмена`,
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать в буфер обмена",
        variant: "destructive",
      });
    }
  };

  if (!resource) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="text-center">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Ресурс не найден</h2>
          <p className="text-muted-foreground mb-4">
            Ресурс с таким ID не существует или был удален
          </p>
          {projectId ? (
            <Link href={`/projects/${projectId}`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к проекту
              </Button>
            </Link>
          ) : (
            <Link href="/projects">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" /> Вернуться к проектам
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full overflow-y-auto scrollbar-hide">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          {projectId ? (
            <Link href={`/projects/${projectId}#resources`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/projects">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center">
              {resourceTypeIcons[resource.type]}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{resourceTypeLabels[resource.type]}</h1>
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
            placeholder="Название ресурса..." 
            {...form.register("title", { onChange: handleChange })} 
            className="text-xl font-semibold"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
          )}
        </div>

        {resource.type === 'link' && (
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="url" className="text-lg">URL</Label>
            <Input 
              id="url"
              type="url"
              placeholder="https://example.com" 
              {...form.register("url", { onChange: handleChange })} 
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
            )}
            {form.watch("url") && (
              <a
                href={form.watch("url")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть ссылку
              </a>
            )}
          </div>
        )}

        {resource.type === 'file' && (
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="url" className="text-lg">Ссылка на файл/документ</Label>
            <Input 
              id="url"
              type="url"
              placeholder="https://docs.google.com/document/..." 
              {...form.register("url", { onChange: handleChange })} 
            />
            {form.formState.errors.url && (
              <p className="text-sm text-destructive">{form.formState.errors.url.message}</p>
            )}
            {form.watch("url") && (
              <a
                href={form.watch("url")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть файл
              </a>
            )}
          </div>
        )}

        {resource.type === 'credentials' && (
          <>
            <div className="space-y-2 flex-shrink-0">
              <Label htmlFor="username" className="text-lg">Логин</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="username"
                  placeholder="username или email" 
                  {...form.register("username", { onChange: handleChange })} 
                  className="font-mono"
                />
                {form.watch("username") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyToClipboard(form.watch("username") || "", "Логин")}
                    title="Копировать логин"
                  >
                    {copiedItem === "Логин" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2 flex-shrink-0">
              <Label htmlFor="password" className="text-lg">Пароль</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    {...form.register("password", { onChange: handleChange })} 
                    className="font-mono pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {form.watch("password") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyToClipboard(form.watch("password") || "", "Пароль")}
                    title="Копировать пароль"
                  >
                    {copiedItem === "Пароль" ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2 flex-shrink-0">
              <Label htmlFor="url" className="text-lg">URL (если есть)</Label>
              <Input 
                id="url"
                type="url"
                placeholder="https://example.com/login" 
                {...form.register("url", { onChange: handleChange })} 
              />
              {form.watch("url") && (
                <a
                  href={form.watch("url")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Открыть
                </a>
              )}
            </div>
          </>
        )}

        {resource.type === 'note' && (
          <div className="space-y-2 flex-shrink-0">
            <Label htmlFor="content" className="text-lg">Содержимое</Label>
            <Textarea 
              id="content"
              ref={textareaRef}
              placeholder="Начните писать заметку..." 
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
        )}

        <div className="space-y-2 flex-shrink-0">
          <Label htmlFor="description" className="text-lg">Описание/Комментарий</Label>
          <Textarea 
            id="description"
            placeholder="Дополнительная информация..." 
            {...form.register("description", { onChange: handleChange })} 
            className="resize-none min-h-[100px]"
          />
        </div>

        <div className="flex-shrink-0 pt-4 border-t text-sm text-muted-foreground">
          <p>Создано: {format(new Date(resource.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}</p>
          <p>Обновлено: {format(new Date(resource.updatedAt), "d MMM yyyy, HH:mm", { locale: ru })}</p>
        </div>
      </form>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить ресурс?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот ресурс? Это действие нельзя отменить.
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

