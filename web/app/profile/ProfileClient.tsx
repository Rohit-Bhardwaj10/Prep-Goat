'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2, TrendingUp, Lightbulb, CheckCircle2, Activity } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface Stats {
  totalAttempts: number;
  completed: number;
  byDifficulty: { EASY: number; MEDIUM: number; HARD: number };
  totalByDifficulty: { EASY: number; MEDIUM: number; HARD: number };
  averageScore: number;
  totalHintsUsed: number;
  heatmap: { date: string; count: number }[];
  recentAttempts: {
    id: string;
    problemId: string;
    problemTitle: string;
    difficulty: string;
    score: number | null;
    status: string;
    createdAt: string;
  }[];
}

const DIFF_COLORS = {
  EASY: '#00b8a3', 
  MEDIUM: '#ffc01e',
  HARD: '#ff375f', 
} as const;

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

function SegmentedRing({ byDifficulty, totalByDifficulty }: Pick<Stats, 'byDifficulty' | 'totalByDifficulty'>) {
  const totalSolved = byDifficulty.EASY + byDifficulty.MEDIUM + byDifficulty.HARD;
  const totalProblems = totalByDifficulty.EASY + totalByDifficulty.MEDIUM + totalByDifficulty.HARD;

  const r = 42;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  const easyPct = totalProblems > 0 ? byDifficulty.EASY / totalProblems : 0;
  const medPct = totalProblems > 0 ? byDifficulty.MEDIUM / totalProblems : 0;
  const hardPct = totalProblems > 0 ? byDifficulty.HARD / totalProblems : 0;

  const easyLen = easyPct * circumference;
  const medLen = medPct * circumference;
  const hardLen = hardPct * circumference;

  const medOffset = -easyLen;
  const hardOffset = -(easyLen + medLen);

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 flex flex-col md:flex-row items-center gap-8 md:gap-12">
      {/* Ring */}
      <div className="relative w-28 h-28 shrink-0">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="-rotate-90">
          {/* Base Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth="3" />
          
          {/* Segments */}
          {easyLen > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={DIFF_COLORS.EASY} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${easyLen} ${circumference}`} strokeDashoffset={0} />
          )}
          {medLen > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={DIFF_COLORS.MEDIUM} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${medLen} ${circumference}`} strokeDashoffset={medOffset} />
          )}
          {hardLen > 0 && (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={DIFF_COLORS.HARD} strokeWidth="4" strokeLinecap="round"
              strokeDasharray={`${hardLen} ${circumference}`} strokeDashoffset={hardOffset} />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-semibold text-white">{totalSolved}</span>
            <span className="text-xs text-white/40">/{totalProblems}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-white/50 mt-1">
             <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Solved
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="flex-1 w-full space-y-3">
        {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
          <div key={diff} className="bg-[#2a2a2a]/30 rounded-md p-2.5 px-3.5 flex flex-col">
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <span style={{ color: DIFF_COLORS[diff] }} className="font-medium">{diff.charAt(0) + diff.slice(1).toLowerCase()}</span>
              <span className="text-white/90 font-medium">
                {byDifficulty[diff]} <span className="text-white/40 font-normal">/ {totalByDifficulty[diff]}</span>
              </span>
            </div>
            {/* Mini progress bar */}
            <div className="w-full h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${totalByDifficulty[diff] > 0 ? (byDifficulty[diff] / totalByDifficulty[diff]) * 100 : 0}%`,
                  backgroundColor: DIFF_COLORS[diff]
                }} 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Heatmap logic
function buildHeatmapData(heatmap: Stats['heatmap']) {
  const countByDate = new Map(heatmap.map((h) => [h.date, h.count]));
  
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  start.setDate(start.getDate() - 52 * 7);
  start.setDate(start.getDate() - start.getDay()); // align to Sunday

  const weeks: { date: string; count: number }[][] = [];
  let current = new Date(start);
  
  let currentStreak = 0;
  let maxStreak = 0;
  let activeDays = 0;
  let submissionsInPastYear = 0;

  // Calculate streaks
  let tempDate = new Date(today);
  while (true) {
      const dStr = tempDate.toISOString().split('T')[0];
      if ((countByDate.get(dStr) || 0) > 0) {
          currentStreak++;
          tempDate.setDate(tempDate.getDate() - 1);
      } else {
          if (tempDate.toISOString().split('T')[0] === today.toISOString().split('T')[0]) {
             tempDate.setDate(tempDate.getDate() - 1);
             continue; // ignore if today is 0 for current streak
          }
          break;
      }
  }

  let localStreak = 0;
  while (current <= end) {
    const week: { date: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().split('T')[0];
      const count = countByDate.get(dateStr) || 0;
      week.push({ date: dateStr, count });
      
      if (count > 0) {
        localStreak++;
        activeDays++;
        submissionsInPastYear += count;
        if (localStreak > maxStreak) maxStreak = localStreak;
      } else {
        localStreak = 0;
      }
      
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  
  return { weeks, maxStreak, currentStreak, activeDays, submissionsInPastYear };
}

function cellColor(count: number) {
  if (count === 0) return 'bg-[#2a2a2a]';
  if (count === 1) return 'bg-[#0e4429]'; 
  if (count === 2) return 'bg-[#006d32]';
  if (count === 3) return 'bg-[#26a641]';
  return 'bg-[#39d353]';
}

function Heatmap({ heatmap }: { heatmap: Stats['heatmap'] }) {
  const { weeks, maxStreak, currentStreak, activeDays, submissionsInPastYear } = buildHeatmapData(heatmap);
  const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const month = new Date(week[0].date).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_LABELS[month], col });
      lastMonth = month;
    }
  });

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 flex-1 min-w-0 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 text-sm">
        <span className="text-white/90 font-medium">
          {submissionsInPastYear} submissions in the past one year
        </span>
        <div className="flex items-center gap-4 text-white/50 text-[11px] md:text-xs">
          <span>Total active days: <span className="text-white font-medium">{activeDays}</span></span>
          <span>Max streak: <span className="text-white font-medium">{maxStreak}</span></span>
          <span>Current streak: <span className="text-white font-medium">{currentStreak}</span></span>
        </div>
      </div>

      <div className="relative mb-2 h-4 w-full">
        {monthLabels.map(({ label, col }) => (
          <span
            key={`${label}-${col}`}
            className="absolute text-xs text-white/40"
            style={{ left: col * 14 }} // 11px cell + 3px gap = 14px per week
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.count} submissions`}
                className={`w-[11px] h-[11px] rounded-[2px] ${cellColor(cell.count)} transition-opacity hover:opacity-80 cursor-pointer`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentAttempts({ recentAttempts }: { recentAttempts: Stats['recentAttempts'] }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden flex flex-col">
      <div className="flex items-center gap-6 px-5 py-3 border-b border-[#2a2a2a] bg-[#1e1e1e]/50">
        <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Recent AC
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm cursor-pointer hover:text-white transition-colors">
          <Activity className="w-4 h-4" />
          List
        </div>
      </div>
      
      {recentAttempts.length === 0 ? (
        <div className="p-8 text-center text-white/40 text-sm">
          No recent attempts.
        </div>
      ) : (
        <div className="divide-y divide-[#2a2a2a]">
          {recentAttempts.map(a => (
            <Link 
              key={a.id} 
              href={`/problems/${a.problemId}/attempt/${a.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-[#2a2a2a]/30 transition-colors group"
            >
              <span className="text-white/80 font-medium text-sm group-hover:text-white transition-colors">
                {a.problemTitle}
              </span>
              <span className="text-white/40 text-xs">
                {timeAgo(a.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LeftSidebar({ session, stats }: { session: any, stats: Stats }) {
  const avatarLetter = session.user.name?.[0]?.toUpperCase() || session.user.email[0].toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Profile Info */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-5 flex flex-col">
        <div className="flex gap-4 items-center md:items-start md:flex-col">
          <div className="w-20 h-20 rounded-xl bg-[#2a2a2a] flex items-center justify-center shrink-0">
             <span className="text-3xl font-bold text-white/80">
                {avatarLetter}
             </span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">{session.user.name || 'Anonymous'}</h1>
            <p className="text-sm text-white/40">{session.user.email}</p>
          </div>
        </div>
        
        <button className="w-full mt-5 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-emerald-500 font-medium text-sm rounded transition-colors border border-emerald-500/10">
          Edit Profile
        </button>

        <div className="mt-6 space-y-4 pt-6 border-t border-[#2a2a2a]">
           <h3 className="text-white/80 font-medium text-sm mb-3">Community Stats</h3>
           
           <div className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                 <CheckCircle2 className="w-4 h-4 text-blue-400" />
                 Attempts
              </div>
              <span className="text-white font-medium">{stats.totalAttempts}</span>
           </div>

           <div className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                 <TrendingUp className="w-4 h-4 text-emerald-400" />
                 Avg Score
              </div>
              <span className="text-white font-medium">{stats.averageScore > 0 ? `${stats.averageScore}%` : '—'}</span>
           </div>

           <div className="flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2 text-white/60 group-hover:text-white transition-colors">
                 <Lightbulb className="w-4 h-4 text-amber-400" />
                 Hints Used
              </div>
              <span className="text-white font-medium">{stats.totalHintsUsed}</span>
           </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileClient() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace('/login');
    }
  }, [session, sessionPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch(`${SERVER}/api/attempts/stats`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setError('Failed to load profile stats.'))
      .finally(() => setLoading(false));
  }, [session]);

  if (sessionPending || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-white/30 animate-spin" />
      </div>
    );
  }

  if (error || !stats || !session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/40 text-sm">
        {error || 'Something went wrong.'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        
        {/* LEFT COLUMN */}
        <LeftSidebar session={session} stats={stats} />

        {/* RIGHT COLUMN */}
        <div className="space-y-4 min-w-0">
          <SegmentedRing byDifficulty={stats.byDifficulty} totalByDifficulty={stats.totalByDifficulty} />
          <Heatmap heatmap={stats.heatmap} />
          <RecentAttempts recentAttempts={stats.recentAttempts} />
        </div>

      </main>
    </div>
  );
}
