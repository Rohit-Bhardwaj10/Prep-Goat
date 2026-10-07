"use client";

import { useEffect, useState } from "react";
import { useInView } from "./DemoPanels";
import { useScrollReveal } from "./useScrollReveal";
import { ProblemsDemo } from "./ShowcasePanels";

const CONCEPTS = [
  "Sharding",
  "Consistent hashing",
  "CAP theorem",
  "Caching",
  "Message queues",
  "Rate limiting",
  "Replication",
  "CDN",
  "Idempotency",
  "Bloom filters",
  "Leader election",
  "Observer pattern",
  "SOLID",
  "State machine",
  "Strategy",
  "Load balancing",
];

function useCount(to: number, start: boolean, ms = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min((t - t0) / ms, 1);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, ms]);
  return n;
}

export function FeatureProblems() {
  const { ref, visible } = useScrollReveal();
  const { ref: statRef, inView } = useInView<HTMLDivElement>(0.3);
  const total = useCount(100, inView);
  const [hl, setHl] = useState<string | null>(null);

  const DIFF = [
    { l: "Easy", n: 30, c: "#10b981" },
    { l: "Medium", n: 45, c: "#fbbf24" },
    { l: "Hard", n: 25, c: "#f43f5e" },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--center">
        <span className="ls-eyebrow">PROBLEM LIBRARY</span>
        <h2 className="landing-h2">
          100 problems. Every pattern that matters.
        </h2>
        <p className="landing-body" style={{ margin: "16px auto 0" }}>
          Pastebin, URL shortener, rate limiter, notification system — the exact
          problems top companies ask, each with constraints, concept tags and a
          difficulty rating.
        </p>
        <a
          href="/problems"
          className="landing-link"
          style={{ marginTop: 20, display: "inline-flex" }}
        >
          Browse all problems →
        </a>
      </div>

      <div className="ls-stage" style={{ maxWidth: 1200, marginBottom: 28 }}>
        <div className="ls-stage__glow" />
        <ProblemsDemo />
      </div>

      <div
        className="ls-bento3"
        ref={statRef}
        style={{ maxWidth: 1200, marginTop: 0, gap: 12 }}
      >
        <div className="landing-card ls-stat ls-stat--big">
          <span className="ls-stat__label">TOTAL PROBLEMS</span>
          <div className="ls-stat__num">{total}</div>
          <div className="ls-split-bar">
            <div
              className="ls-split-bar__a"
              style={{ width: inView ? "60%" : 0 }}
            >
              HLD · 60
            </div>
            <div
              className="ls-split-bar__b"
              style={{ width: inView ? "40%" : 0 }}
            >
              LLD · 40
            </div>
          </div>
          <p className="landing-body" style={{ fontSize: 13.5, marginTop: 14 }}>
            System design and object-oriented design in one sheet.
          </p>
        </div>

        <div className="landing-card ls-stat">
          <span className="ls-stat__label">DIFFICULTY MIX</span>
          <div className="ls-diff">
            {DIFF.map((d, i) => (
              <div key={d.l} className="ls-diff__row">
                <div
                  className="dm-row dm-row--between"
                  style={{ fontSize: 13 }}
                >
                  <span style={{ color: d.c }}>{d.l}</span>
                  <b>{d.n}</b>
                </div>
                <div className="ls-diff__track">
                  <div
                    className="ls-diff__fill"
                    style={{
                      width: inView ? `${d.n * 2}%` : 0,
                      background: d.c,
                      transitionDelay: `${i * 150}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-card ls-stat">
          <span className="ls-stat__label">
            CONCEPTS COVERED · {hl ?? "hover a tag"}
          </span>
          <div className="ls-cloud">
            {CONCEPTS.map((c, i) => (
              <span
                key={c}
                className={`ls-cloud__tag ${hl === c ? "is-hl" : ""}`}
                style={{ animationDelay: `${(i % 6) * 0.35}s` }}
                onMouseEnter={() => setHl(c)}
                onMouseLeave={() => setHl(null)}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
