"use client";

import { ProgressDemo } from "./DemoPanels";
import { useScrollReveal } from "./useScrollReveal";

const METRICS = [
  { v: "3", l: "Difficulty tiers", d: "Easy, Medium and Hard progress rings." },
  { v: "365", l: "Day heatmap", d: "A full year of submissions at a glance." },
  {
    v: "0",
    l: "Badges or leaderboards",
    d: "Just where you stand and what's next.",
  },
];

/** Full-width dashboard with a metric row underneath. */
export function FeatureProgress() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--split">
        <h2 className="landing-h2">
          Track what matters. Skip the vanity metrics.
        </h2>
        <p className="landing-body">
          Difficulty breakdown, submission heatmap, average score, streaks and
          recent completions — one dashboard, modeled after the tracking you
          already know.
        </p>
      </div>

      <div className="ls-stage">
        <div className="ls-stage__glow" />
        <ProgressDemo />
      </div>

      <div className="ls-metrics">
        {METRICS.map((m) => (
          <div key={m.l} className="ls-metrics__cell">
            <span className="ls-metrics__v">{m.v}</span>
            <div>
              <div className="landing-h3" style={{ fontSize: 15 }}>
                {m.l}
              </div>
              <p
                className="landing-body"
                style={{ marginTop: 4, fontSize: 13.5 }}
              >
                {m.d}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
