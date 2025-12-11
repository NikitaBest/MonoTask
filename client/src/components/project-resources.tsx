import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useStore, ProjectResource } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Link as LinkIcon, Lock, FileText, ExternalLink, Copy, Eye, EyeOff, Search, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ResourceForm } from "./resource-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ProjectResourcesProps {
  projectId: string;
}

const resourceTypeLabels: Record<string, string> = {
  link: 'Ссылка',
  credentials: 'Пароль/Логин',
  note: 'Заметка',
  file: 'Файл/Документ',
};

const resourceTypeIcons: Record<string, React.ReactNode> = {
  link: <LinkIcon className="w-4 h-4" />,
  credentials: <Lock className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  file: <ExternalLink className="w-4 h-4" />,
};

export function ProjectResources({ projectId }: ProjectResourcesProps) {
  const allResources = useStore((state) => state.resources);
  const deleteResource = useStore((state) => state.deleteResource);
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ProjectResource | undefined>();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedItems, setCopiedItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const resources = useMemo(() => {
    if (!allResources || !Array.isArray(allResources)) {
      return [];
    }
    return allResources
      .filter((r) => r.projectId === projectId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [allResources, projectId]);

  const filteredResources = useMemo(() => {
    if (!search) return resources;
    
    return resources.filter((resource) => {
      return (
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.description?.toLowerCase().includes(search.toLowerCase()) ||
        resource.url?.toLowerCase().includes(search.toLowerCase()) ||
        resource.content?.toLowerCase().includes(search.toLowerCase()) ||
        resource.username?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [resources, search]);

  const resourcesByType = useMemo(() => {
    const grouped: Record<string, ProjectResource[]> = {
      link: [],
      credentials: [],
      note: [],
      file: [],
    };
    filteredResources.forEach((resource) => {
      if (grouped[resource.type]) {
        grouped[resource.type].push(resource);
      }
    });
    return grouped;
  }, [filteredResources]);


  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  const handleCreateResource = () => {
    setSelectedResource(undefined);
    setIsFormOpen(true);
  };

  const handleEditResource = (resource: ProjectResource) => {
    setSelectedResource(resource);
    setIsFormOpen(true);
  };

  const handleDeleteResource = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот ресурс?")) {
      deleteResource(id);
    }
  };

  const handleCopyToClipboard = async (text: string, itemId: string, label: string = "Текст") => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Визуальная обратная связь
      setCopiedItems(prev => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setCopiedItems(prev => {
          const newState = { ...prev };
          delete newState[itemId];
          return newState;
        });
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

  const togglePasswordVisibility = (resourceId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [resourceId]: !prev[resourceId]
    }));
  };

  return (
    <div className="p-4 md:p-6 w-full space-y-6 flex flex-col h-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Ресурсы</h1>
        </div>
        
        <Button onClick={handleCreateResource}>
          <Plus className="mr-2 h-4 w-4" /> Добавить ресурс
        </Button>
      </div>

      {/* Поиск */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full md:w-auto max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск ресурсов..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {resources.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <div className="p-4 rounded-full bg-secondary mb-4">
            <LinkIcon className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg font-medium">Нет ресурсов</p>
          <p className="text-sm">Добавьте первый ресурс для проекта</p>
          <Button onClick={handleCreateResource} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Добавить ресурс
          </Button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <div className="p-4 rounded-full bg-secondary mb-4">
            <Search className="w-8 h-8 opacity-50" />
          </div>
          <p className="text-lg font-medium">Ресурсы не найдены</p>
          <p className="text-sm">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-4 scrollbar-hide min-h-0">
          <div className="flex gap-4 min-w-max h-full">
            {Object.keys(resourceTypeLabels).map((type) => {
              const typeResources = resourcesByType[type] || [];
              
              return (
                <div
                  key={type}
                  className="flex flex-col w-80 flex-shrink-0 rounded-lg border bg-card shadow-sm h-full"
                >
                  {/* Заголовок колонки */}
                  <div className="p-3 border-b bg-muted/30 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {resourceTypeIcons[type]}
                        <h3 className="font-semibold text-sm text-foreground">{resourceTypeLabels[type]}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {typeResources.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Список ресурсов */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-hide">
                    {typeResources.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="text-xs text-center px-4">
                          Нет ресурсов
                        </p>
                      </div>
                    ) : (
                      typeResources.map((resource) => (
                        <Link key={resource.id} href={`/projects/${projectId}/resources/${resource.id}`}>
                          <Card 
                            className={cn(
                              "group relative hover:shadow-md transition-all border-l-4 cursor-pointer",
                              resource.type === 'link' && "border-l-blue-500",
                              resource.type === 'credentials' && "border-l-orange-500",
                              resource.type === 'note' && "border-l-green-500",
                              resource.type === 'file' && "border-l-purple-500"
                            )}
                          >
                            <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {resourceTypeIcons[type]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-sm truncate">{resource.title}</h3>
                                </div>
                              </div>
                              
                              {resource.type === 'link' && resource.url && (
                                <div className="flex items-start gap-1.5">
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-start gap-2 text-xs text-muted-foreground hover:text-foreground hover:underline break-all group/link flex-1 min-w-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <LinkIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    <span className="break-all">{truncateUrl(resource.url)}</span>
                                  </a>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleCopyToClipboard(resource.url!, `${resource.id}-url`, "Ссылка");
                                    }}
                                    title="Копировать ссылку"
                                  >
                                    {copiedItems[`${resource.id}-url`] ? (
                                      <Check className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              )}

                              {resource.type === 'file' && resource.url && (
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:underline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Не предотвращаем переход по ссылке на файл
                                  }}
                                >
                                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>Открыть файл</span>
                                </a>
                              )}

                              {resource.type === 'credentials' && (
                                <div className="space-y-1.5">
                                  {resource.username && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-muted-foreground">Логин:</span>
                                      <span className="text-xs font-mono flex-1 truncate">{resource.username}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleCopyToClipboard(resource.username!, `${resource.id}-username`, "Логин");
                                        }}
                                        title="Копировать логин"
                                      >
                                        {copiedItems[`${resource.id}-username`] ? (
                                          <Check className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                  {resource.password && (
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-muted-foreground">Пароль:</span>
                                      <span className="text-xs font-mono flex-1 truncate">
                                        {visiblePasswords[resource.id] ? resource.password : '••••••••'}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          togglePasswordVisibility(resource.id);
                                        }}
                                        title={visiblePasswords[resource.id] ? "Скрыть пароль" : "Показать пароль"}
                                      >
                                        {visiblePasswords[resource.id] ? (
                                          <EyeOff className="w-3 h-3" />
                                        ) : (
                                          <Eye className="w-3 h-3" />
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          handleCopyToClipboard(resource.password!, `${resource.id}-password`, "Пароль");
                                        }}
                                        title="Копировать пароль"
                                      >
                                        {copiedItems[`${resource.id}-password`] ? (
                                          <Check className="w-3 h-3 text-green-600" />
                                        ) : (
                                          <Copy className="w-3 h-3" />
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Не предотвращаем переход по ссылке
                                      }}
                                    >
                                      <LinkIcon className="w-3.5 h-3.5" />
                                      <span>Открыть</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              {resource.type === 'note' && resource.content && (
                                <p className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-3">
                                  {resource.content}
                                </p>
                              )}

                              {resource.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {resource.description}
                                </p>
                              )}

                              <div className="text-xs text-muted-foreground pt-1.5 border-t">
                                {format(new Date(resource.updatedAt), "d MMM yyyy, HH:mm", { locale: ru })}
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleEditResource(resource);
                                  }}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" /> Редактировать
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteResource(resource.id);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          </CardContent>
                        </Card>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ResourceForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        projectId={projectId}
        resourceToEdit={selectedResource}
      />
    </div>
  );
}

