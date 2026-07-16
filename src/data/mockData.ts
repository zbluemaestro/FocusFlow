import { StudyBuddy, Badge, ShopTheme, LeaderboardEntry, StudyRoom } from '../types';

export const STUDY_ROOMS: StudyRoom[] = [
  {
    id: 'lofi_cafe',
    name: 'Lofi Music Cafe',
    description: 'A cozy coffee shop with rain pattering on the window and a soothing lofi soundtrack.',
    icon: 'Coffee',
    bgGradient: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
    buddiesCount: 4,
    tagline: 'Cozy vibes & background beats'
  },
  {
    id: 'silent_library',
    name: 'Silent Library',
    description: 'A quiet, distraction-free sanctuary for deep focus. Sound is muted, concentration is key.',
    icon: 'BookOpen',
    bgGradient: 'from-blue-500/10 to-indigo-500/10 border-blue-500/20',
    buddiesCount: 5,
    tagline: 'Absolute silence & deep concentration'
  },
  {
    id: 'tech_lab',
    name: 'Tech Den & Lab',
    description: 'A high-energy neon lab where builders, coders, and creators design and compile projects.',
    icon: 'Terminal',
    bgGradient: 'from-purple-500/10 to-pink-500/10 border-purple-500/20',
    buddiesCount: 3,
    tagline: 'For coders, writers, and creators'
  },
  {
    id: 'forest_cabin',
    name: 'Forest Treehouse',
    description: 'An open-air cabin surrounded by rustling leaves, birds chirping, and fresh green nature.',
    icon: 'Compass',
    bgGradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
    buddiesCount: 3,
    tagline: 'Natural sounds & peaceful breathing'
  }
];

export const INITIAL_BUDDIES: StudyBuddy[] = [
  {
    id: 'buddy_alex',
    name: 'Alex',
    avatar: '👨‍💻',
    status: 'focusing',
    currentTaskName: 'Coding React Components',
    activeTimerRemaining: 1120,
    totalXp: 1850,
    currentStreak: 5,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300'
  },
  {
    id: 'buddy_sophia',
    name: 'Sophia',
    avatar: '👩‍⚕️',
    status: 'focusing',
    currentTaskName: 'Biology Flashcards',
    activeTimerRemaining: 430,
    totalXp: 2420,
    currentStreak: 12,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  },
  {
    id: 'buddy_jin',
    name: 'Jin',
    avatar: '👨‍🎨',
    status: 'break',
    currentTaskName: 'Sketching Concept Art',
    activeTimerRemaining: 210,
    totalXp: 950,
    currentStreak: 3,
    color: 'bg-pink-100 text-pink-700 border-pink-300'
  },
  {
    id: 'buddy_emily',
    name: 'Emily',
    avatar: '👩‍✍️',
    status: 'focusing',
    currentTaskName: 'Literature Essay Draft',
    activeTimerRemaining: 1390,
    totalXp: 3100,
    currentStreak: 18,
    color: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  {
    id: 'buddy_liam',
    name: 'Liam',
    avatar: '👨‍🔬',
    status: 'idle',
    currentTaskName: 'Physics Homework',
    activeTimerRemaining: 0,
    totalXp: 1200,
    currentStreak: 1,
    color: 'bg-teal-100 text-teal-700 border-teal-300'
  },
  {
    id: 'buddy_hana',
    name: 'Hana',
    avatar: '👩‍💻',
    status: 'focusing',
    currentTaskName: 'Algorithms Practice',
    activeTimerRemaining: 880,
    totalXp: 4300,
    currentStreak: 25,
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Complete your first focus session',
    iconName: 'Play',
    targetValue: 1,
    currentValue: 0,
    unlocked: false
  },
  {
    id: 'deep_diver',
    title: 'Deep Focus Diver',
    description: 'Accumulate 100 total minutes of focus time',
    iconName: 'Compass',
    targetValue: 100,
    currentValue: 0,
    unlocked: false
  },
  {
    id: 'pomodoro_pioneer',
    title: 'Pomodoro Pioneer',
    description: 'Complete 10 full Pomodoro sessions',
    iconName: 'Flame',
    targetValue: 10,
    currentValue: 0,
    unlocked: false
  },
  {
    id: 'streak_enthusiast',
    title: 'Habit Builder',
    description: 'Reach a study streak of 3 consecutive days',
    iconName: 'Calendar',
    targetValue: 3,
    currentValue: 0,
    unlocked: false
  },
  {
    id: 'social_scholar',
    title: 'Collaborative Mind',
    description: 'Send a message in a virtual study room chat',
    iconName: 'MessageSquare',
    targetValue: 1,
    currentValue: 0,
    unlocked: false
  },
  {
    id: 'task_slayer',
    title: 'Task Slayer',
    description: 'Fully complete 5 planner tasks',
    iconName: 'CheckSquare',
    targetValue: 5,
    currentValue: 0,
    unlocked: false
  },
  {
    id: 'elite_scholar',
    title: 'Elite Scholar',
    description: 'Reach Level 5 focusing milestone',
    iconName: 'Award',
    targetValue: 5,
    currentValue: 1, // standard user starts at Level 1
    unlocked: false
  },
  {
    id: 'wealthy_mind',
    title: 'Golden Scholar',
    description: 'Amass 150 Focus Coins',
    iconName: 'Coins',
    targetValue: 150,
    currentValue: 0,
    unlocked: false
  }
];

export const AVAILABLE_THEMES: ShopTheme[] = [
  {
    id: 'tomato_red',
    title: 'Bold Indigo',
    description: 'The default FocusFlow theme: sharp display typography, stark dark slate cards, and deep indigo accents.',
    price: 0,
    bgClass: 'bg-slate-950 text-slate-50',
    primaryClass: 'bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-tighter border-0 rounded-2xl shadow-xl shadow-indigo-500/20',
    accentClass: 'text-indigo-400 border-slate-800 bg-slate-900',
    cardClass: 'bg-slate-900 border border-slate-800/80 shadow-2xl shadow-black/50',
    unlocked: true
  },
  {
    id: 'sakura_bloom',
    title: 'Bold Sakura',
    description: 'Sharp display typography and deep slate structures with vibrant cherry blossom pink highlights.',
    price: 30,
    bgClass: 'bg-neutral-950 text-neutral-50',
    primaryClass: 'bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-tighter border-0 rounded-2xl shadow-xl shadow-rose-500/20',
    accentClass: 'text-rose-400 border-neutral-800 bg-neutral-900',
    cardClass: 'bg-neutral-900 border border-neutral-800/80 shadow-2xl shadow-black/50',
    unlocked: false
  },
  {
    id: 'cyberpunk_neon',
    title: 'Bold Cyber',
    description: 'A tech-forward terminal look with ultra-bold typography and glowing high-voltage purple accents.',
    price: 60,
    bgClass: 'bg-zinc-950 text-zinc-50',
    primaryClass: 'bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-tighter border-0 rounded-2xl shadow-xl shadow-purple-500/20',
    accentClass: 'text-purple-400 border-zinc-800 bg-zinc-900',
    cardClass: 'bg-zinc-900 border border-zinc-800/80 shadow-2xl shadow-black/50',
    unlocked: false
  },
  {
    id: 'forest_retreat',
    title: 'Bold Forest',
    description: 'Durable woodland tones with bold headers, deep green accents, and rich pine structures.',
    price: 45,
    bgClass: 'bg-stone-950 text-stone-50',
    primaryClass: 'bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-tighter border-0 rounded-2xl shadow-xl shadow-emerald-500/20',
    accentClass: 'text-emerald-400 border-stone-800 bg-stone-900',
    cardClass: 'bg-stone-900 border border-stone-800/80 shadow-2xl shadow-black/50',
    unlocked: false
  },
  {
    id: 'sunset_glow',
    title: 'Bold Amber',
    description: 'Sharp display aesthetics and deep charcoal structures with warm radiating sunset orange highlights.',
    price: 50,
    bgClass: 'bg-slate-950 text-slate-50',
    primaryClass: 'bg-amber-600 hover:bg-amber-500 text-white font-black uppercase tracking-tighter border-0 rounded-2xl shadow-xl shadow-amber-500/20',
    accentClass: 'text-amber-400 border-slate-800 bg-slate-900',
    cardClass: 'bg-slate-900 border border-slate-800/80 shadow-2xl shadow-black/50',
    unlocked: false
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb_1', name: 'Hana (Algorithms)', avatar: '👩‍💻', xp: 4300, focusMinutes: 480, isUser: false },
  { id: 'lb_2', name: 'Emily (Literature)', avatar: '👩‍✍️', xp: 3100, focusMinutes: 360, isUser: false },
  { id: 'lb_3', name: 'Sophia (Biology)', avatar: '👩‍⚕️', xp: 2420, focusMinutes: 280, isUser: false },
  { id: 'lb_4', name: 'Alex (WebDev)', avatar: '👨‍💻', xp: 1850, focusMinutes: 210, isUser: false },
  { id: 'lb_5', name: 'Liam (Physics)', avatar: '👨‍🔬', xp: 1200, focusMinutes: 140, isUser: false },
  { id: 'lb_6', name: 'Jin (Design)', avatar: '👨‍🎨', xp: 950, focusMinutes: 110, isUser: false },
  { id: 'lb_7', name: 'Chloe (Writing)', avatar: '👩‍🏫', xp: 510, focusMinutes: 60, isUser: false }
];

export const CHAT_PRESETS = [
  'Let\'s crush our focus goals today! 💪',
  'Focus time started. Phones away! 📱❌',
  'Just finished a session. Feeling great! 🌟',
  'Taking a short stretch break. Drink water! 💧🧘‍♀️',
  'Lofi track is hitting different today. 🎵🎧',
  'We can do this! Stay strong! 🔥',
  'Time to check some tasks off the list. 📝✅'
];

export const BUDDY_RESPONSES = [
  'Awesome work! Let\'s keep pushing! 🚀',
  'You\'ve got this! Focus on one small step.',
  'Thanks! Stretching right now as well 🧘‍♂️',
  'That session flew by! Great effort.',
  'Agreed, this track is extremely relaxing ☕',
  'We\'re building amazing habits together! 🤝',
  'Nothing beats checking off a completed task! 📝'
];
