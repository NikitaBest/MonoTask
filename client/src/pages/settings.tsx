import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Upload, Moon, Sun, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

export default function SettingsPage() {
  const { settings, updateSettings, tasks } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme handling logic
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ tasks, settings }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monotask-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Экспорт завершен", description: "Ваши данные были успешно скачаны." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks && Array.isArray(data.tasks)) {
           useStore.setState({ tasks: data.tasks, settings: { ...settings, ...data.settings } });
           toast({ title: "Импорт завершен", description: "Данные успешно восстановлены." });
        } else {
           throw new Error("Invalid format");
        }
      } catch (err) {
        toast({ title: "Ошибка импорта", description: "Неверный формат файла.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Внешний вид</h2>
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Тема оформления</Label>
              <p className="text-sm text-muted-foreground">Выберите тему интерфейса.</p>
            </div>
            <div className="flex bg-secondary p-1 rounded-lg">
               <Button 
                 variant={settings.theme === 'light' ? 'default' : 'ghost'} 
                 size="sm" 
                 className="h-8 w-8 p-0"
                 onClick={() => handleThemeChange('light')}
               >
                 <Sun className="h-4 w-4" />
               </Button>
               <Button 
                 variant={settings.theme === 'dark' ? 'default' : 'ghost'} 
                 size="sm" 
                 className="h-8 w-8 p-0"
                 onClick={() => handleThemeChange('dark')}
               >
                 <Moon className="h-4 w-4" />
               </Button>
               <Button 
                 variant={settings.theme === 'system' ? 'default' : 'ghost'} 
                 size="sm" 
                 className="h-8 w-8 p-0"
                 onClick={() => handleThemeChange('system')}
               >
                 <Monitor className="h-4 w-4" />
               </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Предпочтения</h2>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Вид по умолчанию</Label>
              <p className="text-sm text-muted-foreground">Экран, который открывается при запуске.</p>
            </div>
            <Select 
              value={settings.defaultView} 
              onValueChange={(v) => updateSettings({ defaultView: v as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите вид" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">День</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="list">Список</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Начало недели</Label>
              <p className="text-sm text-muted-foreground">День, с которого начинается неделя.</p>
            </div>
            <Select 
              value={settings.startOfWeek} 
              onValueChange={(v) => updateSettings({ startOfWeek: v as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Выберите день" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Понедельник</SelectItem>
                <SelectItem value="sunday">Воскресенье</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Уведомления</Label>
               <p className="text-sm text-muted-foreground">Получать браузерные уведомления о задачах.</p>
             </div>
             <Switch 
               checked={settings.notificationsEnabled}
               onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
             />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Управление данными</h2>
          <Separator />
          
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Все данные хранятся локально в вашем браузере. Вы можете экспортировать их в файл для резервного копирования.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Экспорт
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Импорт
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleImport}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
