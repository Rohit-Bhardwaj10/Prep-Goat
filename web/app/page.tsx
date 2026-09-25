"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Navbar } from "@/components/Navbar";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "@/components/Magnetic";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 flex flex-col font-sans overflow-hidden">

      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Image(2).png"
          alt="Background"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Dark Overlay to reduce shine and make text pop */}
        <div className="absolute inset-0 bg-[#0a0a0a]/20" />
        {/* Grain Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%221.5%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")' }}
        />
        {/* Subtle bottom fade to blend with the logo band */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-80" />
      </div>

      <Navbar />

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 max-w-7xl w-full mb-12">
        <div className="space-y-6 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-mono uppercase text-white leading-[1.1] tracking-tight font-semibold" style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            Find clarity in complex system design
          </h1>
          <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-2xl pr-12 font-medium" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            Your all-in-one destination for mastering System Design. Practice with gold-standard problems, access curated resources, and level up with real-time feedback.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Magnetic>
              <Link
                href="/problems"
                className="inline-flex items-center justify-center px-7 py-3.5 bg-[#1a1a1a]/80 hover:bg-black/90  text-white text-sm font-semibold transition-colors border border-white/10 backdrop-blur-md"
              >
                Browse Problems
              </Link>
            </Magnetic>
            {!session && (
              <Magnetic>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-5 py-3 bg-white hover:bg-white/90 text-black text-sm font-semibold transition-colors shadow-lg group"
                >
                  Sign in
                  <ArrowUpRight className="w-4 h-4 ml-1.5 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </Magnetic>
            )}
          </div>
        </div>
      </main>

      {/* Logo band at the bottom */}
      <div className="relative z-10 w-full bg-[#0a0a0a] border-t border-white/5">
        <div className="flex flex-wrap items-center justify-center sm:justify-between px-8 py-3 gap-8 max-w-7xl mx-auto opacity-40 grayscale">
          <span className="font-semibold tracking-wider text-sm flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2Z" /></svg> google
          </span>
          <span className="font-bold tracking-[0.2em] text-sm text-zinc-300">META</span>
          <span className="font-bold tracking-wider text-sm flex items-center gap-1">
            netflix
          </span>
          <span className="font-bold tracking-tighter text-sm flex items-center gap-1">amazon</span>
          <span className="font-bold tracking-wider text-sm">microsoft</span>
          <span className="font-bold tracking-widest text-sm">UBER</span>
          <span className="font-bold tracking-widest text-sm">stripe</span>
        </div>
      </div>

    </div>
  );
}
