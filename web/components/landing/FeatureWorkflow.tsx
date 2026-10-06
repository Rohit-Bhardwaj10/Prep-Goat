"use client";

import { useState } from "react";
import { WorkflowDemo } from "./DemoPanels";
import { useScrollReveal } from "./useScrollReveal";

const PHASES = [
  {
    t: "Requirements",
    d: "Clarify scope, scale and SLAs before drawing anything.",
  },
  {
    t: "Architecture",
    d: "Lay out services, storage and data flow on the canvas.",
  },
  {
    t: "Scale & trade-offs",
    d: "Defend bottlenecks at 100× load and the trade-offs you made.",
  },
];

/** Timeline layout: clickable phases drive the demo below. */
export function FeatureWorkflow() {
  const { ref, visible } = useScrollReveal();
  const [step, setStep] = useState(2);

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--split">
        <h2 className="landing-h2">No hand-waving. Every step evaluated.</h2>
        <p className="landing-body">
          Each problem walks you through the phases of a 45-minute interview.
          The AI scores each step independently — not just your final diagram.
        </p>
      </div>

      <div className="ls-timeline">
        {PHASES.map((p, i) => (
          <button
            key={p.t}
            type="button"
            className={`ls-timeline__item ${i === step ? "is-active" : ""} ${i < step ? "is-done" : ""}`}
            onClick={() => setStep(i)}
          >
            <span className="ls-timeline__dot">{i < step ? "✓" : i + 1}</span>
            <span className="ls-timeline__t">{p.t}</span>
            <span className="ls-timeline__d">{p.d}</span>
          </button>
        ))}
      </div>

      <div className="ls-narrow">
        <WorkflowDemo step={step} onStepChange={setStep} />
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <a href="/problems" className="landing-link">
          See the full workflow →
        </a>
      </div>
    </section>
  );
}
