'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Lock, Bookmark, Download, Play, Copy } from 'lucide-react';
import { startAttempt } from './actions';
import { Navbar } from '@/components/Navbar';
import { authClient } from '@/lib/auth-client';

interface Problem {
  id: string;
  type: 'HLD' | 'LLD';
  title: string;
  description: string;
  requirements: string[];
  constraints: string[];
  testCases?: string[];
  extensibilityHooks?: string[];
}

interface ProblemDetailClientProps {
  problem: Problem;
  initialAttempts: any[];
}

export function ProblemDetailClient({ problem, initialAttempts }: ProblemDetailClientProps) {
  const [isPending, startTransition] = useTransition();
  const [attempts, setAttempts] = useState<any[]>(initialAttempts);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'requirements' | 'constraints' | 'testCases' | 'extensibility'>('requirements');
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/attempts?problemId=${problem.id}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.attempts) {
          setAttempts(data.attempts);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingHistory(false));
  }, [problem.id]);

  const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d] font-sans text-white selection:bg-white/20">
      <Navbar />

      <main className="flex-1 w-full max-w-[1400px] mx-auto pb-20 px-4 md:px-8 pt-4">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 pb-6 border-b border-white/5">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-widest text-[#ff6b35] mb-4">
              <span>{problem.type || 'LLD'} // OBJECT-ORIENTED DESIGN</span>
              <span className="text-white/20">|</span>
              <span className="text-white/40">Diff: Medium</span>
              <span className="text-white/20">|</span>
              <span className="text-white/40">Est: 35m</span>
              <span className="text-white/20">|</span>
              <span className="text-white/40">SYS-042 // LMS-01</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif font-bold uppercase tracking-wide text-white mb-4" style={{ fontFamily: 'var(--font-serif, "Georgia", serif)' }}>
              {problem.title}
            </h1>
            
            <p className="text-white/60 text-sm md:text-base max-w-3xl leading-relaxed">
              {problem.description}
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-6 lg:mt-0 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors">
              <Bookmark className="w-3.5 h-3.5" /> Save
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            {session ? (
              <button
                onClick={() => startTransition(() => startAttempt(problem.id))}
                disabled={isPending || isSessionPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                Start Problem
              </button>
            ) : (
              <Link
                href={`/login?redirect=/problems/${problem.id}`}
                className="flex items-center gap-2 px-6 py-2.5 rounded bg-[#ff6b35] hover:bg-[#ff6b35]/90 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
              >
                <Lock className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          
          {/* Left Column: Problem Spec */}
          <div className="flex flex-col min-w-0">
            
            {/* Tabs */}
            <div className="flex items-center gap-8 mb-8 border-b border-white/5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('requirements')}
                className={`pb-3 text-xs font-mono font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === 'requirements' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
              >
                Functional Requirements
              </button>
              <button
                onClick={() => setActiveTab('constraints')}
                className={`pb-3 text-xs font-mono font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === 'constraints' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
              >
                Constraints & Notes
              </button>
              {problem.testCases && problem.testCases.length > 0 && (
                <button
                  onClick={() => setActiveTab('testCases')}
                  className={`pb-3 text-xs font-mono font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === 'testCases' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
                >
                  Test Cases
                </button>
              )}
              {problem.extensibilityHooks && problem.extensibilityHooks.length > 0 && (
                <button
                  onClick={() => setActiveTab('extensibility')}
                  className={`pb-3 text-xs font-mono font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === 'extensibility' ? 'border-[#ff6b35] text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}
                >
                  Extensibility Scenarios
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="mb-12">
              {activeTab === 'requirements' && (
                <div className="space-y-8">
                  {problem.requirements?.map((req, i) => {
                    // Split the requirement into title and description if it contains a period or colon in the first half
                    let title = `Requirement ${i + 1}`;
                    let desc = req;
                    const splitMatch = req.match(/^([^.!?:]+[.!?:]+)(.*)$/);
                    if (splitMatch && splitMatch[1].length < 60) {
                      title = splitMatch[1].trim();
                      desc = splitMatch[2].trim() || req;
                    }
                    
                    return (
                      <div key={i} className="flex gap-6 group">
                        <span className="font-mono text-sm text-white/30 font-bold shrink-0 mt-0.5 group-hover:text-[#ff6b35] transition-colors">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className="text-white/90 font-bold mb-2">{title}</h3>
                          <p className="text-white/60 text-[13px] leading-relaxed">{desc !== title ? desc : req}</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {(!problem.requirements || problem.requirements.length === 0) && (
                    <div className="flex gap-6 group">
                      <span className="font-mono text-sm text-white/30 font-bold shrink-0 mt-0.5 group-hover:text-[#ff6b35] transition-colors">01</span>
                      <div>
                        <h3 className="text-white/90 font-bold mb-2">Books, members, and librarians.</h3>
                        <p className="text-white/60 text-[13px] leading-relaxed">Decouple conceptual metadata (title, author, ISBN) from physical book copies (barcode, shelf coordinates).</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab !== 'requirements' && (
                <ul className="space-y-6 text-white/70 text-[13px] leading-relaxed">
                  {(activeTab === 'constraints' ? problem.constraints : 
                    activeTab === 'testCases' ? problem.testCases : 
                    problem.extensibilityHooks)?.map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Code Snippet Box */}
            <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden mb-12 shadow-lg">
              <div className="flex justify-between items-center bg-[#1a1a1a]/50 px-6 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                  <div className="w-4 h-4 flex items-center justify-center bg-white/10 rounded">
                    <span className="text-[8px]">&lt;/&gt;</span>
                  </div>
                  SpecDefinition.go
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                  <span>Go 1.22</span>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
              <div className="p-6 font-mono text-xs leading-relaxed overflow-x-auto">
                <pre>
                  <code className="text-white/70">
<span className="text-pink-400">package</span> domain{'\n\n'}
<span className="text-white/40">// BookItem represents a physical instance of a library catalog title.</span>{'\n'}
<span className="text-pink-400">type</span> <span className="text-yellow-200">BookItem</span> <span className="text-pink-400">struct</span> {'{\n'}
  Barcode       <span className="text-blue-300">string</span>          <span className="text-green-300">`json:"barcode"`</span>{'\n'}
  ISBN          <span className="text-blue-300">string</span>          <span className="text-green-300">`json:"isbn"`</span>{'\n'}
  Status        <span className="text-blue-300">BookStatus</span>      <span className="text-green-300">`json:"status"`</span>{'\n'}
  RackLocation  <span className="text-blue-300">RackCoordinate</span>  <span className="text-green-300">`json:"location"`</span>{'\n'}
  Version       <span className="text-blue-300">uint64</span>          <span className="text-green-300">`json:"version"`</span>{'\n'}
{'}\n\n'}
<span className="text-pink-400">type</span> <span className="text-yellow-200">LendingService</span> <span className="text-pink-400">interface</span> {'{\n'}
  <span className="text-blue-200">CheckoutBook</span>(ctx context.Context, memberID <span className="text-blue-300">string</span>, barcode <span className="text-blue-300">string</span>) (*<span className="text-yellow-200">LoanRecord</span>, <span className="text-blue-300">error</span>){'\n'}
  <span className="text-blue-200">ReturnBook</span>(ctx context.Context, barcode <span className="text-blue-300">string</span>) (*<span className="text-yellow-200">ReturnReceipt</span>, <span className="text-blue-300">error</span>){'\n'}
  <span className="text-blue-200">ReserveBook</span>(ctx context.Context, memberID <span className="text-blue-300">string</span>, isbn <span className="text-blue-300">string</span>) (*<span className="text-yellow-200">Reservation</span>, <span className="text-blue-300">error</span>){'\n'}
  <span className="text-blue-200">AssessFines</span>(ctx context.Context, memberID <span className="text-blue-300">string</span>) (<span className="text-blue-300">float64</span>, <span className="text-blue-300">error</span>){'\n'}
{'}'}
                  </code>
                </pre>
              </div>
              <div className="bg-[#1a1a1a]/30 px-6 py-3 border-t border-white/5 flex justify-between text-[11px] font-mono text-white/40">
                <span>Concurrency: CAS with exponential backoff</span>
                <span>Memory: 48 bytes/instance</span>
              </div>
            </div>

            {/* Bottom Call to Action */}
            <div className="bg-[#141414] border border-white/5 rounded-xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/40 rounded-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white/90 mb-1">Ready to build? Show off your system design skills.</h4>
                  <p className="text-[13px] text-white/50">Preloaded environment with Go/Python/Java scaffolds.</p>
                </div>
              </div>
              
              {!isSessionPending && !session ? (
                <Link
                  href={`/login?redirect=/problems/${problem.id}`}
                  className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-colors"
                >
                  <Lock className="w-3.5 h-3.5 opacity-60" />
                  Sign in to Start
                </Link>
              ) : (
                <button
                  onClick={() => startTransition(() => startAttempt(problem.id))}
                  disabled={isPending || isSessionPending}
                  className="shrink-0 flex items-center gap-2 px-6 py-2.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-colors disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 opacity-60" />}
                  Start Environment
                </button>
              )}
            </div>
            
          </div>

          {/* Right Column: Sidebar Panels */}
          <div className="flex flex-col gap-6">
            
            {/* Past Attempts */}
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6 shadow-lg">
              <h2 className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-widest mb-6 flex justify-between items-center">
                <span>Past Attempts</span>
              </h2>

              {isLoadingHistory ? (
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                </div>
              ) : completedAttempts.length === 0 ? (
                <>
                  <div className="text-[13px] text-white/50 leading-relaxed mb-6">
                    You haven't completed any attempts for this problem yet. Start one to see your history here.
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[11px] font-mono text-white/40">
                    <span>Recent Avg: -</span>
                    <span>Benchmark: 35m</span>
                  </div>
                </>
              ) : (
                <ul className="space-y-3">
                  {completedAttempts.map((attempt) => {
                    const date = new Date(attempt.createdAt);
                    return (
                      <li key={attempt.id} className="group relative">
                        <Link
                          href={`/problems/${problem.id}/attempt/${attempt.id}`}
                          className="block p-4 rounded bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all cursor-pointer"
                        >
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="font-medium text-white group-hover:text-[#ff6b35] transition-colors text-sm">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            {attempt.totalScore !== null && (
                              <span className="font-mono text-[11px] font-bold text-white/70">
                                {attempt.totalScore}/{attempt.maxScore ?? (problem.type === 'HLD' ? 65 : 15)}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-white/40 flex items-center gap-2">
                            <span>{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            <span className="text-[#ff6b35]">Completed</span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Evaluation Criteria */}
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6 shadow-lg">
              <h2 className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-widest mb-6 flex justify-between items-center">
                <span>Evaluation Criteria</span>
                <span className="text-white/30 lowercase">rubric</span>
              </h2>
              
              <div className="space-y-5">
                <div>
                  <h4 className="text-[13px] font-bold text-white/90 mb-1 font-mono">01. Domain Modeling</h4>
                  <p className="text-xs text-white/50 leading-relaxed">Clean separation between Book metadata and BookItem physical instances.</p>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white/90 mb-1 font-mono">02. State Machine</h4>
                  <p className="text-xs text-white/50 leading-relaxed">Proper finite transitions: Available, Reserved, Loaned, Lost.</p>
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white/90 mb-1 font-mono">03. Concurrency Safety</h4>
                  <p className="text-xs text-white/50 leading-relaxed">Prevent double-checkout races using versioned optimistic locking.</p>
                </div>
              </div>
            </div>

            {/* Target Constraints */}
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6 shadow-lg">
              <h2 className="text-[11px] font-mono font-bold text-white/60 uppercase tracking-widest mb-6 flex justify-between items-center">
                <span>Target Constraints</span>
                <span className="text-white/30 lowercase">scale</span>
              </h2>
              
              <div className="space-y-4 text-xs font-mono">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-white/50">Catalog Titles:</span>
                  <span className="text-white font-bold">20,000</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-white/50">Physical BookItems:</span>
                  <span className="text-white font-bold">100,000</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-white/50">Peak Checkout QPS:</span>
                  <span className="text-white font-bold">500 req/sec</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-white/50">Locking Mechanism:</span>
                  <span className="text-white font-bold">CAS / Optimistic</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
