import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding problems...");
  // Only delete HLD problems to avoid breaking existing LLD attempts
  await prisma.problem.deleteMany({ where: { type: 'HLD' } });

  await prisma.problem.createMany({
    data: [
      {
        title: "Parking Lot",
        description: "Design a multi-floor parking lot system.",
        difficulty: "MEDIUM",
        type: "LLD",
        tags: ["Object-Oriented Design", "State Machine", "Concurrency"],
        requirements: [
          "The parking lot should have multiple floors.",
          "Each floor should have multiple spots of different types (compact, large, handicapped, motorcycle).",
          "The system should support different types of vehicles (car, truck, van, motorcycle).",
          "The system should calculate the fee based on the duration of parking and the vehicle type.",
          "The system should allow entry and exit of vehicles."
        ],
        constraints: [
          "Concurrency: Handle multiple vehicles entering/exiting simultaneously.",
          "Scale: Thousands of spots, tens of thousands of transactions per day."
        ],
        testCases: [
          "Motorcycle arrives at lot with only large spots left -> should find appropriate spot if policy allows",
          "2 cars arrive simultaneously for last compact spot -> only 1 gets it (concurrency handling)",
          "Handicapped vehicle arrives, all handicapped spots full, large available -> fallback policy",
          "Exit calculated at midnight boundary -> fee calculation crosses calendar day correctly"
        ],
        extensibilityHooks: [
          "Add EV charging spots with varying power levels",
          "Add monthly pass support",
          "Add reservation system for future parking"
        ],
        hints: [
          "Consider using the Strategy pattern for calculating parking fees.",
          "Think about thread-safety when multiple vehicles try to claim the same parking spot.",
          "A state machine could be useful for tracking the status of a parking spot."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: ParkingLot, Floor, ParkingSpot, Vehicle, Ticket, PaymentSystem.\n2. Design Patterns: Strategy (Fee calculation), Singleton (ParkingLot instance), Factory (Vehicle creation).\n3. Concurrency: Use read-write locks on the Floor/ParkingSpot levels when assigning a spot to prevent race conditions."
      },
      {
        title: "Elevator System",
        description: "Design an elevator system for a high-rise building.",
        difficulty: "HARD",
        type: "LLD",
        tags: ["Algorithm", "State Machine", "Concurrency"],
        requirements: [
          "The building has multiple floors and multiple elevators.",
          "Elevators can be requested from any floor.",
          "Users can select the destination floor once inside the elevator.",
          "The system should use an efficient scheduling algorithm (like SCAN) to minimize wait times.",
          "The doors should open and close automatically, with safety sensors."
        ],
        constraints: [
          "Concurrency: Handle multiple requests simultaneously.",
          "Real-time: The state machine for the doors and movement must be responsive."
        ],
        testCases: [
          "3 simultaneous requests from floors 1, 5, 10 -> SCAN algorithm correct dispatch",
          "Elevator at capacity -> should not accept more passengers (weight sensor)",
          "Emergency stop triggered -> state machine must handle EMERGENCY state",
          "Power failure mid-floor -> partial floor state resolution"
        ],
        extensibilityHooks: [
          "Add express elevators (skip floors)",
          "Add VIP floors requiring authentication",
          "Add predictive dispatch based on historical traffic patterns"
        ],
        hints: [
          "The SCAN (or LOOK) algorithm is ideal for scheduling elevators.",
          "Use a State pattern for the Elevator (Idle, MovingUp, MovingDown, Emergency).",
          "Decouple the Elevator controller from the individual Elevators."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: ElevatorSystem, Elevator, Button (Inside/Outside), Request, StateMachine.\n2. Dispatch Algorithm: Maintain two priority queues for each elevator (UP requests, DOWN requests). Implement LOOK algorithm.\n3. Synchronization: Controller processes incoming requests in a dedicated thread to ensure responsiveness."
      },
      {
        title: "Vending Machine",
        description: "Design a software system for a physical vending machine.",
        difficulty: "EASY",
        type: "LLD",
        tags: ["State Machine", "Object-Oriented Design"],
        requirements: [
          "The vending machine has multiple items with different prices and quantities.",
          "It accepts different denominations of money (coins and notes).",
          "It dispenses the selected item if sufficient money is provided and the item is in stock.",
          "It returns the correct change if excess money is provided.",
          "It handles scenarios like out-of-stock items or insufficient funds."
        ],
        constraints: [
          "State Machine: Clear states (Idle, HasMoney, Dispensing, ReturnChange).",
          "Transactionality: Payment and dispensing must be atomic."
        ],
        testCases: [
          "User inserts $5 for a $2 item -> correctly calculates and dispenses $3 change",
          "User selects out of stock item after inserting money -> state resets, returns money",
          "User cancels transaction mid-way -> refunds exact inserted denominations if possible"
        ],
        extensibilityHooks: [
          "Add support for digital payments (credit card, NFC)",
          "Implement dynamic pricing based on time of day",
          "Add remote telemetry for inventory monitoring"
        ],
        hints: [
          "This is a classic use case for the State design pattern.",
          "Ensure inventory count deductions are transactionally safe."
        ],
        sampleSolution: "Reference Solution:\n\n1. Use the State pattern with interfaces for handling insertMoney(), selectProduct(), dispense(), and cancel().\n2. Maintain an Inventory class to map items to quantities.\n3. Return change algorithm: Greedy approach using available denominations."
      },
      {
        title: "Cache System",
        description: "Design an in-memory caching system with a Least Recently Used (LRU) eviction policy.",
        difficulty: "MEDIUM",
        type: "LLD",
        tags: ["Data Structures", "Concurrency"],
        requirements: [
          "Should support get() and put() operations in O(1) time.",
          "Should have a fixed capacity.",
          "When capacity is reached, it should evict the least recently used item.",
          "Should support a generic type for keys and values.",
          "Should be thread-safe for concurrent access."
        ],
        constraints: [
          "Concurrency: Multiple threads can read and write simultaneously.",
          "Performance: High throughput, minimal latency."
        ],
        testCases: [
          "Insert beyond capacity -> exactly one element evicted (LRU)",
          "Get an existing element -> updates its position to most recently used",
          "Multiple threads put simultaneously -> capacity never exceeded, no race conditions"
        ],
        extensibilityHooks: [
          "Add Time-To-Live (TTL) support for cache items",
          "Make eviction policy configurable (e.g., switch to LFU)",
          "Implement a multi-level cache (L1 in-memory, L2 disk)"
        ],
        hints: [
          "O(1) requirement points to combining a Hash Map and a Doubly Linked List.",
          "For thread-safety, consider lock striping or a ConcurrentHashMap."
        ],
        sampleSolution: "Reference Solution:\n\n1. Data Structure: HashMap mapped to nodes of a Doubly Linked List.\n2. Concurrency: Use ReentrantReadWriteLock to allow multiple readers but exclusive writers.\n3. Eviction: On put(), if size == capacity, remove the tail node of the list and delete it from the map."
      },
      {
        title: "Movie Ticket Booking System",
        description: "Design a system to browse movies, select seats, and book tickets.",
        difficulty: "HARD",
        type: "LLD",
        tags: ["Database", "Concurrency", "Transaction"],
        requirements: [
          "System should have multiple cities, cinemas, and screens.",
          "Users can browse movies by city and time.",
          "Users can select seats and hold them temporarily (seat lock) while making a payment.",
          "Payment processing should be integrated.",
          "Support for different seat types (Silver, Gold, Platinum)."
        ],
        constraints: [
          "Concurrency: Handle multiple users trying to book the same seat simultaneously without double booking.",
          "ACID: Transactionality during booking and payment."
        ],
        testCases: [
          "Two users select the same seat at exact same time -> only one acquires the lock",
          "User lock expires while in payment screen -> seat becomes available, payment fails",
          "Payment fails -> seat lock is released immediately"
        ],
        extensibilityHooks: [
          "Add dynamic pricing (e.g., surge pricing on weekends)",
          "Support discount coupons and loyalty points",
          "Implement waitlists for sold-out shows"
        ],
        hints: [
          "Use a distributed lock (like Redis) or database row-level locking for the seat hold.",
          "A cron job or TTL mechanism is needed to expire abandoned seat holds."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: Cinema, Screen, Show, Seat, Booking, User.\n2. Concurrency handling: When user selects a seat, change seat status to 'LOCKED' with an expiration timestamp. Use DB transaction (SELECT FOR UPDATE) to prevent race conditions.\n3. TTL mechanism: Use Redis expiration for the hold, or a background worker to clean up expired bookings."
      },
      {
        title: "Library Management System",
        description: "Design a system for managing books, members, and borrowing processes in a library.",
        difficulty: "EASY",
        type: "LLD",
        tags: ["Object-Oriented Design", "Database"],
        requirements: [
          "System should have books, members, and librarians.",
          "A book can have multiple copies (book items).",
          "Members can search for books by title, author, or category.",
          "Members can borrow, reserve, and return books.",
          "The system should calculate fines for overdue books."
        ],
        constraints: [
          "State Management: Book states (Available, Reserved, Loaned, Lost).",
          "Scale: Tens of thousands of books and members."
        ],
        testCases: [
          "Member attempts to borrow more than max limit -> system denies",
          "Member returns book 5 days late -> system correctly calculates fine and blocks further borrowing if unpaid",
          "Member reserves book -> next available copy is allocated to them"
        ],
        extensibilityHooks: [
          "Integrate with a barcode scanner",
          "Add digital books (e-books) and audiobooks",
          "Implement inter-library loans"
        ],
        hints: [
          "Distinguish between a 'Book' (metadata) and a 'BookItem' (physical copy).",
          "Use Observer pattern to notify members when a reserved book becomes available."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: Book, BookItem, Account (Member/Librarian), LibraryCard, Reservation, Fine.\n2. Searching: Implement a Catalog interface and separate search modules.\n3. Notifications: Observer pattern for reservations."
      },
      {
        title: "Chess Game",
        description: "Design an object-oriented model for a 2-player chess game.",
        difficulty: "HARD",
        type: "LLD",
        tags: ["Object-Oriented Design", "Algorithm"],
        requirements: [
          "Board should be 8x8.",
          "Different piece types (Pawn, Knight, Bishop, Rook, Queen, King) with specific move rules.",
          "System should detect valid moves, checks, checkmates, and stalemates.",
          "Support for special moves like castling, en passant, and pawn promotion.",
          "Game flow: Players take alternating turns, with time limits."
        ],
        constraints: [
          "Extensibility: Easy to add new variants (e.g. different board sizes, new pieces).",
          "Performance: Efficient calculation of all valid moves in a given position."
        ],
        testCases: [
          "Castling conditions met -> move succeeds and moves both King and Rook",
          "Pawn reaches end of board -> triggers promotion menu/logic",
          "Player makes move that leaves King in check -> move rejected"
        ],
        extensibilityHooks: [
          "Add multiplayer matchmaking",
          "Support chess variants like Chess960",
          "Implement move replay/history export (PGN)"
        ],
        hints: [
          "Every Piece class should have a `getValidMoves()` method, but the Board must validate if a move leaves the King in check.",
          "Use the Command pattern for moves to easily support undo functionality."
        ],
        sampleSolution: "Reference Solution:\n\n1. Core classes: Game, Board, Square, Player, Move, Piece (abstract), and concrete piece classes.\n2. Move validation logic happens inside individual pieces for reachability, then validated against Board state for checks.\n3. History: Store a list of Move objects."
      },
      {
        title: "E-commerce System",
        description: "Design the core shopping flow for an e-commerce platform.",
        difficulty: "MEDIUM",
        type: "LLD",
        tags: ["System Design", "Database", "Transaction"],
        requirements: [
          "Users can browse products, add to cart, and checkout.",
          "Products have categories, prices, and reviews.",
          "Inventory management should track stock levels.",
          "System supports multiple payment methods and shipping options.",
          "Order tracking from placement to delivery."
        ],
        constraints: [
          "Scalability: Millions of products and users.",
          "Consistency: Inventory should be updated consistently (no overselling)."
        ],
        testCases: [
          "Item has 1 stock, two users checkout simultaneously -> only one succeeds",
          "Cart calculation with multiple promotions and tax rules -> total matches expected",
          "Order state transitions: Pending -> PaymentConfirmed -> Shipped -> Delivered"
        ],
        extensibilityHooks: [
          "Add a recommendation engine for cross-selling",
          "Support third-party sellers (marketplace model)",
          "Implement subscription-based orders (subscribe & save)"
        ],
        hints: [
          "The most critical part is inventory deduction. When do you deduct stock? (On add to cart vs checkout).",
          "Use the State pattern for Order status lifecycle."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: Product, Cart, CartItem, Order, OrderLog, Payment, Shipment.\n2. Concurrency: Deduct inventory at checkout using optimistic locking or DB transactions to avoid overselling.\n3. Pricing: Use Strategy pattern for different discount and tax calculators."
      },
      {
        title: "Tic-Tac-Toe Game",
        description: "Design a flexible Tic-Tac-Toe game.",
        difficulty: "EASY",
        type: "LLD",
        tags: ["Object-Oriented Design"],
        requirements: [
          "Support a customizable board size (N x N) and winning condition (M symbols in a row).",
          "Two players take turns placing their symbol (X or O).",
          "The system should declare a winner or a draw when the game ends.",
          "Support undo feature.",
          "Support bot players with basic AI."
        ],
        constraints: [
          "Performance: Winning condition check should be O(1) or O(N).",
          "Extensibility: Easy to change rules or add more players."
        ],
        testCases: [
          "Player achieves winning condition on N=5, M=4 board -> game ends",
          "Board fills up with no winner -> draw state triggered",
          "Undo move -> board state reverts and turn swaps back"
        ],
        extensibilityHooks: [
          "Add a 3D board variant",
          "Add a Minimax algorithm for the bot player",
          "Support N-player mode with larger boards"
        ],
        hints: [
          "To achieve O(1) win checking, keep track of counts for rows, columns, and diagonals instead of scanning the board.",
          "Use the Command pattern for undo support."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: Game, Board, Player, MoveCommand.\n2. O(1) Check: Maintain arrays `rowSums[]`, `colSums[]`, `diag1`, `diag2`. Increment/decrement by +1 (Player 1) or -1 (Player 2) on move.\n3. Undo: Command pattern."
      },
      {
        title: "Food Delivery System",
        description: "Design a food delivery system that connects customers, restaurants, and delivery partners.",
        difficulty: "MEDIUM",
        type: "LLD",
        tags: ["System Design", "State Machine"],
        requirements: [
          "Customers can search for restaurants and view menus.",
          "Customers can place orders and track their delivery status in real-time.",
          "Restaurants can accept/reject orders and update preparation status.",
          "System assigns available delivery partners to orders efficiently.",
          "System handles payments and rating/reviews."
        ],
        constraints: [
          "Real-time: Live tracking of delivery partners via GPS.",
          "Scale: High volume of concurrent orders during peak hours."
        ],
        testCases: [
          "No delivery partners available -> order queues or notifies restaurant to delay prep",
          "Delivery partner rejects assigned order -> system automatically reassigns to next nearest",
          "Restaurant goes offline mid-order -> system alerts support and user"
        ],
        extensibilityHooks: [
          "Add batched order delivery (one driver taking 2 nearby orders)",
          "Implement surge pricing for high demand",
          "Add a subscription tier for zero delivery fees"
        ],
        hints: [
          "Use the Observer pattern for notifying the customer app when order status changes.",
          "Consider how you model geographic proximity for finding drivers."
        ],
        sampleSolution: "Reference Solution:\n\n1. Entities: Restaurant, Menu, Order, Customer, DeliveryPartner, Dispatcher.\n2. Dispatch Algorithm: A matchmaking service that queries active drivers within a radius (QuadTree or Geohash) and uses a scoring formula.\n3. State Machine: Order transitions (Placed, Accepted, Preparing, PickedUp, Delivered)."
      }
    ],
    skipDuplicates: true
  });
  
  console.log("Seeding completed.");

  // ── HLD Problems ───────────────────────────────────────────────────────────
  await prisma.problem.createMany({
    data: [
      {
        title: "URL Shortener",
        description: "Design a scalable URL shortening service like bit.ly that converts long URLs into short aliases and redirects users.",
        difficulty: "EASY",
        type: "HLD",
        tags: ["Hashing", "Caching", "Read-Heavy"],
        requirements: [
          "Generate a unique short alias (6-8 chars) for any long URL.",
          "Redirect short URL to original in < 10ms p99.",
          "Support 100M URLs, 10B redirects/month.",
          "Allow custom aliases.",
          "Expire URLs after a configurable TTL."
        ],
        constraints: [
          "Read:Write ratio ~1000:1.",
          "Globally distributed: users on all continents.",
          "Alias uniqueness must be guaranteed across all nodes."
        ],
        testCases: [
          "Two users request the same long URL simultaneously → only one alias created",
          "Expired URL accessed → 404 or redirect to expiry page",
          "Custom alias that conflicts with existing alias → reject with clear error"
        ],
        extensibilityHooks: [
          "Add analytics: click counts, referrer, geo breakdown",
          "Support QR code generation for each short URL",
          "Add per-user link management dashboard"
        ],
        hints: [
          "Base62 encoding of an auto-incremented DB ID gives collision-free short codes.",
          "A CDN or Redis layer in front of the redirect service eliminates most DB reads.",
          "Consistent hashing helps distribute alias generation across nodes."
        ],
        sampleSolution: "Components: API Gateway → Write Service → ID Generator (Snowflake/Counter) → SQL DB (id, short, long, expiry). Read path: API Gateway → Redis Cache → Read Replicas. Alias = base62(counter). Cache with TTL matching URL expiry. CDN for static redirects."
      },
      {
        title: "Twitter / X Feed",
        description: "Design the core newsfeed system for a social media platform: users post tweets and see a real-time feed of accounts they follow.",
        difficulty: "HARD",
        type: "HLD",
        tags: ["Fan-out", "Caching", "Real-time"],
        requirements: [
          "Users post tweets (text, image, video).",
          "Timeline shows tweets from all followed accounts, newest first.",
          "Support 300M daily active users, 500M tweets/day.",
          "Read latency < 100ms for timeline.",
          "Support celebrity accounts with 50M+ followers."
        ],
        constraints: [
          "Fan-out on write is expensive for celebrities (hotspot problem).",
          "Eventual consistency acceptable for non-real-time followers.",
          "Storage: tweets live forever; media stored in object store."
        ],
        testCases: [
          "Celebrity posts tweet → 50M timelines updated without thundering herd",
          "User unfollows account → their old tweets disappear from feed within seconds",
          "User with no internet reconnects → sees missed tweets in order"
        ],
        extensibilityHooks: [
          "Add algorithmic ranking (engagement score) on top of chronological feed",
          "Add trending topics service",
          "Support lists (curated sub-feeds)"
        ],
        hints: [
          "Use a hybrid fan-out: push for normal users, pull for celebrities.",
          "Pre-computed timeline cache per user in Redis gives sub-10ms reads.",
          "Kafka for async tweet delivery to followers."
        ],
        sampleSolution: "Write path: Tweet Service → Kafka → Fan-out Workers → Timeline Cache (Redis sorted set per user). Read path: Timeline Service → Redis (cache hit) or pull from DB. Celebrities: pull-on-read merged with push feed. Media: upload to S3/CDN. Search: Elasticsearch for full-text."
      },
      {
        title: "Ride-Sharing Platform (Uber)",
        description: "Design the backend for a ride-sharing service: matching riders to nearby drivers in real-time.",
        difficulty: "HARD",
        type: "HLD",
        tags: ["Geospatial", "Real-time", "Matching"],
        requirements: [
          "Rider requests a ride with pickup & dropoff.",
          "Match rider to nearest available driver within 30s.",
          "Track driver location in real-time (GPS ping every 5s).",
          "Calculate ETA and fare upfront.",
          "Support 5M concurrent rides globally."
        ],
        constraints: [
          "Location updates: 1M drivers × 1 ping/5s = 200K writes/s.",
          "Matching latency < 2s from request to driver notification.",
          "Fare accuracy must be consistent across retries."
        ],
        testCases: [
          "All nearby drivers are busy → rider placed in queue, notified when one frees up",
          "Driver cancels mid-trip → system immediately re-matches rider",
          "Surge pricing activates in downtown area → fares update in real time"
        ],
        extensibilityHooks: [
          "Add carpooling: match multiple riders heading same direction",
          "Add scheduled rides booked 24h in advance",
          "Add driver earnings dashboard with daily/weekly breakdowns"
        ],
        hints: [
          "Geohash or QuadTree partitions the map for O(1) nearby driver lookup.",
          "Separate location update stream (Kafka/Redis) from the matching service.",
          "Use a consistent-hash ring to shard drivers by region."
        ],
        sampleSolution: "Location Service: drivers push GPS → Kafka → Location Store (Redis Geospatial). Matching Service: on ride request, query Redis GEORADIUS → rank by ETA → notify driver via WebSocket. Trip Service: manages trip state machine. Pricing Service: computes fare (base + surge). Maps API for routing/ETA."
      },
      {
        title: "YouTube / Video Streaming",
        description: "Design a large-scale video upload, processing, and streaming platform.",
        difficulty: "HARD",
        type: "HLD",
        tags: ["CDN", "Encoding", "Streaming"],
        requirements: [
          "Users upload videos up to 10GB.",
          "Videos are transcoded to multiple resolutions (360p, 720p, 1080p, 4K).",
          "Stream video to 2B users globally with < 500ms start time.",
          "Support adaptive bitrate (ABR) streaming.",
          "Store video metadata, comments, and likes."
        ],
        constraints: [
          "Upload bandwidth: 500 hours of video uploaded per minute.",
          "Streaming: 1B hours watched per day.",
          "Storage: exabytes of video data."
        ],
        testCases: [
          "User uploads a 2GB video → all resolutions available within 5 minutes",
          "Popular video spikes to 10M concurrent viewers → no buffering",
          "User pauses and resumes after 1 hour → resume from exact byte position"
        ],
        extensibilityHooks: [
          "Add live streaming support",
          "Add automatic captioning / subtitle generation",
          "Add content ID matching for copyright detection"
        ],
        hints: [
          "Chunk upload (multipart) + resumable upload protocol for reliability.",
          "Transcoding pipeline: upload → S3 → SQS → transcoding workers → S3.",
          "CDN edge nodes serve video segments; ABR playlist (HLS/DASH) selects quality."
        ],
        sampleSolution: "Upload: chunked multipart → S3 raw. Transcoding: SQS → worker fleet → FFmpeg → S3 multiple resolutions. CDN (CloudFront) caches segments. Metadata: PostgreSQL. Search: Elasticsearch. Recommendations: ML pipeline on watch history. Comments: Cassandra (high write throughput)."
      },
      {
        title: "WhatsApp / Messaging System",
        description: "Design a real-time messaging system supporting 1-on-1 and group chats with guaranteed delivery.",
        difficulty: "MEDIUM",
        type: "HLD",
        tags: ["WebSocket", "Message Queue", "Consistency"],
        requirements: [
          "Send and receive messages in real-time.",
          "Support group chats up to 256 members.",
          "Guarantee at-least-once delivery; show read receipts.",
          "Persist message history for 7 years.",
          "Support 2B users, 100B messages/day."
        ],
        constraints: [
          "Messages must be delivered even if recipient is offline (store-and-forward).",
          "End-to-end encryption (E2EE) — server must not read plaintext.",
          "Message ordering must be consistent within a conversation."
        ],
        testCases: [
          "Recipient is offline for 3 days → messages delivered in order when they reconnect",
          "256-member group message → all members receive within 1s",
          "Network partitioned mid-send → message not duplicated on retry"
        ],
        extensibilityHooks: [
          "Add voice/video calls over WebRTC",
          "Add disappearing messages with per-chat TTL",
          "Add message reactions and threaded replies"
        ],
        hints: [
          "Each chat-server holds WebSocket connections; a message router dispatches to the right server.",
          "Cassandra for message storage: partition by conversation_id, cluster by timestamp.",
          "Sequence numbers per conversation ensure ordering and deduplication."
        ],
        sampleSolution: "WebSocket gateway per region. Message Service assigns sequence number → Kafka → Delivery Workers (push to online clients, store for offline). Storage: Cassandra (messages) + Redis (online user map). Read receipts: ack flow back through Kafka. Groups: fan-out to each member's inbox."
      },
      {
        title: "Distributed Rate Limiter",
        description: "Design a distributed rate limiting service that enforces per-user and per-endpoint request quotas across a fleet of API servers.",
        difficulty: "MEDIUM",
        type: "HLD",
        tags: ["Distributed Systems", "Redis", "API Gateway"],
        requirements: [
          "Enforce N requests per second/minute per user or API key.",
          "Work across 100+ API server nodes.",
          "Latency overhead of rate check < 5ms.",
          "Support multiple algorithms: token bucket, sliding window.",
          "Graceful degradation if rate-limit service is down."
        ],
        constraints: [
          "Strong consistency required: no double-spending of quota.",
          "Rate limiter must not become a single point of failure.",
          "Must handle 1M+ unique keys simultaneously."
        ],
        testCases: [
          "User sends 101 requests in 1 second with 100 RPS limit → 101st is rejected",
          "Rate limiter Redis cluster loses a node → API servers fall back to local counters",
          "Burst of 500 requests in 100ms under token bucket → correct bucket drain"
        ],
        extensibilityHooks: [
          "Add per-plan limits (free vs. paid tiers)",
          "Add circuit breaker integration (stop rate-checking overloaded services)",
          "Add real-time rate limit dashboard and alerting"
        ],
        hints: [
          "Redis INCR + EXPIRE implements a fixed window counter atomically.",
          "Sliding window log: store timestamps in a Redis sorted set, prune old entries.",
          "Use Redis Cluster with read replicas; local token bucket as fallback."
        ],
        sampleSolution: "API Gateway checks rate before forwarding. Rate Limiter Service: Redis Cluster stores token bucket state per key (INCRBY + TTL). Lua script for atomic check-and-decrement. Fallback: local in-memory bucket per node (allows brief over-quota on failure). Prometheus metrics for monitoring quota usage."
      },
      {
        title: "Google Drive / Cloud Storage",
        description: "Design a cloud file storage and sync service where users upload, organize, and share files across devices.",
        difficulty: "MEDIUM",
        type: "HLD",
        tags: ["Sync", "Object Storage", "Collaboration"],
        requirements: [
          "Upload, download, and organize files in folders.",
          "Sync changes across all user devices in real-time.",
          "Support file sharing with view/edit permissions.",
          "Handle files up to 5TB.",
          "Support 1B users, 15 exabytes of storage."
        ],
        constraints: [
          "Bandwidth efficiency: only upload changed chunks (delta sync).",
          "Consistency: two devices editing the same file → last-write-wins or conflict copy.",
          "Metadata operations (rename, delete) must be transactional."
        ],
        testCases: [
          "User edits large file → only changed 4MB chunk re-uploaded, not full 2GB file",
          "Two devices edit same file offline simultaneously → conflict copy created",
          "Shared folder: 1000 collaborators all see a new file within 5 seconds"
        ],
        extensibilityHooks: [
          "Add version history (last 30 versions)",
          "Add real-time collaborative editing (Google Docs-style)",
          "Add virus scanning on upload"
        ],
        hints: [
          "Split files into 4MB chunks; hash each chunk (SHA-256) to detect changes.",
          "Metadata DB (PostgreSQL) tracks file tree; chunks stored in S3.",
          "Delta sync: client sends list of chunk hashes → server replies with which to upload."
        ],
        sampleSolution: "Client SDK chunks files + computes hashes. Upload API: POST chunk list → server returns missing chunks → client uploads only those to S3. Metadata: PostgreSQL (files, folders, permissions, version history). Sync: long-poll or WebSocket notification when remote changes. CDN for fast downloads. Search: Elasticsearch on metadata."
      },
      {
        title: "Search Autocomplete / Typeahead",
        description: "Design a real-time search suggestion service that shows relevant completions as the user types, at Google scale.",
        difficulty: "EASY",
        type: "HLD",
        tags: ["Trie", "Caching", "Read-Heavy"],
        requirements: [
          "Return top-10 suggestions within 100ms for any prefix.",
          "Suggestions ranked by popularity (search frequency).",
          "Support 10B queries/day, 500M unique queries/month.",
          "Update suggestions based on recent trends (near real-time).",
          "Support multiple languages."
        ],
        constraints: [
          "Read:Write ratio ~10000:1.",
          "Prefix index must fit in memory for fast lookup.",
          "Trending queries should surface within 15 minutes of going viral."
        ],
        testCases: [
          "User types 'appl' → sees [apple, application, apple watch, apple store, ...] in < 50ms",
          "Trending query spikes 1000× in 10 minutes → appears in suggestions within 15 minutes",
          "Rare 3-word query → system gracefully returns best partial match"
        ],
        extensibilityHooks: [
          "Add personalized suggestions based on user search history",
          "Add spell-correction for misspelled prefixes",
          "Add image/product previews alongside text suggestions"
        ],
        hints: [
          "Pre-compute top-k suggestions per prefix and cache in Redis.",
          "Trie in memory for exact prefix match; top-k stored at each node.",
          "Stream recent searches through Kafka → batch job updates trie every 15 minutes."
        ],
        sampleSolution: "Data collection: log searches → Kafka → Spark aggregation (hourly/daily). Trie Builder: compute top-10 per prefix → store in Redis (key = prefix). Suggestion API: lookup prefix in Redis (< 1ms). CDN caches common prefixes. Fallback: Elasticsearch prefix query. Personalization layer merges global + user-specific scores."
      },
      {
        title: "Notification Service",
        description: "Design a high-throughput notification system that delivers push, email, and SMS notifications reliably to millions of users.",
        difficulty: "MEDIUM",
        type: "HLD",
        tags: ["Message Queue", "Fan-out", "Multi-channel"],
        requirements: [
          "Support push (iOS/Android), email, and SMS channels.",
          "Deliver notifications within 5 seconds of trigger.",
          "Handle 1M notifications/second at peak.",
          "Guarantee at-least-once delivery; deduplicate on retry.",
          "Support per-user channel preferences and quiet hours."
        ],
        constraints: [
          "Third-party providers (APNs, FCM, SendGrid, Twilio) have rate limits.",
          "Do not spam: enforce per-user per-type rate limiting.",
          "Notifications must not be lost if a downstream provider is unavailable."
        ],
        testCases: [
          "Provider FCM is down for 30 min → notifications queued and delivered when it recovers",
          "User sets quiet hours 10pm–8am → notifications held and delivered at 8am",
          "Same notification triggered twice due to upstream retry → user receives it once"
        ],
        extensibilityHooks: [
          "Add in-app notification inbox (persistent feed)",
          "Add notification analytics (open rate, click rate)",
          "Add A/B testing for notification copy"
        ],
        hints: [
          "Use a topic-based Kafka architecture: one topic per channel type.",
          "Idempotency key per notification prevents duplicates on retry.",
          "Worker pools per provider respect rate limits independently."
        ],
        sampleSolution: "Notification API → Kafka (topic per channel). Workers per channel: validate preferences, check quiet hours, apply rate limit, call provider SDK. Retry queue with exponential backoff for failed deliveries. Dedup: Redis SET with notification_id + TTL. DLQ for permanently failed notifications. Analytics: emit events to Kafka → ClickHouse."
      },
      {
        title: "Distributed Task Queue (Celery / Sidekiq-style)",
        description: "Design a distributed task queue system for offloading long-running background jobs from web servers.",
        difficulty: "MEDIUM",
        type: "HLD",
        tags: ["Queue", "Workers", "Reliability"],
        requirements: [
          "Enqueue tasks from web servers; workers process them asynchronously.",
          "Support task priorities, retries with exponential backoff, and dead-letter queues.",
          "Schedule tasks for future execution (cron-style).",
          "Monitor task status and execution history.",
          "Handle 100K tasks/second at peak."
        ],
        constraints: [
          "Tasks must not be lost if a worker crashes mid-execution.",
          "At-least-once delivery; tasks should be idempotent.",
          "Worker fleet scales horizontally; tasks distributed evenly."
        ],
        testCases: [
          "Worker crashes mid-task → task re-queued and executed by another worker",
          "Task fails 3 times → moved to DLQ with full error trace",
          "Scheduled task set for 3am → executes within 1 second of scheduled time"
        ],
        extensibilityHooks: [
          "Add task chaining (workflow DAG: task B runs after task A succeeds)",
          "Add per-queue rate limiting (max N tasks/s per queue)",
          "Add real-time worker dashboard showing queue depths and throughput"
        ],
        hints: [
          "Redis lists or Kafka topics as the queue backend; BRPOPLPUSH for reliable dequeue.",
          "Heartbeat mechanism: worker marks task as 'in-progress'; scheduler re-queues if heartbeat stops.",
          "Separate scheduler service polls a sorted set (score = run_at timestamp) for due tasks."
        ],
        sampleSolution: "Broker: Redis (low latency) or Kafka (high throughput). Worker: BRPOPLPUSH to move task to in-progress set → execute → ACK removes from in-progress. Retry: exponential backoff with jitter, max 5 attempts → DLQ. Scheduler: daemon polls Redis ZRANGEBYSCORE (score=epoch) → enqueue due tasks. Monitoring: Prometheus + Grafana for queue depths."
      },
    ],
  });

  console.log("HLD problems seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
