'use client';

import { useState } from 'react';
import { Lightbulb, Unlock, Loader2 } from 'lucide-react';

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';

interface HintPanelProps {
  attemptId: string;
  totalHints: number;
  initialUnlockedHints: string[];
  status: string;
}

export function HintPanel({ attemptId, totalHints, initialUnlockedHints, status }: HintPanelProps) {
  const [unlockedHints, setUnlockedHints] = useState<string[]>(initialUnlockedHints);
  const [unlocking, setUnlocking] = useState(false);

  const canUnlock = unlockedHints.length < totalHints && (status === 'DRAFT' || status === 'FAILED');

  const handleUnlock = async () => {
    if (!canUnlock) return;
    
    if (!confirm('Unlocking a hint will deduct 5 points from your final evaluation score. Are you sure?')) {
      return;
    }

    setUnlocking(true);
    try {
      const nextIndex = unlockedHints.length;
      const res = await fetch(`${SERVER}/api/attempts/${attemptId}/hints`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hintIndex: nextIndex })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUnlockedHints(prev => [...prev, data.hint]);
    } catch (err: any) {
      alert(err.message || 'Failed to unlock hint');
    } finally {
      setUnlocking(false);
    }
  };

  if (totalHints === 0) return null;

  return (
    <div className="text-left mt-8 pt-6 border-t border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest font-mono flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Hints ({unlockedHints.length} / {totalHints})
        </h3>
        
        {canUnlock && (
          <button
            onClick={handleUnlock}
            disabled={unlocking}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 rounded transition-colors disabled:opacity-50"
          >
            {unlocking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
            Unlock Next Hint
          </button>
        )}
      </div>

      {unlockedHints.length > 0 ? (
        <ul className="space-y-3">
          {unlockedHints.map((hint, i) => (
            <li key={i} className="flex gap-3 text-sm text-amber-500/80 bg-amber-500/5 p-3 rounded-md border border-amber-500/10">
              <span className="font-bold shrink-0">#{i + 1}</span>
              <span className="leading-relaxed text-white/80">{hint}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/40 italic">No hints unlocked yet. Unlocking a hint applies a penalty to your final score.</p>
      )}
    </div>
  );
}
