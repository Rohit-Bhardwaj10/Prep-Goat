"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function LandingNav() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  return (
    <nav className="landing-nav">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 no-underline">
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
          PREP-G
        </span>
      </Link>

      {/* Right side */}
      <div 
        className="flex items-center gap-6 px-5 py-2.5" 
        style={{
          border: "1px solid rgba(255, 255, 255, 0.06)",
          fontFamily: "var(--landing-font-mono)",
          fontSize: 12,
          letterSpacing: "0.02em"
        }}
      >
        <Link href="/problems" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors no-underline">
          Problems
        </Link>
        <Link href="/resources" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors no-underline">
          Resources
        </Link>
        
        {!isPending && !session && (
          <>
            <Link href="/login" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors no-underline ml-2">
              Log in
            </Link>
            <Link href="/signup" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors no-underline">
              Sign up
            </Link>
          </>
        )}
        
        {!isPending && session && (
          <>
            <Link href="/profile" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors no-underline ml-2">
              Profile
            </Link>
            <Link href="/problems" className="text-[rgba(255,255,255,0.7)] hover:text-white transition-colors no-underline">
              Dashboard
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
