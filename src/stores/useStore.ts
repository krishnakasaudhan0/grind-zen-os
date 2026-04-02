import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export type HabitType = {
  id: string;
  name: string;
  emoji: string;
  type: 'checkbox' | 'counter' | 'hours';
  target?: number;
  unit?: string;
};

export type HabitEntry = {
  done: boolean;
  value: number;
};

export type DailyHabits = Record<string, HabitEntry>;

export type TaskCategory = 'GYM' | 'LEETCODE' | 'PROJECT' | 'STUDY' | 'OTHER';
export type TaskPriority = 'HIGH' | 'MED' | 'LOW';

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  done: boolean;
  dueDate?: string;
  timeEstimate?: string;
  startTime?: number; // Hour of the day (0-23)
  duration?: number; // Duration in hours
  createdAt: string;
  order: number;
};

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'PAUSED';

export type Project = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  githubUrl: string;
  deadline?: string;
  progress: number;
  notes: string;
  subtasks: { id: string; title: string; done: boolean }[];
  createdAt: string;
};

export type LeetCodeEntry = {
  date: string;
  easy: number;
  medium: number;
  hard: number;
};

export type PomodoroSettings = {
  workDuration: number;
  shortBreak: number;
  longBreak: number;
  sessionsBeforeLong: number;
  soundEnabled: boolean;
  autoStartBreak: boolean;
};

export type DailyStats = {
  date: string;
  habitsCompleted: number;
  totalHabits: number;
  tasksCompleted: number;
  pomodoroSessions: number;
  focusMinutes: number;
};

type Store = {
  // Profile
  userName: string;
  avatarEmoji: string;
  university: string;
  year: string;
  onboarded: boolean;
  setProfile: (name: string, emoji: string) => void;
  setOnboarded: (v: boolean) => void;

  // Active tab
  activeTab: number;
  setActiveTab: (t: number) => void;

  // Habits
  habits: HabitType[];
  dailyHabitData: Record<string, DailyHabits>; // date -> habitId -> entry
  setHabits: (h: HabitType[]) => void;
  toggleHabit: (date: string, habitId: string) => void;
  setHabitValue: (date: string, habitId: string, value: number) => void;
  addHabit: (h: HabitType) => void;
  removeHabit: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'order' | 'done'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  reorderTasks: (tasks: Task[]) => void;

  // Projects
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Journal
  journalEntries: Record<string, string>; // date -> text
  setJournalEntry: (date: string, text: string) => void;

  // LeetCode
  leetcodeEntries: LeetCodeEntry[];
  addLeetCodeEntry: (entry: LeetCodeEntry) => void;
  weeklyLeetCodeGoal: number;
  setWeeklyLeetCodeGoal: (g: number) => void;

  // Pomodoro
  pomodoroSettings: PomodoroSettings;
  pomodoroSessionsToday: number;
  setPomodoroSettings: (s: Partial<PomodoroSettings>) => void;
  incrementPomodoroSession: () => void;
  resetPomodoroSessions: () => void;

  // Stats
  dailyStats: DailyStats[];
  recordDailyStats: (stats: DailyStats) => void;

  // Settings
  accentColor: 'green' | 'blue' | 'purple' | 'amber';
  compactMode: boolean;
  setAccentColor: (c: 'green' | 'blue' | 'purple' | 'amber') => void;
  setCompactMode: (v: boolean) => void;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  updateStreak: (date: string) => void;

  // Data management
  exportData: () => string;
  importData: (json: string) => void;
  resetAllData: () => void;
};

const defaultHabits: HabitType[] = [
  { id: 'gym', name: 'Gym / Workout', emoji: '🏋️', type: 'checkbox' },
  { id: 'leetcode', name: 'LeetCode', emoji: '🧠', type: 'counter', target: 1, unit: 'problems' },
  { id: 'project', name: 'Project Work', emoji: '💻', type: 'hours', target: 2, unit: 'hours' },
  { id: 'study', name: 'Study / DSA', emoji: '📖', type: 'checkbox' },
  { id: 'water', name: 'Water Intake', emoji: '💧', type: 'counter', target: 8, unit: 'glasses' },
  { id: 'sleep', name: 'Sleep', emoji: '😴', type: 'hours', target: 8, unit: 'hours' },
  { id: 'read', name: 'Read / Learn', emoji: '📚', type: 'checkbox' },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      userName: '',
      avatarEmoji: '💻',
      university: '',
      year: '2nd Year CS',
      onboarded: false,
      setProfile: (name, emoji) => set({ userName: name, avatarEmoji: emoji }),
      setOnboarded: (v) => set({ onboarded: v }),

      activeTab: 0,
      setActiveTab: (t) => set({ activeTab: t }),

      habits: defaultHabits,
      dailyHabitData: {},
      setHabits: (h) => set({ habits: h }),
      toggleHabit: (date, habitId) => set((state) => {
        const dayData = { ...(state.dailyHabitData[date] || {}) };
        const current = dayData[habitId] || { done: false, value: 0 };
        dayData[habitId] = { ...current, done: !current.done, value: current.done ? 0 : 1 };
        return { dailyHabitData: { ...state.dailyHabitData, [date]: dayData } };
      }),
      setHabitValue: (date, habitId, value) => set((state) => {
        const dayData = { ...(state.dailyHabitData[date] || {}) };
        const habit = state.habits.find(h => h.id === habitId);
        const target = habit?.target || 1;
        dayData[habitId] = { done: value >= target, value };
        return { dailyHabitData: { ...state.dailyHabitData, [date]: dayData } };
      }),
      addHabit: (h) => set((s) => ({ habits: [...s.habits, h] })),
      removeHabit: (id) => set((s) => ({ habits: s.habits.filter(h => h.id !== id) })),

      tasks: [],
      addTask: (t) => set((s) => ({
        tasks: [...s.tasks, { ...t, id: uid(), createdAt: new Date().toISOString(), order: s.tasks.length, done: false }]
      })),
      toggleTask: (id) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)
      })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter(t => t.id !== id) })),
      updateTask: (id, updates) => set((s) => ({
        tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),
      reorderTasks: (tasks) => set({ tasks }),

      projects: [],
      addProject: (p) => set((s) => ({
        projects: [...s.projects, { ...p, id: uid(), createdAt: new Date().toISOString() }]
      })),
      updateProject: (id, updates) => set((s) => ({
        projects: s.projects.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProject: (id) => set((s) => ({ projects: s.projects.filter(p => p.id !== id) })),

      journalEntries: {},
      setJournalEntry: (date, text) => set((s) => ({
        journalEntries: { ...s.journalEntries, [date]: text }
      })),

      leetcodeEntries: [],
      addLeetCodeEntry: (entry) => set((s) => ({
        leetcodeEntries: [...s.leetcodeEntries, entry]
      })),
      weeklyLeetCodeGoal: 7,
      setWeeklyLeetCodeGoal: (g) => set({ weeklyLeetCodeGoal: g }),

      pomodoroSettings: {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        sessionsBeforeLong: 4,
        soundEnabled: true,
        autoStartBreak: false,
      },
      pomodoroSessionsToday: 0,
      setPomodoroSettings: (s) => set((state) => ({
        pomodoroSettings: { ...state.pomodoroSettings, ...s }
      })),
      incrementPomodoroSession: () => set((s) => ({
        pomodoroSessionsToday: s.pomodoroSessionsToday + 1
      })),
      resetPomodoroSessions: () => set({ pomodoroSessionsToday: 0 }),

      dailyStats: [],
      recordDailyStats: (stats) => set((s) => ({
        dailyStats: [...s.dailyStats.filter(d => d.date !== stats.date), stats]
      })),

      accentColor: 'green',
      compactMode: false,
      setAccentColor: (c) => set({ accentColor: c }),
      setCompactMode: (v) => set({ compactMode: v }),

      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: '',
      updateStreak: (date) => set((s) => {
        const yesterday = format(new Date(new Date(date).getTime() - 86400000), 'yyyy-MM-dd');
        let newStreak = s.currentStreak;
        if (s.lastCompletedDate === yesterday) {
          newStreak = s.currentStreak + 1;
        } else if (s.lastCompletedDate !== date) {
          newStreak = 1;
        }
        return {
          currentStreak: newStreak,
          longestStreak: Math.max(s.longestStreak, newStreak),
          lastCompletedDate: date,
        };
      }),

      exportData: () => {
        const state = get();
        const data = {
          userName: state.userName,
          avatarEmoji: state.avatarEmoji,
          habits: state.habits,
          dailyHabitData: state.dailyHabitData,
          tasks: state.tasks,
          projects: state.projects,
          journalEntries: state.journalEntries,
          leetcodeEntries: state.leetcodeEntries,
          dailyStats: state.dailyStats,
          currentStreak: state.currentStreak,
          longestStreak: state.longestStreak,
          pomodoroSettings: state.pomodoroSettings,
        };
        return JSON.stringify(data, null, 2);
      },
      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set(data);
        } catch { /* ignore */ }
      },
      resetAllData: () => set({
        userName: '',
        avatarEmoji: '💻',
        onboarded: false,
        habits: defaultHabits,
        dailyHabitData: {},
        tasks: [],
        projects: [],
        journalEntries: {},
        leetcodeEntries: [],
        dailyStats: [],
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: '',
        pomodoroSessionsToday: 0,
      }),
    }),
    { name: 'grind-os-storage' }
  )
);
