"use client";

import { useScrollReveal } from "./useScrollReveal";

const PAIN_CARDS = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6 text-[var(--landing-accent)]"
      >
        <path
          d="M12 9v4m0 4h.01M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Scattered prep, zero signal.",
    body: "YouTube walkthroughs, blog posts, mock interviews — none of them tell you where your design actually breaks. You finish a session with confidence but no evidence.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6 text-[var(--landing-accent)]"
      >
        <path
          d="M9 17v-2m3 2v-4m3 4v-6m-9 8h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Interviewers evaluate 6 dimensions. You practice 1.",
    body: "Real evaluations grade scalability, data modeling, API design, trade-offs, extensibility, and code. Most practice covers only the whiteboard diagram.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6 text-[var(--landing-accent)]"
      >
        <path
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Feedback loops measured in weeks.",
    body: "You only discover gaps in a real interview — or worse, after a rejection. By then you've already burned the opportunity. The loop is too slow.",
  },
];

export function ProblemSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div style={{ maxWidth: 560, marginBottom: 48 }}>
        <h2 className="landing-h2">
          What works for algorithms doesn't work for design.
        </h2>
        <p className="landing-body" style={{ marginTop: 16 }}>
          System design interviews test judgment, not just knowledge. You need a
          practice environment that evaluates how you think — not just what you
          draw.
        </p>
        <a href="#features" className="landing-link" style={{ marginTop: 16 }}>
          See how we fix this
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M6 3l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <div className="landing-cards-grid">
        {PAIN_CARDS.map((card) => (
          <div key={card.title} className="landing-card">
            <div style={{ marginBottom: 16 }}>{card.icon}</div>
            <h3 className="landing-h3" style={{ marginBottom: 8 }}>
              {card.title}
            </h3>
            <p
              style={{
                fontSize: "var(--landing-text-sm)",
                lineHeight: 1.65,
                color: "var(--landing-text-secondary)",
              }}
            >
              {card.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
