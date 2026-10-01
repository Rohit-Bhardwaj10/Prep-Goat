'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import DotField from '@/components/DotField';

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
const TYPE_TAGS = ['LLD', 'HLD'];

const DIFF_COLOR: Record<string, string> = {
  EASY:   'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HARD:   'text-red-400',
};

export default function ProblemsClient({ problems, initialPagination }: { problems: Problem[], initialPagination: Pagination }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || 'All');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'HLD');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };
  const { data: session } = authClient.useSession();

  const updateURL = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (updates.page === undefined) params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }, [searchParams, pathname, router]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== (searchParams.get('search') || '')) updateURL({ search });
    }, 400);
    return () => clearTimeout(handler);
  }, [search, searchParams, updateURL]);

  const handleDifficultyChange = (val: string) => { setDifficultyFilter(val); updateURL({ difficulty: val }); };
  const handleTypeChange = (val: string) => { setTypeFilter(val); updateURL({ type: val }); };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= initialPagination.totalPages) updateURL({ page: newPage.toString() });
  };

  // Group problems by their first tag (concept)
  const groupedProblems = problems.reduce((acc, problem) => {
    const group = problem.tags && problem.tags.length > 0 ? problem.tags[0] : 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(problem);
    return acc;
  }, {} as Record<string, Problem[]>);

  // Initialize all groups as expanded on mount
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    Object.keys(groupedProblems).forEach((group, index) => {
      initialExpanded[group] = index === 0;
    });
    setExpandedGroups(initialExpanded);
  }, [problems]);

  return (
    <div className="relative flex flex-col min-h-screen bg-[#1a1a1a] font-sans text-white selection:bg-white/20">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          cursorRadius={250}
          bulgeStrength={40}
          glowRadius={100}
          sparkle={false}
          waveAmplitude={0}
          glowColor="#1a1a1a"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">

        {/* Page title row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-white tracking-tight">Problems</h1>
          <span className="text-sm font-mono text-white/50">{initialPagination.total} problems</span>
        </div>

        {/* Filter + Search bar */}
        <div className="flex flex-wrap items-center gap-3 mb-0 border-b border-white/5 pb-3">

          {/* Type filter */}
          <div className="flex items-center gap-0 border border-white/10">
            {TYPE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTypeChange(tag)}
                className={`px-6 py-2 text-sm font-medium transition-all border-r border-white/10 last:border-r-0 ${
                  typeFilter === tag
                    ? 'bg-[#ff6b35] text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5 bg-[#1a1a1a]'
                }`}
              >
                {tag} Sheet
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-0 border border-white/10">
            {DIFFICULTY_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleDifficultyChange(tag)}
                className={`px-4 py-1.5 text-xs font-medium transition-all border-r border-white/10 last:border-r-0 ${
                  difficultyFilter === tag
                    ? tag === 'EASY'   ? 'bg-emerald-500/20 text-emerald-400'
                    : tag === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400'
                    : tag === 'HARD'   ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5 bg-[#1a1a1a]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative ml-auto w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#1a1a1a] border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff6b35] transition-all"
            />
          </div>
        </div>

        {/* Problem list */}
        {problems.length === 0 ? (
          <div className="p-16 text-center border-x border-b border-white/5 bg-[#1a1a1a]">
            <Search className="w-8 h-8 text-white/20 mx-auto mb-4" />
            <p className="text-sm text-white/40">No problems found. Try a different filter.</p>
          </div>
        ) : (
          <>
          <div className="border border-white/5 bg-[#1a1a1a] rounded-lg overflow-hidden divide-y divide-white/5">
            {Object.entries(groupedProblems).map(([group, groupProblems], index) => {
              const isExpanded = expandedGroups[group] ?? (index === 0);

              return (
                <div key={group} className="bg-[#1a1a1a]">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group)}
                    className={`w-full flex items-center justify-between px-5 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left ${isExpanded ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-white/90 tracking-wide uppercase">{group}</h2>
                      <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                        {groupProblems.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    )}
                  </button>

                  {/* Group Content (Collapsible) */}
                  {isExpanded && (
                    <div>
                      {/* Table header */}
                      {index === 0 && (
                        <div className="grid grid-cols-[2.5rem_1fr_auto_auto] md:grid-cols-[2.5rem_1fr_10rem_6rem_5rem] px-5 py-2 border-b border-white/5 text-xs font-mono text-white/30 uppercase tracking-widest bg-[#1a1a1a]/50">
                          <div></div>
                          <div>Problem</div>
                          <div className="hidden md:block">Concepts</div>
                          <div className="hidden md:block text-center">Difficulty</div>
                          <div className="text-right">Action</div>
                        </div>
                      )}

                      {/* Rows */}
                      <div className="divide-y divide-white/[0.04]">
                        {groupProblems.map((problem) => {
                          const diff = problem.difficulty || 'MEDIUM';
                          
                          // Rest of tags are the actual concepts (since tag[0] is the group)
                          const conceptTags = (problem.tags || []).slice(1);
                          const absoluteIdx = (initialPagination.page - 1) * initialPagination.limit + problems.indexOf(problem);

                          return (
                            <div
                              key={problem.id}
                              className="grid grid-cols-[2.5rem_1fr_auto_auto] md:grid-cols-[2.5rem_1fr_10rem_6rem_5rem] px-5 py-4 items-center group hover:bg-white/[0.02] transition-colors bg-[#1a1a1a]"
                            >
                              {/* Index */}
                              <div className="text-sm font-mono text-white/30">
                                {String(absoluteIdx + 1).padStart(2, '0')}
                              </div>

                              {/* Title + description */}
                              <div className="min-w-0 pr-4">
                                <Link
                                  href={`/problems/${problem.id}`}
                                  className="text-base font-medium text-white/90 group-hover:text-[#ff6b35] transition-colors flex items-center gap-2"
                                >
                                  {problem.title}
                                </Link>
                                <p className="text-sm text-white/50 mt-1 truncate max-w-lg">{problem.description}</p>
                              </div>

                              {/* Tags */}
                              <div className="hidden md:flex flex-wrap gap-1.5 max-w-[160px]">
                                {conceptTags.slice(0, 2).map((tag, i) => (
                                  <span key={i} className="text-xs font-mono text-white/50 border border-white/10 px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                                {conceptTags.length > 2 && (
                                  <span className="text-xs font-mono text-white/30 px-1.5 py-0.5">+{conceptTags.length - 2}</span>
                                )}
                              </div>

                              {/* Difficulty */}
                              <div className="hidden md:block text-center">
                                <span className={`text-sm font-medium ${DIFF_COLOR[diff] || 'text-white/50'}`}>
                                  {diff.charAt(0) + diff.slice(1).toLowerCase()}
                                </span>
                              </div>

                              {/* Action */}
                              <div className="text-right">
                                {session ? (
                                  <Link href={`/problems/${problem.id}`} className="text-sm font-mono text-white/50 hover:text-[#ff6b35] transition-colors bg-white/5 hover:bg-[#ff6b35]/10 px-3 py-1.5 rounded">
                                    Solve
                                  </Link>
                                ) : (
                                  <Link href={`/login?redirect=/problems/${problem.id}`} className="inline-flex items-center justify-center p-1.5 text-[#ff6b35]/60 hover:text-[#ff6b35] bg-[#ff6b35]/5 hover:bg-[#ff6b35]/10 rounded transition-colors">
                                    <Lock className="w-4 h-4" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

            {/* Pagination footer */}
            {initialPagination.totalPages > 1 && (
              <div className="border-t border-white/5 px-5 py-3 flex items-center justify-between bg-[#1a1a1a]">
                <span className="text-xs font-mono text-white/30">
                  {(initialPagination.page - 1) * initialPagination.limit + 1}–{Math.min(initialPagination.page * initialPagination.limit, initialPagination.total)} of {initialPagination.total}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePageChange(initialPagination.page - 1)} disabled={initialPagination.page <= 1} className="w-7 h-7 flex items-center justify-center text-white/40 hover:bg-white/10 disabled:opacity-20 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(initialPagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => handlePageChange(p)} className={`w-7 h-7 flex items-center justify-center text-xs font-mono transition-colors ${p === initialPagination.page ? 'bg-[#ff6b35] text-white' : 'text-white/40 hover:bg-white/10'}`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(initialPagination.page + 1)} disabled={initialPagination.page >= initialPagination.totalPages} className="w-7 h-7 flex items-center justify-center text-white/40 hover:bg-white/10 disabled:opacity-20 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      </div>
    </div>
  );
}
