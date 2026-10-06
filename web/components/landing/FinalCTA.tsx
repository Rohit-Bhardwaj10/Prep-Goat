"use client";

import Link from "next/link";
import { useScrollReveal } from "./useScrollReveal";

export function FinalCTA() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="landing-gradient-border" style={{ marginTop: 80 }}>
      <div
        ref={ref}
        className={`landing-section landing-fade-in text-center ${visible ? "is-visible" : ""}`}
        style={{ paddingTop: 120, paddingBottom: 120 }}
      >
        <h2 className="landing-h2" style={{ maxWidth: 640, margin: "0 auto" }}>
          Practice the patterns. Pass the interview.
        </h2>
        <p
          className="landing-body"
          style={{
            margin: "24px auto 32px",
            fontSize: "var(--landing-text-lg)",
          }}
        >
          Sign up in 30 seconds. Start solving immediately.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="landing-btn landing-btn--primary no-underline"
          >
            Start free →
          </Link>
          <Link
            href="/problems"
            className="landing-btn landing-btn--secondary no-underline"
          >
            Browse problems
          </Link>
        </div>
      </div>
    </section>
  );
}
