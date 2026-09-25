'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-white/20">

      {/* Hero Section — navbar baked in */}
      <div className="relative w-full h-80 md:h-[420px] overflow-hidden">
        <Image
          src="/Image(6).png"
          alt="Design Problems Hero"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay: dark at top (for nav legibility) + fade to page bg at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#0a0a0a]" />

        {/* ── Navbar row ── */}
        <div className="absolute top-0 left-0 right-0 z-20 px-8 md:px-12 py-8 flex items-center justify-between">
          {/* Logo — same as hero */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#a3b18a]">
                  <path d="M12 2L22 19H2L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="13" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold tracking-widest text-base text-white">PREP-G</span>
            </Link>
          </div>

          {/* Nav pill — same as hero */}
          <nav className="hidden md:flex items-center bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 p-1 text-[13px] font-medium text-white/70">
            <Link href="/problems" className="px-5 py-2 text-white bg-white/10 transition-colors">
              Problems
            </Link>
            <Link href="/resources" className="px-5 py-2 hover:text-white transition-colors">
              Resources
            </Link>
            {!isPending && !session && (
              <>
                <Link href="/login" className="px-5 py-2 hover:text-white transition-colors">Log in</Link>
                <Link href="/signup" className="px-5 py-2 hover:text-white transition-colors">Sign up</Link>
              </>
            )}
            {!isPending && session && (
              <button onClick={handleSignOut} className="px-5 py-2 hover:text-white transition-colors">
                Sign out
              </button>
            )}
          </nav>
        </div>

        {/* ── Hero Text ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <p className="text-[#a3b18a] font-mono text-xs uppercase tracking-[0.3em] mb-3 font-bold">
            Practice Platform
          </p>
          <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-tight text-white drop-shadow-lg">
            Design Problems
          </h1>
          <p className="mt-4 text-white/60 text-sm md:text-base max-w-md">
            Select a canonical system to begin your design attempt.
          </p>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#a3b18a] focus:border-transparent transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              {TYPE_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTypeChange(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${typeFilter === tag
                      ? 'bg-[#a3b18a] border-[#a3b18a] text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="w-px bg-white/10 hidden sm:block"></div>
            <div className="flex gap-2">
              {DIFFICULTY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleDifficultyChange(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${difficultyFilter === tag
                      ? 'bg-[#a3b18a] border-[#a3b18a] text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30'
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
      <main className="flex-1 w-full max-w-5xl mx-auto pt-8 pb-12 px-6">
        <p className="text-xs text-white/40 font-mono mb-4 uppercase tracking-widest">
          {initialPagination.total} problem{initialPagination.total !== 1 ? 's' : ''} found
        </p>

        {problems.length === 0 ? (
          <div className="border border-white/10 bg-[#0a0a0a] rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <FileText className="w-5 h-5 text-white/40" />
            </div>
            <h3 className="text-sm font-medium text-white/90">No problems found</h3>
            <p className="text-sm text-white/50 mt-1">Try a different search or filter.</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-widest w-[45%]">Title</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-widest">Type & Tags</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-widest">Difficulty</th>
                  <th className="py-4 px-6 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {problems.map((problem, idx) => {
                  const diff = problem.difficulty || 'MEDIUM';
                  const pType = problem.type || 'LLD';
                  return (
                    <tr
                      key={problem.id}
                      className={`group hover:bg-[#1a1a1a] transition-colors ${idx % 2 !== 0 ? 'bg-white/[0.02]' : 'bg-transparent'}`}
                    >
                      <td className="py-5 px-6">
                        <Link href={`/problems/${problem.id}`} className="block">
                          <div className="font-semibold text-base text-white/90 group-hover:text-[#a3b18a] transition-colors flex items-center gap-2">
                            {problem.title}
                          </div>
                          <div className="text-sm text-white/50 mt-1 line-clamp-1 max-w-lg">
                            {problem.description}
                          </div>
                        </Link>
                      </td>
                      <td className="py-5 px-6 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
                            {pType}
                          </span>
                          {problem.tags && problem.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/5 text-white/60 border border-white/10">
                              {tag}
                            </span>
                          ))}
                          {problem.tags && problem.tags.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-white/5 text-white/60 border border-white/10">
                              +{problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 align-middle">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${DIFFICULTY_COLORS[diff]}`}>
                          {diff}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right align-middle">
                        {session ? (
                          <Link
                            href={`/problems/${problem.id}`}
                            className="inline-flex items-center justify-center h-8 px-4 rounded-md bg-[#2a2a2a] hover:bg-[#a3b18a] border border-white/5 hover:border-[#a3b18a] text-white/90 font-semibold text-xs transition-all"
                          >
                            Solve
                          </Link>
                        ) : (
                          <Link
                            href={`/login?redirect=/problems/${problem.id}`}
                            className="inline-flex items-center justify-center h-8 px-4 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white font-semibold text-xs transition-all"
                          >
                            Sign in to Solve
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {initialPagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
            <span className="text-xs text-white/40 font-mono uppercase tracking-wider">
              Page {initialPagination.page} of {initialPagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(initialPagination.page - 1)}
                disabled={initialPagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <button
                onClick={() => handlePageChange(initialPagination.page + 1)}
                disabled={initialPagination.page >= initialPagination.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
