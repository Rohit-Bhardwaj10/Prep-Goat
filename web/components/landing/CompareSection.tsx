"use client";

import { useScrollReveal } from "./useScrollReveal";

const COMPETITORS = [
  {
    name: "LeetCode",
    description:
      "Best-in-class for algorithms. No guided system design workflow, no architecture canvas, no AI evaluation.",
    url: "https://leetcode.com",
  },
  {
    name: "Educative",
    description:
      "Great text-based courses. Read-only format — you learn patterns but never practice designing under constraints.",
    url: "https://educative.io",
  },
  {
    name: "InterviewBit",
    description:
      "Solid problem sets for coding rounds. System design section is a curated reading list, not a practice environment.",
    url: "https://interviewbit.com",
  },
  {
    name: "AlgoExpert",
    description:
      "Video explanations from a single author. Good for learning, but no hands-on practice with real-time feedback.",
    url: "https://algoexpert.io",
  },
];

export function CompareSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div style={{ maxWidth: 560, marginBottom: 40 }}>
        <h2 className="landing-h2">Compare us with the alternatives.</h2>
        <p className="landing-body" style={{ marginTop: 12 }}>
          We're not replacing your algo prep. We're filling the gap none of them
          cover.
        </p>
      </div>

      <div className="landing-compare-grid">
        {COMPETITORS.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-card landing-card--clickable no-underline block"
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: "var(--landing-text-base)",
                color: "var(--landing-text-primary)",
                marginBottom: 8,
              }}
            >
              {c.name}
            </div>
            <p
              style={{
                fontSize: "var(--landing-text-sm)",
                lineHeight: 1.6,
                color: "var(--landing-text-tertiary)",
                margin: 0,
              }}
            >
              {c.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
