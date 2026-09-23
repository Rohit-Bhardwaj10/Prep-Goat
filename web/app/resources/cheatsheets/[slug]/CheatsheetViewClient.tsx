"use client";

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ResourceDetail } from './page';

export default function CheatsheetViewClient({ resource }: { resource: ResourceDetail }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-white/20">
      
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link 
          href="/resources" 
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Resources</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#ff6b35]">
              <path d="M12 2L22 19H2L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="2.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-bold tracking-widest text-[13px] text-white">PREP-G</span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-12 border-b border-white/10 pb-8">
          <p className="text-[#ff6b35] font-mono text-xs uppercase tracking-[0.2em] mb-4 font-bold">
            Cheatsheet
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            {resource.title}
          </h1>
        </header>

        <article className="prose prose-invert prose-orange max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-[#ff6b35] hover:prose-a:text-[#ff8b55] prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-[#ff6b35] prose-strong:text-white prose-li:marker:text-white/30">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {resource.content}
          </ReactMarkdown>
        </article>
      </main>
    </div>
  );
}
