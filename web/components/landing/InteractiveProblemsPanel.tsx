"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Sheet = "LLD" | "HLD";
type Diff = "Easy" | "Medium" | "Hard";

interface Problem {
  title: string;
  desc: string;
  concepts: string[];
  difficulty: Diff;
}

interface Category {
  name: string;
  problems: Problem[];
}

const DATA: Record<Sheet, Category[]> = {
  HLD: [
    {
      name: "Foundations",
      problems: [
        {
          title: "Pastebin",
          desc: "Design Pastebin. Users paste text or code (up to 10 MB), get a shareable link.",
          concepts: ["Capacity estimation", "blob vs metadata split"],
          difficulty: "Easy",
        },
        {
          title: "URL Shortener",
          desc: "Design a URL shortening service like bit.ly. Users paste a long URL and get a short one.",
          concepts: ["ID generation", "read-heavy caching", "sharding"],
          difficulty: "Easy",
        },
        {
          title: "Scale from 1 to 10M Users",
          desc: "You launched a web app on a single server and it is taking on traffic.",
          concepts: ["Horizontal scaling", "stateless services", "CDN"],
          difficulty: "Easy",
        },
        {
          title: "Photo Sharing Upload",
          desc: "Design the upload and delivery path for a photo sharing app.",
          concepts: ["Object storage", "pre-signed URLs", "thumbnails"],
          difficulty: "Easy",
        },
      ],
    },
    {
      name: "Core Infrastructure",
      problems: [
        {
          title: "Rate Limiter",
          desc: "Design a distributed rate limiter protecting public APIs from abuse.",
          concepts: ["Token bucket", "Redis", "sliding window"],
          difficulty: "Medium",
        },
        {
          title: "Notification System",
          desc: "Design a system that fans out push, email and SMS notifications at scale.",
          concepts: ["Fan-out", "queues", "retries"],
          difficulty: "Medium",
        },
        {
          title: "Distributed Cache",
          desc: "Design a distributed in-memory cache with eviction and replication.",
          concepts: ["Consistent hashing", "eviction", "replication"],
          difficulty: "Hard",
        },
      ],
    },
    {
      name: "Storage Systems",
      problems: [
        {
          title: "Key-Value Store",
          desc: "Design a distributed key-value store with tunable consistency.",
          concepts: ["Quorum", "LSM trees", "gossip"],
          difficulty: "Hard",
        },
        {
          title: "Web Crawler",
          desc: "Design a crawler that fetches billions of pages politely and de-duplicates them.",
          concepts: ["URL frontier", "bloom filter", "politeness"],
          difficulty: "Medium",
        },
        {
          title: "File Storage Sync",
          desc: "Design a Dropbox-style service that syncs files across devices.",
          concepts: ["Chunking", "deduplication", "delta sync"],
          difficulty: "Medium",
        },
      ],
    },
    {
      name: "Real-time Systems",
      problems: [
        {
          title: "Chat Messenger",
          desc: "Design a 1:1 and group chat service with delivery receipts.",
          concepts: ["WebSockets", "ordering", "presence"],
          difficulty: "Medium",
        },
        {
          title: "Live Leaderboard",
          desc: "Design a real-time leaderboard for millions of concurrent players.",
          concepts: ["Sorted sets", "sharding", "approximation"],
          difficulty: "Hard",
        },
      ],
    },
  ],
  LLD: [
    {
      name: "Object Modeling",
      problems: [
        {
          title: "Parking Lot",
          desc: "Model a multi-level parking lot with different vehicle types and pricing.",
          concepts: ["Class design", "strategy pattern"],
          difficulty: "Easy",
        },
        {
          title: "Library Management",
          desc: "Design the classes for a library with members, books and fines.",
          concepts: ["Entities", "SOLID"],
          difficulty: "Easy",
        },
        {
          title: "Vending Machine",
          desc: "Design a vending machine that handles inventory, payment and refunds.",
          concepts: ["State pattern", "enums"],
          difficulty: "Medium",
        },
      ],
    },
    {
      name: "Concurrency",
      problems: [
        {
          title: "Thread-safe LRU Cache",
          desc: "Implement an LRU cache that is safe under concurrent access.",
          concepts: ["Locks", "linked list + map"],
          difficulty: "Medium",
        },
        {
          title: "Elevator System",
          desc: "Design an elevator controller scheduling multiple cars and requests.",
          concepts: ["Scheduling", "state machine", "observer"],
          difficulty: "Hard",
        },
      ],
    },
  ],
};

const DIFFS: ("All" | Diff)[] = ["All", "Easy", "Medium", "Hard"];

export function InteractiveProblemsPanel() {
  const [sheet, setSheet] = useState<Sheet>("HLD");
  const [diff, setDiff] = useState<"All" | Diff>("All");
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DATA[sheet]
      .map((c) => ({
        ...c,
        problems: c.problems.filter(
          (p) =>
            (diff === "All" || p.difficulty === diff) &&
            (!q ||
              p.title.toLowerCase().includes(q) ||
              p.desc.toLowerCase().includes(q) ||
              p.concepts.some((x) => x.toLowerCase().includes(q))),
        ),
      }))
      .filter((c) => c.problems.length > 0);
  }, [sheet, diff, query]);

  let counter = 0;

  return (
    <div className="landing-panel">
      <div className="landing-panel__chrome">
        <span className="landing-panel__dot landing-panel__dot--red" />
        <span className="landing-panel__dot landing-panel__dot--yellow" />
        <span className="landing-panel__dot landing-panel__dot--green" />
      </div>

      <div className="lpp">
        <div className="lpp__head">
          <h3 className="lpp__title">Problems</h3>
          <span className="lpp__count">100 problems</span>
        </div>

        <div className="lpp__toolbar">
          <div className="lpp__group">
            {(["LLD", "HLD"] as Sheet[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`lpp__tab ${sheet === s ? "is-active-accent" : ""}`}
                onClick={() => setSheet(s)}
              >
                {s} Sheet
              </button>
            ))}
          </div>
          <div className="lpp__group lpp__group--sm">
            {DIFFS.map((d) => (
              <button
                key={d}
                type="button"
                className={`lpp__pill ${diff === d ? "is-active" : ""}`}
                onClick={() => setDiff(d)}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
          <label className="lpp__search">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M11 11l3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems..."
              aria-label="Search problems"
            />
          </label>
        </div>

        <div className="lpp__list">
          {categories.length === 0 && (
            <div className="lpp__empty">No problems match your filters.</div>
          )}
          {categories.map((cat) => {
            const key = `${sheet}-${cat.name}`;
            const isCollapsed = collapsed[key];
            return (
              <div key={key} className="lpp__cat">
                <button
                  type="button"
                  className="lpp__cat-head"
                  onClick={() =>
                    setCollapsed((c) => ({ ...c, [key]: !c[key] }))
                  }
                >
                  <span>
                    {cat.name.toUpperCase()}
                    <span className="lpp__badge">{cat.problems.length}</span>
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      transform: isCollapsed ? "rotate(180deg)" : "none",
                      transition: "transform .2s",
                    }}
                  >
                    <path
                      d="M3 10l5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {!isCollapsed && (
                  <>
                    <div className="lpp__cols">
                      <span>PROBLEM</span>
                      <span>CONCEPTS</span>
                      <span>DIFFICULTY</span>
                      <span>ACTION</span>
                    </div>
                    {cat.problems.map((p) => {
                      counter += 1;
                      return (
                        <div key={p.title} className="lpp__row">
                          <span className="lpp__num">
                            {String(counter).padStart(2, "0")}
                          </span>
                          <div className="lpp__main">
                            <div className="lpp__name">{p.title}</div>
                            <div className="lpp__desc">{p.desc}</div>
                          </div>
                          <div className="lpp__tags">
                            {p.concepts.slice(0, 2).map((c) => (
                              <span key={c} className="lpp__tag">
                                {c}
                              </span>
                            ))}
                            {p.concepts.length > 2 && (
                              <span className="lpp__more">
                                +{p.concepts.length - 2}
                              </span>
                            )}
                          </div>
                          <span
                            className={`lpp__diff lpp__diff--${p.difficulty.toLowerCase()}`}
                          >
                            {p.difficulty}
                          </span>
                          <Link
                            href="/signup"
                            className="lpp__solve no-underline"
                          >
                            Solve
                          </Link>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
