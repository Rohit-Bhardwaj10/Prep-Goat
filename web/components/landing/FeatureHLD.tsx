"use client";

import { CanvasDemo } from "./ShowcasePanels";
import { useScrollReveal } from "./useScrollReveal";

const POINTS = [
  {
    n: "01",
    t: "A real canvas",
    d: "tldraw whiteboard for services, databases, queues and data flows — not a text box.",
  },
  {
    n: "02",
    t: "Diagram-aware AI",
    d: "The evaluator reads your boxes and arrows, not your prose.",
  },
  {
    n: "03",
    t: "Guided phases",
    d: "Requirements, architecture, API design, data model and scaling — in interview order.",
  },
];

/** Centered "stage" layout: headline on top, wide product panel, feature strip below. */
export function FeatureHLD() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--center">
        <span className="ls-eyebrow">HLD</span>
        <h2 className="landing-h2">Draw architecture. Get evaluated.</h2>
        <p className="landing-body" style={{ margin: "16px auto 0" }}>
          Sketch your system exactly like you would on a whiteboard. Try it —
          drop a component on the canvas below.
        </p>
      </div>

      <div className="ls-stage" style={{ maxWidth: 1180 }}>
        <div className="ls-stage__glow" />
        <CanvasDemo />
      </div>

      <div className="ls-strip">
        {POINTS.map((p) => (
          <div key={p.n} className="ls-strip__cell">
            <span className="ls-strip__n">{p.n}</span>
            <h3 className="landing-h3">{p.t}</h3>
            <p className="landing-body" style={{ marginTop: 8, fontSize: 14 }}>
              {p.d}
            </p>
          </div>
        ))}
        <a href="/problems" className="landing-link ls-strip__link">
          Try an HLD problem →
        </a>
      </div>
    </section>
  );
}
