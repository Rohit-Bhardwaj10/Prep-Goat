"use client";

import Link from "next/link";
import { TryDemo } from "./ShowcasePanels";
import { useScrollReveal } from "./useScrollReveal";

const BADGES = [
  "Instant AI feedback",
  "Step-by-step scoring",
  "Save your attempts",
];

export function TryItSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ls-try ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--center" style={{ position: "relative" }}>
        <span className="ls-eyebrow">TRY IT NOW</span>
        <h2 className="landing-h2">
          Solve a problem. See exactly where you stand.
        </h2>
        <p className="landing-body" style={{ margin: "16px auto 0" }}>
          Pick a problem, write your design, and watch it get scored step by
          step. Create a free account to save your work and track progress
          across problems.
        </p>
        <div className="ls-badges">
          {BADGES.map((b) => (
            <span key={b}>✓ {b}</span>
          ))}
        </div>
      </div>

      <div className="ls-stage">
        <TryDemo />
      </div>

      <div style={{ textAlign: "center", marginTop: 36, position: "relative" }}>
        <Link
          href="/signup"
          className="landing-btn landing-btn--accent no-underline"
        >
          Create free account →
        </Link>
      </div>
    </section>
  );
}
