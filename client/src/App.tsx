import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/loading-screen";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import ListPage from "@/pages/list";
import ProjectsPage from "@/pages/projects";
import ProjectDetailPage from "@/pages/project-detail";
import NoteDetailPage from "@/pages/note-detail";
import ResourceDetailPage from "@/pages/resource-detail";
import SettingsPage from "@/pages/settings";
import CalendarPage from "@/pages/calendar";
import CalendarDayPage from "@/pages/calendar-day";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ProjectsPage} />
        <Route path="/list" component={ListPage} />
        <Route path="/notes/:id" component={NoteDetailPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:id" component={ProjectDetailPage} />
        <Route path="/projects/:projectId/resources/:id" component={ResourceDetailPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/calendar/:date" component={CalendarDayPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <LoadingScreen />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
