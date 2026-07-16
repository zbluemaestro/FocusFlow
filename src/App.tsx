import React, { useState, useEffect } from 'react';
import { Sparkles, Edit, Check, Award, Flame, Coins, Trophy, User } from 'lucide-react';
import { UserProfile, Task, SessionLog, Badge, ShopTheme, LeaderboardEntry, AppView } from './types';
import { INITIAL_BADGES, AVAILABLE_THEMES, INITIAL_LEADERBOARD } from './data/mockData';
import Navigation from './components/Navigation';
import Timer from './components/Timer';
import TaskManager from './components/TaskManager';
import StatsDashboard from './components/StatsDashboard';
import StudyRooms from './components/StudyRooms';
import GamificationHub from './components/GamificationHub';

// Initial preseeded tasks for a helpful first onboarding
const PRESEEDED_TASKS: Task[] = [
  {
    id: 'task_pre_1',
    title: 'Explore Pomodoro study interface',
    completed: false,
    category: 'Other',
    priority: 'Medium',
    estimatedPomodoros: 1,
    completedPomodoros: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_pre_2',
    title: 'Solve three difficult textbook equations',
    completed: false,
    category: 'Math',
    priority: 'High',
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  // --- STATE PROVIDERS & LOCALSTORAGE RETRIEVAL ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studyclub_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Profile parse error', e);
      }
    }
    return {
      name: 'Scholar Student',
      avatar: '🎓',
      xp: 0,
      level: 1,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      focusCoins: 20, // start with a small coin nest
      currentThemeId: 'tomato_red',
      totalFocusMinutes: 0,
      totalCompletedPomodoros: 0
    };
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('studyclub_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Tasks parse error', e);
      }
    }
    return PRESEEDED_TASKS;
  });

  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem('studyclub_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Logs parse error', e);
      }
    }
    return [];
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('studyclub_badges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Badges parse error', e);
      }
    }
    return INITIAL_BADGES;
  });

  const [themes, setThemes] = useState<ShopTheme[]>(() => {
    const saved = localStorage.getItem('studyclub_themes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Themes parse error', e);
      }
    }
    return AVAILABLE_THEMES;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('studyclub_leaderboard');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Leaderboard parse error', e);
      }
    }
    return INITIAL_LEADERBOARD;
  });

  const [currentView, setCurrentView] = useState<AppView>('timer');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Profile Edit modal
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.name);
  const [tempAvatar, setTempAvatar] = useState(profile.avatar);

  // Synchronize state with LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('studyclub_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('studyclub_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('studyclub_logs', JSON.stringify(sessionLogs));
  }, [sessionLogs]);

  useEffect(() => {
    localStorage.setItem('studyclub_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('studyclub_themes', JSON.stringify(themes));
  }, [themes]);

  useEffect(() => {
    localStorage.setItem('studyclub_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  // Streak verification on load
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastActive = profile.lastActiveDate;

    if (lastActive && lastActive !== todayStr) {
      const lastActiveDateObj = new Date(lastActive);
      const todayDateObj = new Date(todayStr);
      const diffTime = Math.abs(todayDateObj.getTime() - lastActiveDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Logged in exactly consecutive day! Streak incremented
        setProfile((prev) => ({
          ...prev,
          streak: prev.streak + 1,
          lastActiveDate: todayStr
        }));
      } else if (diffDays > 1) {
        // Broke streak
        setProfile((prev) => ({
          ...prev,
          streak: 1,
          lastActiveDate: todayStr
        }));
      }
    }
  }, []);

  // --- COMPILATION LOGIC FOR GAINED XP & BADGES CHECK ---
  const handleCompleteFocusSession = (
    type: 'pomodoro' | 'short_break' | 'long_break',
    durationMinutes: number,
    taskId?: string
  ) => {
    // 1. Calculate gains
    let xpReward = 0;
    let coinReward = 0;

    if (type === 'pomodoro') {
      // Study block rewards
      xpReward = 50 + profile.streak * 5; // streak XP bonus!
      coinReward = 10;
    } else if (type === 'short_break') {
      xpReward = 10;
      coinReward = 2;
    } else {
      xpReward = 25;
      coinReward = 5;
    }

    // 2. Add extra task-completion bonus if linked task finishes
    let newlyCompletedTaskTitle: string | undefined;
    let extraXp = 0;
    let extraCoins = 0;

    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId && type === 'pomodoro') {
        const nextCompletedCount = Math.min(task.completedPomodoros + 1, task.estimatedPomodoros);
        const isNowFinished = nextCompletedCount === task.estimatedPomodoros;
        
        if (isNowFinished && !task.completed) {
          extraXp = 30; // completed task bonus!
          extraCoins = 5;
          newlyCompletedTaskTitle = task.title;
        }

        return {
          ...task,
          completedPomodoros: nextCompletedCount,
          completed: isNowFinished
        };
      }
      return task;
    });

    if (taskId && type === 'pomodoro') {
      setTasks(updatedTasks);
    }

    const totalXpGain = xpReward + extraXp;
    const totalCoinGain = coinReward + extraCoins;

    // 3. Construct history log item
    const linkedTask = tasks.find((t) => t.id === taskId);
    const newLog: SessionLog = {
      id: `log_${Date.now()}`,
      taskId,
      taskTitle: linkedTask?.title,
      category: type === 'pomodoro' ? (linkedTask?.category || 'Other') : 'Other',
      type,
      durationMinutes,
      timestamp: new Date().toISOString(),
      earnedXp: totalXpGain,
      earnedCoins: totalCoinGain
    };

    const newLogs = [...sessionLogs, newLog];
    setSessionLogs(newLogs);

    // 4. Update Profile XP & level checks
    const updatedXp = profile.xp + totalXpGain;
    const xpNeeded = profile.level * 150;
    let nextLevel = profile.level;
    let nextXp = updatedXp;

    if (updatedXp >= xpNeeded) {
      nextLevel += 1;
      nextXp = updatedXp - xpNeeded;
      alert(`🎉 LEVEL UP! You reached Level ${nextLevel}! Unlocked +15 Focus Coins bonus!`);
    }

    const updatedFocusMinutes = profile.totalFocusMinutes + (type === 'pomodoro' ? durationMinutes : 0);
    const updatedCompletedPomos = profile.totalCompletedPomodoros + (type === 'pomodoro' ? 1 : 0);

    const nextProfile: UserProfile = {
      ...profile,
      xp: nextXp,
      level: nextLevel,
      focusCoins: profile.focusCoins + totalCoinGain + (nextLevel > profile.level ? 15 : 0),
      totalFocusMinutes: updatedFocusMinutes,
      totalCompletedPomodoros: updatedCompletedPomos,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    setProfile(nextProfile);

    if (newlyCompletedTaskTitle) {
      alert(`📝 Task Completed: "${newlyCompletedTaskTitle}"! Gained +30 XP & +5 Coins task-slayer bonus!`);
    }

    // 5. Check badges unlocking parameters
    checkBadgesUnlock(nextProfile, updatedTasks, newLogs);
  };

  const checkBadgesUnlock = (uProfile: UserProfile, currentTasks: Task[], currentLogs: SessionLog[]) => {
    const finishedTasks = currentTasks.filter(t => t.completed).length;
    const totalMinutes = uProfile.totalFocusMinutes;
    const totalPomodoros = uProfile.totalCompletedPomodoros;
    const streak = uProfile.streak;
    const coins = uProfile.focusCoins;
    const level = uProfile.level;

    const updatedBadges = badges.map((badge) => {
      if (badge.unlocked) return badge;

      let currentProgressVal = 0;
      switch (badge.id) {
        case 'first_step':
          currentProgressVal = totalPomodoros;
          break;
        case 'deep_diver':
          currentProgressVal = totalMinutes;
          break;
        case 'pomodoro_pioneer':
          currentProgressVal = totalPomodoros;
          break;
        case 'streak_enthusiast':
          currentProgressVal = streak;
          break;
        case 'task_slayer':
          currentProgressVal = finishedTasks;
          break;
        case 'elite_scholar':
          currentProgressVal = level;
          break;
        case 'wealthy_mind':
          currentProgressVal = coins;
          break;
        default:
          currentProgressVal = badge.currentValue;
      }

      const reachedTarget = currentProgressVal >= badge.targetValue;

      if (reachedTarget && !badge.unlocked) {
        // Newly unlocked!
        setTimeout(() => {
          alert(`🏆 ACHIEVEMENT UNLOCKED: "${badge.title}"! ${badge.description}. Unlocked +100 XP / +20 Focus Coins!`);
        }, 1200);

        // Update profile reward
        setProfile((prev) => ({
          ...prev,
          xp: prev.xp + 100, // badge reward
          focusCoins: prev.focusCoins + 20
        }));

        return {
          ...badge,
          currentValue: currentProgressVal,
          unlocked: true,
          unlockedAt: new Date().toISOString().split('T')[0]
        };
      }

      return {
        ...badge,
        currentValue: currentProgressVal
      };
    });

    setBadges(updatedBadges);
  };

  // Callback to unlock "Social Scholar" badge when user chats
  const handleUserChattedBadgeCheck = () => {
    const updatedBadges = badges.map((badge) => {
      if (badge.id === 'social_scholar' && !badge.unlocked) {
        setTimeout(() => {
          alert(`🏆 ACHIEVEMENT UNLOCKED: "${badge.title}"! Sent chat supportive messages in room. +100 XP / +20 Focus Coins!`);
        }, 800);

        setProfile((prev) => ({
          ...prev,
          xp: prev.xp + 100,
          focusCoins: prev.focusCoins + 20
        }));

        return {
          ...badge,
          currentValue: 1,
          unlocked: true,
          unlockedAt: new Date().toISOString().split('T')[0]
        };
      }
      return badge;
    });
    setBadges(updatedBadges);
  };

  // --- TASK CRUD PASS-THRU ---
  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'completedPomodoros' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      completed: false,
      completedPomodoros: 0,
      createdAt: new Date().toISOString()
    };
    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    
    // update task slayer current value
    checkBadgesUnlock(profile, newTasks, sessionLogs);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    setTasks(newTasks);
    
    // If we marked completed, check achievements
    checkBadgesUnlock(profile, newTasks, sessionLogs);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
  };

  const handleClearCompletedTasks = () => {
    setTasks(tasks.filter((t) => !t.completed));
  };

  // --- REWARDS THEME SHOP PASS-THRU ---
  const handleUnlockTheme = (themeId: string, price: number) => {
    if (profile.focusCoins >= price) {
      const updatedThemes = themes.map((theme) => {
        if (theme.id === themeId) {
          return { ...theme, unlocked: true };
        }
        return theme;
      });

      setThemes(updatedThemes);
      setProfile((prev) => ({
        ...prev,
        focusCoins: prev.focusCoins - price
      }));

      alert(`🛒 Theme successfully unlocked! Select it in the Shop to apply to your study workspace.`);
    } else {
      alert(`⚠️ Insufficient Focus Coins. Continue focusing on your study timer to earn more!`);
    }
  };

  const handleApplyTheme = (themeId: string) => {
    setProfile((prev) => ({
      ...prev,
      currentThemeId: themeId
    }));
  };

  // --- THEME COLOR MAPPING SELECTOR ---
  const getThemeClasses = (themeId: string) => {
    const t = themes.find((x) => x.id === themeId) || AVAILABLE_THEMES[0];
    return {
      bg: t.bgClass,
      primary: t.primaryClass,
      accent: t.accentClass,
      card: t.cardClass
    };
  };

  const activeThemeClasses = getThemeClasses(profile.currentThemeId);

  // Save profile name/avatar edits
  const saveProfileEdit = () => {
    if (!tempName.trim()) return;
    setProfile((prev) => ({
      ...prev,
      name: tempName.trim(),
      avatar: tempAvatar
    }));
    setIsEditingName(false);
  };

  return (
    <div className={`min-h-screen ${activeThemeClasses.bg} pb-20 md:pb-8 md:pl-64 transition-all duration-300 font-sans`}>
      
      {/* Dynamic Navigation panel */}
      <Navigation
        currentView={currentView}
        onViewChange={(view) => setCurrentView(view)}
        profile={profile}
        themePrimaryClass={activeThemeClasses.primary}
      />

      {/* Top Header Bar (Includes editable Profile option) */}
      <header className="w-full max-w-4xl mx-auto py-5 px-6 md:px-8 flex justify-between items-center border-b border-slate-800/80 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <span className="text-3xl p-1 bg-slate-900 rounded-xl border border-slate-800 block select-none">
              {profile.avatar || '🎓'}
            </span>
          </div>

          <div>
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={18}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="p-1.5 px-2.5 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-900 font-bold text-slate-100"
                />
                <select
                  value={tempAvatar}
                  onChange={(e) => setTempAvatar(e.target.value)}
                  className="p-1.5 text-xs border border-slate-800 rounded-xl bg-slate-900 text-slate-100 font-bold"
                >
                  {['🎓', '👨‍💻', '👩‍💻', '📝', '⚡', '🌟', '🍀', '🍕', '🦊', '🦉'].map((em) => (
                    <option key={em} value={em}>{em}</option>
                  ))}
                </select>
                <button
                  onClick={saveProfileEdit}
                  className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="font-sans font-black text-slate-100 text-xs uppercase tracking-wider">
                  {profile.name}
                </h2>
                <button
                  onClick={() => {
                    setTempName(profile.name);
                    setTempAvatar(profile.avatar);
                    setIsEditingName(true);
                  }}
                  title="Edit Profile"
                  className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-900 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
              Rank standing: Senior Study Buddy
            </p>
          </div>
        </div>

        {/* Quick Streak details on top */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-xl" title="Study Streak">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-500/10" />
            <span className="font-mono text-xs font-black text-orange-400">{profile.streak}d</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl" title="Focus Coins balance">
            <Coins className="w-3.5 h-3.5 text-amber-400 fill-amber-500/10" />
            <span className="font-mono text-xs font-black text-amber-400">{profile.focusCoins}🪙</span>
          </div>
        </div>
      </header>

      {/* Main Container Views Content rendering */}
      <main className="w-full max-w-4xl mx-auto px-6 md:px-8 mt-4 animate-in fade-in duration-200">
        
        {currentView === 'timer' && (
          <Timer
            profile={profile}
            tasks={tasks}
            onCompleteSession={handleCompleteFocusSession}
            selectedTaskId={selectedTaskId}
            setSelectedTaskId={setSelectedTaskId}
            themePrimaryClass={activeThemeClasses.primary}
            themeAccentClass={activeThemeClasses.accent}
            themeCardClass={activeThemeClasses.card}
          />
        )}

        {currentView === 'tasks' && (
          <TaskManager
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onClearCompletedTasks={handleClearCompletedTasks}
            selectedTaskId={selectedTaskId}
            setSelectedTaskId={setSelectedTaskId}
            themePrimaryClass={activeThemeClasses.primary}
            themeAccentClass={activeThemeClasses.accent}
            themeCardClass={activeThemeClasses.card}
          />
        )}

        {currentView === 'stats' && (
          <StatsDashboard
            logs={sessionLogs}
            profile={profile}
            themeCardClass={activeThemeClasses.card}
            themeAccentClass={activeThemeClasses.accent}
          />
        )}

        {currentView === 'rooms' && (
          <StudyRooms
            profile={profile}
            themePrimaryClass={activeThemeClasses.primary}
            themeAccentClass={activeThemeClasses.accent}
            themeCardClass={activeThemeClasses.card}
            onLoggedSystemMessage={handleUserChattedBadgeCheck}
          />
        )}

        {currentView === 'gamification' && (
          <GamificationHub
            profile={profile}
            badges={badges}
            themes={themes}
            leaderboard={leaderboard}
            onUnlockTheme={handleUnlockTheme}
            onApplyTheme={handleApplyTheme}
            themePrimaryClass={activeThemeClasses.primary}
            themeAccentClass={activeThemeClasses.accent}
            themeCardClass={activeThemeClasses.card}
          />
        )}

      </main>

    </div>
  );
}
