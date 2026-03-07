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
import DashboardPage from "@/pages/dashboard";
import GoalsPage from "@/pages/goals";
import GoalDetailPage from "@/pages/goal-detail";
import { FinanceLayout } from "@/components/finance-layout";
import FinanceDashboardPage from "@/pages/finance/finance-dashboard";
import FinanceIncomesPage from "@/pages/finance/finance-incomes";
import FinanceExpensesPage from "@/pages/finance/finance-expenses";
import FinanceCategoriesPage from "@/pages/finance/finance-categories";
import FinanceBudgetsPage from "@/pages/finance/finance-budgets";
import FinanceGoalsPage from "@/pages/finance/finance-goals";
import FinanceAnalyticsPage from "@/pages/finance/finance-analytics";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/list" component={ListPage} />
        <Route path="/notes/:id" component={NoteDetailPage} />
        <Route path="/projects" component={ProjectsPage} />
        <Route path="/projects/:id" component={ProjectDetailPage} />
        <Route path="/projects/:projectId/resources/:id" component={ResourceDetailPage} />
        <Route path="/calendar" component={CalendarPage} />
        <Route path="/calendar/:date" component={CalendarDayPage} />
        <Route path="/goals" component={GoalsPage} />
        <Route path="/goals/:id" component={GoalDetailPage} />
        <Route path="/finance" component={() => <FinanceLayout><FinanceDashboardPage /></FinanceLayout>} />
        <Route path="/finance/incomes" component={() => <FinanceLayout><FinanceIncomesPage /></FinanceLayout>} />
        <Route path="/finance/expenses" component={() => <FinanceLayout><FinanceExpensesPage /></FinanceLayout>} />
        <Route path="/finance/categories" component={() => <FinanceLayout><FinanceCategoriesPage /></FinanceLayout>} />
        <Route path="/finance/budgets" component={() => <FinanceLayout><FinanceBudgetsPage /></FinanceLayout>} />
        <Route path="/finance/goals" component={() => <FinanceLayout><FinanceGoalsPage /></FinanceLayout>} />
        <Route path="/finance/analytics" component={() => <FinanceLayout><FinanceAnalyticsPage /></FinanceLayout>} />
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
