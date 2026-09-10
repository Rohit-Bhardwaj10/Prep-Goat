import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding problems...");
  await prisma.problem.deleteMany({});
  
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
