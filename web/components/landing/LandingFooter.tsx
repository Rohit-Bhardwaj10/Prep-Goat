"use client";

import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="max-w-[1280px] mx-auto">
        <div className="landing-footer-grid">
          {/* Logo Column */}
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2.5 no-underline mb-6"
            >
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
            <p className="text-[var(--landing-text-secondary)] text-sm leading-relaxed max-w-[280px]">
              The interactive platform for mastering system design. Practice
              canonical problems with real-time AI feedback.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[var(--landing-text-primary)] font-semibold text-sm mb-4">
              Platform
            </h4>
            <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
              <li>
                <Link href="/problems" className="landing-link">
                  Problems
                </Link>
              </li>
              <li>
                <Link href="/resources" className="landing-link">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/login" className="landing-link">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[var(--landing-text-primary)] font-semibold text-sm mb-4">
              Resources
            </h4>
            <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
              <li>
                <Link href="/resources" className="landing-link">
                  Study Notes
                </Link>
              </li>
              <li>
                <Link href="/problems?tab=hld" className="landing-link">
                  HLD Prep
                </Link>
              </li>
              <li>
                <Link href="/problems?tab=lld" className="landing-link">
                  LLD Prep
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[var(--landing-text-primary)] font-semibold text-sm mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 m-0 p-0 list-none">
              <li>
                <a href="#" className="landing-link">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="landing-link">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="landing-link">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="landing-divider" style={{ margin: "48px 0 24px" }} />

        <div className="flex flex-wrap items-center justify-between gap-4 text-[var(--landing-text-tertiary)] text-xs">
          <div>© {new Date().getFullYear()} PREP-G. All rights reserved.</div>
          <div className="flex gap-4">
            <a
              href="#"
              className="hover:text-[var(--landing-text-primary)] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="hover:text-[var(--landing-text-primary)] transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
