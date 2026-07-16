export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'Math' | 'Science' | 'Coding' | 'Writing' | 'Exam Prep' | 'Other';
  priority: 'High' | 'Medium' | 'Low';
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: string;
}

export interface SessionLog {
  id: string;
  taskTitle?: string;
  taskId?: string;
  category: string;
  type: 'pomodoro' | 'short_break' | 'long_break';
  durationMinutes: number;
  timestamp: string;
  earnedXp: number;
  earnedCoins: number;
}

export type BuddyStatus = 'focusing' | 'break' | 'idle';

export interface StudyBuddy {
  id: string;
  name: string;
  avatar: string;
  status: BuddyStatus;
  currentTaskName: string;
  activeTimerRemaining: number; // in seconds
  totalXp: number;
  currentStreak: number;
  color: string; // Tailwind bg class for avatar accent
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderColor: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
  isUser?: boolean;
  isEmojiBurst?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ShopTheme {
  id: string;
  title: string;
  description: string;
  price: number;
  bgClass: string;
  primaryClass: string;
  accentClass: string;
  unlocked: boolean;
  cardClass: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  focusCoins: number;
  currentThemeId: string;
  totalFocusMinutes: number;
  totalCompletedPomodoros: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  focusMinutes: number;
  isUser: boolean;
  rank?: number;
}

export type AppView = 'timer' | 'tasks' | 'stats' | 'rooms' | 'gamification';

export interface StudyRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  bgGradient: string;
  buddiesCount: number;
  tagline: string;
}
