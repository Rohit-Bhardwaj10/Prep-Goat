'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Search, ChevronLeft, ChevronRight, Lock, Check, Mail, Play, Eye } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';

interface Problem {
  id: string;
  title: string;
  description: string;
  type?: string;
  difficulty?: string;
  tags?: string[];
  requirements?: string[];
  constraints?: string[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DIFFICULTY_TAGS = ['All', 'EASY', 'MEDIUM', 'HARD'];
const TYPE_TAGS = ['All', 'LLD', 'HLD'];

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  MEDIUM: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  HARD: 'text-red-400 border-red-400/30 bg-red-400/10',
};

export default function ProblemsClient({ problems, initialPagination }: { problems: Problem[], initialPagination: Pagination }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || 'All');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'All');
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push('/login');
  };

  const updateURL = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 if changing filters (unless page is explicitly updated)
    if (updates.page === undefined) {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) {
        updateURL({ search });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, searchParams, updateURL]);

  const handleDifficultyChange = (val: string) => {
    setDifficultyFilter(val);
    updateURL({ difficulty: val });
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    updateURL({ type: val });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= initialPagination.totalPages) {
      updateURL({ page: newPage.toString() });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0d0d0d] font-sans text-white selection:bg-white/20 relative" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,107,53,0.07) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(255,107,53,0.04) 0%, transparent 50%)' }}>
      {/* Dot grid overlay */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <Navbar />

      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center pt-8 pb-12 px-4 text-center">
        <div className="flex items-center gap-2 text-[#ff6b35] text-xs font-mono uppercase tracking-[0.2em] mb-4 font-bold">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></div>
          <span>Practice Platform</span>
          <span className="text-white/30 px-1">•</span>
          <span>{initialPagination.total} Problems</span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm mb-4">
          System Design Problems
        </h1>
        
        <p className="text-white/70 text-sm md:text-base max-w-2xl">
          Canonical production architectures, scale bottlenecks, and Staff-level trade-offs deconstructed.
        </p>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pb-20">
        
        {/* Search + Filter Bar */}
        <div className="bg-[#141414] border border-white/5 rounded-xl p-4 mb-6 shadow-lg">
          <div className="flex items-center border-b border-white/5 pb-4 mb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search problems..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="text-white/40">Scope:</span>
              <div className="flex gap-2">
                {TYPE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTypeChange(tag)}
                    className={`px-3 py-1.5 rounded transition-all font-bold tracking-wider uppercase ${typeFilter === tag
                      ? 'bg-[#ff6b35] text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tag === 'All' ? `All (${initialPagination.total || 0})` : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/40">Difficulty:</span>
              <div className="flex gap-2">
                {DIFFICULTY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleDifficultyChange(tag)}
                    className={`px-3 py-1.5 rounded transition-all font-bold tracking-wider uppercase ${difficultyFilter === tag
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Problem List */}
        {problems.length === 0 ? (
          <div className="border border-white/5 bg-[#141414] rounded-xl p-16 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Search className="w-5 h-5 text-white/40" />
            </div>
            <h3 className="text-sm font-medium text-white/90">No problems found</h3>
            <p className="text-sm text-white/50 mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="bg-[#141414] border border-white/5 rounded-xl shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] md:text-xs font-mono text-white/40 uppercase tracking-widest bg-[#1a1a1a]/50">
                  <th className="py-4 px-4 w-12 text-center">Status</th>
                  <th className="py-4 px-4 w-1/3">Problem & Archetype</th>
                  <th className="py-4 px-4 hidden md:table-cell">System Primitives & Tags</th>
                  <th className="py-4 px-4 hidden lg:table-cell">Scale / Constraints</th>
                  <th className="py-4 px-4">Difficulty</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {problems.map((problem, idx) => {
                  const diff = problem.difficulty || 'MEDIUM';
                  const pType = problem.type || 'LLD';
                  const isSolved = idx === 0; // Mock solved status
                  const isStarted = idx === 2; // Mock started status
                  
                  return (
                    <tr
                      key={problem.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-5 px-4 align-top pt-6">
                        <div className="flex items-center justify-center font-mono text-xs text-white/40">
                          {isSolved ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                          )}
                          <span className="ml-2 w-6">#{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <Link href={`/problems/${problem.id}`} className="group-hover:text-[#ff6b35] transition-colors text-white/90 font-medium flex items-center gap-2 mb-1 text-sm md:text-base">
                            {problem.title}
                            <span className="text-[10px] font-mono tracking-widest text-white/30 group-hover:text-[#ff6b35]/50 uppercase">{pType}</span>
                          </Link>
                          <div className="text-[13px] text-white/60 line-clamp-2 max-w-lg leading-relaxed">
                            {problem.description}
                          </div>
                          <div className="text-[11px] text-white/40 mt-2 font-mono">
                            Amazon • Microsoft
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden md:table-cell align-top pt-6">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 max-w-[200px]">
                          {(problem.tags || ['OOP Design', 'Concurrency', 'State Machine']).slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[11px] font-mono text-white/60 border-b border-white/10 pb-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 hidden lg:table-cell align-top pt-6">
                        <div className="flex flex-col gap-1 font-mono text-[11px] text-white/60">
                          {(problem.constraints || ['100k Members', '<10ms Locks']).slice(0, 2).map((c, i) => (
                            <span key={i}>{c}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 align-top pt-6">
                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                          diff === 'EASY' ? 'text-white/60' : 
                          diff === 'MEDIUM' ? 'text-white/80' : 
                          diff === 'HARD' ? 'text-white' : 'text-[#ff6b35]'
                        }`}>
                          {diff}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right align-top pt-6">
                        {session ? (
                          <Link
                            href={`/problems/${problem.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white transition-colors uppercase tracking-wider group/btn"
                          >
                            {isStarted ? 'Resume' : isSolved ? 'View' : 'Solve'}
                            {isStarted ? <Play className="w-3 h-3 group-hover/btn:text-[#ff6b35]" /> : 
                             isSolved ? <Eye className="w-3.5 h-3.5 group-hover/btn:text-[#ff6b35]" /> : 
                             <Mail className="w-3.5 h-3.5 group-hover/btn:text-[#ff6b35]" />}
                          </Link>
                        ) : (
                          <Link
                            href={`/login?redirect=/problems/${problem.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#ff6b35]/70 hover:text-[#ff6b35] transition-colors uppercase tracking-wider"
                          >
                            <Lock className="w-3 h-3" />
                            Sign in
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Table Footer */}
            <div className="bg-[#1a1a1a]/50 border-t border-white/5 py-3 px-6 flex items-center justify-between">
              <div className="text-[11px] font-mono text-white/40">
                Showing {(initialPagination.page - 1) * initialPagination.limit + 1}–{Math.min(initialPagination.page * initialPagination.limit, initialPagination.total)} of {initialPagination.total} Canonical Systems <span className="mx-2">•</span> Indexed under Schema v1.4
              </div>
              
              {initialPagination.totalPages > 1 && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-white/60">
                  <span className="mr-2">Previous</span>
                  <button onClick={() => handlePageChange(initialPagination.page - 1)} disabled={initialPagination.page <= 1} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 disabled:opacity-30">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <span className="w-6 h-6 rounded flex items-center justify-center bg-[#ff6b35] text-white">1</span>
                  <button onClick={() => handlePageChange(2)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">2</button>
                  <button onClick={() => handlePageChange(3)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">3</button>
                  <span className="mx-1 opacity-50">..</span>
                  <button onClick={() => handlePageChange(initialPagination.totalPages)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">{initialPagination.totalPages}</button>
                  <button onClick={() => handlePageChange(initialPagination.page + 1)} disabled={initialPagination.page >= initialPagination.totalPages} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 disabled:opacity-30">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <span className="ml-2">Next</span>
                </div>
              )}
            </div>
          </div>
        )}
        


      </main>
    </div>
  );
}
