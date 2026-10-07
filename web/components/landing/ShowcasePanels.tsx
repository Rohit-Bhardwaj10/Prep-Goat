"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Frame, TopBar, useInView, useTyped } from "./DemoPanels";

/* =====================================================
   1. HLD canvas — auto-drawing architecture with data flow
   ===================================================== */

interface Node {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  hint: string;
}

const NODES: Node[] = [
  {
    id: "client",
    x: 30,
    y: 160,
    w: 110,
    h: 60,
    label: "client",
    hint: "Clients & entry point",
  },
  {
    id: "lb",
    x: 190,
    y: 160,
    w: 130,
    h: 60,
    label: "load balancer",
    hint: "Spread traffic",
  },
  {
    id: "a",
    x: 390,
    y: 70,
    w: 130,
    h: 60,
    label: "api svc A",
    hint: "Stateless API tier",
  },
  {
    id: "b",
    x: 390,
    y: 250,
    w: 130,
    h: 60,
    label: "api svc B",
    hint: "Horizontal scale",
  },
  {
    id: "cache",
    x: 600,
    y: 40,
    w: 130,
    h: 60,
    label: "cache",
    hint: "Hot reads in Redis",
  },
  {
    id: "db",
    x: 600,
    y: 160,
    w: 130,
    h: 60,
    label: "database",
    hint: "Metadata store",
  },
  {
    id: "store",
    x: 600,
    y: 280,
    w: 130,
    h: 60,
    label: "object store",
    hint: "Large blobs",
  },
];

const EDGES = [
  "M140 190 L188 190",
  "M320 180 L388 105",
  "M320 200 L388 275",
  "M520 95 L598 72",
  "M520 110 L598 185",
  "M520 275 L598 200",
  "M520 290 L598 308",
];

const EXTRA = ["cdn", "queue", "worker", "search"];
const TOOLS = ["▲", "✋", "✎", "⌫", "→", "T", "▭"];

export function CanvasDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [drawn, setDrawn] = useState(0);
  const [flow, setFlow] = useState(false);
  const [run, setRun] = useState(0);
  const [extra, setExtra] = useState<{ x: number; y: number; label: string }[]>(
    [],
  );
  const [tool, setTool] = useState(0);
  const [saved, setSaved] = useState("Saved");
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!inView) return;
    setDrawn(0);
    setFlow(false);
    setExtra([]);
    let n = 0;
    let t2: ReturnType<typeof setTimeout>;
    const id = setInterval(() => {
      n += 1;
      setDrawn(n);
      if (n >= NODES.length) {
        clearInterval(id);
        t2 = setTimeout(() => setFlow(true), 1600);
      }
    }, 520);
    return () => {
      clearInterval(id);
      clearTimeout(t2);
    };
  }, [inView, run]);

  const place = (e: React.MouseEvent<SVGSVGElement>) => {
    if (tool !== 6 || !svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 760 - 55;
    const y = ((e.clientY - r.top) / r.height) * 400 - 28;
    setExtra((b) => [...b, { x, y, label: EXTRA[b.length % EXTRA.length] }]);
    setSaved("Saving…");
    setTimeout(() => setSaved("Saved"), 700);
  };

  const edgesOn = drawn >= NODES.length;
  const cur = drawn > 0 && drawn < NODES.length ? NODES[drawn] : null;

  return (
    <Frame innerRef={ref}>
      <TopBar
        title="Pastebin"
        badge="HLD"
        right={
          <>
            <span className="dm-small dm-muted">{saved}</span>
            <button
              type="button"
              className="dm-btn dm-btn--ghost"
              onClick={() => setRun((r) => r + 1)}
            >
              ↺ Replay
            </button>
            <span className="dm-btn dm-btn--accent">Next</span>
          </>
        }
      />
      <div className="dm-split dm-split--third">
        <div className="dm-pad dm-dark">
          <span className="dm-chip">ARCHITECTURE DIAGRAM</span>
          <p className="dm-code-p" style={{ marginBottom: 16 }}>
            Draw your high-level architecture on the canvas.
          </p>
          <ul className="dm-check">
            {NODES.map((n, i) => (
              <li key={n.id} className={i < drawn ? "is-done" : ""}>
                <span className="dm-check__box">{i < drawn ? "✓" : ""}</span>
                <span>
                  <b>{n.hint}</b>
                </span>
              </li>
            ))}
          </ul>
          <p className="dm-small dm-muted" style={{ marginTop: 14 }}>
            Choose ▭ and click the canvas to add your own component.
          </p>
        </div>

        <div className="dm-canvas">
          <div className="dm-canvas__bar">
            <span>ARCHITECTURE DIAGRAM</span>
            <span className="dm-blue">● TLDRAW CANVAS — AUTO-SAVED</span>
          </div>
          <svg
            ref={svgRef}
            viewBox="0 0 760 400"
            className={`dm-svg dm-svg--wide ${tool === 6 ? "is-place" : ""}`}
            onClick={place}
          >
            <defs>
              <marker
                id="dm-arrow2"
                markerWidth="9"
                markerHeight="9"
                refX="7"
                refY="4.5"
                orient="auto"
              >
                <path
                  d="M0 0L8 4.5L0 9"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="1.6"
                />
              </marker>
              <pattern
                id="dm-dots"
                width="22"
                height="22"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1.5" cy="1.5" r="1" fill="#d4d4d8" />
              </pattern>
            </defs>
            <rect width="760" height="400" fill="url(#dm-dots)" />

            {EDGES.map((d, i) => (
              <path
                key={d}
                d={d}
                className={`dm-line dm-line--w ${edgesOn ? "is-on" : ""}`}
                style={{ animationDelay: `${i * 140}ms` }}
                markerEnd="url(#dm-arrow2)"
              />
            ))}

            {NODES.map((b, i) => (
              <g key={b.id} className={`dm-box ${i < drawn ? "is-in" : ""}`}>
                <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="7" />
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + 6}
                  textAnchor="middle"
                >
                  {b.label}
                </text>
              </g>
            ))}

            {extra.map((b, i) => (
              <g key={i} className="dm-box is-in">
                <rect x={b.x} y={b.y} width={110} height={56} rx="7" />
                <text x={b.x + 55} y={b.y + 34} textAnchor="middle">
                  {b.label}
                </text>
              </g>
            ))}

            {flow &&
              EDGES.map((d, i) => (
                <circle key={d} r="4.5" fill="#ff6b35">
                  <animateMotion
                    dur="2.2s"
                    repeatCount="indefinite"
                    begin={`${i * 0.3}s`}
                    path={d}
                  />
                </circle>
              ))}

            {cur && (
              <g
                className="dm-cursor"
                style={{
                  transform: `translate(${cur.x + cur.w / 2}px, ${cur.y + cur.h / 2}px)`,
                }}
              >
                <path
                  d="M0 0 L0 17 L5 13 L9 21 L12 19.5 L8 12 L14 12 Z"
                  fill="#111"
                  stroke="var(--landing-text-primary)"
                  strokeWidth="1.2"
                />
              </g>
            )}
          </svg>
          <div className="dm-tools dm-tools--bar">
            {TOOLS.map((t, i) => (
              <button
                key={t}
                type="button"
                className={`dm-tool ${tool === i ? "is-active" : ""}`}
                style={{ fontSize: i === 6 ? 16 : 14 }}
                onClick={() => setTool(i)}
                aria-label={`tool ${i}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* =====================================================
   2. Resources library
   ===================================================== */

const CATS = ["ALL", "HLD", "LLD", "NETWORKING", "DATABASES", "VIDEOS"];

const RES = [
  {
    t: "The CAP Theorem, explained simply",
    d: "Why a distributed system can only ever guarantee two of three things — and what that means when you pick your database.",
    tag: "DATABASES",
    m: "4 min",
    kind: "Original",
  },
  {
    t: "How DNS actually works",
    d: "From typing a URL to getting an IP back — resolvers, root servers and TTLs, step by step.",
    tag: "NETWORKING",
    m: "3 min",
    kind: "Original",
  },
  {
    t: "Designing a rate limiter",
    d: "Token bucket vs sliding window, and where to keep the counters.",
    tag: "HLD",
    m: "6 min",
    kind: "Original",
  },
  {
    t: "SOLID with a parking lot",
    d: "A practical walk through class design using a real LLD problem.",
    tag: "LLD",
    m: "5 min",
    kind: "Original",
  },
  {
    t: "Consistent hashing in 10 minutes",
    d: "Visual walkthrough of rings, virtual nodes and rebalancing.",
    tag: "VIDEOS",
    m: "10 min",
    kind: "Video",
  },
  {
    t: "Sharding vs replication",
    d: "When to split data and when to copy it — with real failure stories.",
    tag: "DATABASES",
    m: "7 min",
    kind: "Original",
  },
];

export function ResourcesDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [cat, setCat] = useState("ALL");
  const [q, setQ] = useState("");

  const items = RES.filter(
    (r) =>
      (cat === "ALL" || r.tag === cat) &&
      (!q || (r.t + r.d).toLowerCase().includes(q.toLowerCase())),
  );
  const count = (c: string) =>
    c === "ALL" ? RES.length : RES.filter((r) => r.tag === c).length;

  return (
    <Frame innerRef={ref}>
      <div className="dm-lib">
        <aside className="dm-lib__side">
          <div className="dm-eyebrow">STUDY NOTES</div>
          <h3 className="dm-h" style={{ fontSize: 24 }}>
            Library
          </h3>
          <input
            className="dm-lib__search"
            placeholder="Search notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search resources"
          />
          <nav className="dm-lib__nav">
            {CATS.map((c) => (
              <button
                key={c}
                type="button"
                className={`dm-lib__cat ${cat === c ? "is-active" : ""}`}
                onClick={() => setCat(c)}
              >
                <span>{c}</span>
                <span className="dm-lib__n">{count(c)}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="dm-lib__list" key={cat + q + inView}>
          {items.length === 0 && (
            <div className="dm-small dm-muted" style={{ padding: 32 }}>
              Nothing matches yet.
            </div>
          )}
          {items.map((r, i) => (
            <Link
              href="/signup"
              key={r.t}
              className={`dm-lib__item no-underline ${i === 0 ? "is-featured" : ""}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="dm-res__tags">
                <span
                  className={r.kind === "Video" ? "dm-tag-vid" : "dm-tag-orig"}
                >
                  {r.kind === "Video" ? "▶ VIDEO" : "ORIGINAL"}
                </span>
                <span className="dm-muted">{r.tag}</span>
                <span className="dm-muted" style={{ marginLeft: "auto" }}>
                  {r.m}
                </span>
              </div>
              <b className="dm-res__t">{r.t}</b>
              <p className="dm-small dm-muted dm-res__d">{r.d}</p>
              <span className="dm-lib__go">Read ↗</span>
            </Link>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* =====================================================
   3. Try it — type a design, get an AI evaluation
   ===================================================== */

const TRY = [
  {
    name: "Pastebin",
    text: `// Requirements
- create paste -> unique short URL
- fetch paste (rendered + raw)
- optional expiry, custom alias

// Capacity
- 1M writes/day  ~ 12 writes/s
- 10M reads/day  ~ 115 reads/s
- 10KB avg x 1M  = ~10 GB/day

// Design
- metadata in SQL, blobs in object store
- cache hot pastes in Redis
- expire via TTL + background sweeper`,
    scores: [
      ["Requirements", 9, "Scope and expiry clearly covered"],
      ["Capacity", 8, "Read/write ratio estimated"],
      ["Trade-offs", 7, "Discuss cache invalidation on expiry"],
    ],
  },
  {
    name: "URL Shortener",
    text: `// Requirements
- shorten long URL -> 7 char key
- redirect with low latency
- optional analytics

// Capacity
- 100M new URLs / month
- 100:1 read to write ratio

// Design
- base62 ids from a counter service
- read-through cache for hot keys
- shard by key hash`,
    scores: [
      ["Requirements", 8, "Good functional split"],
      ["Capacity", 9, "Throughput math is solid"],
      ["Trade-offs", 8, "Counter vs hash trade-off noted"],
    ],
  },
  {
    name: "Rate Limiter",
    text: `// Requirements
- limit per user + per IP
- low overhead on the hot path
- configurable rules

// Design
- token bucket per key in Redis
- Lua script for atomic refill
- sliding window for strict APIs

// Failure
- fail-open with local fallback`,
    scores: [
      ["Requirements", 8, "Rules and keys well defined"],
      ["Capacity", 7, "Estimate Redis memory per key"],
      ["Trade-offs", 9, "Fail-open decision justified"],
    ],
  },
] as const;

function ScoreRow({
  label,
  value,
  note,
  delay,
}: {
  label: string;
  value: number;
  note: string;
  delay: number;
}) {
  const [n, setN] = useState(0);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  useEffect(() => {
    if (!on) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= value) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [on, value]);

  return (
    <div className="dm-score">
      <div className="dm-row dm-row--between">
        <b>{label}</b>
        <span className="dm-accent">{n}/10</span>
      </div>
      <div className="dm-bar__track dm-bar__track--lg">
        <div
          className="dm-bar__fill"
          style={{
            width: on ? `${value * 10}%` : 0,
            background: "linear-gradient(90deg,#ff6b35,#fbbf24)",
          }}
        />
      </div>
      <div
        className="dm-small dm-muted"
        style={{ opacity: on ? 1 : 0, transition: "opacity .4s" }}
      >
        {note}
      </div>
    </div>
  );
}

export function TryDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [pid, setPid] = useState(0);
  const [phase, setPhase] = useState<"typing" | "scan" | "result">("typing");
  const p = TRY[pid];
  const { typed, done } = useTyped(p.text, inView, 16);

  useEffect(() => setPhase("typing"), [pid]);
  useEffect(() => {
    if (phase === "typing" && done) {
      const t = setTimeout(() => setPhase("scan"), 500);
      return () => clearTimeout(t);
    }
    if (phase === "scan") {
      const t = setTimeout(() => setPhase("result"), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, done]);

  const avg = (
    p.scores.reduce((a, s) => a + s[1], 0) / p.scores.length
  ).toFixed(1);
  const lines = typed.split("\n");

  return (
    <Frame innerRef={ref}>
      <div className="dm-try__top">
        <div className="dm-try__tabs">
          {TRY.map((t, i) => (
            <button
              key={t.name}
              type="button"
              className={`dm-try__tab ${pid === i ? "is-active" : ""}`}
              onClick={() => setPid(i)}
            >
              {t.name}
            </button>
          ))}
        </div>
        <span className="dm-chip dm-chip--green">● NO ACCOUNT NEEDED</span>
      </div>

      <div className="dm-split dm-split--half dm-try__body">
        <div className="dm-try__editor">
          <div className="dm-canvas__bar">
            <span>YOUR DESIGN</span>
            <span className="dm-muted">{done ? "ready" : "typing…"}</span>
          </div>
          <pre className="dm-pre dm-pre--try">
            {lines.map((l, i) => (
              <div key={i} className="dm-pre__l">
                <span className="dm-ln">{i + 1}</span>
                <span className={l.startsWith("//") ? "dm-cm" : ""}>{l}</span>
              </div>
            ))}
            {!done && <span className="dm-caret dm-caret--inline" />}
          </pre>
        </div>

        <div className="dm-try__eval">
          <div className="dm-canvas__bar">
            <span>AI EVALUATION</span>
            <button
              type="button"
              className="dm-link"
              onClick={() => done && setPhase("scan")}
            >
              ↺ re-run
            </button>
          </div>
          <div className="dm-try__evalbody">
            {phase === "typing" && (
              <div className="dm-try__idle">
                <div className="dm-skel" />
                <div className="dm-skel dm-skel--s" />
                <div className="dm-skel" />
                <span className="dm-small dm-muted">
                  Waiting for your design…
                </span>
              </div>
            )}
            {phase === "scan" && (
              <div className="dm-try__idle dm-scan">
                <div className="dm-skel" />
                <div className="dm-skel dm-skel--s" />
                <div className="dm-skel" />
                <div className="dm-scan__laser">
                  <div className="dm-scan__laser-line" />
                </div>
                <span className="dm-small dm-accent">
                  Evaluating architecture & trade-offs…
                </span>
              </div>
            )}
            {phase === "result" && (
              <div className="dm-fade">
                <div className="dm-verdict">
                  <span className="dm-verdict__n">{avg}</span>
                  <div>
                    <b>Strong submission</b>
                    <div className="dm-small dm-muted">
                      Per-step scoring, not one grade
                    </div>
                  </div>
                </div>
                {p.scores.map((s, i) => (
                  <ScoreRow
                    key={pid + s[0]}
                    label={s[0]}
                    value={s[1]}
                    note={s[2]}
                    delay={i * 250}
                  />
                ))}
                <Link
                  href="/signup"
                  className="dm-btn dm-btn--accent dm-try__cta no-underline"
                >
                  Save this attempt — free →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* =====================================================
   4. Problems Demo — Scrolling library of problems
   ===================================================== */

const PROBS = [
  { t: "Pastebin", d: "Easy", c: "Capacity estimation", cat: "HLD" },
  { t: "Rate Limiter", d: "Medium", c: "Token bucket", cat: "HLD" },
  { t: "Key-Value Store", d: "Hard", c: "LSM trees", cat: "HLD" },
  { t: "URL Shortener", d: "Easy", c: "ID generation", cat: "HLD" },
  { t: "Notification System", d: "Medium", c: "Fan-out", cat: "HLD" },
  { t: "Distributed Cache", d: "Hard", c: "Consistent hashing", cat: "HLD" },
  { t: "Chat Messenger", d: "Medium", c: "WebSockets", cat: "HLD" },
  { t: "Parking Lot", d: "Easy", c: "Class design", cat: "LLD" },
  { t: "Elevator System", d: "Hard", c: "State machine", cat: "LLD" },
  { t: "Web Crawler", d: "Medium", c: "URL frontier", cat: "HLD" },
  { t: "Vending Machine", d: "Medium", c: "State pattern", cat: "LLD" },
  { t: "Live Leaderboard", d: "Hard", c: "Sorted sets", cat: "HLD" },
  { t: "Thread-safe LRU", d: "Medium", c: "Locks", cat: "LLD" },
  { t: "Library Management", d: "Easy", c: "Entities", cat: "LLD" },
  { t: "Ride-Sharing", d: "Hard", c: "Geo-indexing", cat: "HLD" },
  { t: "Typeahead Search", d: "Medium", c: "Trie", cat: "HLD" },
];

const DIFF_COLOR: Record<string, string> = {
  Easy: "#10b981",
  Medium: "#fbbf24",
  Hard: "#f43f5e",
};

function ProbRow({
  t,
  d,
  c,
  cat,
  style,
}: {
  t: string;
  d: string;
  c: string;
  cat: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 60px 90px 52px",
        alignItems: "center",
        padding: "9px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        gap: 8,
        fontSize: 12.5,
        ...style,
      }}
    >
      <span
        style={{
          fontWeight: 500,
          color: "#e4e4e7",
          letterSpacing: "-.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {t}
      </span>
      <span
        style={{
          fontFamily: "var(--landing-font-mono)",
          fontSize: 10,
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
          letterSpacing: ".06em",
        }}
      >
        {cat}
      </span>
      <span
        style={{
          fontFamily: "var(--landing-font-mono)",
          fontSize: 10,
          color: "rgba(255,255,255,0.3)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {c}
      </span>
      <span
        style={{
          fontFamily: "var(--landing-font-mono)",
          fontSize: 10,
          color: DIFF_COLOR[d],
          fontWeight: 600,
          textAlign: "right",
        }}
      >
        {d}
      </span>
    </div>
  );
}

export function ProblemsDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const rows = [...PROBS, ...PROBS];

  return (
    <Frame innerRef={ref}>
      <TopBar
        title="Problem Library"
        badge="100+"
        right={
          <div style={{ display: "flex", gap: 8 }}>
            {["ALL", "HLD", "LLD"].map((f) => (
              <span
                key={f}
                style={{
                  fontFamily: "var(--landing-font-mono)",
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 0,
                  background:
                    f === "ALL" ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.05)",
                  border:
                    f === "ALL"
                      ? "1px solid rgba(255,107,53,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: f === "ALL" ? "#ff6b35" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        }
      />
      {/* Column headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 60px 90px 52px",
          padding: "7px 20px",
          gap: 8,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        {["PROBLEM", "TYPE", "CONCEPT", "LEVEL"].map((h) => (
          <span
            key={h}
            style={{
              fontFamily: "var(--landing-font-mono)",
              fontSize: 9,
              letterSpacing: ".12em",
              color: "rgba(255,255,255,0.2)",
              textAlign: h === "LEVEL" ? "right" : "left",
            }}
          >
            {h}
          </span>
        ))}
      </div>
      <div style={{ height: 240, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            animation: inView ? "dmScrollUp 28s linear infinite" : "none",
          }}
        >
          {rows.map((p, i) => (
            <ProbRow key={i} {...p} />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(0deg, var(--landing-bg-panel), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>
    </Frame>
  );
}
