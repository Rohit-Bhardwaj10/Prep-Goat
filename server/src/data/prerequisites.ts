export const PREREQUISITES: Record<string, string[]> = {
  "092bd9b6-c12a-4920-8565-c7e68903eafc": [
    "Inverted index",
    "index sharding",
    "ranking"
  ],
  "0a9f2fa0-c77b-4bd4-a6a2-12bdf719da82": [
    "LSM trees",
    "downsampling",
    "retention"
  ],
  "0b9c28a7-3dc2-4208-833c-224f94105f12": [
    "Object storage",
    "pre-signed URLs",
    "CDN"
  ],
  "0f3536b0-43d7-4abe-b113-91dc29d6e22c": [
    "Chunking",
    "dedup",
    "delta sync",
    "conflict handling"
  ],
  "1134b747-db44-4c94-adf5-dc0741f64f2d": [
    "Heartbeats",
    "TTLs",
    "pub/sub fanout"
  ],
  "198ba906-0f78-4c11-a3a4-7c6384a28a88": [
    "Live location ingestion",
    "real-time matching"
  ],
  "1a31cafd-7825-4715-adc3-e812ceb54a6b": [
    "Geohash",
    "quadtree",
    "spatial indexing"
  ],
  "23c59f76-8e4c-4efa-bfae-408e36eb0be4": [
    "L4 vs L7",
    "balancing algorithms",
    "health checks"
  ],
  "2dbbb34f-0fd3-4d6d-ba33-563525116512": [
    "Replication lag",
    "read-your-writes"
  ],
  "31cd1d52-984e-4e6c-a9e0-fc38e7843f07": [
    "Capacity estimation",
    "blob vs metadata split"
  ],
  "3512bf7d-11a9-4288-b817-d0066f8b2987": [
    "WebSockets",
    "ordering",
    "delivery receipts"
  ],
  "35f61afa-96f7-4699-9d4c-20c9257e3d51": [
    "Horizontal scaling",
    "stateless services",
    "load balancing"
  ],
  "37b7dcd1-ebd4-484b-a85b-65ce717490dc": [
    "Quorum",
    "tunable consistency",
    "gossip",
    "vector clocks"
  ],
  "401fbbe2-2733-4ac2-8d90-46033a66577d": [
    "Ingestion",
    "backpressure",
    "indexing at scale"
  ],
  "4044a00d-3b2a-4e40-bc03-06536cdeaeba": [
    "Fanout on write vs read",
    "hybrid for celebrities"
  ],
  "419558f1-5d16-4189-b953-5517755cf939": [
    "Isolation",
    "noisy neighbors",
    "per-tenant scaling"
  ],
  "4426dd10-9d8b-413e-bfaf-97be2478169c": [
    "Massive fanout",
    "connection management"
  ],
  "47bd97c6-51d4-4c9b-a36e-4f91ba781a44": [
    "Stream processing",
    "windowing",
    "exactly-once",
    "late data"
  ],
  "502561e0-5c04-460d-b357-325d9b65d992": [
    "Graph storage",
    "traversal at scale"
  ],
  "520896f6-727c-437b-a8c0-6deef589e51a": [
    "Tries",
    "precomputation",
    "ranking"
  ],
  "578181b3-1067-40b7-ab07-0b704120d83e": [
    "Idempotency keys",
    "ledger",
    "reconciliation"
  ],
  "5796f20a-6d7b-4b55-8e18-bf0b7d220da9": [
    "Geo-replication",
    "failover",
    "conflict resolution"
  ],
  "5a5ed4ad-62b2-48e1-9a02-e5d127a3d31c": [
    "Queues",
    "retries",
    "idempotency",
    "fanout"
  ],
  "5ae6e19c-952a-4d79-a1ba-e8d5f0f2bdab": [
    "OT vs CRDT",
    "conflict resolution"
  ],
  "612cbad5-9f45-481d-8a24-df6bd26cec73": [
    "Contention",
    "admission queues",
    "oversell prevention"
  ],
  "6a86b486-e506-4d80-8505-15da4ab66105": [
    "Token bucket",
    "sliding window",
    "distributed counters"
  ],
  "6bcea257-d820-4729-91e6-179c12c6605e": [
    "Metadata vs data nodes",
    "replication",
    "failure recovery"
  ],
  "6fa27920-ea86-42de-930b-3f545283e621": [
    "ID generation",
    "read-heavy caching",
    "DB choice"
  ],
  "7304ff10-7ced-4cd6-a8f4-53bd6915d374": [
    "Tokens",
    "sessions",
    "revocation",
    "security tradeoffs"
  ],
  "7e3dfe1d-81bf-4e4d-aa4a-fbd86aa01049": [
    "Sorted sets",
    "hot-key sharding"
  ],
  "8d05b784-9023-4e6a-be0c-eaaac3b25630": [
    "Leader election",
    "timing",
    "exactly-once execution"
  ],
  "8d60a845-27be-4fc7-96b7-80cf56aeb632": [
    "Double-entry",
    "2PC vs saga",
    "auditability"
  ],
  "8f3e97d1-9fa7-4bb1-a8b6-b91ffd0436f4": [
    "Consistent hashing",
    "eviction",
    "replication"
  ],
  "9395ab81-f13f-4608-b954-c2af7712bf2b": [
    "Transcoding pipeline",
    "adaptive bitrate",
    "CDN tiers"
  ],
  "979f6635-d7b5-482c-b486-bc11cc5f7f32": [
    "Seat holds with TTL",
    "double-booking prevention"
  ],
  "9c3e3ce2-b6ab-472d-8682-12ff3f75a1ed": [
    "Write contention",
    "sharded counters",
    "eventual consistency"
  ],
  "9e79c38a-775e-46d0-97ae-f697619aa7ea": [
    "Backoff",
    "dead-letter queues",
    "at-least-once"
  ],
  "a0ec0848-a7ce-441a-9467-9b4f22d9f418": [
    "Partitioning",
    "resharding",
    "cross-shard queries"
  ],
  "ac5b4138-5619-45b0-bb60-a2b9f73b7fa0": [
    "Routing",
    "auth offload",
    "registries",
    "config"
  ],
  "ae2e38b8-5793-4f25-9f45-60e4d348950e": [
    "Frontier queue",
    "politeness",
    "URL dedup"
  ],
  "b1338952-a470-411e-a45a-c7b3b92883bb": [
    "Bloom filters",
    "probabilistic structures"
  ],
  "bd1e50e8-8139-4b4c-99c9-4aa7bdc9a8a8": [
    "Date-range availability",
    "search vs booking split"
  ],
  "c140b12d-578f-4632-a518-bc5825039c5c": [
    "Leases",
    "fencing tokens",
    "consensus (Raft/ZooKeeper)"
  ],
  "c3845f01-70b3-44a8-a392-c8471474b455": [
    "Determinism",
    "ordering",
    "low latency"
  ],
  "c5a8051f-10b3-4e14-b70b-221444a663fd": [
    "Clocks",
    "coordination-free IDs (Snowflake)"
  ],
  "c7bc2c46-a947-4431-8146-8db12f29e73f": [
    "Config propagation",
    "assignment consistency",
    "metrics"
  ],
  "da5ece7a-3a1a-4679-8264-e47b41a85762": [
    "Saga",
    "outbox pattern",
    "compensation"
  ],
  "f48e90ce-8e06-4a0d-b38a-c52bb8dc1662": [
    "Log storage",
    "partitions",
    "consumer groups",
    "delivery semantics"
  ],
  "fa19d1a3-e7b1-4f0c-a59a-22000251744e": [
    "Cache-aside vs write-through",
    "stampede",
    "invalidation"
  ],
  "0e6beb84-d96e-434c-a352-cc1d2f1f3715": [
    "Recurrence rules",
    "conflict detection"
  ],
  "1333f5b7-4c9f-433b-8293-007efda1eef6": [
    "Read-write locks",
    "lock granularity"
  ],
  "158abbae-bd56-43b6-b8cc-be6c9cbfb9b1": [
    "State plus pluggable scheduling strategies"
  ],
  "1ade8920-7d42-4a6d-a679-525c74dc72bb": [
    "Priority queue",
    "timing"
  ],
  "1e9ea861-09af-4662-bd2d-40adda3d7a03": [
    "Encapsulation",
    "extensibility to NxN"
  ],
  "226f042d-8a35-4415-80be-758a23205de9": [
    "State machines",
    "timers"
  ],
  "23d2094f-2a32-4654-92c1-81e6f7889750": [
    "Builder",
    "fluent interfaces"
  ],
  "23e1a1a2-9871-4391-983e-69d2862c3a32": [
    "Specification pattern"
  ],
  "272afdae-d52f-4268-88c3-cef240e5f1e7": [
    "Seat holds",
    "concurrent booking in a domain model"
  ],
  "292c34d6-34df-4d3f-a0da-c841d376fcef": [
    "Token bucket",
    "sliding window",
    "per-key state"
  ],
  "31025418-5971-44f3-a1e0-fea7e6299dc2": [
    "Composite"
  ],
  "31e478cf-66a8-4634-8dd6-4a6132353355": [
    "Transactions",
    "limits",
    "audit trail"
  ],
  "37d52f53-0f8b-400b-9fc6-cf30f2084f68": [
    "Lock ordering",
    "deadlock avoidance",
    "atomicity"
  ],
  "3aba8be6-e118-4c53-b05b-0de32a958263": [
    "Chain of responsibility",
    "template method"
  ],
  "3c8d66cf-e0e9-49d1-9080-5467f6838df9": [
    "Interval overlap",
    "allocation"
  ],
  "3c94a677-4077-4859-9490-995df3df4306": [
    "Bridge",
    "device abstraction"
  ],
  "4addb3d9-9e57-40a4-8b5e-a47afb91f3e1": [
    "Entity modeling",
    "SRP",
    "enums"
  ],
  "4cdfdc13-0ea8-42e7-8f0e-5afd946536a6": [
    "State pattern",
    "transaction handling"
  ],
  "5a1f9af5-a8a7-494a-8cee-35f549d25ba2": [
    "Shared state",
    "dedup",
    "bounded parallelism"
  ],
  "5e10ca73-53c4-4973-b945-f14899f596ae": [
    "Expiry strategies",
    "lazy vs active cleanup"
  ],
  "6742adf7-0cd3-47fa-a37e-137fe4fbe3bc": [
    "Order lifecycle",
    "partner assignment"
  ],
  "68034899-017b-4d4c-a13f-92784fc8204d": [
    "Heaps",
    "ordered structures"
  ],
  "6855d425-47c1-4ddc-a094-2b815e875b8d": [
    "Matching strategy",
    "pricing strategy"
  ],
  "9011b0b0-2974-4e9a-bfc1-ae6d6c0d030b": [
    "State pattern"
  ],
  "938d9f4c-0085-4ba7-9a89-f9d57b621f20": [
    "Mediator"
  ],
  "a65fb981-8d86-40b3-b636-c909b4d06dc2": [
    "Polymorphism",
    "move validation"
  ],
  "a8dd3409-65ec-48b8-997a-bedd6500daef": [
    "Follow graph",
    "feed generation"
  ],
  "a9286363-89f8-4712-a0a7-af51fc89d531": [
    "Command",
    "memento"
  ],
  "aa71db5c-bd22-4ccf-9c70-2ced591acd46": [
    "Hash map plus linked list",
    "O(1) design"
  ],
  "ab1d32b9-d206-4516-b8da-def92ae5cd14": [
    "Availability over date ranges"
  ],
  "ad64546b-9657-40da-a15b-61f16395055c": [
    "Abstract factory"
  ],
  "b5249d66-6856-4265-bbcc-32917b8fa6cb": [
    "Singleton and its pitfalls",
    "chain of responsibility"
  ],
  "b7530afe-9a94-4658-9804-5c9376d80047": [
    "Inheritance vs composition",
    "associations"
  ],
  "bcb186a2-604c-467d-97a0-68d210058260": [
    "Decorator",
    "strategy"
  ],
  "c910cd0b-2091-47aa-baa8-e1b0516318c6": [
    "Balance tracking",
    "debt simplification"
  ],
  "cb5dd90a-c4b6-452c-97e0-50ab8edc9a60": [
    "Producer-consumer",
    "wait/notify"
  ],
  "de4de2ab-b8d6-4b25-917d-6bcb42d7b33b": [
    "Adapter",
    "facade"
  ],
  "dfe4efaa-4f72-4b6d-9ad3-af6c86228832": [
    "Trie",
    "prefix ranking"
  ],
  "e08dce84-3a83-4d41-9e99-fa1e89fc64e8": [
    "Registration",
    "lifecycle",
    "plugin architecture"
  ],
  "e38a3178-56ed-44a1-b19a-ef26e411983b": [
    "Config-driven rules",
    "open/closed"
  ],
  "e7693ff9-9ef3-4fe7-9a04-6e3afae0606e": [
    "Dependency graph",
    "topological recalculation"
  ],
  "eb84566a-3ef6-417e-a027-05e7ed6f39c6": [
    "Observer"
  ],
  "eec364c5-b9ef-4666-b91c-d5e0e976f49f": [
    "Interpreter",
    "visitor"
  ],
  "ef3ecbbc-1ae6-4570-ba60-1388748fde15": [
    "Strategy over policies",
    "frequency buckets"
  ],
  "f02cc0f3-251e-4893-8877-aea7a802adfb": [
    "Price-time priority matching"
  ],
  "f059897f-1a09-46cc-bcbb-44495533c6ab": [
    "Proxy"
  ],
  "f6785cd8-ff9e-4732-9a30-38ca0ff17547": [
    "Virtual nodes",
    "rebalancing"
  ],
  "fbd5dd08-11a9-4048-9686-9faf126ac048": [
    "Worker lifecycle",
    "task queues"
  ],
  "ffff9da7-a34c-4b3c-ad92-477188d3f5ae": [
    "Factory",
    "strategy per channel"
  ]
};