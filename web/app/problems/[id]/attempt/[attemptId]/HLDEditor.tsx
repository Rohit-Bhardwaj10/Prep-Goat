'use client';

import { useEffect, useRef, useState, useCallback, useTransition } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Loader2,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { startAttempt } from '../../actions';
import { HintPanel } from './HintPanel';
import { ScoreCard } from './ScoreCard';

// tldraw is a heavy ESM-only bundle — import client-side only
const TldrawEditor = dynamic(
  () => import('./TldrawEditor').then((m) => m.TldrawEditor),
  { ssr: false, loading: () => <div className="flex-1 flex items-center justify-center bg-[#111] text-white/30 text-sm font-mono">Loading canvas…</div> }
);

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
const AUTO_SAVE_INTERVAL = 30_000;

interface Stage {
  stageType: 'REQUIREMENTS' | 'DESIGN' | 'EXTENSION';
  content: string;
  status: string;
}

interface Attempt {
  id: string;
  problemId: string;
  status: string;
  stages: Stage[];
  evaluation?: any;
  problem?: { sampleSolution?: string };
}

interface Problem {
  title: string;
  description: string;
  type: string;
  requirements: string[];
  constraints: string[];
  testCases?: string[];
  extensibilityHooks?: string[];
  hints?: string[];
  totalHints?: number;
  sampleSolution?: string;
}

const STAGES = ['REQUIREMENTS', 'DESIGN', 'EXTENSION'] as const;
type StageType = (typeof STAGES)[number];

const STAGE_META: Record<StageType, { label: string; prompt: string }> = {
  REQUIREMENTS: {
    label: 'Requirements',
    prompt: `Clarify the scope of this system design.\n\nAsk yourself:\n• What are the core functional requirements?\n• What scale do we target (users, QPS, data size)?\n• What are the SLAs and non-functional requirements?\n• What is explicitly out of scope?\n\nList your final requirements clearly, one per line.`,
  },
  DESIGN: {
    label: 'Architecture Diagram',
    prompt: `Draw your high-level architecture on the canvas.\n\nThink about:\n• What major components / services do you need?\n• How do they communicate (REST, gRPC, async queues)?\n• Where does data flow between them?\n• What are your storage choices and why?\n\nUse boxes for services, arrows for data flow, labels for protocols.`,
  },
  EXTENSION: {
    label: 'Scale & Trade-offs',
    prompt: `Annotate your diagram or add notes for:\n\n• Where are the bottlenecks at 100× scale?\n• What caching, sharding, or replication strategies apply?\n• What trade-offs did you make (CAP theorem, latency vs consistency)?\n• What would you change with more time?`,
  },
};

interface HLDEditorProps {
  attemptId: string;
  problemId: string;
  problem: Problem;
}

export function HLDEditor({ attemptId, problemId, problem }: HLDEditorProps) {
  const [contents, setContents] = useState<Record<StageType, string>>({
    REQUIREMENTS: '',
    DESIGN: '',
    EXTENSION: '',
  });
  const [activeStage, setActiveStage] = useState<StageType>('REQUIREMENTS');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [attemptStatus, setAttemptStatus] = useState<string>('DRAFT');
  const [sidebarWidth, setSidebarWidth] = useState(440);
  const [isPending, startTransition] = useTransition();
  const [resultTab, setResultTab] = useState<'evaluation' | 'scorecard' | 'solution' | 'submission'>('scorecard');
  const [sampleSolution, setSampleSolution] = useState<string | null>(null);

  const contentsRef = useRef(contents);
  contentsRef.current = contents;
  const isDragging = useRef(false);

  // ── Load existing attempt data ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${SERVER}/api/attempts/${attemptId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data: { attempt: Attempt }) => {
        const map: Record<string, string> = {};
        data.attempt.stages.forEach((s) => { map[s.stageType] = s.content; });
        setContents({
          REQUIREMENTS: map['REQUIREMENTS'] || '',
          DESIGN: map['DESIGN'] || '',
          EXTENSION: map['EXTENSION'] || '',
        });
        setAttemptStatus(data.attempt.status);
        if (data.attempt.evaluation) setEvaluation(data.attempt.evaluation.results);
        if (data.attempt.problem?.sampleSolution) setSampleSolution(data.attempt.problem.sampleSolution);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [attemptId]);

  // ── Resizable sidebar ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      setSidebarWidth(Math.max(280, Math.min(e.clientX, 700)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = 'default';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // ── Save helpers ────────────────────────────────────────────────────────────
  const saveStage = useCallback(
    async (type: StageType, content: string) => {
      await fetch(`${SERVER}/api/attempts/${attemptId}/stages`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageType: type, content }),
      });
    },
    [attemptId]
  );

  // For text-only stages (REQUIREMENTS, EXTENSION) we still auto-save
  const saveTextStages = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await Promise.all(
        (['REQUIREMENTS', 'EXTENSION'] as StageType[]).map((type) =>
          saveStage(type, contentsRef.current[type])
        )
      );
      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  }, [saveStage]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && attemptStatus === 'DRAFT') saveTextStages();
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [loading, saveTextStages, attemptStatus]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (attemptStatus === 'DRAFT') saveTextStages();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [attemptStatus, saveTextStages]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!confirm('Submit your HLD attempt? You cannot edit after submitting.')) return;
    await saveTextStages();
    setSubmitting(true);
    try {
      const res = await fetch(`${SERVER}/api/attempts/${attemptId}/submit`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit evaluation');
      } else {
        setEvaluation(data.evaluation.results);
        setAttemptStatus('COMPLETED');
        setResultTab('scorecard');
        const fresh = await fetch(`${SERVER}/api/attempts/${attemptId}`, { credentials: 'include' });
        const freshData = await fresh.json();
        if (freshData.attempt?.problem?.sampleSolution) setSampleSolution(freshData.attempt.problem.sampleSolution);
      }
    } catch {
      alert('An unexpected error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeIndex = STAGES.indexOf(activeStage);
  const canGoBack = activeIndex > 0;
  const canGoNext = activeIndex < STAGES.length - 1;

  const isCanvasStage = activeStage === 'DESIGN';

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-white font-sans selection:bg-white/20">

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/problems/${problemId}`}
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-white text-sm font-semibold">{problem.title}</span>
          <span className="ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-sky-500/10 text-sky-400 border border-sky-500/20">
            HLD
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm bg-white/10 text-white/80 border border-white/10">
            {attemptStatus}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="flex items-center gap-1 text-xs text-white/50 font-mono">
              <Clock className="w-3 h-3" />
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {attemptStatus === 'DRAFT' && (
            <button
              onClick={saveTextStages}
              disabled={saveStatus === 'saving'}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-[#2a2a2a] hover:bg-[#333] border border-white/5 text-sm font-medium text-white/90 transition-all disabled:opacity-50"
            >
              {saveStatus === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
               saveStatus === 'saved'  ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> :
               <Save className="w-3.5 h-3.5" />}
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved!' : 'Save Draft'}
            </button>
          )}
          {attemptStatus === 'COMPLETED' ? (
            <button
              onClick={() => startTransition(() => startAttempt(problemId))}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded bg-[#ff6b35] hover:bg-[#e05a2a] text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Re-attempt
            </button>
          ) : (
            <button
              onClick={canGoNext ? () => setActiveStage(STAGES[activeIndex + 1]) : handleSubmit}
              disabled={submitting || attemptStatus !== 'DRAFT'}
              className="px-3.5 py-1.5 rounded bg-[#ff6b35] hover:bg-[#e05a2a] text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && !canGoNext ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {attemptStatus === 'DRAFT'
                ? canGoNext ? 'Next' : 'Submit'
                : 'Submitted'}
            </button>
          )}
        </div>
      </header>

      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR — Problem context */}
        <aside
          style={{ width: sidebarWidth }}
          className="shrink-0 flex flex-col overflow-hidden relative border-r border-white/10 bg-[#0a0a0a]"
        >
          {/* Stage navigation dots */}
          <div className="flex items-center justify-center gap-4 h-12 border-b border-white/10 shrink-0 bg-white/5">
            <button
              onClick={() => canGoBack && setActiveStage(STAGES[activeIndex - 1])}
              disabled={!canGoBack}
              className="text-white/40 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-2 items-center">
              {STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  title={STAGE_META[stage].label}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeStage === stage
                      ? 'bg-[#ff6b35] ring-2 ring-[#ff6b35]/30 w-2.5 h-2.5'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => canGoNext && setActiveStage(STAGES[activeIndex + 1])}
              disabled={!canGoNext}
              className="text-white/40 hover:text-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable context */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8">
            <div className="text-left">
              <span className="inline-flex px-2 py-0.5 bg-white/5 rounded-sm border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 mb-4 font-mono">
                {STAGE_META[activeStage].label}
              </span>
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line font-medium">
                {STAGE_META[activeStage].prompt}
              </p>
            </div>

            <div className="border-t border-white/10 pt-6 text-left">
              <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-mono">
                Problem Context
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">{problem.description}</p>
            </div>

            {problem.requirements?.length > 0 && (
              <div className="text-left">
                <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-mono">Requirements</h3>
                <ul className="space-y-3">
                  {problem.requirements.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="text-[#ff6b35] font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {problem.constraints?.length > 0 && (
              <div className="text-left">
                <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-mono">Constraints & Scale</h3>
                <ul className="space-y-3">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="text-[#ff6b35] font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {problem.testCases && problem.testCases.length > 0 && (
              <div className="text-left">
                <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-mono">Test Scenarios</h3>
                <ul className="space-y-3">
                  {problem.testCases.map((tc, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="text-[#ff6b35] font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{tc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {problem.extensibilityHooks && problem.extensibilityHooks.length > 0 && (
              <div className="text-left">
                <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 font-mono">Extension Scenarios</h3>
                <ul className="space-y-3">
                  {problem.extensibilityHooks.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/70">
                      <span className="text-[#ff6b35] font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <HintPanel
              attemptId={attemptId}
              totalHints={problem.totalHints || 0}
              initialUnlockedHints={problem.hints || []}
              status={attemptStatus}
            />
          </div>
        </aside>

        {/* DRAG HANDLE */}
        <div
          className="w-1 cursor-col-resize bg-transparent hover:bg-white/10 active:bg-white/20 shrink-0 transition-colors z-10"
          onMouseDown={() => {
            isDragging.current = true;
            document.body.style.cursor = 'col-resize';
          }}
        />

        {/* RIGHT — Canvas / Text editor / Evaluation */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">

          {/* Evaluation tab bar (shown once submitted) */}
          {evaluation && (
            <div className="flex items-center gap-8 border-b border-white/10 px-8 pt-6 shrink-0 bg-[#0a0a0a]">
              <button
                onClick={() => setResultTab('scorecard')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${resultTab === 'scorecard' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
              >
                Score Overview
              </button>
              <button
                onClick={() => setResultTab('evaluation')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${resultTab === 'evaluation' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
              >
                Full Breakdown
              </button>
              {sampleSolution && (
                <button
                  onClick={() => setResultTab('solution')}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${resultTab === 'solution' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
                >
                  Sample Solution
                </button>
              )}
              <button
                onClick={() => setResultTab('submission')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${resultTab === 'submission' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
              >
                My Submission
              </button>
            </div>
          )}

          {/* ── Evaluation results views ── */}
          {evaluation && resultTab === 'scorecard' ? (
            <ScoreCard evaluation={evaluation} />
          ) : evaluation && resultTab === 'solution' && sampleSolution ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                  <h2 className="text-xl font-bold text-white">Sample Solution</h2>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-bold uppercase tracking-wider font-mono">Reference</span>
                </div>
                <pre className="font-mono text-sm text-white/80 leading-relaxed whitespace-pre-wrap bg-white/[0.03] border border-white/10 rounded-xl p-6">{sampleSolution}</pre>
              </div>
            </div>
          ) : evaluation && resultTab === 'evaluation' ? (
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Evaluation Results</h2>
                  <div className="px-3 py-1 bg-white/5 text-[#ff6b35] border border-white/10 rounded text-xs font-bold uppercase tracking-wider font-mono">Completed</div>
                </div>
                {evaluation.map((res: any, i: number) => (
                  <div key={i} className="space-y-4">
                    <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest border-b border-white/10 pb-2">{res.stageType}</h3>
                    <div className="grid gap-4">
                      {res.feedback.map((item: any, j: number) => {
                        const isPass = item.score >= 4;
                        const isWarn = item.score === 3;
                        return (
                          <div key={j} className="text-sm p-4 rounded-md border border-white/10 bg-white/5 space-y-3">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className={`font-mono text-xs font-bold ${isPass ? 'text-emerald-500' : isWarn ? 'text-amber-500' : 'text-red-500'}`}>
                                [{item.score}/5]
                              </span>
                              <strong className="text-white/90">{item.criterion}</strong>
                            </div>
                            {item.evidence && (
                              <div className="pl-3 border-l-2 border-white/20 text-xs text-white/60 font-mono bg-white/[0.02] py-1.5">{item.evidence}</div>
                            )}
                            <p className="text-white/80 leading-relaxed">{item.concern}</p>
                            {item.suggestion && (
                              <p className="text-white/50 italic flex gap-1 mt-2">
                                <span className="font-bold">↳</span> {item.suggestion}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ── Active working view ──
            <>
              {/* Stage label bar */}
              <div className="flex items-center justify-between px-6 h-12 border-b border-white/10 bg-white/5 shrink-0">
                <span className="text-xs font-bold font-mono text-white/50 uppercase tracking-wider">
                  {STAGE_META[activeStage].label}
                </span>
                {isCanvasStage && (
                  <span className="text-xs font-mono text-sky-400/60 uppercase tracking-wider">
                    tldraw canvas — auto-saved
                  </span>
                )}
              </div>

              {/* DESIGN stage → tldraw canvas (always rendered but hidden when not active to preserve state) */}
              <div className={`flex-1 overflow-hidden ${!isCanvasStage ? 'hidden' : 'flex'}`}>
                <TldrawEditor
                  key={`${attemptId}-DESIGN`}
                  attemptId={attemptId}
                  stageType="DESIGN"
                  initialContent={contents['DESIGN']}
                  disabled={attemptStatus !== 'DRAFT'}
                  onSaveStatusChange={setSaveStatus}
                />
              </div>

              {/* REQUIREMENTS / EXTENSION → plain textarea */}
              {!isCanvasStage && (
                <div className="flex-1 overflow-y-auto no-scrollbar flex">
                  <textarea
                    key={activeStage}
                    value={contents[activeStage]}
                    onChange={(e) =>
                      setContents((prev) => ({ ...prev, [activeStage]: e.target.value }))
                    }
                    disabled={attemptStatus !== 'DRAFT'}
                    placeholder={
                      activeStage === 'REQUIREMENTS'
                        ? '// List your functional requirements, scale targets, and assumptions…'
                        : '// Describe bottlenecks, caching strategies, trade-offs, and what you\'d improve…'
                    }
                    className="w-full h-full p-6 bg-transparent text-sm font-mono text-white/85 leading-relaxed resize-none outline-none placeholder:text-white/20 disabled:opacity-60"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
