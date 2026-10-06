"use client";

import { LLDDemo } from "./DemoPanels";
import { useScrollReveal } from "./useScrollReveal";

const CARDS = [
  {
    k: "{ }",
    t: "Real code editor",
    d: "Define entities, interfaces and relationships in Go, Python or Java scaffolds.",
  },
  {
    k: "SOLID",
    t: "Graded like a senior",
    d: "Checks SOLID principles, design patterns and extensibility — not just compilation.",
  },
  {
    k: "↻",
    t: "Extensibility twists",
    d: "Follow-up scenarios test whether your design bends without breaking.",
  },
];

/** Bento layout: wide panel on one side, stacked capability cards on the other. */
export function FeatureLLD() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head">
        <span className="ls-eyebrow">LLD</span>
        <h2 className="landing-h2">Code the classes. Not just the boxes.</h2>
      </div>

      <div className="ls-bento">
        <div className="ls-bento__main">
          <LLDDemo />
        </div>
        <div className="ls-bento__side">
          {CARDS.map((c) => (
            <div key={c.t} className="landing-card ls-card">
              <span className="ls-card__k">{c.k}</span>
              <h3 className="landing-h3" style={{ fontSize: 16 }}>
                {c.t}
              </h3>
              <p
                className="landing-body"
                style={{ marginTop: 6, fontSize: 13.5 }}
              >
                {c.d}
              </p>
            </div>
          ))}
          <a href="/problems" className="landing-link" style={{ marginTop: 4 }}>
            Try an LLD problem →
          </a>
        </div>
      </div>
    </section>
  );
}
