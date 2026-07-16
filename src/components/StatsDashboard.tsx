import React from 'react';
import { BarChart3, Clock, Trophy, Flame, Coins, Calendar, ChevronRight, Activity, BookOpen } from 'lucide-react';
import { SessionLog, UserProfile } from '../types';

interface StatsDashboardProps {
  logs: SessionLog[];
  profile: UserProfile;
  themeCardClass: string;
  themeAccentClass: string;
}

export default function StatsDashboard({
  logs,
  profile,
  themeCardClass,
  themeAccentClass
}: StatsDashboardProps) {
  // 1. Calculate General aggregates
  const totalMinutes = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const pomodorosOnly = logs.filter((l) => l.type === 'pomodoro');
  const totalCompletedPomos = pomodorosOnly.length;
  
  const totalCoinsEarned = logs.reduce((acc, log) => acc + log.earnedCoins, 0);
  const totalXpEarned = logs.reduce((acc, log) => acc + log.earnedXp, 0);

  // 2. Weekly Bar Chart Data (Last 7 Days)
  // Let's gather the actual focus minutes completed in the last 7 days.
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Build a map of the last 7 days focus minutes (Mon-Sun or Sun-Sat)
  const getWeeklyData = () => {
    const data: { label: string; dateStr: string; minutes: number }[] = [];
    const today = new Date();
    
    // Generate last 7 days starting from 6 days ago
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayLabel = daysOfWeek[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      
      // Filter logs for this specific calendar date
      const daysLogs = logs.filter((log) => {
        const logDateStr = log.timestamp.split('T')[0];
        return logDateStr === dateStr && log.type === 'pomodoro';
      });
      
      const totalDaysMins = daysLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
      data.push({
        label: dayLabel,
        dateStr,
        minutes: totalDaysMins
      });
    }
    return data;
  };

  const weeklyData = getWeeklyData();
  const maxWeeklyMins = Math.max(...weeklyData.map((d) => d.minutes), 30); // scale height based on max minutes, minimum 30

  // 3. Subject Segmented Breakdown
  const categoriesList = ['Math', 'Science', 'Coding', 'Writing', 'Exam Prep', 'Other'] as const;
  const categoryStats = categoriesList.map((cat) => {
    const catLogs = logs.filter((l) => l.category === cat && l.type === 'pomodoro');
    const catMins = catLogs.reduce((acc, l) => acc + l.durationMinutes, 0);
    return {
      category: cat,
      minutes: catMins,
      percentage: totalMinutes > 0 ? Math.round((catMins / totalMinutes) * 100) : 0
    };
  }).sort((a, b) => b.minutes - a.minutes);

  // Category Color mapping helper
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'Math': return { bg: 'bg-blue-500', text: 'text-blue-400', pill: 'bg-blue-500/15 text-blue-400 border-blue-500/20' };
      case 'Science': return { bg: 'bg-teal-500', text: 'text-teal-400', pill: 'bg-teal-500/15 text-teal-400 border-teal-500/20' };
      case 'Coding': return { bg: 'bg-indigo-500', text: 'text-indigo-400', pill: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' };
      case 'Writing': return { bg: 'bg-amber-500', text: 'text-amber-400', pill: 'bg-amber-500/15 text-amber-400 border-amber-500/20' };
      case 'Exam Prep': return { bg: 'bg-rose-500', text: 'text-rose-400', pill: 'bg-rose-500/15 text-rose-400 border-rose-500/20' };
      default: return { bg: 'bg-slate-500', text: 'text-slate-400', pill: 'bg-slate-800 text-slate-300 border border-slate-700' };
    }
  };

  const formatTimestamp = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      return { timeStr, dateStr };
    } catch {
      return { timeStr: '--:--', dateStr: 'Date unknown' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none animate-in fade-in duration-300">
      
      {/* Header Info */}
      <div>
        <h2 className="font-sans font-black text-slate-100 uppercase tracking-widest text-lg md:text-xl leading-none">
          Performance Analytics & Insights
        </h2>
        <p className="text-xs text-slate-400 mt-2">
          Detailed metrics of your learning journey, completed sessions, and subjects focus ratio.
        </p>
      </div>

      {/* Aggregate metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Time */}
        <div className={`p-5 rounded-2xl ${themeCardClass} border border-slate-850/80 shadow-sm flex items-center gap-4`}>
          <div className="p-3 rounded-xl bg-slate-950 text-indigo-400 border border-slate-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-xl font-black text-slate-100 leading-tight">
              {totalHours}h
            </div>
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Total Focus</span>
          </div>
        </div>

        {/* Sessions Completed */}
        <div className={`p-5 rounded-2xl ${themeCardClass} border border-slate-850/80 shadow-sm flex items-center gap-4`}>
          <div className="p-3 rounded-xl bg-slate-950 text-indigo-400 border border-slate-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono text-xl font-black text-slate-100 leading-tight">
              {totalCompletedPomos}
            </div>
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Pomodoros</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className={`p-5 rounded-2xl ${themeCardClass} border border-slate-850/80 shadow-sm flex items-center gap-4`}>
          <div className="p-3 rounded-xl bg-slate-950 text-orange-400 border border-slate-800">
            <Flame className="w-5 h-5 fill-orange-500/10" />
          </div>
          <div>
            <div className="font-mono text-xl font-black text-slate-100 leading-tight">
              {profile.streak} Day{profile.streak !== 1 ? 's' : ''}
            </div>
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Study Streak</span>
          </div>
        </div>

        {/* Focus Coins */}
        <div className={`p-5 rounded-2xl ${themeCardClass} border border-slate-850/80 shadow-sm flex items-center gap-4`}>
          <div className="p-3 rounded-xl bg-slate-950 text-amber-400 border border-slate-800">
            <Coins className="w-5 h-5 fill-amber-500/10" />
          </div>
          <div>
            <div className="font-mono text-xl font-black text-slate-100 leading-tight">
              {profile.focusCoins}
            </div>
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Coins Earned</span>
          </div>
        </div>
      </div>

      {/* Charts Section: Weekly Progress and Subject Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Weekly focus Bar Chart */}
        <div className={`md:col-span-7 p-6 rounded-3xl ${themeCardClass} border border-slate-800 shadow-xl`}>
          <h3 className="font-sans font-black text-slate-100 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            Weekly Focus Pattern (Minutes)
          </h3>

          {/* SVG Rendered Responsive Bar Chart */}
          <div className="w-full h-56 flex flex-col justify-end mt-4">
            <div className="flex-1 flex items-end justify-between px-2 gap-4 h-40">
              {weeklyData.map((day, idx) => {
                // Calculate percentage height
                const barHeightPct = (day.minutes / maxWeeklyMins) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                    {/* Tooltip on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 bg-slate-950 text-slate-100 border border-slate-800 text-[10px] font-mono px-2 py-1 rounded-md absolute transform -translate-y-12 transition-all pointer-events-none shadow-md z-10 whitespace-nowrap">
                      {day.minutes}m focus
                    </div>
                    {/* Active Bar */}
                    <div
                      className="w-full bg-indigo-600 rounded-t-lg transition-all duration-500 hover:bg-indigo-500 shadow-sm relative cursor-pointer"
                      style={{ height: `${Math.max(barHeightPct, 4)}%` }}
                    >
                      {day.minutes > 0 && (
                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-mono font-black text-slate-400">
                          {day.minutes}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom X-Axis Divider */}
            <div className="h-[1px] bg-slate-800 w-full mt-2" />

            {/* X-Axis labels */}
            <div className="flex justify-between px-2 mt-2">
              {weeklyData.map((day, idx) => (
                <div key={idx} className="flex-1 text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Ratio segmented progress board */}
        <div className={`md:col-span-5 p-6 rounded-3xl ${themeCardClass} border border-slate-800 shadow-xl flex flex-col`}>
          <h3 className="font-sans font-black text-slate-100 text-xs uppercase tracking-widest mb-4.5 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            Focus Ratio by Subject
          </h3>

          {totalMinutes === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 border border-dashed border-slate-800 rounded-2xl text-slate-500 text-center">
              <span className="text-xl mb-1">📊</span>
              <p className="text-xs uppercase font-bold tracking-wider leading-relaxed">No focus data logged yet. Complete a focus session to unlock ratio stats!</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center space-y-4">
              {/* Segmented Cumulative Bar */}
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 flex overflow-hidden">
                {categoryStats.filter(c => c.minutes > 0).map((stat) => (
                  <div
                    key={stat.category}
                    className={`${getCategoryTheme(stat.category).bg} h-full transition-all`}
                    style={{ width: `${stat.percentage}%` }}
                    title={`${stat.category}: ${stat.minutes}m (${stat.percentage}%)`}
                  />
                ))}
              </div>

              {/* Rows detail */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categoryStats.map((stat) => {
                  const colors = getCategoryTheme(stat.category);
                  if (stat.minutes === 0) return null;
                  return (
                    <div key={stat.category} className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-950 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors.bg}`} />
                        <span className="font-bold text-slate-300">{stat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-100 font-bold">{stat.minutes}m</span>
                        <span className="text-[9px] font-mono text-slate-500">({stat.percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Chronological Focus Session history feed */}
      <div className={`p-6 rounded-3xl ${themeCardClass} border border-slate-800 shadow-xl`}>
        <div className="flex items-center justify-between mb-4.5">
          <h3 className="font-sans font-black text-slate-100 text-xs uppercase tracking-widest flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Study Session History Log
          </h3>
          <span className="text-[9px] font-mono text-slate-500 uppercase font-black tracking-widest">
            Total focus events: {logs.length}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 border border-dashed border-slate-800 rounded-3xl text-center text-slate-500 text-xs uppercase font-bold tracking-wider">
            No study sessions recorded in this cycle. Power up the timer and let's get focused!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-widest font-black text-[9px] h-10">
                  <th className="pb-2">Date & Time</th>
                  <th className="pb-2">Session Type</th>
                  <th className="pb-2">Subject / Linked Task</th>
                  <th className="pb-2">Focus Block</th>
                  <th className="pb-2 text-right">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {logs.slice().reverse().map((log) => {
                  const { timeStr, dateStr } = formatTimestamp(log.timestamp);
                  const isBreak = log.type !== 'pomodoro';
                  const catTheme = getCategoryTheme(log.category);

                  return (
                    <tr key={log.id} className="hover:bg-slate-950/45 h-12 transition-colors">
                      <td className="py-2.5 text-slate-400">
                        <div className="font-bold text-slate-300">{timeStr}</div>
                        <div className="text-[10px] text-slate-500">{dateStr}</div>
                      </td>
                      <td className="py-2.5 capitalize font-medium">
                        {isBreak ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-black text-[9px] uppercase tracking-wider">
                            ☕ {log.type.replace('_', ' ')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-black text-[9px] border border-indigo-500/20 uppercase tracking-wider">
                            🍅 Focus Session
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {isBreak ? (
                          <span className="text-slate-500 italic">Recharging battery</span>
                        ) : (
                          <div>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider mr-1.5 border ${catTheme.pill}`}>
                              {log.category}
                            </span>
                            <span className="text-slate-300 font-bold truncate inline-block max-w-[160px] align-middle">
                              {log.taskTitle || 'Deep Study block'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-slate-100 font-black">
                        {log.durationMinutes}m
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold">
                        {log.earnedXp > 0 && (
                          <span className="text-emerald-400" title="XP Earned">
                            +{log.earnedXp} XP
                          </span>
                        )}
                        {log.earnedCoins > 0 && (
                          <span className="text-amber-400 ml-2" title="Focus Coins Earned">
                            +{log.earnedCoins}🪙
                          </span>
                        )}
                        {log.earnedXp === 0 && log.earnedCoins === 0 && (
                          <span className="text-slate-600 font-normal">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
