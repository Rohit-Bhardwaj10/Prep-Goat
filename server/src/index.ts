import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import problemsRouter from "./routes/problems";
import attemptsRouter from "./routes/attempts";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:3000"] : ["http://localhost:3000"],
  credentials: true,
}));

// NOTE: Do NOT use express.json() before the auth handler.
// better-auth's toNodeHandler does its own body parsing.
// Applying express.json() first would consume the request stream,
// leaving better-auth with an empty body (causing 400 Bad Request).
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.use("/api/problems", problemsRouter);
app.use("/api/attempts", attemptsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// TEMP: debug which DB the server is actually connected to
app.get("/api/admin/db-info", (req, res) => {
  const url = process.env.DATABASE_URL || "NOT SET";
  const masked = url.replace(/:([^:@]+)@/, ":***@");
  res.json({ DATABASE_URL: masked });
});

// TEMP: wipe and reseed using the server's live connection
app.post("/api/admin/reseed", async (req, res) => {
  try {
    await prisma.problem.deleteMany({});
    await prisma.problem.createMany({
      data: [
        { title: "Parking Lot", description: "Design a multi-floor parking lot system.", difficulty: "MEDIUM", type: "LLD", tags: ["Object-Oriented Design", "State Machine", "Concurrency"], requirements: ["The parking lot should have multiple floors.", "Each floor should have multiple spots of different types.", "The system should support different vehicle types.", "The system should calculate fees.", "The system should allow entry and exit."], constraints: ["Concurrency: Handle multiple vehicles simultaneously.", "Scale: Thousands of spots."], testCases: ["Motorcycle arrives with only large spots left -> finds appropriate spot", "2 cars arrive simultaneously for last compact spot -> only 1 gets it", "Handicapped vehicle arrives, all handicapped spots full -> fallback policy"], extensibilityHooks: ["Add EV charging spots", "Add monthly pass support", "Add reservation system"], hints: ["Use Strategy pattern for fees.", "Thread-safety for spot assignment.", "State machine for spot status."], sampleSolution: "1. Entities: ParkingLot, Floor, ParkingSpot, Vehicle, Ticket.\n2. Patterns: Strategy, Singleton, Factory.\n3. Concurrency: Read-write locks on Floor/ParkingSpot." },
        { title: "Elevator System", description: "Design an elevator system for a high-rise building.", difficulty: "HARD", type: "LLD", tags: ["Algorithm", "State Machine", "Concurrency"], requirements: ["Building has multiple floors and elevators.", "Elevators can be requested from any floor.", "Users select destination floor inside.", "Efficient scheduling algorithm (SCAN).", "Doors open/close automatically with safety sensors."], constraints: ["Concurrency: Handle multiple requests simultaneously.", "Real-time: State machine must be responsive."], testCases: ["3 simultaneous requests from floors 1,5,10 -> SCAN correct dispatch", "Elevator at capacity -> not accept more passengers", "Emergency stop triggered -> EMERGENCY state"], extensibilityHooks: ["Add express elevators", "Add VIP floors requiring auth", "Predictive dispatch based on history"], hints: ["SCAN algorithm for scheduling.", "State pattern for Elevator.", "Decouple controller from elevators."], sampleSolution: "1. Entities: ElevatorSystem, Elevator, Button, Request, StateMachine.\n2. Algorithm: Two priority queues per elevator (UP/DOWN). LOOK algorithm.\n3. Sync: Controller processes requests in dedicated thread." },
        { title: "Vending Machine", description: "Design a software system for a physical vending machine.", difficulty: "EASY", type: "LLD", tags: ["State Machine", "Object-Oriented Design"], requirements: ["Multiple items with different prices and quantities.", "Accepts different denominations.", "Dispenses item if sufficient money and in stock.", "Returns correct change.", "Handles out-of-stock and insufficient funds."], constraints: ["State Machine: Clear states (Idle, HasMoney, Dispensing, ReturnChange).", "Transactionality: Payment and dispensing must be atomic."], testCases: ["User inserts $5 for $2 item -> dispenses $3 change", "User selects out-of-stock item after inserting money -> state resets, returns money", "User cancels mid-way -> refunds exact inserted denominations"], extensibilityHooks: ["Add digital payments", "Dynamic pricing by time of day", "Remote telemetry for inventory"], hints: ["Classic State pattern use case.", "Inventory deductions must be transactionally safe."], sampleSolution: "1. State pattern with insertMoney(), selectProduct(), dispense(), cancel().\n2. Inventory class maps items to quantities.\n3. Greedy change algorithm." },
        { title: "Cache System (LRU)", description: "Design an in-memory caching system with LRU eviction policy.", difficulty: "MEDIUM", type: "LLD", tags: ["Data Structures", "Concurrency"], requirements: ["O(1) get() and put() operations.", "Fixed capacity.", "Evict least recently used item at capacity.", "Support generic types.", "Thread-safe for concurrent access."], constraints: ["Concurrency: Multiple threads read/write simultaneously.", "Performance: High throughput, minimal latency."], testCases: ["Insert beyond capacity -> exactly one element evicted (LRU)", "Get existing element -> updates to most recently used", "Multiple threads put simultaneously -> capacity never exceeded"], extensibilityHooks: ["Add TTL support for cache items", "Configurable eviction policy (LFU)", "Multi-level cache (L1 in-memory, L2 disk)"], hints: ["O(1) requires HashMap + Doubly Linked List.", "Lock striping or ConcurrentHashMap for thread-safety."], sampleSolution: "1. HashMap mapped to nodes of Doubly Linked List.\n2. ReentrantReadWriteLock for concurrent access.\n3. On put() at capacity: remove tail node, delete from map." },
        { title: "Movie Ticket Booking", description: "Design a system to browse movies, select seats, and book tickets.", difficulty: "HARD", type: "LLD", tags: ["Database", "Concurrency", "Transaction"], requirements: ["Multiple cities, cinemas, and screens.", "Browse movies by city and time.", "Seat hold while making payment.", "Payment processing integration.", "Different seat types (Silver, Gold, Platinum)."], constraints: ["Concurrency: Handle multiple users booking same seat without double-booking.", "ACID: Transactionality during booking and payment."], testCases: ["Two users select same seat simultaneously -> only one acquires lock", "User lock expires during payment -> seat released, payment fails", "Payment fails -> seat lock released immediately"], extensibilityHooks: ["Dynamic pricing (surge on weekends)", "Discount coupons and loyalty points", "Waitlists for sold-out shows"], hints: ["Distributed lock or DB row-level locking for seat hold.", "TTL mechanism for expired seat holds."], sampleSolution: "1. Entities: Cinema, Screen, Show, Seat, Booking, User.\n2. Seat locking: Change seat to LOCKED with expiry. SELECT FOR UPDATE.\n3. TTL: Redis expiration or background worker." },
        { title: "Library Management System", description: "Design a system for managing books, members, and borrowing in a library.", difficulty: "EASY", type: "LLD", tags: ["Object-Oriented Design", "Database"], requirements: ["Books, members, and librarians.", "A book can have multiple copies.", "Search by title, author, or category.", "Members can borrow, reserve, and return books.", "Calculate fines for overdue books."], constraints: ["State Management: Book states (Available, Reserved, Loaned, Lost).", "Scale: Tens of thousands of books and members."], testCases: ["Member borrows more than max limit -> system denies", "Member returns book 5 days late -> correct fine, blocks borrowing if unpaid", "Member reserves book -> next available copy allocated"], extensibilityHooks: ["Barcode scanner integration", "Digital books and audiobooks", "Inter-library loans"], hints: ["Distinguish Book (metadata) from BookItem (physical copy).", "Observer pattern to notify members when reserved book available."], sampleSolution: "1. Entities: Book, BookItem, Account, LibraryCard, Reservation, Fine.\n2. Searching: Catalog interface with separate search modules.\n3. Notifications: Observer pattern." },
        { title: "Chess Game", description: "Design an object-oriented model for a 2-player chess game.", difficulty: "HARD", type: "LLD", tags: ["Object-Oriented Design", "Algorithm"], requirements: ["8x8 board.", "Different piece types with specific move rules.", "Detect valid moves, checks, checkmates, stalemates.", "Special moves: castling, en passant, pawn promotion.", "Alternating turns with time limits."], constraints: ["Extensibility: Easy to add variants.", "Performance: Efficient calculation of all valid moves."], testCases: ["Castling conditions met -> move succeeds, moves both King and Rook", "Pawn reaches end of board -> triggers promotion", "Player makes move leaving King in check -> move rejected"], extensibilityHooks: ["Multiplayer matchmaking", "Chess variants like Chess960", "Move replay/history export (PGN)"], hints: ["Each Piece has getValidMoves(), Board validates for check.", "Command pattern for undo."], sampleSolution: "1. Classes: Game, Board, Square, Player, Move, Piece (abstract), concrete pieces.\n2. Move validation: piece reachability + board check validation.\n3. History: List of Move objects." },
        { title: "E-commerce Platform", description: "Design the core shopping flow for an e-commerce platform.", difficulty: "MEDIUM", type: "LLD", tags: ["System Design", "Database", "Transaction"], requirements: ["Browse products, add to cart, checkout.", "Products have categories, prices, reviews.", "Inventory management tracks stock.", "Multiple payment methods and shipping options.", "Order tracking from placement to delivery."], constraints: ["Scalability: Millions of products and users.", "Consistency: No overselling."], testCases: ["1 stock item, two users checkout simultaneously -> only one succeeds", "Cart with multiple promotions and tax rules -> total matches expected", "Order state transitions: Pending -> PaymentConfirmed -> Shipped -> Delivered"], extensibilityHooks: ["Recommendation engine for cross-selling", "Third-party sellers (marketplace)", "Subscription-based orders"], hints: ["Inventory deduction timing is critical (cart vs checkout).", "State pattern for Order status lifecycle."], sampleSolution: "1. Entities: Product, Cart, CartItem, Order, OrderLog, Payment, Shipment.\n2. Inventory: Optimistic locking or DB transactions at checkout.\n3. Pricing: Strategy pattern for discounts and tax." },
        { title: "Tic-Tac-Toe", description: "Design a flexible Tic-Tac-Toe game.", difficulty: "EASY", type: "LLD", tags: ["Object-Oriented Design"], requirements: ["Customizable board size (N x N) and winning condition (M in a row).", "Two players alternate turns.", "Declare winner or draw.", "Undo feature.", "Bot players with basic AI."], constraints: ["Performance: Winning check O(1) or O(N).", "Extensibility: Easy to change rules or add players."], testCases: ["Player achieves winning condition on N=5, M=4 board -> game ends", "Board fills up with no winner -> draw state triggered", "Undo move -> board state reverts and turn swaps back"], extensibilityHooks: ["3D board variant", "Minimax algorithm for bot", "N-player mode with larger boards"], hints: ["O(1) win checking: track row/col/diagonal sums.", "Command pattern for undo."], sampleSolution: "1. Entities: Game, Board, Player, MoveCommand.\n2. O(1) Check: rowSums[], colSums[], diag1, diag2 arrays.\n3. Undo: Command pattern." },
        { title: "Food Delivery System", description: "Design a food delivery system connecting customers, restaurants, and delivery partners.", difficulty: "MEDIUM", type: "LLD", tags: ["System Design", "State Machine"], requirements: ["Search restaurants, view menus.", "Place orders and track delivery in real-time.", "Restaurants accept/reject orders.", "Assign delivery partners efficiently.", "Handle payments and ratings."], constraints: ["Real-time: Live tracking via GPS.", "Scale: High volume of concurrent orders."], testCases: ["No delivery partners available -> order queues or notifies restaurant to delay", "Partner rejects assigned order -> auto-reassigns to next nearest", "Restaurant goes offline mid-order -> alerts support and user"], extensibilityHooks: ["Batched order delivery", "Surge pricing for high demand", "Subscription tier for zero delivery fees"], hints: ["Observer pattern for order status notifications.", "Geographic proximity modeling for drivers."], sampleSolution: "1. Entities: Restaurant, Menu, Order, Customer, DeliveryPartner, Dispatcher.\n2. Dispatch: Matchmaking service with QuadTree/Geohash + scoring.\n3. State Machine: Placed -> Accepted -> Preparing -> PickedUp -> Delivered." },
      ],
    });
    const count = await prisma.problem.count();
    res.json({ success: true, count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { prisma } from "./auth";

// Keep Neon awake — ping every 4 minutes
setInterval(async () => {
  await prisma.$queryRaw`SELECT 1`.catch(() => { });
}, 4 * 60 * 1000);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
