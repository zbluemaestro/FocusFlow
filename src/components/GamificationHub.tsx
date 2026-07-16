import React from 'react';
import { Award, Trophy, Flame, Coins, Check, Lock, Sparkles, ChevronRight, ShieldAlert, ShoppingBag, Eye } from 'lucide-react';
import { Badge, ShopTheme, LeaderboardEntry, UserProfile } from '../types';

interface GamificationHubProps {
  profile: UserProfile;
  badges: Badge[];
  themes: ShopTheme[];
  leaderboard: LeaderboardEntry[];
  onUnlockTheme: (themeId: string, price: number) => void;
  onApplyTheme: (themeId: string) => void;
  themePrimaryClass: string;
  themeAccentClass: string;
  themeCardClass: string;
}

export default function GamificationHub({
  profile,
  badges,
  themes,
  leaderboard,
  onUnlockTheme,
  onApplyTheme,
  themePrimaryClass,
  themeAccentClass,
  themeCardClass
}: GamificationHubProps) {
  // 1. Compile Live Dynamic Leaderboard
  // Insert the user dynamically based on their actual focus minutes and XP
  const compiledLeaderboard = () => {
    const userEntry: LeaderboardEntry = {
      id: 'user_entry',
      name: `${profile.name} (You)`,
      avatar: profile.avatar || '🎓',
      xp: profile.xp,
      focusMinutes: profile.totalFocusMinutes,
      isUser: true
    };

    // Filter out user entries from initial leaderboard list to prevent duplication
    const cleanList = leaderboard.filter(item => !item.isUser && item.id !== 'user_entry');
    
    // Merge & Sort by XP (and fallback to minutes)
    const sorted = [...cleanList, userEntry].sort((a, b) => b.xp - a.xp);
    
    // Assign ranked numbers
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  };

  const sortedLeaderboard = compiledLeaderboard();
  const userRank = sortedLeaderboard.find(item => item.isUser)?.rank || 8;

  // 2. Icon helper for badges
  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const cls = `w-6 h-6 ${unlocked ? 'text-indigo-400' : 'text-slate-700'}`;
    switch (iconName) {
      case 'Play': return <Award className={cls} />;
      case 'Compass': return <Award className={cls} />;
      case 'Flame': return <Flame className={`${cls} ${unlocked ? 'fill-indigo-500/10' : ''}`} />;
      case 'Calendar': return <Award className={cls} />;
      case 'MessageSquare': return <Award className={cls} />;
      case 'CheckSquare': return <Award className={cls} />;
      case 'Coins': return <Coins className={`${cls} ${unlocked ? 'fill-amber-500/10 text-amber-400' : ''}`} />;
      default: return <Trophy className={cls} />;
    }
  };

  const xpNeeded = profile.level * 150;

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none animate-in fade-in duration-300">
      
      {/* View Header */}
      <div>
        <h2 className="font-sans font-black text-slate-100 uppercase tracking-widest text-lg md:text-xl leading-none">
          Progress Hub & Rewards
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Review your level metrics, compete on the live leaderboard, claim badges, and spend Focus Coins on custom aesthetic themes.
        </p>
      </div>

      {/* Gamification Level Progression Dashboard */}
      <div className={`p-6 rounded-3xl ${themeCardClass} border border-slate-800 bg-slate-900/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        {/* Abstract design elements */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Level Emblem */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex flex-col items-center justify-center text-white shadow-lg border border-indigo-400/30 shrink-0">
            <span className="text-[9px] font-mono uppercase font-black tracking-widest leading-none text-indigo-200">Level</span>
            <span className="text-2xl font-sans font-black leading-none mt-1.5">{profile.level}</span>
          </div>

          <div>
            <h3 className="font-sans font-black text-slate-100 text-xs uppercase tracking-widest">
              Level Progression Milestone
            </h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Accumulate XP by studying. Higher levels unlock premium badge tiers and custom shop discounts!
            </p>
            {/* XP progress metrics */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-48 bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-850">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ width: `${Math.min((profile.xp / xpNeeded) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-slate-300 font-bold">
                {profile.xp} / {xpNeeded} XP
              </span>
            </div>
          </div>
        </div>

        {/* Level bonus / stats summary */}
        <div className="grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 relative z-10">
          <div>
            <div className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Focus Multiplier</div>
            <div className="font-mono text-base font-black text-slate-200 leading-none mt-1.5">
              1.{profile.streak}x XP
            </div>
            <span className="text-[9px] text-slate-400 font-bold mt-1 block">From {profile.streak} day streak</span>
          </div>

          <div>
            <div className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Global Standings</div>
            <div className="font-mono text-base font-black text-indigo-400 leading-none mt-1.5 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-indigo-400 fill-indigo-500/10" />
              Rank #{userRank}
            </div>
            <span className="text-[9px] text-slate-400 font-bold mt-1 block">Out of {sortedLeaderboard.length} students</span>
          </div>
        </div>
      </div>

      {/* Main split grid: Leaderboards vs Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Achievements / Badges Grid (7/12 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Study Badges & Achievements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {badges.map((badge) => {
              const progressPct = Math.min((badge.currentValue / badge.targetValue) * 100, 100);
              return (
                <div
                  key={badge.id}
                  id={`badge-card-${badge.id}`}
                  className={`p-4 rounded-2xl border relative flex flex-col justify-between transition-all hover:scale-[1.02] ${
                    badge.unlocked
                      ? 'border-slate-800 bg-slate-900/60 shadow-lg shadow-indigo-600/5'
                      : 'border-slate-900 opacity-70 bg-slate-950/40'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Badge Icon Slot */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
                      badge.unlocked
                        ? 'bg-slate-950 border-slate-800 text-indigo-400'
                        : 'bg-slate-950/20 border-slate-900/40 text-slate-700'
                    }`}>
                      {getBadgeIcon(badge.iconName, badge.unlocked)}
                    </div>

                    <div className="overflow-hidden">
                      <h4 className={`text-xs font-black uppercase tracking-wider ${badge.unlocked ? 'text-slate-100' : 'text-slate-500'}`}>
                        {badge.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  {/* Achievements progress bar indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-850/60">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-1 font-black uppercase tracking-wider">
                      <span>Progress</span>
                      <span className="font-black text-slate-400">
                        {badge.currentValue} / {badge.targetValue}
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900/30">
                      <div
                        className={`h-full ${badge.unlocked ? 'bg-indigo-500' : 'bg-slate-800'}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Stamp indicator if unlocked */}
                  {badge.unlocked && (
                    <span className="absolute top-2.5 right-2.5 text-[8px] uppercase tracking-wider font-black bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">
                      ✓ Claimed
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dynamic Standings Leaderboard (5/12 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 pl-1">
            <Trophy className="w-3.5 h-3.5 text-indigo-400" />
            <span>Weekly Focus Leaderboard</span>
          </h3>

          <div className={`p-5 rounded-3xl ${themeCardClass} border border-slate-800 bg-slate-900/60 shadow-xl flex flex-col gap-3.5`}>
            <div className="text-[10px] text-slate-400 leading-relaxed mb-1 font-bold">
              Compete weekly against simulated peers in your room. Gain Focus XP on the study timer to climb the ranks!
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-0.5">
              {sortedLeaderboard.map((student) => {
                const isUser = student.isUser;
                
                return (
                  <div
                    key={student.id}
                    className={`p-3 rounded-xl flex items-center justify-between border transition-all ${
                      isUser
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-600/5'
                        : 'border-slate-900 bg-slate-950/40 hover:bg-slate-950'
                    }`}
                  >
                    {/* Rank Badge and Avatar Info */}
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      {/* Rank text or trophy */}
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        student.rank === 1 ? 'bg-amber-400/10 border border-amber-400/20 text-amber-400' :
                        student.rank === 2 ? 'bg-slate-500/10 border border-slate-500/20 text-slate-300' :
                        student.rank === 3 ? 'bg-orange-400/10 border border-orange-400/20 text-orange-400' :
                        'text-slate-600'
                      }`}>
                        {student.rank}
                      </span>

                      {/* Avatar */}
                      <span className="text-lg shrink-0">{student.avatar}</span>
                      
                      {/* Name */}
                      <span className={`text-xs truncate ${isUser ? 'font-black text-slate-100' : 'font-bold text-slate-300'}`}>
                        {student.name}
                      </span>
                    </div>

                    {/* XP display */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-mono font-black text-slate-100">
                        {student.xp} <span className="text-[10px] font-normal text-slate-500">XP</span>
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                        {student.focusMinutes}m focus
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Rewards Shop Section: Theme customizer */}
      <div className={`p-6 rounded-3xl ${themeCardClass} border border-slate-800 bg-slate-900/60 shadow-xl space-y-4`}>
        <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
          <ShoppingBag className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-sans font-black text-slate-100 text-xs uppercase tracking-widest">
              Cosmetics Theme Shop
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-1">
              Exchange your earned Focus Coins for beautiful, immersive workspace themes. Unlocked items are yours forever!
            </p>
          </div>
        </div>

        {/* Shop Items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => {
            const isCurrent = profile.currentThemeId === theme.id;
            const canAfford = profile.focusCoins >= theme.price;
            
            return (
              <div
                key={theme.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-2 border-indigo-600 bg-indigo-600/5 shadow-2xl'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-950'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full ${theme.primaryClass.split(' ')[0]}`} />
                      {theme.title}
                    </h4>
                    
                    {/* Theme Price badge */}
                    {!theme.unlocked ? (
                      <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        🪙 {theme.price}
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        Owned
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal mb-4 font-bold">
                    {theme.description}
                  </p>
                </div>

                {/* Shop Action Button */}
                <div>
                  {theme.unlocked ? (
                    <button
                      onClick={() => onApplyTheme(theme.id)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 rounded-xl text-xs font-black text-center border transition-all ${
                        isCurrent
                          ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-widest cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 uppercase tracking-widest cursor-pointer active:scale-95'
                      }`}
                    >
                      {isCurrent ? 'Theme Active' : 'Apply Workspace Theme'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockTheme(theme.id, theme.price)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl text-xs font-black text-center border transition-all uppercase tracking-widest ${
                        canAfford
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-600/10 cursor-pointer active:scale-95'
                          : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Purchase Theme' : `Need ${theme.price - profile.focusCoins} Coins`}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
