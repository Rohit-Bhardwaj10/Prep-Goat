"use client";

import { useEffect, useState, useRef } from "react";
import { useScrollReveal } from "./useScrollReveal";
import { useInView } from "./DemoPanels";

/* ── animated counter ── */
function useCount(to: number, run: boolean, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min((t - t0) / ms, 1);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return n;
}

/* ── Card 1: Workflow flow connector ── */
function WorkflowCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 1800);
    return () => clearInterval(id);
  }, [inView]);

  const STEPS = [
    { label: "Pick a problem", icon: "◎", color: "#ff6b35" },
    { label: "Draw architecture", icon: "⬡", color: "#a78bfa" },
    { label: "Write code / design", icon: "{ }", color: "#38bdf8" },
    { label: "Get AI evaluation", icon: "✦", color: "#34d399" },
  ];

  return (
    <div ref={ref} className="bn-card bn-card--flow">
      <span className="bn-eyebrow">GUIDED WORKFLOW</span>
      <p className="bn-title">
        Focus on thinking,
        <br />
        not the process.
      </p>
      <div className="bn-flow">
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`bn-flow__step ${step === i ? "is-active" : ""} ${step > i ? "is-done" : ""}`}
          >
            <div
              className="bn-flow__dot"
              style={{
                background:
                  step === i
                    ? s.color
                    : step > i
                      ? "#34d399"
                      : "rgba(255,255,255,0.07)",
                borderColor:
                  step === i
                    ? s.color
                    : step > i
                      ? "#34d399"
                      : "rgba(255,255,255,0.12)",
              }}
            >
              <span
                style={{
                  color:
                    step === i
                      ? "var(--landing-text-primary)"
                      : step > i
                        ? "var(--landing-text-primary)"
                        : "rgba(255,255,255,0.4)",
                  fontSize: 11,
                }}
              >
                {step > i ? "✓" : s.icon}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="bn-flow__line">
                <div
                  className="bn-flow__fill"
                  style={{
                    width: step > i ? "100%" : step === i ? "50%" : "0%",
                  }}
                />
              </div>
            )}
            <span
              className="bn-flow__label"
              style={{
                color:
                  step === i
                    ? "var(--landing-text-primary)"
                    : "rgba(255,255,255,0.5)",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Card 2: Stats ── */
function StatsCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const problems = useCount(100, inView, 1400);
  const patterns = useCount(40, inView, 1100);
  const avg = useCount(8, inView, 900);

  const STATS = [
    {
      label: "Problems",
      value: problems,
      suffix: "+",
      note: "HLD & LLD combined",
    },
    {
      label: "Patterns",
      value: patterns,
      suffix: "+",
      note: "Core design patterns",
    },
    {
      label: "Avg score /10",
      value: avg,
      suffix: "",
      note: "On first attempt",
    },
  ];

  return (
    <div ref={ref} className="bn-card bn-card--stats">
      <span className="bn-eyebrow">PROBLEM LIBRARY</span>
      <div className="bn-stats">
        {STATS.map((s) => (
          <div key={s.label} className="bn-stat">
            <div className="bn-stat__num">
              {s.value}
              {s.suffix}
            </div>
            <div className="bn-stat__label">{s.label}</div>
            <div className="bn-stat__note">{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Card 3: AI Evaluation dark card ── */
function EvalCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) {
      setShown(0);
      return;
    }
    const id = setInterval(() => setShown((s) => Math.min(s + 1, 3)), 600);
    return () => clearInterval(id);
  }, [inView]);

  const ITEMS = [
    { label: "Requirements clarity", score: 9, color: "#34d399" },
    { label: "Architecture depth", score: 8, color: "#38bdf8" },
    { label: "Trade-off reasoning", score: 7, color: "#fbbf24" },
  ];

  return (
    <div ref={ref} className="bn-card bn-card--eval bn-card--dark">
      <span className="bn-eyebrow" style={{ color: "#34d399" }}>
        AI EVALUATION
      </span>
      <p className="bn-title" style={{ fontSize: 18 }}>
        Scored like a<br />
        senior engineer.
      </p>
      <div className="bn-eval">
        {ITEMS.map((item, i) => (
          <div
            key={item.label}
            className="bn-eval__row"
            style={{
              opacity: i < shown ? 1 : 0,
              transform: i < shown ? "none" : "translateY(6px)",
              transition: "all .4s ease",
            }}
          >
            <div className="bn-eval__top">
              <span>{item.label}</span>
              <span
                style={{
                  color: item.color,
                  fontWeight: 700,
                  fontFamily: "var(--landing-font-mono)",
                  fontSize: 12,
                }}
              >
                {item.score}/10
              </span>
            </div>
            <div className="bn-eval__track">
              <div
                className="bn-eval__fill"
                style={{ width: `${item.score * 10}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Card 4: Problem preview list ── */
function ProblemPreviewCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % 4), 2200);
    return () => clearInterval(id);
  }, [inView]);

  const PROBS = [
    { title: "Design a URL Shortener", diff: "Easy", cat: "HLD" },
    { title: "Parking Lot System", diff: "Easy", cat: "LLD" },
    { title: "Design Twitter / X", diff: "Hard", cat: "HLD" },
    { title: "Thread-safe LRU Cache", diff: "Medium", cat: "LLD" },
  ];

  const DIFF_C: Record<string, string> = {
    Easy: "#34d399",
    Medium: "#fbbf24",
    Hard: "#f43f5e",
  };

  return (
    <div ref={ref} className="bn-card bn-card--problems">
      <span className="bn-eyebrow">CANONICAL PROBLEMS</span>
      <p className="bn-title">Every problem companies actually ask.</p>
      <div className="bn-prob-list">
        {PROBS.map((p, i) => (
          <div
            key={p.title}
            className={`bn-prob-row ${i === active ? "is-active" : ""}`}
          >
            <div
              className="bn-prob-row__dot"
              style={{
                background: i === active ? "#ff6b35" : "rgba(255,255,255,0.07)",
              }}
            />
            <span className="bn-prob-row__title">{p.title}</span>
            <span className="bn-prob-row__cat">{p.cat}</span>
            <span
              className="bn-prob-row__diff"
              style={{ color: DIFF_C[p.diff] }}
            >
              {p.diff}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main export ── */
export function BentoSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--center">
        <span className="ls-eyebrow">WHY PREP GOAT</span>
        <h2 className="landing-h2">
          One platform in.
          <br />
          Interview-ready out.
        </h2>
        <p
          className="landing-body"
          style={{ margin: "16px auto 0", maxWidth: 480 }}
        >
          The structured, AI-powered system design preparation platform built
          for how interviews actually work.
        </p>
      </div>

      <div className="bn-grid">
        <WorkflowCard />
        <StatsCard />
        <EvalCard />
        <ProblemPreviewCard />
      </div>
    </section>
  );
}
