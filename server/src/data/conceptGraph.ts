export const CONCEPT_PREREQUISITES: Record<string, string[]> = {
  "Capacity estimation": [],
  "blob vs metadata split": [],
  "ID generation": [
    "Capacity estimation",
    "blob vs metadata split"
  ],
  "read-heavy caching": [
    "Capacity estimation",
    "blob vs metadata split"
  ],
  "DB choice": [
    "Capacity estimation",
    "blob vs metadata split"
  ],
  "Horizontal scaling": [
    "ID generation",
    "read-heavy caching",
    "DB choice"
  ],
  "stateless services": [
    "ID generation",
    "read-heavy caching",
    "DB choice"
  ],
  "load balancing": [
    "ID generation",
    "read-heavy caching",
    "DB choice"
  ],
  "Object storage": [
    "Horizontal scaling",
    "stateless services",
    "load balancing"
  ],
  "pre-signed URLs": [
    "Horizontal scaling",
    "stateless services",
    "load balancing"
  ],
  "CDN": [
    "Horizontal scaling",
    "stateless services",
    "load balancing"
  ],
  "L4 vs L7": [
    "Object storage",
    "pre-signed URLs",
    "CDN"
  ],
  "balancing algorithms": [
    "Object storage",
    "pre-signed URLs",
    "CDN"
  ],
  "health checks": [
    "Object storage",
    "pre-signed URLs",
    "CDN"
  ],
  "Clocks": [
    "L4 vs L7",
    "balancing algorithms",
    "health checks"
  ],
  "coordination-free IDs (Snowflake)": [
    "L4 vs L7",
    "balancing algorithms",
    "health checks"
  ],
  "Write contention": [
    "Clocks",
    "coordination-free IDs (Snowflake)"
  ],
  "sharded counters": [
    "Clocks",
    "coordination-free IDs (Snowflake)"
  ],
  "eventual consistency": [
    "Clocks",
    "coordination-free IDs (Snowflake)"
  ],
  "Consistent hashing": [
    "Write contention",
    "sharded counters",
    "eventual consistency"
  ],
  "eviction": [
    "Write contention",
    "sharded counters",
    "eventual consistency"
  ],
  "replication": [
    "Write contention",
    "sharded counters",
    "eventual consistency"
  ],
  "Cache-aside vs write-through": [
    "Consistent hashing",
    "eviction",
    "replication"
  ],
  "stampede": [
    "Consistent hashing",
    "eviction",
    "replication"
  ],
  "invalidation": [
    "Consistent hashing",
    "eviction",
    "replication"
  ],
  "Token bucket": [
    "Cache-aside vs write-through",
    "stampede",
    "invalidation"
  ],
  "sliding window": [
    "Cache-aside vs write-through",
    "stampede",
    "invalidation"
  ],
  "distributed counters": [
    "Cache-aside vs write-through",
    "stampede",
    "invalidation"
  ],
  "Sorted sets": [
    "Token bucket",
    "sliding window",
    "distributed counters"
  ],
  "hot-key sharding": [
    "Token bucket",
    "sliding window",
    "distributed counters"
  ],
  "Tries": [
    "Sorted sets",
    "hot-key sharding"
  ],
  "precomputation": [
    "Sorted sets",
    "hot-key sharding"
  ],
  "ranking": [
    "Sorted sets",
    "hot-key sharding"
  ],
  "Bloom filters": [
    "Tries",
    "precomputation",
    "ranking"
  ],
  "probabilistic structures": [
    "Tries",
    "precomputation",
    "ranking"
  ],
  "Quorum": [
    "Bloom filters",
    "probabilistic structures"
  ],
  "tunable consistency": [
    "Bloom filters",
    "probabilistic structures"
  ],
  "gossip": [
    "Bloom filters",
    "probabilistic structures"
  ],
  "vector clocks": [
    "Bloom filters",
    "probabilistic structures"
  ],
  "Partitioning": [
    "Quorum",
    "tunable consistency",
    "gossip",
    "vector clocks"
  ],
  "resharding": [
    "Quorum",
    "tunable consistency",
    "gossip",
    "vector clocks"
  ],
  "cross-shard queries": [
    "Quorum",
    "tunable consistency",
    "gossip",
    "vector clocks"
  ],
  "Replication lag": [
    "Partitioning",
    "resharding",
    "cross-shard queries"
  ],
  "read-your-writes": [
    "Partitioning",
    "resharding",
    "cross-shard queries"
  ],
  "LSM trees": [
    "Replication lag",
    "read-your-writes"
  ],
  "downsampling": [
    "Replication lag",
    "read-your-writes"
  ],
  "retention": [
    "Replication lag",
    "read-your-writes"
  ],
  "Inverted index": [
    "LSM trees",
    "downsampling",
    "retention"
  ],
  "index sharding": [
    "LSM trees",
    "downsampling",
    "retention"
  ],
  "Geohash": [
    "Inverted index",
    "index sharding",
    "ranking"
  ],
  "quadtree": [
    "Inverted index",
    "index sharding",
    "ranking"
  ],
  "spatial indexing": [
    "Inverted index",
    "index sharding",
    "ranking"
  ],
  "Queues": [
    "Geohash",
    "quadtree",
    "spatial indexing"
  ],
  "retries": [
    "Geohash",
    "quadtree",
    "spatial indexing"
  ],
  "idempotency": [
    "Geohash",
    "quadtree",
    "spatial indexing"
  ],
  "fanout": [
    "Geohash",
    "quadtree",
    "spatial indexing"
  ],
  "Log storage": [
    "Queues",
    "retries",
    "idempotency",
    "fanout"
  ],
  "partitions": [
    "Queues",
    "retries",
    "idempotency",
    "fanout"
  ],
  "consumer groups": [
    "Queues",
    "retries",
    "idempotency",
    "fanout"
  ],
  "delivery semantics": [
    "Queues",
    "retries",
    "idempotency",
    "fanout"
  ],
  "Backoff": [
    "Log storage",
    "partitions",
    "consumer groups",
    "delivery semantics"
  ],
  "dead-letter queues": [
    "Log storage",
    "partitions",
    "consumer groups",
    "delivery semantics"
  ],
  "at-least-once": [
    "Log storage",
    "partitions",
    "consumer groups",
    "delivery semantics"
  ],
  "Leader election": [
    "Backoff",
    "dead-letter queues",
    "at-least-once"
  ],
  "timing": [
    "Backoff",
    "dead-letter queues",
    "at-least-once"
  ],
  "exactly-once execution": [
    "Backoff",
    "dead-letter queues",
    "at-least-once"
  ],
  "Ingestion": [
    "Leader election",
    "timing",
    "exactly-once execution"
  ],
  "backpressure": [
    "Leader election",
    "timing",
    "exactly-once execution"
  ],
  "indexing at scale": [
    "Leader election",
    "timing",
    "exactly-once execution"
  ],
  "WebSockets": [
    "Ingestion",
    "backpressure",
    "indexing at scale"
  ],
  "ordering": [
    "Ingestion",
    "backpressure",
    "indexing at scale"
  ],
  "delivery receipts": [
    "Ingestion",
    "backpressure",
    "indexing at scale"
  ],
  "Heartbeats": [
    "WebSockets",
    "ordering",
    "delivery receipts"
  ],
  "TTLs": [
    "WebSockets",
    "ordering",
    "delivery receipts"
  ],
  "pub/sub fanout": [
    "WebSockets",
    "ordering",
    "delivery receipts"
  ],
  "Live location ingestion": [
    "Heartbeats",
    "TTLs",
    "pub/sub fanout"
  ],
  "real-time matching": [
    "Heartbeats",
    "TTLs",
    "pub/sub fanout"
  ],
  "Massive fanout": [
    "Live location ingestion",
    "real-time matching"
  ],
  "connection management": [
    "Live location ingestion",
    "real-time matching"
  ],
  "OT vs CRDT": [
    "Massive fanout",
    "connection management"
  ],
  "conflict resolution": [
    "Massive fanout",
    "connection management"
  ],
  "Fanout on write vs read": [
    "OT vs CRDT",
    "conflict resolution"
  ],
  "hybrid for celebrities": [
    "OT vs CRDT",
    "conflict resolution"
  ],
  "Graph storage": [
    "Fanout on write vs read",
    "hybrid for celebrities"
  ],
  "traversal at scale": [
    "Fanout on write vs read",
    "hybrid for celebrities"
  ],
  "Heavy hitters": [
    "Graph storage",
    "traversal at scale"
  ],
  "count-min sketch": [
    "Graph storage",
    "traversal at scale"
  ],
  "time windows": [
    "Graph storage",
    "traversal at scale"
  ],
  "Transcoding pipeline": [
    "Heavy hitters",
    "count-min sketch",
    "time windows"
  ],
  "adaptive bitrate": [
    "Heavy hitters",
    "count-min sketch",
    "time windows"
  ],
  "CDN tiers": [
    "Heavy hitters",
    "count-min sketch",
    "time windows"
  ],
  "Chunking": [
    "Transcoding pipeline",
    "adaptive bitrate",
    "CDN tiers"
  ],
  "dedup": [
    "Transcoding pipeline",
    "adaptive bitrate",
    "CDN tiers"
  ],
  "delta sync": [
    "Transcoding pipeline",
    "adaptive bitrate",
    "CDN tiers"
  ],
  "conflict handling": [
    "Transcoding pipeline",
    "adaptive bitrate",
    "CDN tiers"
  ],
  "Seat holds with TTL": [
    "Chunking",
    "dedup",
    "delta sync",
    "conflict handling"
  ],
  "double-booking prevention": [
    "Chunking",
    "dedup",
    "delta sync",
    "conflict handling"
  ],
  "Leases": [
    "Seat holds with TTL",
    "double-booking prevention"
  ],
  "fencing tokens": [
    "Seat holds with TTL",
    "double-booking prevention"
  ],
  "consensus (Raft/ZooKeeper)": [
    "Seat holds with TTL",
    "double-booking prevention"
  ],
  "Idempotency keys": [
    "Leases",
    "fencing tokens",
    "consensus (Raft/ZooKeeper)"
  ],
  "ledger": [
    "Leases",
    "fencing tokens",
    "consensus (Raft/ZooKeeper)"
  ],
  "reconciliation": [
    "Leases",
    "fencing tokens",
    "consensus (Raft/ZooKeeper)"
  ],
  "Saga": [
    "Idempotency keys",
    "ledger",
    "reconciliation"
  ],
  "outbox pattern": [
    "Idempotency keys",
    "ledger",
    "reconciliation"
  ],
  "compensation": [
    "Idempotency keys",
    "ledger",
    "reconciliation"
  ],
  "Contention": [
    "Saga",
    "outbox pattern",
    "compensation"
  ],
  "admission queues": [
    "Saga",
    "outbox pattern",
    "compensation"
  ],
  "oversell prevention": [
    "Saga",
    "outbox pattern",
    "compensation"
  ],
  "Double-entry": [
    "Contention",
    "admission queues",
    "oversell prevention"
  ],
  "2PC vs saga": [
    "Contention",
    "admission queues",
    "oversell prevention"
  ],
  "auditability": [
    "Contention",
    "admission queues",
    "oversell prevention"
  ],
  "Determinism": [
    "Double-entry",
    "2PC vs saga",
    "auditability"
  ],
  "low latency": [
    "Double-entry",
    "2PC vs saga",
    "auditability"
  ],
  "Date-range availability": [
    "Determinism",
    "ordering",
    "low latency"
  ],
  "search vs booking split": [
    "Determinism",
    "ordering",
    "low latency"
  ],
  "Routing": [
    "Date-range availability",
    "search vs booking split"
  ],
  "auth offload": [
    "Date-range availability",
    "search vs booking split"
  ],
  "registries": [
    "Date-range availability",
    "search vs booking split"
  ],
  "config": [
    "Date-range availability",
    "search vs booking split"
  ],
  "Tokens": [
    "Routing",
    "auth offload",
    "registries",
    "config"
  ],
  "sessions": [
    "Routing",
    "auth offload",
    "registries",
    "config"
  ],
  "revocation": [
    "Routing",
    "auth offload",
    "registries",
    "config"
  ],
  "security tradeoffs": [
    "Routing",
    "auth offload",
    "registries",
    "config"
  ],
  "Config propagation": [
    "Tokens",
    "sessions",
    "revocation",
    "security tradeoffs"
  ],
  "assignment consistency": [
    "Tokens",
    "sessions",
    "revocation",
    "security tradeoffs"
  ],
  "metrics": [
    "Tokens",
    "sessions",
    "revocation",
    "security tradeoffs"
  ],
  "Stream processing": [
    "Config propagation",
    "assignment consistency",
    "metrics"
  ],
  "windowing": [
    "Config propagation",
    "assignment consistency",
    "metrics"
  ],
  "exactly-once": [
    "Config propagation",
    "assignment consistency",
    "metrics"
  ],
  "late data": [
    "Config propagation",
    "assignment consistency",
    "metrics"
  ],
  "Frontier queue": [
    "Stream processing",
    "windowing",
    "exactly-once",
    "late data"
  ],
  "politeness": [
    "Stream processing",
    "windowing",
    "exactly-once",
    "late data"
  ],
  "URL dedup": [
    "Stream processing",
    "windowing",
    "exactly-once",
    "late data"
  ],
  "Metadata vs data nodes": [
    "Frontier queue",
    "politeness",
    "URL dedup"
  ],
  "failure recovery": [
    "Frontier queue",
    "politeness",
    "URL dedup"
  ],
  "Geo-replication": [
    "Metadata vs data nodes",
    "replication",
    "failure recovery"
  ],
  "failover": [
    "Metadata vs data nodes",
    "replication",
    "failure recovery"
  ],
  "Isolation": [
    "Geo-replication",
    "failover",
    "conflict resolution"
  ],
  "noisy neighbors": [
    "Geo-replication",
    "failover",
    "conflict resolution"
  ],
  "per-tenant scaling": [
    "Geo-replication",
    "failover",
    "conflict resolution"
  ],
  "Entity modeling": [],
  "SRP": [],
  "enums": [],
  "Inheritance vs composition": [
    "Entity modeling",
    "SRP",
    "enums"
  ],
  "associations": [
    "Entity modeling",
    "SRP",
    "enums"
  ],
  "Encapsulation": [
    "Inheritance vs composition",
    "associations"
  ],
  "extensibility to NxN": [
    "Inheritance vs composition",
    "associations"
  ],
  "Config-driven rules": [
    "Encapsulation",
    "extensibility to NxN"
  ],
  "open/closed": [
    "Encapsulation",
    "extensibility to NxN"
  ],
  "Polymorphism": [
    "Config-driven rules",
    "open/closed"
  ],
  "move validation": [
    "Config-driven rules",
    "open/closed"
  ],
  "Singleton and its pitfalls": [
    "Polymorphism",
    "move validation"
  ],
  "chain of responsibility": [
    "Polymorphism",
    "move validation"
  ],
  "Factory": [
    "Singleton and its pitfalls",
    "chain of responsibility"
  ],
  "strategy per channel": [
    "Singleton and its pitfalls",
    "chain of responsibility"
  ],
  "Builder": [
    "Factory",
    "strategy per channel"
  ],
  "fluent interfaces": [
    "Factory",
    "strategy per channel"
  ],
  "Object pool": [
    "Builder",
    "fluent interfaces"
  ],
  "resource lifecycle": [
    "Builder",
    "fluent interfaces"
  ],
  "Abstract factory": [
    "Object pool",
    "resource lifecycle"
  ],
  "Decorator": [
    "Abstract factory"
  ],
  "strategy": [
    "Abstract factory"
  ],
  "Composite": [
    "Decorator",
    "strategy"
  ],
  "Adapter": [
    "Composite"
  ],
  "facade": [
    "Composite"
  ],
  "Proxy": [
    "Adapter",
    "facade"
  ],
  "Bridge": [
    "Proxy"
  ],
  "device abstraction": [
    "Proxy"
  ],
  "Command": [
    "Bridge",
    "device abstraction"
  ],
  "memento": [
    "Bridge",
    "device abstraction"
  ],
  "State pattern": [
    "Command",
    "memento"
  ],
  "transaction handling": [
    "State pattern"
  ],
  "State machines": [
    "State pattern",
    "transaction handling"
  ],
  "timers": [
    "State pattern",
    "transaction handling"
  ],
  "State plus pluggable scheduling strategies": [
    "State machines",
    "timers"
  ],
  "Observer": [
    "State plus pluggable scheduling strategies"
  ],
  "Chain of responsibility": [
    "Observer"
  ],
  "template method": [
    "Observer"
  ],
  "Mediator": [
    "Chain of responsibility",
    "template method"
  ],
  "Interpreter": [
    "Mediator"
  ],
  "visitor": [
    "Mediator"
  ],
  "Specification pattern": [
    "Interpreter",
    "visitor"
  ],
  "Dependency graph": [
    "Specification pattern"
  ],
  "topological recalculation": [
    "Specification pattern"
  ],
  "Hash map plus linked list": [
    "Dependency graph",
    "topological recalculation"
  ],
  "O(1) design": [
    "Dependency graph",
    "topological recalculation"
  ],
  "Strategy over policies": [
    "Hash map plus linked list",
    "O(1) design"
  ],
  "frequency buckets": [
    "Hash map plus linked list",
    "O(1) design"
  ],
  "Expiry strategies": [
    "Strategy over policies",
    "frequency buckets"
  ],
  "lazy vs active cleanup": [
    "Strategy over policies",
    "frequency buckets"
  ],
  "per-key state": [
    "Expiry strategies",
    "lazy vs active cleanup"
  ],
  "Trie": [
    "Token bucket",
    "sliding window",
    "per-key state"
  ],
  "prefix ranking": [
    "Token bucket",
    "sliding window",
    "per-key state"
  ],
  "Virtual nodes": [
    "Trie",
    "prefix ranking"
  ],
  "rebalancing": [
    "Trie",
    "prefix ranking"
  ],
  "Heaps": [
    "Virtual nodes",
    "rebalancing"
  ],
  "ordered structures": [
    "Virtual nodes",
    "rebalancing"
  ],
  "Interval overlap": [
    "Heaps",
    "ordered structures"
  ],
  "allocation": [
    "Heaps",
    "ordered structures"
  ],
  "Recurrence rules": [
    "Interval overlap",
    "allocation"
  ],
  "conflict detection": [
    "Interval overlap",
    "allocation"
  ],
  "Producer-consumer": [
    "Recurrence rules",
    "conflict detection"
  ],
  "wait/notify": [
    "Recurrence rules",
    "conflict detection"
  ],
  "Worker lifecycle": [
    "Producer-consumer",
    "wait/notify"
  ],
  "task queues": [
    "Producer-consumer",
    "wait/notify"
  ],
  "Priority queue": [
    "Worker lifecycle",
    "task queues"
  ],
  "Read-write locks": [
    "Priority queue",
    "timing"
  ],
  "lock granularity": [
    "Priority queue",
    "timing"
  ],
  "Shared state": [
    "Read-write locks",
    "lock granularity"
  ],
  "bounded parallelism": [
    "Read-write locks",
    "lock granularity"
  ],
  "Lock ordering": [
    "Shared state",
    "dedup",
    "bounded parallelism"
  ],
  "deadlock avoidance": [
    "Shared state",
    "dedup",
    "bounded parallelism"
  ],
  "atomicity": [
    "Shared state",
    "dedup",
    "bounded parallelism"
  ],
  "Seat holds": [
    "Lock ordering",
    "deadlock avoidance",
    "atomicity"
  ],
  "concurrent booking in a domain model": [
    "Lock ordering",
    "deadlock avoidance",
    "atomicity"
  ],
  "Balance tracking": [
    "Seat holds",
    "concurrent booking in a domain model"
  ],
  "debt simplification": [
    "Seat holds",
    "concurrent booking in a domain model"
  ],
  "Matching strategy": [
    "Balance tracking",
    "debt simplification"
  ],
  "pricing strategy": [
    "Balance tracking",
    "debt simplification"
  ],
  "Order lifecycle": [
    "Matching strategy",
    "pricing strategy"
  ],
  "partner assignment": [
    "Matching strategy",
    "pricing strategy"
  ],
  "Availability over date ranges": [
    "Order lifecycle",
    "partner assignment"
  ],
  "Transactions": [
    "Availability over date ranges"
  ],
  "limits": [
    "Availability over date ranges"
  ],
  "audit trail": [
    "Availability over date ranges"
  ],
  "Follow graph": [
    "Transactions",
    "limits",
    "audit trail"
  ],
  "feed generation": [
    "Transactions",
    "limits",
    "audit trail"
  ],
  "Price-time priority matching": [
    "Follow graph",
    "feed generation"
  ],
  "Registration": [
    "Price-time priority matching"
  ],
  "lifecycle": [
    "Price-time priority matching"
  ],
  "plugin architecture": [
    "Price-time priority matching"
  ]
};
