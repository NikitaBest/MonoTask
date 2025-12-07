import { Link, useLocation } from "wouter";
import { Calendar, List, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { icon: Calendar, label: "Calendar", href: "/" },
    { icon: List, label: "List", href: "/list" },
    { icon: PieChart, label: "Statistics", href: "/stats" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-border bg-sidebar flex flex-col items-center md:items-stretch py-6 transition-all duration-300">
        <div className="px-4 mb-8 flex items-center justify-center md:justify-start gap-3">
          <div className="h-8 w-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold font-mono">
            M
          </div>
          <span className="text-xl font-bold tracking-tight hidden md:block">MonoTask</span>
        </div>

        <nav className="flex-1 px-2 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
                location === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", location === item.href ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="hidden md:block">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto">
           {/* Placeholder for future features or user profile */}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
