import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format } from 'date-fns';

export type TaskStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';

export interface TimeSession {
  id: string;
  startTime: number; // timestamp для вычислений
  endTime?: number; // timestamp (undefined если сессия активна)
  duration?: number; // длительность в миллисекундах
  startTimeReal: string; // Реальное время начала в формате HH:mm
  endTimeReal?: string; // Реальное время окончания в формате HH:mm
}

export interface Task {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status: TaskStatus;
  description?: string;
  tags: string[];
  priority: Priority;
  projectId?: string; // ID проекта, к которому привязана задача
  timeSessions?: TimeSession[]; // История сессий работы
  estimatedTime?: number; // Оценка времени в минутах
  createdAt: number;
}

export interface AppSettings {
  defaultView: 'day' | 'week' | 'month' | 'list';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  startOfWeek: 'monday' | 'sunday';
  dayStartHour: number; // 0-23
  dayEndHour: number; // 0-23
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  category: string; // Категория: работа, личное, тренировки и т.д.
  color?: string; // Цвет для визуального отличия
  notes?: string; // Заметки в формате Markdown
  createdAt: number;
  updatedAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm (опционально для напоминаний)
  description?: string;
  url?: string; // Ссылка на событие (Zoom, Google Meet и т.д.)
  type: 'call' | 'workout' | 'work' | 'development' | 'meeting' | 'reminder' | 'other'; // Тип события
  color?: string; // Цвет для визуального отличия
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string; // Содержимое в формате Markdown
  tags: string[]; // Теги для категоризации
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  projectId: string; // ID проекта
  amount: number; // Сумма оплаты
  currency: string; // Валюта (RUB, USD, EUR и т.д.)
  date: string; // ISO date string YYYY-MM-DD
  description?: string; // Описание оплаты
  documentUrl?: string; // Ссылка на документ (чек, счет и т.д.)
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  projectId: string; // ID проекта
  amount: number; // Сумма расхода
  currency: string; // Валюта (RUB, USD, EUR и т.д.)
  date: string; // ISO date string YYYY-MM-DD
  description?: string; // Описание расхода
  category?: string; // Категория расхода (разработчик, дизайнер, сервер, сервис и т.д.)
  documentUrl?: string; // Ссылка на документ (чек, счет и т.д.)
  createdAt: number;
  updatedAt: number;
}

export type ResourceType = 'link' | 'credentials' | 'note' | 'file';

export interface ProjectResource {
  id: string;
  projectId: string; // ID проекта
  type: ResourceType; // Тип ресурса
  title: string; // Название
  url?: string; // URL (для ссылок)
  username?: string; // Логин (для credentials)
  password?: string; // Пароль (для credentials)
  content?: string; // Содержимое (для заметок)
  description?: string; // Описание/комментарий
  createdAt: number;
  updatedAt: number;
}

export type GoalPeriod = 'week' | 'month' | 'year';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface GoalStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: number; // timestamp когда был выполнен
  order: number; // Порядок выполнения
  createdAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  period: GoalPeriod; // Неделя, месяц или год
  startDate: string; // ISO date string YYYY-MM-DD - начало периода
  endDate: string; // ISO date string YYYY-MM-DD - конец периода
  status: GoalStatus;
  steps: GoalStep[]; // Шаги для выполнения цели
  progress: number; // Прогресс в процентах (0-100)
  category?: string; // Категория цели
  color?: string; // Цвет для визуального отличия
  createdAt: number;
  updatedAt: number;
  completedAt?: number; // timestamp когда цель была выполнена
}

// ——— Финансовый модуль (личные финансы) ———

export interface FinanceIncome {
  id: string;
  amount: number;
  categoryId: string; // id из INCOME_CATEGORIES
  date: string; // YYYY-MM-DD
  comment?: string;
  source?: string; // источник дохода (необязательно)
  currency: string;
  createdAt: number;
}

export interface FinanceExpense {
  id: string;
  amount: number;
  categoryId: string; // id из EXPENSE_GROUPS.categories
  date: string; // YYYY-MM-DD
  comment?: string;
  paymentMethod: 'card' | 'cash' | 'transfer';
  currency: string;
  createdAt: number;
}

export interface FinanceBudget {
  id: string;
  categoryId: string | null; // null = общий бюджет на месяц
  limitAmount: number;
  month: string; // YYYY-MM
  currency: string;
  createdAt: number;
}

export interface FinanceGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string; // YYYY-MM-DD
  createdAt: number;
  updatedAt: number;
}

export type RecurringFrequency = 'monthly' | 'weekly' | 'yearly';

export interface RecurringPayment {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  frequency: RecurringFrequency;
  currency: string;
  nextDueDate?: string; // YYYY-MM-DD
  createdAt: number;
}

/** Ожидаемый доход (должен прийти): кто должен, за что, когда */
export interface PlannedIncome {
  id: string;
  amount: number;
  expectedDate: string; // YYYY-MM-DD
  source: string; // от кого / за что (например "Иван — долг", "Зарплата")
  comment?: string;
  currency: string;
  createdAt: number;
}

interface AppState {
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[];
  notes: Note[];
  payments: Payment[];
  expenses: Expense[];
  resources: ProjectResource[];
  goals: Goal[];
  settings: AppSettings;

  // Финансовый модуль (личные финансы)
  financeIncomes: FinanceIncome[];
  financeExpenses: FinanceExpense[];
  financeBudgets: FinanceBudget[];
  financeGoals: FinanceGoal[];
  recurringPayments: RecurringPayment[];
  plannedIncomes: PlannedIncome[];

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByDate: (date: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  
  // Time Tracking
  startTimer: (taskId: string) => void;
  stopTimer: (taskId: string) => void;
  pauseTimer: (taskId: string) => void;
  getTotalTimeForTask: (taskId: string) => number; // возвращает время в миллисекундах
  getTotalTimeForProject: (projectId: string) => number; // возвращает время в миллисекундах
  getTotalEstimatedTimeForProject: (projectId: string) => number; // возвращает общую оценку времени в минутах
  
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsByCategory: (category: string) => Project[];
  getCategories: () => string[];
  
  // Calendar Events Actions
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (date: string) => CalendarEvent[];
  
  // Notes Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNotesByTag: (tag: string) => Note[];
  getAllTags: () => string[];
  
  // Payments Actions
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  getPaymentsByProject: (projectId: string) => Payment[];
  getTotalPaymentsForProject: (projectId: string) => number; // Общая сумма оплат
  
  // Expenses Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByProject: (projectId: string) => Expense[];
  getTotalExpensesForProject: (projectId: string) => number; // Общая сумма расходов
  
  // Resources Actions
  addResource: (resource: Omit<ProjectResource, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateResource: (id: string, updates: Partial<ProjectResource>) => void;
  deleteResource: (id: string) => void;
  getResourcesByProject: (projectId: string) => ProjectResource[];
  
  // Goals Actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  getGoalsByPeriod: (period: GoalPeriod) => Goal[];
  getGoalsByStatus: (status: GoalStatus) => Goal[];
  getGoalsByDateRange: (startDate: string, endDate: string) => Goal[];
  
  // Goal Steps Actions
  addGoalStep: (goalId: string, step: Omit<GoalStep, 'id' | 'createdAt' | 'order'>) => void;
  updateGoalStep: (goalId: string, stepId: string, updates: Partial<GoalStep>) => void;
  deleteGoalStep: (goalId: string, stepId: string) => void;
  toggleGoalStep: (goalId: string, stepId: string) => void;
  reorderGoalSteps: (goalId: string, stepIds: string[]) => void;
  calculateGoalProgress: (goalId: string) => number;

  // Finance: Incomes
  addFinanceIncome: (data: Omit<FinanceIncome, 'id' | 'createdAt'>) => void;
  updateFinanceIncome: (id: string, updates: Partial<FinanceIncome>) => void;
  deleteFinanceIncome: (id: string) => void;
  getFinanceIncomesByMonth: (month: string) => FinanceIncome[];
  getTotalIncomeByMonth: (month: string) => number;

  // Finance: Expenses
  addFinanceExpense: (data: Omit<FinanceExpense, 'id' | 'createdAt'>) => void;
  updateFinanceExpense: (id: string, updates: Partial<FinanceExpense>) => void;
  deleteFinanceExpense: (id: string) => void;
  getFinanceExpensesByMonth: (month: string) => FinanceExpense[];
  getTotalExpenseByMonth: (month: string) => number;
  getExpensesByCategoryForMonth: (month: string) => { categoryId: string; total: number }[];

  // Finance: Budgets
  addFinanceBudget: (data: Omit<FinanceBudget, 'id' | 'createdAt'>) => void;
  updateFinanceBudget: (id: string, updates: Partial<FinanceBudget>) => void;
  deleteFinanceBudget: (id: string) => void;
  getFinanceBudgetsForMonth: (month: string) => FinanceBudget[];
  getTotalBudgetLimitForMonth: (month: string) => number;
  /** Сумма всех запланированных расходов за месяц: общий бюджет или сумма лимитов по категориям */
  getTotalPlannedSpendingForMonth: (month: string) => number;

  // Finance: Goals (savings)
  addFinanceGoal: (data: Omit<FinanceGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFinanceGoal: (id: string, updates: Partial<FinanceGoal>) => void;
  deleteFinanceGoal: (id: string) => void;
  getActiveFinanceGoals: () => FinanceGoal[];

  // Finance: Recurring
  addRecurringPayment: (data: Omit<RecurringPayment, 'id' | 'createdAt'>) => void;
  updateRecurringPayment: (id: string, updates: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;

  // Finance: Planned incomes (ожидаемые поступления)
  addPlannedIncome: (data: Omit<PlannedIncome, 'id' | 'createdAt'>) => void;
  updatePlannedIncome: (id: string, updates: Partial<PlannedIncome>) => void;
  deletePlannedIncome: (id: string) => void;
  getTotalPlannedIncome: () => number;

  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      projects: [],
      events: [],
      notes: [],
      payments: [],
      expenses: [],
      resources: [],
      goals: [],
      financeIncomes: [],
      financeExpenses: [],
      financeBudgets: [],
      financeGoals: [],
      recurringPayments: [],
      plannedIncomes: [],
      settings: {
        defaultView: 'day',
        theme: 'system',
        notificationsEnabled: false,
        startOfWeek: 'monday',
        dayStartHour: 0,
        dayEndHour: 23,
      },

      // Task Actions
      addTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, { ...taskData, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      getTasksByDate: (date) => {
        return get().tasks.filter((t) => t.date === date);
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((t) => t.projectId === projectId);
      },

      // Time Tracking Actions
      startTimer: (taskId) => set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return state;

        // Проверяем, есть ли активная сессия
        const hasActiveSession = task.timeSessions?.some(
          (s) => s.startTime && !s.endTime
        );

        if (hasActiveSession) return state; // Уже есть активная сессия

        const now = Date.now();
        const currentDate = new Date(now);
        const dateString = format(currentDate, 'yyyy-MM-dd');
        
        // Фиксируем реальное время начала
        const startTimeReal = format(currentDate, 'HH:mm');

        const newSession: TimeSession = {
          id: crypto.randomUUID(),
          startTime: now,
          startTimeReal: startTimeReal,
        };

        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  date: dateString, // Фиксируем дату начала работы
                  startTime: startTimeReal, // Фиксируем время начала для отображения
                  timeSessions: [...(t.timeSessions || []), newSession],
                  status: t.status === 'planned' ? 'in-progress' : t.status,
                }
              : t
          ),
        };
      }),

      stopTimer: (taskId) => set((state) => {
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task || !task.timeSessions) return state;

        const activeSession = task.timeSessions.find(
          (s) => s.startTime && !s.endTime
        );
        if (!activeSession) return state;

        const endTime = Date.now();
        const duration = endTime - activeSession.startTime;
        
        // Фиксируем реальное время окончания
        const endDate = new Date(endTime);
        const endTimeReal = format(endDate, 'HH:mm');

        return {
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  endTime: endTimeReal, // Фиксируем время окончания для отображения
                  startTime: undefined, // Обнуляем startTime для отображения
                  timeSessions: t.timeSessions!.map((s) =>
                    s.id === activeSession.id
                      ? { ...s, endTime, duration, endTimeReal }
                      : s
                  ),
                }
              : t
          ),
        };
      }),

      pauseTimer: (_taskId: string) => {}, // заглушка: при необходимости можно реализовать паузу таймера

      getTotalTimeForTask: (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || !task.timeSessions) return 0;

        const totalTime = task.timeSessions.reduce((sum, session) => {
          if (session.duration) {
            return sum + session.duration;
          }
          // Если сессия активна, считаем текущее время
          if (session.startTime && !session.endTime) {
            return sum + (Date.now() - session.startTime);
          }
          return sum;
        }, 0);

        return totalTime;
      },

      getTotalTimeForProject: (projectId) => {
        const projectTasks = get().tasks.filter(
          (t) => t.projectId === projectId
        );
        return projectTasks.reduce(
          (sum, task) => sum + get().getTotalTimeForTask(task.id),
          0
        );
      },

      getTotalEstimatedTimeForProject: (projectId) => {
        return get().tasks
          .filter((t) => t.projectId === projectId)
          .reduce((total, task) => {
            return total + (task.estimatedTime || 0);
          }, 0);
      },

      // Project Actions
      addProject: (projectData) => set((state) => {
        const now = Date.now();
        return {
          projects: [...state.projects, { 
            ...projectData, 
            id: crypto.randomUUID(), 
            createdAt: now,
            updatedAt: now
          }]
        };
      }),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        )
      })),

      deleteProject: (id) => set((state) => {
        // Удаляем проект и отвязываем задачи от него
        return {
          projects: state.projects.filter((p) => p.id !== id),
          tasks: state.tasks.map((t) => 
            t.projectId === id ? { ...t, projectId: undefined } : t
          )
        };
      }),

      getProjectsByCategory: (category) => {
        return get().projects.filter((p) => p.category === category);
      },

      getCategories: () => {
        const categories = new Set(get().projects.map((p) => p.category));
        const sorted = Array.from(categories).sort();
        // Возвращаем стабильную ссылку, если категории не изменились
        return sorted;
      },

      // Calendar Events Actions
      addEvent: (eventData) => set((state) => ({
        events: [...state.events, { ...eventData, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),

      updateEvent: (id, updates) => set((state) => ({
        events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e))
      })),

      deleteEvent: (id) => set((state) => ({
        events: state.events.filter((e) => e.id !== id)
      })),

      getEventsByDate: (date) => {
        return get().events.filter((e) => e.date === date);
      },

      // Notes Actions
      addNote: (noteData) => set((state) => {
        const now = Date.now();
        return {
          notes: [...state.notes, {
            ...noteData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now
          }]
        };
      }),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
        )
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      })),

      getNotesByTag: (tag) => {
        return get().notes.filter((n) => n.tags.includes(tag));
      },

      getAllTags: () => {
        const allTags = new Set<string>();
        get().notes.forEach((n) => {
          n.tags.forEach((tag) => allTags.add(tag));
        });
        return Array.from(allTags).sort();
      },

      // Payments Actions
      addPayment: (paymentData) => set((state) => {
        const now = Date.now();
        return {
          payments: [...state.payments, {
            ...paymentData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now
          }]
        };
      }),

      updatePayment: (id, updates) => set((state) => ({
        payments: state.payments.map((p) =>
          p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
        )
      })),

      deletePayment: (id) => set((state) => ({
        payments: state.payments.filter((p) => p.id !== id)
      })),

      getPaymentsByProject: (projectId) => {
        return get().payments
          .filter((p) => p.projectId === projectId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTotalPaymentsForProject: (projectId) => {
        return get().payments
          .filter((p) => p.projectId === projectId)
          .reduce((sum, p) => sum + p.amount, 0);
      },

      // Expenses Actions
      addExpense: (expenseData) => set((state) => {
        const now = Date.now();
        return {
          expenses: [...state.expenses, {
            ...expenseData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now
          }]
        };
      }),

      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
        )
      })),

      deleteExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id)
      })),

      getExpensesByProject: (projectId) => {
        return get().expenses
          .filter((e) => e.projectId === projectId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTotalExpensesForProject: (projectId) => {
        return get().expenses
          .filter((e) => e.projectId === projectId)
          .reduce((sum, e) => sum + e.amount, 0);
      },

      // Resources Actions
      addResource: (resourceData) => set((state) => {
        const now = Date.now();
        return {
          resources: [...state.resources, {
            ...resourceData,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now
          }]
        };
      }),

      updateResource: (id, updates) => set((state) => ({
        resources: state.resources.map((r) =>
          r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r
        )
      })),

      deleteResource: (id) => set((state) => ({
        resources: state.resources.filter((r) => r.id !== id)
      })),

      getResourcesByProject: (projectId) => {
        return get().resources
          .filter((r) => r.projectId === projectId)
          .sort((a, b) => b.updatedAt - a.updatedAt);
      },

      // Goals Actions
      addGoal: (goalData) => set((state) => {
        const now = Date.now();
        const newGoal: Goal = {
          ...goalData,
          id: crypto.randomUUID(),
          steps: goalData.steps || [],
          progress: 0,
          createdAt: now,
          updatedAt: now,
        };
        return {
          goals: [...state.goals, newGoal]
        };
      }),

      updateGoal: (id, updates) => set((state) => {
        const goal = state.goals.find((g) => g.id === id);
        if (!goal) return state;

        const updatedGoal = { ...goal, ...updates, updatedAt: Date.now() };
        
        // Автоматически вычисляем прогресс при изменении шагов
        if (updates.steps !== undefined && updatedGoal.steps.length > 0) {
          const completedSteps = updatedGoal.steps.filter((s) => s.completed).length;
          updatedGoal.progress = Math.round((completedSteps / updatedGoal.steps.length) * 100);
        }
        
        // Если все шаги выполнены, помечаем цель как выполненную
        if (updatedGoal.steps.length > 0 && updatedGoal.steps.every(s => s.completed)) {
          updatedGoal.status = 'completed';
          updatedGoal.completedAt = Date.now();
        }

        return {
          goals: state.goals.map((g) => (g.id === id ? updatedGoal : g))
        };
      }),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      })),

      getGoalsByPeriod: (period) => {
        return get().goals
          .filter((g) => g.period === period)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getGoalsByStatus: (status) => {
        return get().goals
          .filter((g) => g.status === status)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getGoalsByDateRange: (startDate, endDate) => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return get().goals.filter((g) => {
          const goalStart = new Date(g.startDate).getTime();
          const goalEnd = new Date(g.endDate).getTime();
          return (goalStart >= start && goalStart <= end) || 
                 (goalEnd >= start && goalEnd <= end) ||
                 (goalStart <= start && goalEnd >= end);
        }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      },

      // Goal Steps Actions
      addGoalStep: (goalId, stepData) => set((state) => {
        const goal = state.goals.find((g) => g.id === goalId);
        if (!goal) return state;

        const maxOrder = goal.steps.length > 0 
          ? Math.max(...goal.steps.map(s => s.order))
          : -1;

        const newStep: GoalStep = {
          ...stepData,
          id: crypto.randomUUID(),
          order: maxOrder + 1,
          createdAt: Date.now(),
        };

        const updatedGoal = {
          ...goal,
          steps: [...goal.steps, newStep],
          updatedAt: Date.now(),
        };
        // Вычисляем прогресс
        const completedSteps = updatedGoal.steps.filter((s) => s.completed).length;
        updatedGoal.progress = updatedGoal.steps.length > 0 
          ? Math.round((completedSteps / updatedGoal.steps.length) * 100)
          : 0;

        return {
          goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g))
        };
      }),

      updateGoalStep: (goalId, stepId, updates) => set((state) => {
        const goal = state.goals.find((g) => g.id === goalId);
        if (!goal) return state;

        const updatedGoal = {
          ...goal,
          steps: goal.steps.map((s) =>
            s.id === stepId ? { ...s, ...updates } : s
          ),
          updatedAt: Date.now(),
        };
        // Вычисляем прогресс
        const completedSteps = updatedGoal.steps.filter((s) => s.completed).length;
        updatedGoal.progress = updatedGoal.steps.length > 0 
          ? Math.round((completedSteps / updatedGoal.steps.length) * 100)
          : 0;

        // Если все шаги выполнены, помечаем цель как выполненную
        if (updatedGoal.steps.length > 0 && updatedGoal.steps.every(s => s.completed)) {
          updatedGoal.status = 'completed';
          updatedGoal.completedAt = Date.now();
        }

        return {
          goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g))
        };
      }),

      deleteGoalStep: (goalId, stepId) => set((state) => {
        const goal = state.goals.find((g) => g.id === goalId);
        if (!goal) return state;

        const updatedGoal = {
          ...goal,
          steps: goal.steps.filter((s) => s.id !== stepId),
          updatedAt: Date.now(),
        };
        // Вычисляем прогресс
        const completedSteps = updatedGoal.steps.filter((s) => s.completed).length;
        updatedGoal.progress = updatedGoal.steps.length > 0 
          ? Math.round((completedSteps / updatedGoal.steps.length) * 100)
          : 0;

        return {
          goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g))
        };
      }),

      toggleGoalStep: (goalId, stepId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal) return;

        const step = goal.steps.find((s) => s.id === stepId);
        if (!step) return;

        get().updateGoalStep(goalId, stepId, {
          completed: !step.completed,
          completedAt: !step.completed ? Date.now() : undefined,
        });
      },

      reorderGoalSteps: (goalId, stepIds) => set((state) => {
        const goal = state.goals.find((g) => g.id === goalId);
        if (!goal) return state;

        const stepMap = new Map(goal.steps.map(s => [s.id, s]));
        const reorderedSteps = stepIds
          .map((id, index) => {
            const step = stepMap.get(id);
            return step ? { ...step, order: index } : null;
          })
          .filter((s): s is GoalStep => s !== null);

        // Добавляем шаги, которых нет в новом порядке (на случай ошибки)
        goal.steps.forEach(step => {
          if (!stepIds.includes(step.id)) {
            reorderedSteps.push({ ...step, order: reorderedSteps.length });
          }
        });

        const updatedGoal = {
          ...goal,
          steps: reorderedSteps,
          updatedAt: Date.now(),
        };

        return {
          goals: state.goals.map((g) => (g.id === goalId ? updatedGoal : g))
        };
      }),

      calculateGoalProgress: (goalId) => {
        const goal = get().goals.find((g) => g.id === goalId);
        if (!goal || goal.steps.length === 0) return 0;

        const completedSteps = goal.steps.filter((s) => s.completed).length;
        return Math.round((completedSteps / goal.steps.length) * 100);
      },

      // Finance: Incomes
      addFinanceIncome: (data) => set((state) => ({
        financeIncomes: [...state.financeIncomes, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateFinanceIncome: (id, updates) => set((state) => ({
        financeIncomes: state.financeIncomes.map((i) => (i.id === id ? { ...i, ...updates } : i))
      })),
      deleteFinanceIncome: (id) => set((state) => ({
        financeIncomes: state.financeIncomes.filter((i) => i.id !== id)
      })),
      getFinanceIncomesByMonth: (month) => {
        return get().financeIncomes
          .filter((i) => i.date.startsWith(month))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      getTotalIncomeByMonth: (month) => {
        return get().financeIncomes
          .filter((i) => i.date.startsWith(month))
          .reduce((sum, i) => sum + i.amount, 0);
      },

      // Finance: Expenses
      addFinanceExpense: (data) => set((state) => ({
        financeExpenses: [...state.financeExpenses, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateFinanceExpense: (id, updates) => set((state) => ({
        financeExpenses: state.financeExpenses.map((e) => (e.id === id ? { ...e, ...updates } : e))
      })),
      deleteFinanceExpense: (id) => set((state) => ({
        financeExpenses: state.financeExpenses.filter((e) => e.id !== id)
      })),
      getFinanceExpensesByMonth: (month) => {
        return get().financeExpenses
          .filter((e) => e.date.startsWith(month))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      getTotalExpenseByMonth: (month) => {
        return get().financeExpenses
          .filter((e) => e.date.startsWith(month))
          .reduce((sum, e) => sum + e.amount, 0);
      },
      getExpensesByCategoryForMonth: (month) => {
        const expenses = get().financeExpenses.filter((e) => e.date.startsWith(month));
        const byCategory: Record<string, number> = {};
        expenses.forEach((e) => {
          byCategory[e.categoryId] = (byCategory[e.categoryId] ?? 0) + e.amount;
        });
        return Object.entries(byCategory).map(([categoryId, total]) => ({ categoryId, total }));
      },

      // Finance: Budgets
      addFinanceBudget: (data) => set((state) => ({
        financeBudgets: [...state.financeBudgets, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateFinanceBudget: (id, updates) => set((state) => ({
        financeBudgets: state.financeBudgets.map((b) => (b.id === id ? { ...b, ...updates } : b))
      })),
      deleteFinanceBudget: (id) => set((state) => ({
        financeBudgets: state.financeBudgets.filter((b) => b.id !== id)
      })),
      getFinanceBudgetsForMonth: (month) => {
        return get().financeBudgets.filter((b) => b.month === month);
      },
      getTotalBudgetLimitForMonth: (month) => {
        return get().financeBudgets
          .filter((b) => b.month === month && b.categoryId === null)
          .reduce((sum, b) => sum + b.limitAmount, 0);
      },

      getTotalPlannedSpendingForMonth: (month) => {
        const budgets = get().financeBudgets.filter((b) => b.month === month);
        const general = budgets.find((b) => b.categoryId === null);
        if (general) return general.limitAmount;
        return budgets.reduce((sum, b) => sum + b.limitAmount, 0);
      },

      // Finance: Goals (savings)
      addFinanceGoal: (data) => set((state) => {
        const now = Date.now();
        return {
          financeGoals: [...state.financeGoals, { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now }]
        };
      }),
      updateFinanceGoal: (id, updates) => set((state) => ({
        financeGoals: state.financeGoals.map((g) =>
          g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g
        )
      })),
      deleteFinanceGoal: (id) => set((state) => ({
        financeGoals: state.financeGoals.filter((g) => g.id !== id)
      })),
      getActiveFinanceGoals: () => {
        return get().financeGoals.filter((g) => g.currentAmount < g.targetAmount);
      },

      // Finance: Recurring
      addRecurringPayment: (data) => set((state) => ({
        recurringPayments: [...state.recurringPayments, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updateRecurringPayment: (id, updates) => set((state) => ({
        recurringPayments: state.recurringPayments.map((r) => (r.id === id ? { ...r, ...updates } : r))
      })),
      deleteRecurringPayment: (id) => set((state) => ({
        recurringPayments: state.recurringPayments.filter((r) => r.id !== id)
      })),

      addPlannedIncome: (data) => set((state) => ({
        plannedIncomes: [...state.plannedIncomes, { ...data, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),
      updatePlannedIncome: (id, updates) => set((state) => ({
        plannedIncomes: state.plannedIncomes.map((p) => (p.id === id ? { ...p, ...updates } : p))
      })),
      deletePlannedIncome: (id) => set((state) => ({
        plannedIncomes: state.plannedIncomes.filter((p) => p.id !== id)
      })),
      getTotalPlannedIncome: () => get().plannedIncomes.reduce((sum, p) => sum + p.amount, 0),

      // Settings
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'monotask-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
