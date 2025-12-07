import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TaskStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';

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

interface AppState {
  tasks: Task[];
  settings: AppSettings;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  getTasksByDate: (date: string) => Task[];
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      settings: {
        defaultView: 'day',
        theme: 'system',
        notificationsEnabled: false,
        startOfWeek: 'monday',
        dayStartHour: 8,
        dayEndHour: 22,
      },

      addTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, { ...taskData, id: crypto.randomUUID(), createdAt: Date.now() }]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),

      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      getTasksByDate: (date) => {
        return get().tasks.filter((t) => t.date === date);
      },
    }),
    {
      name: 'monotask-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
