"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ResourceDetail } from './page';

export default function CheatsheetViewClient({ resource }: { resource: ResourceDetail }) {
  const readTime = Math.max(1, Math.ceil((resource.content?.length || 0) / 1000));

  // Extract ## headings for TOC
  const toc = (resource.content?.match(/^##\s+(.+)$/gm) || [])
    .map(h => h.replace(/^##\s+/, ''));

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-white/20">

      {/* ── Sticky top bar ──────────────────────────────────── */}
      <div className="sticky top-0 z-50 w-full bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link
            href="/resources"
            className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Resources
          </Link>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#ff6b35]">
              <path d="M12 2L22 19H2L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="13" r="2.5" fill="currentColor" />
            </svg>
            <span className="font-bold tracking-widest text-[12px] text-white">PREP-G</span>
          </Link>
        </div>
      </div>

      {/* ── Main layout ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-8 py-16 flex gap-16 items-start">

        {/* ── Article ─────────────────────────────────────── */}
        <article className="flex-1 min-w-0 max-w-[680px]">

          {/* Header */}
          <header className="mb-12 pb-10 border-b border-white/5">
            <div className="flex items-center gap-2.5 mb-5">
              <span className="text-[#ff6b35] text-[10px] font-mono uppercase tracking-[0.25em]">Original</span>
              <span className="text-white/15 text-[10px] font-mono">·</span>
              <span className="text-white/30 text-[10px] font-mono uppercase tracking-[0.2em]">{readTime} min read</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold font-mono uppercase tracking-tight text-white leading-tight mb-6">
              {resource.title}
            </h1>

            <p className="text-white/40 text-sm leading-relaxed max-w-lg">
              A short guide from the Prep-G study notes — written to explain this concept simply and stick with you.
            </p>
          </header>

          {/* Body */}
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-white mt-12 mb-5">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-white mt-12 mb-5 pt-8 border-t border-white/5">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold text-white/90 mt-8 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-[15px] text-white/60 leading-relaxed mb-5">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-5 space-y-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-5 space-y-2 list-decimal list-inside">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-[15px] text-white/60 leading-relaxed flex items-start gap-2">
                    <span className="mt-2 w-1 h-1 rounded-full bg-white/20 shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-white/90">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-white/50 not-italic">{children}</em>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code className="block bg-white/5 border border-white/8 rounded-none p-5 text-sm font-mono text-white/70 overflow-x-auto my-6">
                      {children}
                    </code>
                  ) : (
                    <code className="inline-block bg-white/8 px-1.5 py-0.5 font-mono text-[13px] text-[#ff6b35]/90 rounded-none">{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="my-0">{children}</pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-white/15 pl-5 my-6 text-white/40 italic">{children}</blockquote>
                ),
                hr: () => <div className="my-10 border-t border-white/5" />,
                a: ({ href, children }) => (
                  <a href={href} className="text-[#ff6b35]/80 hover:text-[#ff6b35] underline underline-offset-4 decoration-[#ff6b35]/30 transition-colors" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
              }}
            >
              {resource.content}
            </ReactMarkdown>
          </div>

        </article>

        {/* ── Sidebar TOC ─────────────────────────────────── */}
        {toc.length > 0 && (
          <aside className="hidden xl:block w-52 shrink-0 sticky top-24">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/25 mb-5">
              On this page
            </p>
            <nav className="flex flex-col gap-3.5 border-l border-white/5 pl-4">
              {toc.map((heading, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-[12px] text-white/35 hover:text-white/70 transition-colors leading-snug line-clamp-2"
                >
                  {heading}
                </a>
              ))}
            </nav>
          </aside>
        )}

      </div>
    </div>
  );
}
