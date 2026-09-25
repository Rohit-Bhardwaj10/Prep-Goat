import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing old resources...');
  await prisma.learningPathItem.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.resource.deleteMany();

  console.log('Seeding resources...');

  // ─────────────────────────────────────────────
  // BLOG 1: CAP Theorem
  // ─────────────────────────────────────────────
  const capTheorem = await prisma.resource.upsert({
    where: { slug: 'cap-theorem' },
    update: {},
    create: {
      slug: 'cap-theorem',
      title: 'The CAP Theorem, explained simply',
      content: `
## What is the CAP Theorem?

In 2000, computer scientist Eric Brewer proposed what became one of the most important ideas in distributed systems: that a distributed data store can only ever guarantee two out of three properties at the same time. Those three properties are Consistency, Availability, and Partition tolerance. Together, they form the CAP theorem.

If you have ever wondered why picking a database actually matters, or why someone would choose Cassandra over PostgreSQL for a specific use case, the answer almost always traces back to this idea.

## The Three Properties

### Consistency

A system is consistent if every read receives the most recent write. Not a cached version. Not an old version. The latest one.

Think of it like a bank balance. If you deposit 100 dollars and then immediately check your balance on a different device, you expect to see that deposit reflected. If the system shows you the old balance, it is not consistent.

### Availability

A system is available if every request receives a response, even if that response is not the most recent data. The system never refuses to answer. It might give you slightly stale data, but it will always give you something.

Think of it like a social media feed. If one server goes down, you still see posts, they might just be from a few seconds ago.

### Partition Tolerance

A partition happens when two nodes in a distributed system cannot communicate with each other, usually because of a network failure. Partition tolerance means the system keeps working even when this happens.

Here is the uncomfortable truth: in any real distributed system running across multiple machines or data centers, network partitions will happen. The internet is unreliable. Cables get cut. Routers crash. This means partition tolerance is not really optional. You must design for it.

## Why You Can Only Pick Two

Because partitions are inevitable in distributed systems, the real tradeoff is between Consistency and Availability when a partition occurs.

When a network partition happens, you have two choices:

**Option 1: Stay Consistent.** Stop accepting writes, or return errors, until the partition heals. This way, you never serve stale data. But you also stop serving some requests entirely.

**Option 2: Stay Available.** Keep accepting reads and writes on both sides of the partition. When the partition heals, you reconcile the differences. But during the partition, different nodes may have different data.

There is no third option where you keep both and also tolerate partitions. That is the theorem.

## CP vs AP in Practice

**CP Systems (Consistent + Partition Tolerant)**

These systems will refuse requests or return errors rather than serve stale data. Examples include HBase, Zookeeper, and MongoDB in its default configuration. If you need strict accuracy, like financial transactions or inventory counts, you want CP.

**AP Systems (Available + Partition Tolerant)**

These systems will always respond, even if the data is slightly out of date. Examples include Cassandra, CouchDB, and DynamoDB. If you need high availability and can accept eventual consistency, like social media timelines or product recommendations, you want AP.

## A Concrete Example

Imagine you are building a ride-sharing app. Your database records which driver is assigned to which ride.

If you choose CP and a partition happens, some users might see an error when trying to request a ride. Not great, but no double-assignments happen.

If you choose AP and a partition happens, the system keeps accepting requests on both sides. You might accidentally assign the same driver to two different riders. Also not great, but at least the app keeps working.

Neither is wrong. It depends on what failure mode you can tolerate.

## The Nuance People Miss

CAP is often treated as a binary choice, but real systems are more nuanced. Many modern databases let you tune consistency levels per query. In Cassandra, you can ask for a strongly consistent read by requiring acknowledgement from a quorum of nodes. In DynamoDB, you can request strongly consistent reads at higher latency cost.

The theorem tells you what the ceiling is. Good engineering is about understanding your actual requirements and tuning accordingly.

## Summary

The CAP theorem says distributed systems can only guarantee two of: Consistency, Availability, and Partition tolerance. Since partitions are unavoidable over a real network, you are really choosing between consistency and availability when things go wrong. CP systems favor correctness. AP systems favor uptime. Understanding this is the foundation for making an informed database choice in any system design interview or real production system.
      `.trim(),
    },
  });

  // ─────────────────────────────────────────────
  // BLOG 2: DNS
  // ─────────────────────────────────────────────
  const dnsResource = await prisma.resource.upsert({
    where: { slug: 'dns-basics' },
    update: {},
    create: {
      slug: 'dns-basics',
      title: 'How DNS actually works',
      content: `
## What is DNS?

DNS stands for Domain Name System. It is the reason you can type "google.com" into a browser instead of "142.250.80.46". It is, quite literally, the phonebook of the internet. But unlike a phonebook, it is hierarchical, globally distributed, and needs to resolve billions of queries every second without becoming a single point of failure.

Understanding how DNS works is essential for anyone building networked systems, because it touches everything: performance, security, reliability, and debugging.

## Why DNS Exists

In the early days of the internet, a single file called HOSTS.TXT was maintained at Stanford Research Institute and shared across all machines on the network. Every computer would periodically download this file to know which hostnames mapped to which IP addresses. This worked fine when the internet had a few hundred machines. It stopped working when the number grew to thousands.

DNS was designed in 1983 by Paul Mockapetris as a scalable, distributed replacement. Instead of one central file, the system is a tree of name servers distributed around the world, each responsible for a portion of the namespace.

## The Hierarchy

DNS is organized as a tree. At the very top is the root, represented by a single dot. Below the root are the top-level domains like .com, .org, .net, and country codes like .in or .uk. Below those are the second-level domains that people register, like "google" in google.com. Then there can be subdomains like "mail" in mail.google.com.

Each level is managed by different name servers. ICANN manages the root. Verisign manages .com. Google manages google.com. Your company manages your.company.com.

## What Happens When You Type a URL

When you type "prep-g.com" into your browser and hit enter, a lot happens before the page loads.

### Step 1: Local Cache Check

Your browser first checks its own DNS cache. If it has resolved this domain recently and the record has not expired, it uses the cached IP address and skips everything else. Your operating system also has its own DNS cache. If the browser cache misses, the OS cache is checked next.

### Step 2: The Recursive Resolver

If neither cache has the answer, your OS sends the query to a recursive resolver. This is usually operated by your ISP or a third-party provider like Google (8.8.8.8) or Cloudflare (1.1.1.1). The recursive resolver is the worker that goes out and finds the answer on your behalf.

### Step 3: Root Name Servers

If the recursive resolver does not have the answer cached, it asks one of the 13 root name server clusters. There are hundreds of physical machines behind these 13 addresses, distributed globally using a technique called anycast. The root server does not know the IP for prep-g.com, but it knows who is responsible for .com domains, and it tells the resolver to go ask them.

### Step 4: TLD Name Servers

The resolver now contacts the .com TLD name servers. These servers do not know the IP for prep-g.com either, but they know which name servers are authoritative for prep-g.com, because that information was registered when the domain was purchased. They return those name server addresses.

### Step 5: Authoritative Name Servers

Finally, the resolver contacts the authoritative name servers for prep-g.com. These servers actually hold the DNS records for the domain and return the real IP address.

### Step 6: The Response Travels Back

The recursive resolver returns the IP address to your OS, which passes it to your browser. The browser then opens a TCP connection to that IP address and begins the HTTP handshake. The DNS part is done.

## DNS Record Types

DNS is not just about mapping names to IPs. There are many record types, each serving a different purpose.

**A Record** maps a hostname to an IPv4 address. This is the most common record type.

**AAAA Record** maps a hostname to an IPv6 address.

**CNAME Record** is a canonical name alias. It maps one hostname to another hostname. For example, www.prep-g.com might be a CNAME pointing to prep-g.com. The resolver then looks up the A record for prep-g.com. CNAMEs cannot coexist with other record types at the same name, which causes problems at the zone apex (the root of your domain). This is why many DNS providers offer proprietary ALIAS or ANAME records that work like CNAMEs but are resolved server-side.

**MX Record** specifies the mail servers responsible for accepting email for a domain.

**TXT Record** holds arbitrary text data. Commonly used for domain verification, SPF records for email authentication, and DKIM public keys.

**NS Record** specifies the authoritative name servers for a domain.

## TTL and Caching

Every DNS record has a TTL, which stands for Time to Live. It is measured in seconds and tells resolvers how long they are allowed to cache the record before asking again.

A TTL of 300 means 5 minutes. A TTL of 86400 means 24 hours. Lower TTLs mean changes propagate faster but put more load on your name servers. Higher TTLs mean faster responses for end users because more resolvers have the answer cached, but changes take longer to propagate.

When you are changing DNS records, such as pointing a domain to a new IP address, a common strategy is to lower the TTL well in advance, make the change, verify it works, then raise the TTL again.

## DNS and Performance

DNS lookup time is real latency. A cold DNS resolution with no caches involved can take 50 to 200 milliseconds, which is significant. This is why caching exists at every level, and why CDN providers like Cloudflare can improve perceived performance significantly by putting their name servers physically close to users around the world.

## Summary

DNS translates domain names into IP addresses through a hierarchical, distributed system. A query travels from your browser cache to your OS cache to a recursive resolver to root servers to TLD servers to authoritative servers, picking up the answer along the way. Every record has a TTL that controls how long it is cached. Understanding this chain is crucial for debugging network issues, planning infrastructure changes, and designing resilient systems.
      `.trim(),
    },
  });

  // ─────────────────────────────────────────────
  // BLOG 3: SOLID Principles
  // ─────────────────────────────────────────────
  const solidPrinciples = await prisma.resource.upsert({
    where: { slug: 'solid-principles' },
    update: {},
    create: {
      slug: 'solid-principles',
      title: 'SOLID principles without the jargon',
      content: `
## What are the SOLID Principles?

SOLID is an acronym for five design principles introduced by Robert C. Martin, also known as Uncle Bob, in the early 2000s. They are meant to guide how you write and organize object-oriented code so that it is easier to understand, change, and maintain over time.

The five principles are Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. Most explanations of these are abstract to the point of uselessness. This one will not be.

## Single Responsibility Principle

**A class should have one reason to change.**

This does not mean a class can only do one thing. It means that all the things a class does should serve a single purpose, so that only one kind of change in the system would require you to modify it.

Consider a class called \`UserService\` that handles creating users, validating their email addresses, sending a welcome email, and writing logs to a file. This class has at least four reasons to change: if the user creation logic changes, if the email validation rules change, if you switch email providers, or if you change how logging works.

A better design splits these responsibilities. \`UserService\` creates users. A separate \`EmailValidator\` handles validation. A separate \`Mailer\` sends email. A separate \`Logger\` handles logging. Now each class changes for exactly one reason.

The practical benefit is that when your email provider changes, you only touch the \`Mailer\`. You do not risk accidentally breaking user creation logic.

## Open-Closed Principle

**Classes should be open for extension but closed for modification.**

Once a class is working and tested, you should be able to add new behavior without editing its existing code. You add behavior by extending the class or implementing an interface, not by cracking it open and changing it.

Imagine a payment system with a \`PaymentProcessor\` class that has a big switch statement checking whether the payment method is a credit card, PayPal, or bank transfer, then running different logic for each. Every time you add a new payment method, you edit this class, adding another case to the switch. You risk breaking credit card processing every time you add PayPal support.

A better design has a \`PaymentMethod\` interface with a \`process()\` method. Each payment method is its own class implementing that interface. The \`PaymentProcessor\` accepts any \`PaymentMethod\` and calls \`process()\`. When you add a new payment method, you write a new class. The \`PaymentProcessor\` never changes.

## Liskov Substitution Principle

**Objects of a subclass should be substitutable for objects of the parent class without breaking the program.**

This is the one that causes the most confusion. The idea is that inheritance should represent a genuine "is a" relationship, not just a convenient way to share code.

The classic example is a \`Rectangle\` class with a \`setWidth\` and \`setHeight\` method. A \`Square\` class might seem like a natural subclass of \`Rectangle\`, since a square is a rectangle. But if you inherit and override \`setWidth\` to also set the height (because a square must have equal sides), you break the substitution. Code that expects a \`Rectangle\` and sets the width independently from the height will behave incorrectly when given a \`Square\`.

The rule is: if you cannot substitute a subclass everywhere the parent is used without the behavior changing unexpectedly, your inheritance hierarchy is wrong. Sometimes the fix is to use composition instead of inheritance.

## Interface Segregation Principle

**Clients should not be forced to depend on interfaces they do not use.**

When you create a large, general-purpose interface, every class that implements it must provide implementations for all the methods, even the ones it does not need. This creates unnecessary coupling.

Imagine a \`Worker\` interface with three methods: \`work()\`, \`eat()\`, and \`sleep()\`. You might have a \`HumanWorker\` class that uses all three. But then someone creates a \`RobotWorker\` class. Robots do not eat or sleep. The \`RobotWorker\` is forced to implement \`eat()\` and \`sleep()\` anyway, probably throwing an exception or doing nothing. This is a sign the interface is too broad.

The fix is to break the interface into smaller, focused ones: a \`Workable\` interface with \`work()\`, an \`Eatable\` interface with \`eat()\`, a \`Sleepable\` interface with \`sleep()\`. \`HumanWorker\` implements all three. \`RobotWorker\` only implements \`Workable\`. No class is forced to depend on behavior it does not need.

## Dependency Inversion Principle

**High-level modules should not depend on low-level modules. Both should depend on abstractions.**

This is the principle behind dependency injection and the foundation of how testable code works.

Without it, a high-level class like \`OrderService\` might directly instantiate a \`MySQLDatabase\` class to save orders. Now \`OrderService\` is tightly coupled to MySQL. If you want to switch to PostgreSQL, you change \`OrderService\`. If you want to test \`OrderService\` without hitting a real database, you cannot, because it creates the database connection internally.

With dependency inversion, \`OrderService\` depends on a \`Database\` interface, not on \`MySQLDatabase\` directly. A \`MySQLDatabase\` class implements that interface. You pass an instance of \`MySQLDatabase\` to \`OrderService\` from the outside. Now you can swap it for a \`PostgreSQLDatabase\`. You can also pass in a \`MockDatabase\` during tests. The high-level business logic in \`OrderService\` knows nothing about the underlying storage technology.

## Why These Principles Matter

Following SOLID does not mean writing more code. It means writing code that is easier to change later, because later is when most of the cost of software happens.

Codebases that violate these principles tend to become brittle: a change in one place breaks things in five others. Tests become hard to write because classes are tightly coupled. Adding features requires understanding and modifying huge, sprawling classes.

The principles are not rules to follow blindly. They are tools for thinking about whether the structure of your code matches the structure of the problem it solves. When you feel resistance every time you need to make a change, SOLID is a good place to start looking for the source of that friction.
      `.trim(),
    },
  });

  // ─────────────────────────────────────────────
  // BLOG 4: Scaling Databases
  // ─────────────────────────────────────────────
  const scalingDb = await prisma.resource.upsert({
    where: { slug: 'scaling-databases' },
    update: {},
    create: {
      slug: 'scaling-databases',
      title: 'Scaling databases: replicas, sharding, and caching',
      content: `
## When Your Database Becomes the Bottleneck

Most applications start with a single database. It works fine. Then the user base grows, query volume increases, and at some point the database starts slowing down. Response times creep up. Timeouts appear. The database CPU maxes out.

At this point, you have several options. This post walks through the three most common: read replicas, horizontal sharding, and caching. Each solves a different problem, and understanding what each one does and does not fix is the real skill.

## Vertical Scaling: The First Move

Before anything else, the simplest response to a slow database is to give it more resources. More CPU. More RAM. A faster SSD. This is called vertical scaling, or scaling up.

It is quick, requires zero code changes, and often buys you months. The downside is that it is expensive and has a ceiling. At some point, you run out of hardware you can throw at a single machine, and the cost per unit of performance grows quickly. More critically, a single machine is a single point of failure.

Vertical scaling is where you start. It is not where you end.

## Read Replicas

The most common database bottleneck is read traffic. The majority of web applications read far more than they write. A blog serves hundreds of reads for every one write. A product catalog might have a 100 to 1 read-to-write ratio.

Read replicas solve this by creating copies of the primary database. The primary handles all writes. Replicas are kept in sync with the primary and handle read queries. Your application is configured to send writes to the primary and reads to the replicas.

This is supported natively by most relational databases. PostgreSQL, MySQL, and most managed services like RDS and Cloud SQL support replica configuration out of the box.

### What You Gain

You can scale reads horizontally by adding more replicas. If one replica is struggling, add another. This is genuinely easy to do in managed cloud databases.

### What You Give Up

Replication is asynchronous by default. There is a lag between when a write hits the primary and when it appears on the replicas. This lag is usually milliseconds but can grow under heavy load. This is called replication lag, and it means reads from replicas might be slightly out of date.

For many workloads, this is acceptable. For some it is not. If a user submits a form and is immediately redirected to a page that reads from a replica, they might not see their own change. A common workaround is to route reads to the primary immediately after a write, then relax to replica reads after a short window.

Read replicas do not help with write-heavy workloads. All writes still go to one machine.

## Horizontal Sharding

Sharding is the practice of splitting your data across multiple database instances, each holding a subset of the total data. Each instance is called a shard.

The split is determined by a shard key. A common shard key for a social application is user ID. Users with IDs 1 to 1,000,000 go to shard A. Users with IDs 1,000,001 to 2,000,000 go to shard B. And so on.

With sharding, both reads and writes are distributed. Shard A handles only the users assigned to it, so no single database machine has to handle the full load.

### What You Gain

Theoretical infinite horizontal scalability. As your data and traffic grow, you add more shards. This is how companies like Instagram and Twitter handle billions of rows.

### What You Give Up

Sharding is genuinely complex and you pay that complexity cost every day.

**Routing logic.** Your application now needs to know which shard to talk to for a given request. Every query has to be preceded by a lookup: which shard owns this user?

**Cross-shard queries are painful.** If you want data that spans multiple shards, such as "all orders placed in the last 24 hours regardless of user", you have to query every shard and merge the results in application code. SQL JOINs across shards are not possible.

**Resharding is very hard.** If you chose your shard key poorly and one shard is receiving 80% of the traffic (called a hot shard), redistributing that data while the system is live is one of the hardest operational problems in distributed systems.

**Schema changes are multiplied.** Running a migration means running it on every shard, carefully and in order.

Sharding is the right answer when you genuinely cannot solve the problem any other way. It is the last resort, not the first move.

## Caching

A cache is a fast, temporary data store that sits in front of your database. When your application needs data, it checks the cache first. If the data is there (a cache hit), it returns immediately without hitting the database at all. If it is not there (a cache miss), it fetches from the database, stores the result in the cache, and then returns it.

Redis and Memcached are the two most common caching layers. Redis is generally preferred because it supports richer data structures and persistence.

The impact of caching can be dramatic. A database query that takes 50 milliseconds can return from cache in under 1 millisecond. For read-heavy workloads with frequently-accessed data, adding a cache can reduce database load by 90% or more.

### Cache Invalidation

The infamous hard problem of computer science. When the underlying data changes, your cache needs to be updated or cleared, or you will serve stale data.

**Write-through caching** updates both the cache and the database on every write. The cache is always fresh, but writes are slightly slower because they go to two places.

**Cache-aside** (also called lazy loading) is the most common pattern. You only populate the cache on a cache miss. On a write, you invalidate or delete the relevant cache entry, so the next read is a miss and repopulates it from the new database state.

**TTL-based expiry** is the simplest approach. You set every cache entry to expire after a fixed time, say 60 seconds. Stale data is possible within that window, but you never need to explicitly invalidate anything. This works well for data that can tolerate slight staleness.

### What Caching Does Not Fix

Caching only helps with reads of data that does not change too frequently. If your data is unique per request or changes every second, caching will have low hit rates and provide little benefit. And caching does nothing for write-heavy workloads at all.

## Putting It Together

These three techniques are not mutually exclusive. Production systems at scale typically use all of them together: a caching layer reduces the number of queries that reach the database, read replicas distribute the read queries that do reach it, and sharding distributes writes and data volume across multiple database machines.

The order in which you reach for them usually goes: vertical scaling first, then a caching layer, then read replicas, then sharding if you truly need it. Each step is significantly more complex than the last, so you want to be sure you actually need it before committing.

The most important skill is recognizing which part of the system is actually under pressure and choosing the tool that addresses that specific problem.
      `.trim(),
    },
  });

  // ─────────────────────────────────────────────
  // Learning Paths
  // ─────────────────────────────────────────────
  const networkingPath = await prisma.learningPath.upsert({
    where: { id: 'networking-basics' },
    update: {},
    create: { id: 'networking-basics', title: 'Networking', description: 'How data moves across the internet.' },
  });

  const dataPath = await prisma.learningPath.upsert({
    where: { id: 'data-databases' },
    update: {},
    create: { id: 'data-databases', title: 'Databases', description: 'Storing, scaling, and managing data.' },
  });

  const lldPath = await prisma.learningPath.upsert({
    where: { id: 'lld-patterns' },
    update: {},
    create: { id: 'lld-patterns', title: 'LLD', description: 'Clean, maintainable code design.' },
  });

  // Links
  await prisma.learningPathItem.upsert({
    where: { learningPathId_resourceId: { learningPathId: networkingPath.id, resourceId: dnsResource.id } },
    update: {},
    create: { learningPathId: networkingPath.id, resourceId: dnsResource.id, order: 1 },
  });
  await prisma.learningPathItem.upsert({
    where: { learningPathId_resourceId: { learningPathId: dataPath.id, resourceId: capTheorem.id } },
    update: {},
    create: { learningPathId: dataPath.id, resourceId: capTheorem.id, order: 1 },
  });
  await prisma.learningPathItem.upsert({
    where: { learningPathId_resourceId: { learningPathId: dataPath.id, resourceId: scalingDb.id } },
    update: {},
    create: { learningPathId: dataPath.id, resourceId: scalingDb.id, order: 2 },
  });
  await prisma.learningPathItem.upsert({
    where: { learningPathId_resourceId: { learningPathId: lldPath.id, resourceId: solidPrinciples.id } },
    update: {},
    create: { learningPathId: lldPath.id, resourceId: solidPrinciples.id, order: 1 },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


