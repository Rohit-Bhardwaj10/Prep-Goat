"use client";

import { useState } from 'react';
import Link from 'next/link';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ExternalLink, BookOpen, Play, ArrowUpRight } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────
type ContentType = 'original' | 'link' | 'video';
type Category = 'All' | 'HLD' | 'LLD' | 'Networking' | 'Databases' | 'Videos';

interface ResourceEntry {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  category: Exclude<Category, 'All'>;
  // For original blogs — use slug for internal routing
  slug?: string;
  // For external resources
  href?: string;
  source?: string; // e.g. "ByteByteGo", "Martin Fowler", "YouTube"
  readTime?: string;
}

// ─── Static curated data ────────────────────────────────────
// Mix of original mini-blogs + curated external resources
const RESOURCES: ResourceEntry[] = [
  // ── ORIGINAL BLOGS ──────────────────────────────────────
  {
    id: 'cap-theorem',
    title: 'The CAP Theorem, explained simply',
    description: 'Why a distributed system can only ever guarantee two of three things — and what that means when you pick your database.',
    type: 'original',
    category: 'Databases',
    slug: 'cap-theorem',
    readTime: '4 min',
  },
  {
    id: 'dns-basics',
    title: 'How DNS actually works',
    description: 'From typing a URL to getting an IP back — walking through resolvers, root servers, and TTLs step by step.',
    type: 'original',
    category: 'Networking',
    slug: 'dns-basics',
    readTime: '3 min',
  },
  {
    id: 'solid-principles',
    title: 'SOLID principles without the jargon',
    description: 'The five principles every object-oriented codebase should follow, explained through real examples instead of abstract theory.',
    type: 'original',
    category: 'LLD',
    slug: 'solid-principles',
    readTime: '5 min',
  },
  {
    id: 'scaling-databases',
    title: 'Scaling databases: replicas, sharding, and caching',
    description: 'A practical guide to the three most common database scaling techniques — when to use each, and what you give up.',
    type: 'original',
    category: 'Databases',
    slug: 'scaling-databases',
    readTime: '5 min',
  },

  // ── CURATED EXTERNAL ────────────────────────────────────
  {
    id: 'ext-system-design-primer',
    title: 'The System Design Primer',
    description: 'The best free resource for learning system design from scratch. A massive, well-structured GitHub repository covering almost every concept.',
    type: 'link',
    category: 'HLD',
    href: 'https://github.com/donnemartin/system-design-primer',
    source: 'GitHub · donnemartin',
    readTime: 'Reference',
  },
  {
    id: 'ext-martin-fowler',
    title: 'Patterns of Enterprise Application Architecture',
    description: 'Martin Fowler\'s catalogue of recurring architectural patterns. Dense but the best mental model for LLD you\'ll find.',
    type: 'link',
    category: 'LLD',
    href: 'https://martinfowler.com/eaaCatalog/',
    source: 'martinfowler.com',
    readTime: 'Reference',
  },
  {
    id: 'ext-bbb-guide',
    title: 'ByteByteGo System Design Newsletter',
    description: 'Alex Xu\'s weekly deep-dives on how real systems at scale are designed. Every issue is a mini case-study.',
    type: 'link',
    category: 'HLD',
    href: 'https://blog.bytebytego.com/',
    source: 'blog.bytebytego.com',
    readTime: 'Newsletter',
  },
  {
    id: 'ext-tcp-ip',
    title: 'TCP/IP Illustrated — Chapter 1',
    description: 'The foundational chapter on how packets move across a network. Dry but indispensable for truly understanding networking.',
    type: 'link',
    category: 'Networking',
    href: 'https://www.isi.edu/nsnam/DIRECTED_RESEARCH/DR_HYUN/etc/Stevens_TCPIPIllustrated_V1.pdf',
    source: 'Stevens · PDF',
    readTime: 'Chapter',
  },

  // ── VIDEO PLAYLISTS ──────────────────────────────────────
  {
    id: 'vid-system-design-yt',
    title: 'System Design Interview — ByteByteGo',
    description: 'The most recommended playlist for system design interviews. Concise animations and clean explanations for every major topic.',
    type: 'video',
    category: 'Videos',
    href: 'https://www.youtube.com/@ByteByteGo',
    source: 'YouTube · ByteByteGo',
    readTime: 'Playlist',
  },
  {
    id: 'vid-lld-shreyansh',
    title: 'LLD in Python / Java — Shreyansh Jain',
    description: 'Hands-on low-level design walkthroughs: parking lot, ride-sharing, chess engine. Best for seeing actual code.',
    type: 'video',
    category: 'Videos',
    href: 'https://www.youtube.com/@CodingWithShreyans',
    source: 'YouTube · Coding with Shreyans',
    readTime: 'Playlist',
  },
  {
    id: 'vid-cs75-harvard',
    title: 'CS75 Scalability — Harvard',
    description: 'David Malan\'s iconic lecture on scalability. Load balancers, caching, databases — all in one 1-hour session.',
    type: 'video',
    category: 'Videos',
    href: 'https://youtu.be/-W9F__D3oY4',
    source: 'YouTube · Harvard CS75',
    readTime: '1 hr lecture',
  },
];

const CATEGORIES: Category[] = ['All', 'HLD', 'LLD', 'Networking', 'Databases', 'Videos'];

const TYPE_META: Record<ContentType, { label: string; color: string; Icon: typeof BookOpen }> = {
  original: { label: 'Original', color: 'text-[#a3b18a] border-[#a3b18a]/30 bg-[#a3b18a]/8', Icon: BookOpen },
  link: { label: 'Article', color: 'text-white/50 border-white/10 bg-white/5', Icon: ExternalLink },
  video: { label: 'Video', color: 'text-red-400/80 border-red-400/20 bg-red-400/5', Icon: Play },
};

// ─── Component ───────────────────────────────────────────────
export default function ResourcesClient() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  const filtered = activeCategory === 'All'
    ? RESOURCES
    : RESOURCES.filter(r => r.category === activeCategory);

  const originals = filtered.filter(r => r.type === 'original');
  const external = filtered.filter(r => r.type !== 'original');

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-white/20">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="relative z-50 w-full px-8 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#a3b18a]">
              <path d="M12 2L22 19H2L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold tracking-widest text-base text-white">PREP-G</span>
        </Link>

        <nav className="hidden md:flex items-center bg-[#1a1a1a]/80 backdrop-blur-md border border-white/5 p-1 text-[13px] font-medium text-white/70">
          <Link href="/problems" className="px-5 py-2 hover:text-white transition-colors">Problems</Link>
          <Link href="/resources" className="px-5 py-2 text-white bg-white/10 transition-colors">Resources</Link>
          {!isPending && !session ? (
            <>
              <Link href="/login" className="px-5 py-2 hover:text-white transition-colors">Log in</Link>
              <Link href="/signup" className="px-5 py-2 hover:text-white transition-colors">Sign up</Link>
            </>
          ) : (
            <>
              <Link href="/profile" className="px-5 py-2 hover:text-white transition-colors">Profile</Link>
              <button onClick={handleSignOut} className="px-5 py-2 hover:text-white transition-colors">Sign out</button>
            </>
          )}
        </nav>
      </header>

      {/* ── Page Header ────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-12 pb-28">
        <div className="mb-14">
          <p className="text-[#a3b18a] font-mono text-xs uppercase tracking-[0.3em] mb-4 font-bold">
            Personal study notes
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-mono uppercase tracking-tight text-white mb-5">
            Resources
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-xl leading-relaxed">
            A curated mix of things I actually read and watch when studying system design —
            some written by me, the rest from people who know more than I do.
          </p>
        </div>

        {/* ── Category Filter ─────────────────────────────── */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-xs font-mono uppercase tracking-widest border transition-all ${activeCategory === cat
                    ? 'text-white border-white/30 bg-white/10'
                    : 'text-white/40 border-white/5 bg-transparent hover:text-white/70 hover:border-white/15'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Original Blogs ──────────────────────────────── */}
        {originals.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">Written here</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {originals.map(item => (
                <Link
                  key={item.id}
                  href={`/resources/cheatsheets/${item.slug}`}
                  className="group py-7 flex items-start justify-between gap-8 hover:bg-white/[0.02] -mx-4 px-4 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${TYPE_META[item.type].color}`}>
                        <BookOpen className="w-2.5 h-2.5" />
                        {TYPE_META[item.type].label}
                      </span>
                      <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">{item.category}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-white/90 group-hover:text-white transition-colors mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end justify-between pt-1 gap-4">
                    <div className="w-7 h-7 border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:text-white text-white/30 transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                    {item.readTime && (
                      <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest whitespace-nowrap">
                        {item.readTime}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Curated External ─────────────────────────────── */}
        {external.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">From around the web</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {external.map(item => {
                const meta = TYPE_META[item.type];
                const Icon = item.type === 'video' ? Play : ExternalLink;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group py-7 flex items-start justify-between gap-8 hover:bg-white/[0.02] -mx-4 px-4 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider border ${meta.color}`}>
                          <Icon className="w-2.5 h-2.5" />
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest">{item.category}</span>
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-white/90 group-hover:text-white transition-colors mb-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                      {item.source && (
                        <p className="mt-2 text-[11px] font-mono text-white/20">
                          {item.source}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end justify-between pt-1 gap-4">
                      <div className="w-7 h-7 border border-white/10 flex items-center justify-center group-hover:border-white/30 group-hover:text-white text-white/30 transition-all">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                      {item.readTime && (
                        <span className="text-[10px] font-mono text-white/25 uppercase tracking-widest whitespace-nowrap">
                          {item.readTime}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="py-24 text-center text-white/20 font-mono text-sm">
            Nothing here yet.
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-[11px] font-mono text-white/20 uppercase tracking-widest">
          <span>Prep-G</span>
          <span>Study hard.</span>
        </div>
      </footer>
    </div>
  );
}
