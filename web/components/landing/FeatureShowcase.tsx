"use client";

import { useEffect, useState } from "react";
import { useScrollReveal } from "./useScrollReveal";
import { useInView } from "./DemoPanels";

/* ─── Feature 1: HLD ─── */
function HLDGraphic() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [drawn, setDrawn] = useState(0);
  const [edges, setEdges] = useState(false);
  const [dots, setDots] = useState(false);

  useEffect(() => {
    if (!inView) {
      setDrawn(0);
      setEdges(false);
      setDots(false);
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n++;
      setDrawn(n);
      if (n >= 5) {
        clearInterval(id);
        setTimeout(() => {
          setEdges(true);
          setTimeout(() => setDots(true), 800);
        }, 400);
      }
    }, 450);
    return () => clearInterval(id);
  }, [inView]);

  const NODES = [
    { x: 32, y: 100, w: 100, h: 44, label: "client" },
    { x: 175, y: 100, w: 120, h: 44, label: "load balancer" },
    { x: 345, y: 50, w: 110, h: 44, label: "api svc A" },
    { x: 345, y: 155, w: 110, h: 44, label: "api svc B" },
    { x: 510, y: 100, w: 100, h: 44, label: "database" },
  ];
  const EDGES = [
    "M132 122 L173 122",
    "M295 117 L343 75",
    "M295 128 L343 177",
    "M455 73 L508 110",
    "M455 176 L508 128",
  ];

  return (
    <div ref={ref} className="fs-graphic fs-graphic--canvas">
      <div className="fs-graphic__bar">
        <span className="fs-graphic__dot" style={{ background: "#ff6b35" }} />
        <span
          style={{
            fontFamily: "var(--landing-font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: ".08em",
          }}
        >
          ARCHITECTURE CANVAS — TLDRAW
        </span>
        <span
          style={{
            fontFamily: "var(--landing-font-mono)",
            fontSize: 10,
            color: "#34d399",
            marginLeft: "auto",
          }}
        >
          ● AUTO-SAVED
        </span>
      </div>
      <svg
        viewBox="0 0 640 244"
        style={{
          width: "100%",
          height: 210,
          display: "block",
          background: "var(--landing-bg-panel)",
        }}
      >
        <defs>
          <pattern
            id="fs-dots"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".8" fill="rgba(255,255,255,0.06)" />
          </pattern>
          <marker
            id="fs-arrow"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path
              d="M0 0L6 3L0 6"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.2"
            />
          </marker>
        </defs>
        <rect width="640" height="244" fill="url(#fs-dots)" />
        {EDGES.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            strokeDasharray="120"
            strokeDashoffset={edges ? 0 : 120}
            markerEnd="url(#fs-arrow)"
            style={{ transition: `stroke-dashoffset .6s ease ${i * 0.1}s` }}
          />
        ))}
        {NODES.map((n, i) => (
          <g
            key={i}
            style={{
              opacity: i < drawn ? 1 : 0,
              transform: i < drawn ? "none" : "scale(0.85)",
              transformOrigin: `${n.x + n.w / 2}px ${n.y + n.h / 2}px`,
              transition: "all .35s cubic-bezier(.2,1.4,.4,1)",
            }}
          >
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx="6"
              fill="var(--landing-bg-card)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />
            <text
              x={n.x + n.w / 2}
              y={n.y + n.h / 2 + 5}
              textAnchor="middle"
              fill="rgba(255,255,255,0.75)"
              fontSize="12"
              fontFamily="inherit"
            >
              {n.label}
            </text>
          </g>
        ))}
        {dots &&
          EDGES.map((d, i) => (
            <circle key={i} r="3.5" fill="#ff6b35" opacity="0.85">
              <animateMotion
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.35}s`}
                path={d}
              />
            </circle>
          ))}
      </svg>
    </div>
  );
}

/* ─── Feature 2: LLD ─── */
function LLDGraphic() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [typed, setTyped] = useState("");
  const CODE = `interface Vehicle {\n  id: string\n  plate: string\n  type: VehicleType\n}\n\nclass ParkingLot {\n  private floors: Floor[]\n  \n  park(v: Vehicle): Spot | null {\n    for (const floor of this.floors) {\n      const spot = floor.findSpot(v.type)\n      if (spot) return spot.assign(v)\n    }\n    return null\n  }\n}`;

  useEffect(() => {
    if (!inView) {
      setTyped("");
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(CODE.slice(0, i));
      if (i >= CODE.length) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [inView]);

  const lines = typed.split("\n");
  return (
    <div ref={ref} className="fs-graphic fs-graphic--code">
      <div className="fs-graphic__bar">
        <span className="fs-graphic__dot" style={{ background: "#a78bfa" }} />
        <span
          style={{
            fontFamily: "var(--landing-font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: ".08em",
          }}
        >
          parking-lot.ts — LLD EDITOR
        </span>
      </div>
      <div
        style={{
          padding: "16px 20px",
          minHeight: 210,
          background: "#0d0d10",
          fontFamily: "var(--landing-font-mono)",
          fontSize: 12.5,
          lineHeight: 1.7,
          overflowY: "hidden",
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <span
              style={{
                color: "rgba(255,255,255,0.15)",
                width: 20,
                textAlign: "right",
                userSelect: "none",
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                color:
                  line.startsWith("interface") || line.startsWith("class")
                    ? "#a78bfa"
                    : line.includes("//")
                      ? "rgba(255,255,255,0.3)"
                      : line.trim().startsWith("private") ||
                          line.trim().startsWith("const")
                        ? "#38bdf8"
                        : "rgba(255,255,255,0.75)",
              }}
            >
              {line}
            </span>
          </div>
        ))}
        {typed.length < CODE.length && (
          <span
            style={{
              display: "inline-block",
              width: 2,
              height: 14,
              background: "#a78bfa",
              animation: "blink 1s step-end infinite",
              verticalAlign: "middle",
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Feature 3: AI Evaluation ─── */
function EvalGraphic() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [phase, setPhase] = useState<"waiting" | "scan" | "result">("waiting");

  useEffect(() => {
    if (!inView) {
      setPhase("waiting");
      return;
    }
    const t1 = setTimeout(() => setPhase("scan"), 800);
    const t2 = setTimeout(() => setPhase("result"), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [inView]);

  const SCORES = [
    { label: "Requirements", score: 9, c: "#34d399" },
    { label: "Architecture", score: 8, c: "#38bdf8" },
    { label: "Trade-offs", score: 7, c: "#fbbf24" },
    { label: "Code quality", score: 8, c: "#a78bfa" },
  ];

  return (
    <div ref={ref} className="fs-graphic fs-graphic--eval">
      <div className="fs-graphic__bar">
        <span className="fs-graphic__dot" style={{ background: "#34d399" }} />
        <span
          style={{
            fontFamily: "var(--landing-font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: ".08em",
          }}
        >
          AI EVALUATION
        </span>
        {phase === "scan" && (
          <span
            style={{
              fontFamily: "var(--landing-font-mono)",
              fontSize: 10,
              color: "#fbbf24",
              marginLeft: "auto",
              animation: "fadePulse 1s ease infinite",
            }}
          >
            ● Analyzing…
          </span>
        )}
        {phase === "result" && (
          <span
            style={{
              fontFamily: "var(--landing-font-mono)",
              fontSize: 10,
              color: "#34d399",
              marginLeft: "auto",
            }}
          >
            ● Complete
          </span>
        )}
      </div>
      <div style={{ padding: "20px", minHeight: 210, background: "#0d0d10" }}>
        {(phase === "waiting" || phase === "scan") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 0.7, 1, 0.6].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 10,
                  borderRadius: 0,
                  background: "rgba(255,255,255,0.05)",
                  width: `${w * 100}%`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {phase === "scan" && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
                      animation: `dmShimmer 1.4s linear infinite ${i * 0.2}s`,
                      backgroundSize: "200% 100%",
                    }}
                  />
                )}
              </div>
            ))}
            {phase === "scan" && (
              <div
                style={{
                  marginTop: 8,
                  fontFamily: "var(--landing-font-mono)",
                  fontSize: 11,
                  color: "#fbbf24",
                }}
              >
                Evaluating architecture & trade-offs…
              </div>
            )}
          </div>
        )}
        {phase === "result" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 700,
                  letterSpacing: "-.04em",
                  color: "var(--landing-text-primary)",
                }}
              >
                8.0
              </span>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--landing-text-primary)",
                    fontSize: 14,
                  }}
                >
                  Strong submission
                </div>
                <div
                  style={{
                    fontFamily: "var(--landing-font-mono)",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Per-dimension scoring
                </div>
              </div>
            </div>
            {SCORES.map((s, i) => (
              <div
                key={s.label}
                style={{ animation: `fadeUp .4s ease ${i * 0.1}s both` }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 5,
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
                  <span
                    style={{
                      color: s.c,
                      fontFamily: "var(--landing-font-mono)",
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  >
                    {s.score}/10
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 0,
                    background: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 0,
                      background: s.c,
                      width: `${s.score * 10}%`,
                      transition: `width .8s ease ${i * 0.15}s`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Feature 4: Progress tracking ─── */
function ProgressGraphic() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  const WEEKS = [3, 5, 4, 7, 6, 9, 8];
  const MAX_H = 80;

  return (
    <div ref={ref} className="fs-graphic fs-graphic--progress">
      <div className="fs-graphic__bar">
        <span className="fs-graphic__dot" style={{ background: "#fbbf24" }} />
        <span
          style={{
            fontFamily: "var(--landing-font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: ".08em",
          }}
        >
          PROGRESS DASHBOARD
        </span>
      </div>
      <div style={{ padding: "20px", background: "#0d0d10", minHeight: 210 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          {[
            { v: "24", l: "Solved" },
            { v: "8.2", l: "Avg score" },
            { v: "12", l: "Day streak" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--landing-text-primary)",
                  letterSpacing: "-.03em",
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: "var(--landing-font-mono)",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: ".08em",
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            height: MAX_H + 16,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            padding: "0 4px 8px",
          }}
        >
          {WEEKS.map((v, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: 0,
                  background: i === 6 ? "#ff6b35" : "rgba(255,255,255,0.12)",
                  height: inView ? `${(v / 9) * MAX_H}px` : 0,
                  transition: `height .8s cubic-bezier(.2,.8,.2,1) ${i * 0.07}s`,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--landing-font-mono)",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                W{i + 1}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {["Rate Limiter ✓", "URL Shortener ✓", "Parking Lot ✓"].map(
            (t, i) => (
              <span
                key={t}
                style={{
                  fontFamily: "var(--landing-font-mono)",
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 0,
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.35)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {t}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ALTERNATING FEATURE SHOWCASE ─── */

interface ShowcaseProps {
  n: string;
  eyebrow: string;
  headline: string;
  body: string;
  link?: string;
  linkText?: string;
  reverse?: boolean;
  children: React.ReactNode;
}

function ShowcaseRow({
  n,
  eyebrow,
  headline,
  body,
  link,
  linkText,
  reverse,
  children,
}: ShowcaseProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`fs-row landing-fade-in ${visible ? "is-visible" : ""} ${reverse ? "fs-row--rev" : ""}`}
    >
      <div className="fs-row__text">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <span className="fs-num">{n}</span>
          <span className="ls-eyebrow">{eyebrow}</span>
        </div>
        <h2
          className="landing-h2"
          style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
        >
          {headline}
        </h2>
        <p className="landing-body" style={{ marginTop: 14, fontSize: 15 }}>
          {body}
        </p>
        {link && (
          <a
            href={link}
            className="landing-link"
            style={{ marginTop: 20, display: "inline-flex" }}
          >
            {linkText} →
          </a>
        )}
      </div>
      <div className="fs-row__panel">{children}</div>
    </div>
  );
}

export function FeatureShowcase() {
  const { ref, visible } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={`landing-section landing-fade-in ${visible ? "is-visible" : ""}`}
    >
      <div className="ls-head ls-head--center" style={{ marginBottom: 72 }}>
        <span className="ls-eyebrow">HOW IT WORKS</span>
        <h2 className="landing-h2">
          Everything you need.
          <br />
          Nothing you don't.
        </h2>
      </div>

      <div className="fs-stack">
        <ShowcaseRow
          n="01"
          eyebrow="HIGH-LEVEL DESIGN"
          headline="Draw architecture on a real canvas."
          body="Sketch services, databases, queues and data flows on a tldraw whiteboard. The AI evaluator reads your boxes and arrows — not your prose."
          link="/problems"
          linkText="Try an HLD problem"
        >
          <HLDGraphic />
        </ShowcaseRow>

        <ShowcaseRow
          n="02"
          eyebrow="LOW-LEVEL DESIGN"
          headline="Code the classes. Not just the boxes."
          body="Write real interfaces and classes in Go, Python or Java inside a syntax-highlighted editor. Scored on SOLID principles, design patterns and extensibility."
          link="/problems"
          linkText="Try an LLD problem"
          reverse
        >
          <LLDGraphic />
        </ShowcaseRow>

        <ShowcaseRow
          n="03"
          eyebrow="AI EVALUATION"
          headline="Instant feedback. Graded like a senior."
          body="Every submission gets scored across requirements, architecture, trade-offs and code quality. No vague 'good job' — specific, actionable feedback per dimension."
          link="/signup"
          linkText="See your first score"
        >
          <EvalGraphic />
        </ShowcaseRow>

        <ShowcaseRow
          n="04"
          eyebrow="PROGRESS TRACKING"
          headline="Track your growth across every attempt."
          body="See your score trajectory problem by problem, week by week. Know exactly which patterns you've mastered and where you need more reps."
          link="/signup"
          linkText="Start tracking"
          reverse
        >
          <ProgressGraphic />
        </ShowcaseRow>
      </div>
    </section>
  );
}
