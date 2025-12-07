import { useState } from "react";
import { useStore, TaskStatus, Priority } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TaskCard } from "./task-card";
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { format, isToday, isTomorrow, isYesterday, isPast } from "date-fns";

export function ListView() {
  const tasks = useStore((state) => state.tasks);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "priority">("date");

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          task.description?.toLowerCase().includes(search.toLowerCase()) ||
                          task.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
  });

  // Group by Date for cleaner list
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const sortedDates = Object.keys(groupedTasks).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const getDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        
        <div className="flex flex-1 w-full md:w-auto items-center gap-2 max-w-md">
           <div className="relative flex-1">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Search tasks..." 
               value={search} 
               onChange={(e) => setSearch(e.target.value)}
               className="pl-9"
             />
           </div>
           
           <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
             <SelectTrigger className="w-[140px]">
               <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4" />
                 <span className="truncate">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
               </div>
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Status</SelectItem>
               <SelectItem value="planned">Planned</SelectItem>
               <SelectItem value="in-progress">In Progress</SelectItem>
               <SelectItem value="completed">Completed</SelectItem>
               <SelectItem value="cancelled">Cancelled</SelectItem>
             </SelectContent>
           </Select>

           <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as Priority | "all")}>
             <SelectTrigger className="w-[130px] hidden sm:flex">
               <div className="flex items-center gap-2">
                 <SlidersHorizontal className="w-4 h-4" />
                 <span className="truncate">{priorityFilter === 'all' ? 'Priority' : priorityFilter}</span>
               </div>
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Priorities</SelectItem>
               <SelectItem value="high">High</SelectItem>
               <SelectItem value="medium">Medium</SelectItem>
               <SelectItem value="low">Low</SelectItem>
             </SelectContent>
           </Select>
           
           <Button variant="ghost" size="icon" onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}>
             <ArrowUpDown className="w-4 h-4" />
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8 pr-2">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
             <div className="p-4 rounded-full bg-secondary mb-4">
               <Filter className="w-8 h-8 opacity-50" />
             </div>
             <p className="text-lg font-medium">No tasks found</p>
             <p className="text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date} className="space-y-3">
               <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2 border-b flex items-baseline justify-between">
                 <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                   {getDateHeader(date)}
                   {isPast(new Date(date)) && !isToday(new Date(date)) && (
                     <span className="text-xs font-normal text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Overdue</span>
                   )}
                 </h2>
                 <span className="text-xs text-muted-foreground font-mono">{date}</span>
               </div>
               <div className="grid gap-3">
                 {groupedTasks[date].map(task => (
                   <TaskCard key={task.id} task={task} />
                 ))}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
