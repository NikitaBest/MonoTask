import { useState, useMemo, useCallback } from "react";
import { useStore, Project } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FolderKanban, Search, Filter } from "lucide-react";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const projects = useStore((state) => state.projects);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  // Мемоизируем категории, чтобы избежать пересчетов
  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category));
    return Array.from(cats).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase()) ||
                           project.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || project.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [projects, search, categoryFilter]);

  const groupedByCategory = useMemo(() => {
    return filteredProjects.reduce((acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = [];
      }
      acc[project.category].push(project);
      return acc;
    }, {} as Record<string, Project[]>);
  }, [filteredProjects]);

  const sortedCategories = useMemo(() => {
    return Object.keys(groupedByCategory).sort();
  }, [groupedByCategory]);

  const handleCreateProject = useCallback(() => {
    setSelectedProject(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEditProject = useCallback((project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  }, []);

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Проекты</h1>
        </div>
        
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" /> Новый проект
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:w-auto max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск проектов..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>{categoryFilter === 'all' ? 'Все категории' : categoryFilter}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <FolderKanban className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">
              {projects.length === 0 ? "Нет проектов" : "Проекты не найдены"}
            </p>
            <p className="text-sm">
              {projects.length === 0 
                ? "Создайте свой первый проект для организации задач" 
                : "Попробуйте изменить фильтры или условия поиска"}
            </p>
            {projects.length === 0 && (
              <Button onClick={handleCreateProject} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Создать проект
              </Button>
            )}
          </div>
        ) : (
          sortedCategories.map((category) => (
            <div key={category} className="space-y-4">
              <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 border-b">
                <h2 className="text-xl font-semibold tracking-tight capitalize">{category}</h2>
                <p className="text-sm text-muted-foreground">
                  {groupedByCategory[category].length} {groupedByCategory[category].length === 1 ? 'проект' : 'проектов'}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedByCategory[category].map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project}
                    onEdit={handleEditProject}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <ProjectForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        projectToEdit={selectedProject}
      />
    </div>
  );
}

