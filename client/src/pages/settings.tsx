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

  // Theme handling logic (basic implementation)
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
    // In a real app, you'd apply the class to html element here or in a useEffect at root
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
    toast({ title: "Export Successful", description: "Your data has been downloaded." });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks && Array.isArray(data.tasks)) {
           // Basic validation passed
           useStore.setState({ tasks: data.tasks, settings: { ...settings, ...data.settings } });
           toast({ title: "Import Successful", description: "Your data has been restored." });
        } else {
           throw new Error("Invalid format");
        }
      } catch (err) {
        toast({ title: "Import Failed", description: "The file format is invalid.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto w-full space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <div className="space-y-6">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred interface theme.</p>
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
          <h2 className="text-xl font-semibold">Preferences</h2>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Default View</Label>
              <p className="text-sm text-muted-foreground">The view that opens when you start the app.</p>
            </div>
            <Select 
              value={settings.defaultView} 
              onValueChange={(v) => updateSettings({ defaultView: v as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day View</SelectItem>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Start of Week</Label>
              <p className="text-sm text-muted-foreground">Choose which day the week starts on.</p>
            </div>
            <Select 
              value={settings.startOfWeek} 
              onValueChange={(v) => updateSettings({ startOfWeek: v as any })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Notifications</Label>
               <p className="text-sm text-muted-foreground">Receive browser notifications for upcoming tasks.</p>
             </div>
             <Switch 
               checked={settings.notificationsEnabled}
               onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
             />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Data Management</h2>
          <Separator />
          
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              All your data is stored locally in your browser. You can export it to a JSON file for backup or transfer.
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" /> Import Data
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
