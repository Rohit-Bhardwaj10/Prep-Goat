import { Difficulty, ProblemType } from '@prisma/client';
import { prisma } from './auth';

const RAW_HLD = `
**Foundations**
| 1 | Pastebin | Capacity estimation, blob vs metadata split |
| 2 | URL shortener | ID generation, read-heavy caching, DB choice |
| 3 | Scale from 1 to 10M users | Horizontal scaling, stateless services, load balancing |
| 4 | Photo sharing upload | Object storage, pre-signed URLs, CDN |
| 5 | Load balancer | L4 vs L7, balancing algorithms, health checks |
| 6 | Unique ID generator | Clocks, coordination-free IDs (Snowflake) |
| 7 | View/like counter | Write contention, sharded counters, eventual consistency |

**Caching, storage and data**
| 8 | Distributed cache | Consistent hashing, eviction, replication |
| 9 | Hot product page | Cache-aside vs write-through, stampede, invalidation |
| 10 | Rate limiter | Token bucket, sliding window, distributed counters |
| 11 | Leaderboard | Sorted sets, hot-key sharding |
| 12 | Typeahead | Tries, precomputation, ranking |
| 13 | Duplicate/username checker | Bloom filters, probabilistic structures |
| 14 | Key-value store (Dynamo) | Quorum, tunable consistency, gossip, vector clocks |
| 15 | Sharded SQL layer | Partitioning, resharding, cross-shard queries |
| 16 | Read-replica profile store | Replication lag, read-your-writes |
| 17 | Time-series metrics store | LSM trees, downsampling, retention |
| 18 | Search engine | Inverted index, index sharding, ranking |
| 19 | Nearby places | Geohash, quadtree, spatial indexing |

**Async and messaging**
| 20 | Notification system | Queues, retries, idempotency, fanout |
| 21 | Message queue (Kafka) | Log storage, partitions, consumer groups, delivery semantics |
| 22 | Webhook delivery | Backoff, dead-letter queues, at-least-once |
| 23 | Distributed job scheduler | Leader election, timing, exactly-once-ish execution |
| 24 | Log aggregation pipeline | Ingestion, backpressure, indexing at scale |

**Real-time**
| 25 | Chat (WhatsApp) | WebSockets, ordering, delivery receipts |
| 26 | Presence system | Heartbeats, TTLs, pub/sub fanout |
| 27 | Ride hailing (Uber) | Live location ingestion, real-time matching |
| 28 | Live comments/streaming | Massive fanout, connection management |
| 29 | Collaborative editor | OT vs CRDT, conflict resolution |

**Feeds and media**
| 30 | News feed | Fanout on write vs read, hybrid for celebrities |
| 31 | Follow graph and friend suggestions | Graph storage, traversal at scale |
| 32 | Trending/Top-K | Heavy hitters, count-min sketch, time windows |
| 33 | Video streaming (YouTube/Netflix) | Transcoding pipeline, adaptive bitrate, CDN tiers |
| 34 | File sync (Dropbox/Drive) | Chunking, dedup, delta sync, conflict handling |

**Transactions and consistency**
| 35 | Ticket booking | Seat holds with TTL, double-booking prevention |
| 36 | Distributed lock service | Leases, fencing tokens, consensus (Raft/ZooKeeper) |
| 37 | Payment system | Idempotency keys, ledger, reconciliation |
| 38 | E-commerce orders | Saga, outbox pattern, compensation |
| 39 | Flash sale | Contention, admission queues, oversell prevention |
| 40 | Digital wallet/ledger | Double-entry, 2PC vs saga, auditability |
| 41 | Stock exchange matching engine | Determinism, ordering, low latency |
| 42 | Hotel/Airbnb booking | Date-range availability, search vs booking split |

**Platform and advanced**
| 43 | API gateway and service discovery | Routing, auth offload, registries, config |
| 44 | Auth/SSO (OAuth) | Tokens, sessions, revocation, security tradeoffs |
| 45 | Feature flags and A/B testing | Config propagation, assignment consistency, metrics |
| 46 | Ad click aggregation | Stream processing, windowing, exactly-once, late data |
| 47 | Web crawler | Frontier queue, politeness, URL dedup |
| 48 | Distributed file system (GFS/HDFS) | Metadata vs data nodes, replication, failure recovery |
| 49 | Multi-region active-active | Geo-replication, failover, conflict resolution |
| 50 | Multi-tenant SaaS platform | Isolation, noisy neighbors, per-tenant scaling |
`;

const RAW_LLD = `
**Modeling and OOP principles**
| 1 | Parking lot | Entity modeling, SRP, enums |
| 2 | Library management | Inheritance vs composition, associations |
| 3 | Tic-tac-toe | Encapsulation, extensibility to NxN |
| 4 | Snake and ladder | Config-driven rules, open/closed |
| 5 | Chess | Polymorphism, move validation |

**Creational patterns**
| 6 | Logger framework | Singleton and its pitfalls, chain of responsibility |
| 7 | Notification service | Factory, strategy per channel |
| 8 | HTTP request builder | Builder, fluent interfaces |
| 9 | Connection pool | Object pool, resource lifecycle |
| 10 | Cross-platform UI toolkit | Abstract factory |

**Structural patterns**
| 11 | Shopping cart with discounts | Decorator, strategy |
| 12 | In-memory file system | Composite |
| 13 | Payment gateway integration | Adapter, facade |
| 14 | Lazy-loading image viewer | Proxy |
| 15 | Smart home controller | Bridge, device abstraction |

**Behavioral patterns**
| 16 | Text editor undo/redo | Command, memento |
| 17 | Vending machine | State pattern |
| 18 | ATM | State pattern, transaction handling |
| 19 | Traffic signal controller | State machines, timers |
| 20 | Elevator system | State plus pluggable scheduling strategies |
| 21 | Pub/sub system | Observer |
| 22 | Expense approval workflow | Chain of responsibility, template method |
| 23 | Chat room | Mediator |

**Rules and expressions**
| 24 | Expression evaluator | Interpreter, visitor |
| 25 | Rule engine | Specification pattern |
| 26 | Spreadsheet | Dependency graph, topological recalculation |

**Data-structure design**
| 27 | LRU cache | Hash map plus linked list, O(1) design |
| 28 | LFU cache with pluggable eviction | Strategy over policies, frequency buckets |
| 29 | In-memory KV store with TTL | Expiry strategies, lazy vs active cleanup |
| 30 | Rate limiter | Token bucket, sliding window, per-key state |
| 31 | Autocomplete | Trie, prefix ranking |
| 32 | Consistent hashing ring | Virtual nodes, rebalancing |
| 33 | Top-K/leaderboard | Heaps, ordered structures |
| 34 | Meeting room scheduler | Interval overlap, allocation |
| 35 | Calendar with recurring events | Recurrence rules, conflict detection |

**Concurrency**
| 36 | Bounded blocking queue | Producer-consumer, wait/notify |
| 37 | Thread pool | Worker lifecycle, task queues |
| 38 | Delayed task scheduler | Priority queue, timing |
| 39 | Thread-safe cache | Read-write locks, lock granularity |
| 40 | Concurrent web crawler | Shared state, dedup, bounded parallelism |
| 41 | Concurrent bank transfers | Lock ordering, deadlock avoidance, atomicity |

**Domain systems (everything combined)**
| 42 | BookMyShow | Seat holds, concurrent booking in a domain model |
| 43 | Splitwise | Balance tracking, debt simplification |
| 44 | Ride sharing | Matching strategy, pricing strategy |
| 45 | Food delivery | Order lifecycle, partner assignment |
| 46 | Hotel booking | Availability over date ranges |
| 47 | Digital wallet | Transactions, limits, audit trail |
| 48 | Social network | Follow graph, feed generation |
| 49 | Stock brokerage/order book | Price-time priority matching |
| 50 | Dependency injection container | Registration, lifecycle, plugin architecture |
`;

function parseMarkdown(raw: string, type: ProblemType) {
  const lines = raw.trim().split('\n');
  let currentGroup = '';
  const problems: any[] = [];

  for (const line of lines) {
    if (line.startsWith('**')) {
      currentGroup = line.replace(/\*\*/g, '').trim();
    } else if (line.startsWith('|') && !line.includes('---')) {
      const parts = line.split('|').map((s) => s.trim());
      if (parts.length >= 4) {
        const title = parts[2];
        const concepts = parts[3];
        if (title === 'Problem') continue; // Skip header

        // Simple difficulty assignment
        const num = parseInt(parts[1], 10);
        let diff = Difficulty.MEDIUM;
        if (num <= 7 && type === 'HLD') diff = Difficulty.EASY;
        if (num <= 5 && type === 'LLD') diff = Difficulty.EASY;
        if (num > 35) diff = Difficulty.HARD;

        problems.push({
          title: title,
          description: `A comprehensive ${type} problem focused on ${concepts}.`,
          type,
          difficulty: diff,
          tags: [currentGroup, ...concepts.split(', ').map(s => s.trim())],
          requirements: [
            'Clarify requirements and define the scope.',
            'Identify core entities and their relationships.',
            'Design the API contracts.',
          ],
          constraints: [
            'The system should be highly available.',
            'Latency must be kept to a minimum.',
          ],
          hints: [
            'Start with the core data model.',
            'Consider how read vs write paths differ.',
          ],
          extensibilityHooks: [],
          testCases: [],
        });
      }
    }
  }
  return problems;
}

async function main() {
  console.log('Parsing problems...');
  const hldProblems = parseMarkdown(RAW_HLD, ProblemType.HLD);
  const lldProblems = parseMarkdown(RAW_LLD, ProblemType.LLD);
  const allProblems = [...hldProblems, ...lldProblems];

  console.log(`Found ${allProblems.length} problems to insert.`);
  console.log('Wiping existing problems and their attempts...');
  await prisma.evaluation.deleteMany({});
  await prisma.hintUsage.deleteMany({});
  await prisma.stage.deleteMany({});
  await prisma.attempt.deleteMany({});
  await prisma.problem.deleteMany({});

  console.log('Inserting new problems...');
  for (const p of allProblems) {
    await prisma.problem.create({ data: p });
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
