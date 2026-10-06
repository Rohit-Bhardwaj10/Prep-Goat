"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* ---------- shared helpers ---------- */

export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function Frame({
  children,
  innerRef,
}: {
  children: React.ReactNode;
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div className="landing-panel" ref={innerRef}>
      <div className="landing-panel__chrome">
        <span className="landing-panel__dot landing-panel__dot--red" />
        <span className="landing-panel__dot landing-panel__dot--yellow" />
        <span className="landing-panel__dot landing-panel__dot--green" />
      </div>
      <div className="dm">{children}</div>
    </div>
  );
}

export function TopBar({
  title,
  badge,
  right,
}: {
  title: string;
  badge?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="dm-top">
      <div className="dm-top__l">
        <span className="dm-muted">← Back</span>
        <span className="dm-muted">/</span>
        <b>{title}</b>
        {badge && <span className="dm-chip dm-chip--blue">{badge}</span>}
        <span className="dm-chip">DRAFT</span>
      </div>
      <div className="dm-top__r">{right}</div>
    </div>
  );
}

/** Types `text` into state once `start` is true. */
export function useTyped(text: string, start: boolean, speed = 14) {
  const [n, setN] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!start) return;
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setN(Math.min(i, text.length));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [start, text, speed, run]);
  return {
    typed: text.slice(0, n),
    done: n >= text.length,
    replay: () => setRun((r) => r + 1),
  };
}

/* ---------- 1. Problem detail (FeatureProblems) ---------- */

const TABS = {
  "Functional requirements": [
    "Create a paste from text and return a unique URL",
    "Fetch a paste by URL, in rendered and raw form",
    "Optional expiry (10 minutes, 1 day, 1 month, never)",
    "Public and unlisted visibility",
    "Optional custom alias for a paste",
  ],
  "Constraints & notes": [
    "~1M new pastes per day, ~10x as many reads",
    "Paste size up to 10 MB",
    "A link must keep working until its paste expires",
    "Read latency p99 under 200 ms",
  ],
  "Extensibility scenarios": [
    "Add private pastes protected by a password",
    "Take down malware or leaked secrets fast",
    "Support paste versioning and forks",
    "Add full-text search across public pastes",
  ],
} as const;

export function ProblemDetailDemo() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const keys = Object.keys(TABS) as (keyof typeof TABS)[];
  const [tab, setTab] = useState<keyof typeof TABS>(keys[0]);
  const [started, setStarted] = useState(false);
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started]);

  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <Frame innerRef={ref}>
      <div className="dm-pad">
        <div className="dm-row dm-row--between">
          <div>
            <div className="dm-eyebrow">HLD</div>
            <h3 className="dm-h">Pastebin</h3>
          </div>
          <button
            type="button"
            className="dm-btn dm-btn--accent"
            onClick={() => setStarted((s) => !s)}
          >
            {started ? `■ Stop ${mm}:${ss}` : "▶ Start Attempt"}
          </button>
        </div>
        <p className="dm-p">
          Design Pastebin. Users paste text or code (up to 10 MB), get back a
          unique link, and anyone with the link can view it. Pastes can
          optionally expire.
        </p>

        <div className="dm-split dm-split--main">
          <div>
            <div className="dm-tabs">
              {keys.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`dm-tab ${tab === k ? "is-active" : ""}`}
                  onClick={() => setTab(k)}
                >
                  {k}
                </button>
              ))}
            </div>
            <ol className="dm-reqs" key={tab}>
              {TABS[tab].map((r, i) => (
                <li
                  key={r}
                  style={{ animationDelay: `${(inView ? i : 0) * 70}ms` }}
                >
                  <span className="dm-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b>{r}</b>
                </li>
              ))}
            </ol>
          </div>
          <div className="dm-card">
            <div className="dm-eyebrow dm-muted">PAST ATTEMPTS</div>
            {started ? (
              <div className="dm-attempt">
                <span className="dm-pulse" /> Attempt #1 in progress · {mm}:{ss}
              </div>
            ) : (
              <p className="dm-small">
                You haven&apos;t completed any attempts for this problem yet.
                Start one to see your history here.
              </p>
            )}
            <div className="dm-row dm-row--between dm-small dm-muted dm-card__foot">
              <span>Recent Avg: -</span>
              <span>Benchmark: 35m</span>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 3. Requirements step with typing (TryItSection) ---------- */

const REQ_TEXT = `// Requirements & Estimation

// 1. Functional Requirements
- Create paste, return unique URL
- Fetch paste (rendered + raw)
- Optional expiry, custom alias

// 2. Non-Functional Requirements
- 1M writes/day, ~10M reads/day
- p99 read latency < 200ms

// 3. Capacity Estimation
- ~12 writes/s, ~115 reads/s
- 1M × 10KB avg = ~10 GB/day`;

export function RequirementsTypingDemo() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { typed, done, replay } = useTyped(REQ_TEXT, inView, 22);
  const [text, setText] = useState<string | null>(null);
  const value = text ?? typed;

  return (
    <Frame innerRef={ref}>
      <TopBar
        title="Pastebin"
        badge="HLD"
        right={
          <span className="dm-small dm-muted">
            {done ? "Saved" : "Saving…"}
          </span>
        }
      />
      <div className="dm-split dm-split--half dm-fill">
        <div className="dm-pad dm-dark">
          <span className="dm-chip">REQUIREMENTS</span>
          <p className="dm-code-p">
            Clarify the scope of this system design.{"\n\n"}Ask yourself:{"\n"}•
            What are the core functional requirements?{"\n"}• What scale do we
            target?{"\n"}• What are the SLAs?{"\n"}• What is out of scope?
          </p>
        </div>
        <div className="dm-editor">
          <div className="dm-canvas__bar">
            <span>REQUIREMENTS</span>
            <button
              type="button"
              className="dm-link"
              onClick={() => {
                setText(null);
                replay();
              }}
            >
              ↺ replay
            </button>
          </div>
          <textarea
            className="dm-textarea"
            value={value}
            onFocus={() => text === null && setText(typed)}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            aria-label="Requirements editor"
          />
          {!done && text === null && <span className="dm-caret" />}
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 4. Guided workflow stepper (FeatureWorkflow) ---------- */

const STEPS = [
  {
    chip: "REQUIREMENTS",
    left: "Clarify the scope of this system design.\n\nAsk yourself:\n• What are the core functional requirements?\n• What scale do we target?\n• What is explicitly out of scope?",
    title: "REQUIREMENTS",
    right: [
      "// Requirements & Estimation",
      "// 1. Functional Requirements",
      "// 2. Non-Functional Requirements",
      "// 3. Capacity Estimation",
    ],
  },
  {
    chip: "ARCHITECTURE DIAGRAM",
    left: "Draw your high-level architecture on the canvas.\n\nThink about:\n• What major components do you need?\n• How do they communicate?\n• Where does data flow?",
    title: "ARCHITECTURE DIAGRAM",
    right: [
      "[ client ] → [ api ] → [ clipboard service ]",
      "[ clipboard service ] → [ shared db ]",
      "[ clipboard service ] → [ object store ]",
    ],
  },
  {
    chip: "SCALE & TRADE-OFFS",
    left: "Annotate your diagram or add notes for:\n\n• Where are the bottlenecks at 100× scale?\n• What caching, sharding, or replication applies?\n• What trade-offs did you make?",
    title: "SCALE & TRADE-OFFS",
    right: [
      "// Q1: Add private pastes protected by a password.",
      "// Q2: Users report malware in pastes. How do you take them down fast?",
      "// Q3: Support paste versioning and forks.",
      "// Q4: Two users upload identical content. Store once?",
      "// Q5: Add full-text search without slowing down reads.",
    ],
  },
];

export function WorkflowDemo({
  step: stepProp,
  onStepChange,
}: {
  step?: number;
  onStepChange?: (n: number) => void;
} = {}) {
  const { ref } = useInView<HTMLDivElement>();
  const [inner, setInner] = useState(2);
  const step = stepProp ?? inner;
  const [saving, setSaving] = useState(false);
  const [time, setTime] = useState("2:21:01 AM");
  const s = STEPS[step];

  const go = (n: number) => {
    if (n < 0 || n > 2) return;
    setInner(n);
    onStepChange?.(n);
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setTime(new Date().toLocaleTimeString());
    }, 900);
  };

  return (
    <Frame innerRef={ref}>
      <TopBar
        title="Pastebin"
        badge="HLD"
        right={
          <>
            <span className="dm-small dm-muted">Saved {time}</span>
            <span className="dm-btn dm-btn--ghost">
              {saving ? "◌ Saving…" : "Save Draft"}
            </span>
            <span className="dm-btn dm-btn--accent">
              {step === 2 ? "Submit" : "Next"}
            </span>
          </>
        }
      />
      <div className="dm-stepper">
        <button
          type="button"
          className="dm-arrow"
          onClick={() => go(step - 1)}
          disabled={step === 0}
          aria-label="Previous step"
        >
          ‹
        </button>
        {STEPS.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`dm-dot ${i === step ? "is-active" : ""}`}
            onClick={() => go(i)}
            aria-label={`Step ${i + 1}`}
          />
        ))}
        <button
          type="button"
          className="dm-arrow"
          onClick={() => go(step + 1)}
          disabled={step === 2}
          aria-label="Next step"
        >
          ›
        </button>
      </div>
      <div className="dm-split dm-split--half dm-fill" key={step}>
        <div className="dm-pad dm-dark dm-fade">
          <span className="dm-chip">{s.chip}</span>
          <p className="dm-code-p">{s.left}</p>
        </div>
        <div className="dm-editor dm-fade">
          <div className="dm-canvas__bar">
            <span>{s.title}</span>
          </div>
          <div className="dm-lines">
            {s.right.map((l, i) => (
              <div key={l} style={{ animationDelay: `${i * 90}ms` }}>
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 5. LLD class design (FeatureLLD) ---------- */

const LLD_LINES = [
  "// ----------------------------------------",
  "// ENTITIES & RELATIONSHIPS",
  "// ----------------------------------------",
  "//",
  "// Parking Lot:",
  "//   ParkingLot, Floor, Spot, Vehicle, Ticket",
  "//",
  "// CLASS DESIGN",
  "//",
  "//   enum VehicleType { CAR, BIKE, TRUCK }",
  "//",
  "//   class Ticket {",
  "//     id: string",
  "//     vehicle: Vehicle",
  "//     spot: Spot",
  "//     entryTime: Date",
  "//   }",
  "//",
  "//   class ParkingLot {",
  "//     + assign(v: Vehicle): Ticket",
  "//     + release(t: Ticket): Fee",
  "//     + freeCount(floor: int): int",
  "//   }",
];

const REQS = [
  "Assign a compatible free spot and issue a ticket",
  "Calculate the fee on exit and release the spot",
  "Support multiple vehicle types with different spot sizes",
  "Operate several entry and exit gates at the same time",
  "Show free spot counts per floor",
];

export function LLDDemo() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView) return;
    setShown(0);
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= LLD_LINES.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 110);
    return () => clearInterval(id);
  }, [inView, run]);

  return (
    <Frame innerRef={ref}>
      <TopBar title="Parking Lot" />
      <div className="dm-split dm-split--half dm-fill">
        <div className="dm-pad dm-dark">
          <span className="dm-chip">CLASS DESIGN</span>
          <p className="dm-code-p">
            Design the classes, interfaces, and relationships.
          </p>
          <div className="dm-eyebrow dm-muted" style={{ marginTop: 14 }}>
            REQUIREMENTS
          </div>
          <ol className="dm-reqs dm-reqs--num">
            {REQS.map((r, i) => (
              <li
                key={r}
                className={hover === i ? "is-hover" : ""}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <span className="dm-accent">{i + 1}.</span> {r}
              </li>
            ))}
          </ol>
        </div>
        <div className="dm-editor">
          <div className="dm-canvas__bar">
            <span>CLASS DESIGN</span>
            <button
              type="button"
              className="dm-link"
              onClick={() => setRun((r) => r + 1)}
            >
              ↺ replay
            </button>
          </div>
          <pre className="dm-pre">
            {LLD_LINES.slice(0, shown).map((l, i) => (
              <div key={i} className="dm-pre__l">
                <span className="dm-ln">{i + 1}</span>
                <span
                  className={
                    l.includes("class ") || l.includes("enum ") ? "dm-kw" : ""
                  }
                >
                  {l}
                </span>
              </div>
            ))}
            {shown < LLD_LINES.length && (
              <span className="dm-caret dm-caret--inline" />
            )}
          </pre>
        </div>
      </div>
    </Frame>
  );
}

/* ---------- 6. Progress dashboard (FeatureProgress) ---------- */

const BARS = [
  { l: "Easy", a: 6, b: 12, c: "#10b981" },
  { l: "Medium", a: 31, b: 58, c: "#fbbf24" },
  { l: "Hard", a: 13, b: 30, c: "#f43f5e" },
];
const RECENT = [
  ["API Gateway and Service Discovery", "9 hours ago"],
  ["Sharded SQL Layer", "10 hours ago"],
  ["Webhook Delivery", "11 hours ago"],
];

export function ProgressDemo() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [count, setCount] = useState(0);
  const [hover, setHover] = useState<string>(
    "65 submissions in the past one year",
  );

  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setCount(n);
      if (n >= 50) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [inView]);

  const cells = useMemo(() => {
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: 7 * 36 }, () => {
      const r = rnd();
      return r > 0.86 ? 3 : r > 0.78 ? 2 : r > 0.7 ? 1 : 0;
    });
  }, []);

  const R = 52;
  const C = 2 * Math.PI * R;

  return (
    <Frame innerRef={ref}>
      <div className="dm-pad dm-dash">
        <div className="dm-card dm-profile">
          <div className="dm-avatar">R</div>
          <b>rohit</b>
          <span className="dm-small dm-muted">rohit@example.com</span>
          <span className="dm-btn dm-btn--green">Edit Profile</span>
          <div className="dm-stat">
            <span>Attempts</span>
            <b>65</b>
          </div>
          <div className="dm-stat">
            <span>Avg Score</span>
            <b>87%</b>
          </div>
          <div className="dm-stat">
            <span>Hints Used</span>
            <b>0</b>
          </div>
        </div>

        <div className="dm-dash__main">
          <div className="dm-card dm-ring-row">
            <div className="dm-ring">
              <svg viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={R} className="dm-ring__bg" />
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  className="dm-ring__fg"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - count / 100)}
                />
              </svg>
              <div className="dm-ring__t">
                <b>{count}</b>
                <span>/100</span>
                <small>Solved</small>
              </div>
            </div>
            <div className="dm-bars">
              {BARS.map((b, i) => (
                <div key={b.l} className="dm-bar">
                  <div className="dm-row dm-row--between">
                    <span style={{ color: b.c }}>{b.l}</span>
                    <span>
                      {b.a} / {b.b}
                    </span>
                  </div>
                  <div className="dm-bar__track">
                    <div
                      className="dm-bar__fill"
                      style={{
                        background: b.c,
                        width: inView ? `${(b.a / b.b) * 100}%` : 0,
                        transitionDelay: `${i * 150}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dm-card">
            <b className="dm-small">{hover}</b>
            <div
              className="dm-heat"
              onMouseLeave={() =>
                setHover("65 submissions in the past one year")
              }
            >
              {cells.map((v, i) => (
                <span
                  key={i}
                  className={`dm-cell dm-cell--${v}`}
                  style={{ animationDelay: `${(i % 36) * 14}ms` }}
                  onMouseEnter={() =>
                    setHover(
                      `${v} submission${v === 1 ? "" : "s"} on day ${i + 1}`,
                    )
                  }
                />
              ))}
            </div>
          </div>

          <div className="dm-card dm-recent">
            <div className="dm-small dm-recent__h">
              <span className="dm-green">◉</span> <b>Recent AC</b>{" "}
              <span className="dm-muted">&nbsp; ∿ List</span>
            </div>
            {RECENT.map(([t, w]) => (
              <div key={t} className="dm-recent__r">
                <b>{t}</b>
                <span className="dm-muted">{w}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
