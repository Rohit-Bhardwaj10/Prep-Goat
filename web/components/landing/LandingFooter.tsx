"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="landing-footer relative overflow-hidden pb-0 pt-24 px-0">
      <div className="max-w-[1280px] mx-auto relative z-10 px-6 lg:px-8" style={{ paddingBottom: "120px" }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left Column */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 no-underline text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-[var(--landing-accent)]"
              >
                <path
                  d="M12 2L22 19H2L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="13" r="2.5" fill="currentColor" />
              </svg>
              <span className="font-semibold tracking-widest text-sm text-[var(--landing-text-primary)]">
                PREP
              </span>
            </Link>
            <p className="text-[#a1a1aa] text-sm">
              Stop guessing. Solve the right problems.
            </p>
            <a href="https://github.com/Rohit-Bhardwaj10/Prep-Goat" className="flex items-center gap-2 text-[#71717a] hover:text-[#a1a1aa] transition-colors text-sm mt-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Rohit-Bhardwaj10/Prep</span>
            </a>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-6">Product</h4>
              <ul className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
                <li><Link href="/problems" className="hover:text-white transition-colors">Problems</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link href="/problems" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-6">Account</h4>
              <ul className="flex flex-col gap-4 text-sm text-[#a1a1aa]">
                <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors">Sign up</Link></li>
                <li><Link href="/profile" className="hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="landing-h-line relative z-10" />

      <div className="max-w-[1280px] mx-auto relative z-10 px-6 lg:px-8 pt-8" style={{ paddingBottom: "120px" }}>
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-[#52525b]">
          <div>© {new Date().getFullYear()} PREP— no analytics, no telemetry.</div>
          <div className="uppercase tracking-widest font-semibold">Graded by execution. Never by the model.</div>
        </div>
      </div>

      {/* Giant Background Text */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none select-none z-0">
        <span
          className="font-bold text-center tracking-tighter"
          style={{
            fontSize: "clamp(120px, 25vw, 380px)",
            lineHeight: 0.8,
            color: "rgba(255, 255, 255, 0.02)",
            fontFamily: "var(--landing-font-sans)"
          }}
        >
          PREP
        </span>
      </div>
    </footer>
  );
}
