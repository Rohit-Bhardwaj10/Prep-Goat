'use client';

import { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CriterionFeedback {
  criterion: string;
  score: number;
  evidence?: string;
  concern: string;
  suggestion?: string;
}

interface EvaluationResult {
  stageType: string;
  feedback: CriterionFeedback[];
}

interface ScoreCardProps {
  evaluation: EvaluationResult[];
}

const STAGE_LABELS: Record<string, string> = {
  // LLD labels
  REQUIREMENTS: 'Requirements',
  DESIGN: 'Design',         // shown for both LLD (class design) and HLD (architecture diagram)
  EXTENSION: 'Extension & Trade-offs',
};

function scoreColor(score: number) {
  if (score >= 4) return 'text-emerald-400';
  if (score === 3) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBg(score: number) {
  if (score >= 4) return 'bg-emerald-500/10 border-emerald-500/20';
  if (score === 3) return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

// Flatten all criteria across all stages into radar data points
function buildRadarData(evaluation: EvaluationResult[]) {
  return evaluation.flatMap((stage) =>
    stage.feedback.map((fb) => ({
      criterion: fb.criterion.length > 22 ? fb.criterion.slice(0, 20) + '…' : fb.criterion,
      fullCriterion: fb.criterion,
      score: fb.score,
      stage: STAGE_LABELS[stage.stageType] ?? stage.stageType,
    }))
  );
}

function totalScore(evaluation: EvaluationResult[]) {
  const all = evaluation.flatMap((s) => s.feedback);
  return all.reduce((sum, fb) => sum + fb.score, 0);
}

function maxScore(evaluation: EvaluationResult[]) {
  return evaluation.flatMap((s) => s.feedback).length * 5;
}

// Custom tooltip for the radar chart
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-md px-3 py-2 text-xs shadow-lg max-w-[200px]">
      <p className="text-white/90 font-semibold mb-1">{d.fullCriterion}</p>
      <p className="text-white/50 font-mono">{d.stage}</p>
      <p className={`font-bold font-mono mt-1 ${scoreColor(d.score)}`}>{d.score} / 5</p>
    </div>
  );
}

function StageSection({ result }: { result: EvaluationResult }) {
  const [open, setOpen] = useState(true);
  const stageScore = result.feedback.reduce((s, fb) => s + fb.score, 0);
  const stageMax = result.feedback.length * 5;

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
      >
        <div className="flex items-center gap-3">
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          )}
          <span className="text-xs font-bold uppercase tracking-widest font-mono text-white/70">
            {STAGE_LABELS[result.stageType] ?? result.stageType}
          </span>
        </div>
        <span className={`font-mono text-xs font-bold ${scoreColor(stageScore / result.feedback.length)}`}>
          {stageScore} / {stageMax}
        </span>
      </button>

      {open && (
        <div className="divide-y divide-white/5">
          {result.feedback.map((fb, i) => (
            <div key={i} className={`px-4 py-3 border-l-2 ${fb.score >= 4 ? 'border-emerald-500/40' : fb.score === 3 ? 'border-amber-500/40' : 'border-red-500/40'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded border ${scoreBg(fb.score)} ${scoreColor(fb.score)}`}>
                  {fb.score}/5
                </span>
                <span className="text-sm font-semibold text-white/85">{fb.criterion}</span>
              </div>
              {fb.evidence && (
                <div className="my-2 pl-3 border-l border-white/10 text-xs font-mono text-white/50 bg-white/[0.02] py-1 rounded-sm">
                  {fb.evidence}
                </div>
              )}
              <p className="text-sm text-white/70 leading-relaxed">{fb.concern}</p>
              {fb.suggestion && (
                <p className="text-sm text-white/45 italic mt-1.5 flex gap-1">
                  <span className="font-bold not-italic">↳</span> {fb.suggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoreCard({ evaluation }: ScoreCardProps) {
  const radarData = buildRadarData(evaluation);
  const total = totalScore(evaluation);
  const max = maxScore(evaluation);
  const pct = Math.round((total / max) * 100);

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Score Overview</h2>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold font-mono text-white">{total}</span>
            <div className="text-left">
              <p className="text-xs text-white/40 font-mono">/ {max} pts</p>
              <p className={`text-xs font-bold font-mono ${scoreColor(pct / 20)}`}>{pct}%</p>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono mb-4">
            Skill Radar
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="criterion"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'ui-monospace, monospace' }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#ff6b35"
                fill="#ff6b35"
                fillOpacity={0.15}
                strokeWidth={1.5}
                dot={{ r: 3, fill: '#ff6b35', strokeWidth: 0 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Per-stage breakdown */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-mono">
            Criterion Breakdown
          </p>
          {evaluation.map((result, i) => (
            <StageSection key={i} result={result} />
          ))}
        </div>

      </div>
    </div>
  );
}
