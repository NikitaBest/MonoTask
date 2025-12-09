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
  type: 'reminder' | 'meeting' | 'call' | 'task'; // Тип события
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

interface AppState {
  tasks: Task[];
  projects: Project[];
  events: CalendarEvent[]; // События/напоминания для календаря
  notes: Note[]; // Заметки
  payments: Payment[]; // Оплаты по проектам
  expenses: Expense[]; // Расходы по проектам
  settings: AppSettings;
  
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
  
  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
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
