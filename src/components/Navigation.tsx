import React from 'react';
import { Timer as TimerIcon, ClipboardList, BarChart3, Users, Trophy, Flame, Coins, Sparkles } from 'lucide-react';
import { AppView, UserProfile } from '../types';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  profile: UserProfile;
  themePrimaryClass: string;
}

export default function Navigation({
  currentView,
  onViewChange,
  profile,
  themePrimaryClass
}: NavigationProps) {
  const navItems = [
    { id: 'timer' as AppView, label: 'Focus Timer', mobileLabel: 'Focus', icon: TimerIcon },
    { id: 'tasks' as AppView, label: 'Tasks Planner', mobileLabel: 'Tasks', icon: ClipboardList },
    { id: 'stats' as AppView, label: 'Study Analytics', mobileLabel: 'Stats', icon: BarChart3 },
    { id: 'rooms' as AppView, label: 'Study Rooms', mobileLabel: 'Rooms', icon: Users, badge: 'Live' },
    { id: 'gamification' as AppView, label: 'Progress Hub', mobileLabel: 'Progress', icon: Trophy },
  ];

  // Calculate XP percentage
  const xpNeeded = profile.level * 150;
  const xpProgress = Math.min((profile.xp / xpNeeded) * 100, 100);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-slate-800/60 p-5 bg-slate-950/85 backdrop-blur-md z-10 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400">
            <TimerIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl leading-none tracking-tighter text-slate-50 uppercase">
              FocusFlow
            </h1>
            <span className="text-[10px] text-slate-500 font-bold tracking-[0.25em]">STUDY CLUB</span>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-lg">
          <div className="flex items-center gap-3 mb-2.5">
            <span className="text-2xl">{profile.avatar || '🎓'}</span>
            <div className="overflow-hidden">
              <div className="font-sans font-bold text-sm text-slate-100 truncate">
                {profile.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-indigo-400 font-bold uppercase tracking-wider font-sans">
                  Lvl {profile.level}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {profile.xp}/{xpNeeded} XP
                </span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full bg-indigo-500 transition-all duration-500 ease-out`}
              style={{ width: `${xpProgress}%` }}
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5" title="Daily Focus Streak">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500/10" />
              <div>
                <div className="text-xs font-mono font-bold text-slate-100 leading-none">
                  {profile.streak}d
                </div>
                <span className="text-[9px] text-slate-500 uppercase tracking-tight">Streak</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5" title="Focus Coins Earned">
              <Coins className="w-4 h-4 text-amber-500 fill-amber-500/10" />
              <div>
                <div className="text-xs font-mono font-bold text-slate-100 leading-none">
                  {profile.focusCoins}
                </div>
                <span className="text-[9px] text-slate-500 uppercase tracking-tight">Coins</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                id={`nav-link-${item.id}`}
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-sans text-xs font-bold uppercase tracking-wider transition-all duration-200 group text-left ${
                  isActive
                    ? `${themePrimaryClass} shadow-lg shadow-indigo-600/15`
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-105' : 'group-hover:scale-105 text-slate-500 group-hover:text-slate-300'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-2 py-0.5 font-bold font-mono tracking-widest uppercase rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-950 text-indigo-400 border border-indigo-900/50 animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="mt-auto pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-500 px-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[9px] font-mono tracking-widest uppercase">Focus State: Active</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/98 backdrop-blur-md pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] px-3 flex justify-around items-center z-[100] select-none shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              id={`nav-link-mobile-${item.id}`}
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition-all duration-150 relative ${
                isActive ? 'text-slate-100 font-bold' : 'text-slate-500'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive ? `bg-indigo-600 text-white shadow-lg shadow-indigo-600/20` : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] mt-1 font-sans font-bold uppercase tracking-wide">
                {item.mobileLabel}
              </span>
              {item.badge && !isActive && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
