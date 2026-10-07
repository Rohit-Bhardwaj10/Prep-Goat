"use client";

import { ResourcesDemo } from "./ShowcasePanels";
import { useScrollReveal } from "./useScrollReveal";

const FACTS = [
  { v: "40+", l: "Original notes written from real interview prep" },
  { v: "6", l: "Topics: HLD, LLD, networking, databases and more" },
  { v: "3–10", l: "Minute reads — no padding" },
];

/** Wide library panel with a fact row. */
export function FeatureResources() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--split">
        <div>
          <span className="ls-eyebrow">RESOURCES</span>
          <h2 className="landing-h2">Study notes that respect your time.</h2>
        </div>
        <p className="landing-body">
          A curated library of what actually helps — short original write-ups
          and the best videos, filterable by topic. Try the filters.
        </p>
      </div>

      <div className="ls-stage">
        <div className="ls-stage__glow" />
        <ResourcesDemo />
      </div>

      <div className="ls-facts">
        {FACTS.map((f) => (
          <div key={f.l} className="ls-facts__cell">
            <span className="ls-facts__v">{f.v}</span>
            <span className="ls-facts__l">{f.l}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
