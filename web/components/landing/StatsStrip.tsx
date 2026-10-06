"use client";

import { useScrollReveal } from "./useScrollReveal";

const STATS = [
  { value: "100", label: "Design problems" },
  { value: "LLD + HLD", label: "Both tracks covered" },
  { value: "AI", label: "Powered evaluation" },
  { value: "Free", label: "To start" },
];

export function StatsStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="landing-gradient-border">
      <div
        ref={ref}
        className={`landing-section landing-stagger ${visible ? "is-visible" : ""}`}
        style={{ paddingTop: 40, paddingBottom: 40 }}
      >
        <p
          className="text-center mb-8"
          style={{
            fontSize: "var(--landing-text-sm)",
            color: "var(--landing-text-tertiary)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Built for engineers preparing for top tech interviews
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div
                className="landing-mono"
                style={{
                  fontSize: "var(--landing-text-2xl)",
                  fontWeight: 600,
                  color: "var(--landing-text-primary)",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "var(--landing-text-sm)",
                  color: "var(--landing-text-tertiary)",
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
