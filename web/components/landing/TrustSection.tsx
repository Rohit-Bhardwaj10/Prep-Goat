"use client";

import { useScrollReveal } from "./useScrollReveal";

const PILLARS = [
  {
    icon: "⬡",
    title: "Structured phases",
    body: "Requirements → Architecture → API Design → Data Model → Scaling. In exactly the order interviewers expect.",
  },
  {
    icon: "✦",
    title: "Diagram-aware AI",
    body: "The evaluator reads your actual boxes and arrows, not just your written explanation. Like a real whiteboard review.",
  },
  {
    icon: "{ }",
    title: "Real code editor",
    body: "Define classes, interfaces and relationships in actual code. Checked for SOLID principles, not just syntax.",
  },
  {
    icon: "↻",
    title: "Extensibility twists",
    body: "Follow-up scenarios test whether your design bends without breaking — just like a real interview loop.",
  },
];

export function TrustSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in trust-section ${visible ? "is-visible" : ""}`}
    >
      <div className="trust-inner">
        <div className="ls-head" style={{ maxWidth: 480 }}>
          <span className="ls-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>
            WHAT MAKES IT DIFFERENT
          </span>
          <h2
            className="landing-h2"
            style={{ color: "var(--landing-text-primary)" }}
          >
            Built for the interview.
            <br />
            Not generic study.
          </h2>
          <p
            className="landing-body"
            style={{ marginTop: 14, color: "rgba(255,255,255,0.5)" }}
          >
            Every feature is designed around how system design interviews are
            actually conducted at top companies.
          </p>
        </div>

        <div className="trust-grid">
          {PILLARS.map((p) => (
            <div key={p.title} className="trust-card">
              <div className="trust-card__icon">{p.icon}</div>
              <h3 className="trust-card__title">{p.title}</h3>
              <p className="trust-card__body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
