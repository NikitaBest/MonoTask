import { useState, useMemo } from "react";
import { useStore, Note } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Tag, Edit2, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { NoteForm } from "./note-form";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function NotesView() {
  const notes = useStore((state) => state.notes);
  const deleteNote = useStore((state) => state.deleteNote);
  const getAllTags = useStore((state) => state.getAllTags);
  const [, setLocation] = useLocation();
  
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();

  const tags = useMemo(() => getAllTags(), [getAllTags]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesTag = selectedTag === null || note.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, search, selectedTag]);

  const handleCreateNote = () => {
    setSelectedNote(undefined);
    setIsFormOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту заметку?")) {
      deleteNote(id);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Заметки</h1>
        </div>
        
        <Button onClick={handleCreateNote}>
          <Plus className="mr-2 h-4 w-4" /> Новая заметка
        </Button>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full md:w-auto max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Поиск заметок..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              Все
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <div className="p-4 rounded-full bg-secondary mb-4">
              <FileText className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium">
              {notes.length === 0 ? "Нет заметок" : "Заметки не найдены"}
            </p>
            <p className="text-sm">
              {notes.length === 0 
                ? "Создайте свою первую заметку" 
                : "Попробуйте изменить фильтры или условия поиска"}
            </p>
            {notes.length === 0 && (
              <Button onClick={handleCreateNote} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Создать заметку
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`} className="h-full">
                <Card 
                  className="group relative flex flex-col h-full hover:shadow-md transition-all cursor-pointer"
                >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2 flex-1">
                      {note.title || "Без названия"}
                    </CardTitle>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/notes/${note.id}`);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Открыть
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-3 min-h-0">
                  <div className="text-sm text-muted-foreground line-clamp-4 flex-1 min-h-0">
                    {note.content || "Нет содержимого"}
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTag(tag);
                          }}
                        >
                          <Tag className="w-2.5 h-2.5 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    {format(new Date(note.updatedAt), "d MMM yyyy, HH:mm", { locale: ru })}
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NoteForm 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        noteToEdit={selectedNote}
      />
    </div>
  );
}

