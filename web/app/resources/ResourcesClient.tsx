"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { LearningPath } from './page';

export default function ResourcesClient({ paths }: { paths: LearningPath[] }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] font-sans text-white selection:bg-white/20">

      {/* Hero Section — navbar baked in */}
      <div className="relative w-full h-80 md:h-[420px] overflow-hidden">
        <Image
          src="/AI_Bg_031(1).png"
          alt="Resources Hero"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay: dark at top (for nav legibility) + fade to page bg at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#0a0a0a]" />

        {/* ── Navbar row ── */}
        <div className="absolute top-0 left-0 right-0 z-20 px-8 md:px-12 py-6 flex items-center justify-between">
          {/* Logo container matching the right pill */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-1 flex items-center">
            <Link href="/" className="flex items-center gap-3 px-5 py-2 hover:opacity-80 transition-opacity">
              <div className="w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-[#ff6b35]">
                  <path d="M12 2L22 19H2L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="2.5" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold tracking-widest text-[13px] text-white">PREP</span>
            </Link>
          </div>

          {/* Nav pill */}
          <nav className="hidden md:flex items-center bg-black/40 backdrop-blur-md border border-white/10 p-1 text-[13px] font-medium text-white/70">
            <Link href="/problems" className="px-5 py-2 hover:text-white transition-colors">
              Platform
            </Link>
            <Link href="/resources" className="px-5 py-2 text-white bg-white/10 transition-colors">
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
          <p className="text-[#ff6b35] font-mono text-xs uppercase tracking-[0.3em] mb-3 font-bold">
            Learning Hub
          </p>
          <h1 className="text-4xl md:text-6xl font-bold font-mono uppercase tracking-tight text-white drop-shadow-lg">
            Resources
          </h1>
          <p className="mt-4 text-white/60 text-sm md:text-base max-w-md">
            Master system design with curated paths and cheatsheets.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-16 relative z-10">
        {paths.length === 0 && (
          <div className="text-center text-white/40 font-mono py-10 border border-white/5 rounded-xl bg-white/5">
            No resources available yet. Run the seeder.
          </div>
        )}
        {paths.map(path => (
          <div key={path.id} className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{path.title}</h2>
              <p className="text-white/50 text-sm">{path.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {path.items.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/resources/cheatsheets/${item.resource.slug}`}
                  className="group flex items-start gap-4 p-5 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-[#ff6b35]/50 transition-all hover:bg-[#1f1f1f]"
                >
                  <div className="p-2.5 rounded-lg bg-black/50 border border-white/5 group-hover:border-[#ff6b35]/30 group-hover:text-[#ff6b35] text-white/40 transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white/90 group-hover:text-white">{item.resource.title}</span>
                    <span className="text-xs text-white/40 mt-1 uppercase font-mono tracking-wider">Cheatsheet</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
