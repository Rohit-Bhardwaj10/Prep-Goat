import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding resources...');

  // 1. Create Resources (Cheatsheets)
  const capTheorem = await prisma.resource.upsert({
    where: { slug: 'cap-theorem' },
    update: {},
    create: {
      slug: 'cap-theorem',
      title: 'The CAP Theorem',
      content: `
# The CAP Theorem

The CAP theorem states that a distributed data store can only simultaneously provide two of the following three guarantees:

1. **Consistency (C)**: Every read receives the most recent write or an error.
2. **Availability (A)**: Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
3. **Partition tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.

## CA vs CP vs AP

- **CA Systems**: Not possible in distributed networks (since partitions will happen). Usually single-node RDBMS.
- **CP Systems**: Guarantee consistency and partition tolerance. If a partition occurs, the system will return an error or timeout rather than stale data. (e.g., MongoDB, HBase)
- **AP Systems**: Guarantee availability and partition tolerance. If a partition occurs, the system will return the most recent available version of the data, which might be stale. (e.g., Cassandra, DynamoDB)

## When to choose what?
- If your system handles financial transactions (banking), you **must** choose **CP** (Consistency).
- If your system is a social media feed or product reviews, you **should** choose **AP** (Availability) for a better user experience.
      `.trim(),
    },
  });

  const solidPrinciples = await prisma.resource.upsert({
    where: { slug: 'solid-principles' },
    update: {},
    create: {
      slug: 'solid-principles',
      title: 'SOLID Principles',
      content: `
# SOLID Principles

SOLID is an acronym for five design principles intended to make software designs more understandable, flexible, and maintainable.

## 1. Single Responsibility Principle (SRP)
A class should have one, and only one, reason to change. 
*Example: A \`User\` class should handle user properties, not save itself to the database.*

## 2. Open-Closed Principle (OCP)
Entities should be open for extension, but closed for modification.
*Example: You should be able to add a new Payment Method without altering the existing \`Checkout\` class.*

## 3. Liskov Substitution Principle (LSP)
Functions that use pointers or references to base classes must be able to use objects of derived classes without knowing it.

## 4. Interface Segregation Principle (ISP)
Many client-specific interfaces are better than one general-purpose interface.
*Example: Instead of a massive \`IWorker\` interface, split it into \`IFeedable\` and \`IWorkable\`.*

## 5. Dependency Inversion Principle (DIP)
Depend upon abstractions, not concretions.
*Example: High-level modules should not depend on low-level modules. Both should depend on interfaces.*
      `.trim(),
    },
  });

  const scalingDb = await prisma.resource.upsert({
    where: { slug: 'scaling-databases' },
    update: {},
    create: {
      slug: 'scaling-databases',
      title: 'Scaling Databases',
      content: `
# Scaling Databases

When your database becomes a bottleneck, there are several standard strategies to scale it.

## 1. Vertical Scaling (Scaling Up)
Adding more power (CPU, RAM) to your existing database server.
- **Pros**: Easy to implement, no code changes.
- **Cons**: Hardware limits, expensive, single point of failure.

## 2. Read Replicas
Route read queries to replicas and write queries to the primary database.
- **Pros**: Great for read-heavy apps.
- **Cons**: Eventual consistency (replicas lag slightly behind the primary).

## 3. Database Sharding
Splitting data across multiple database servers based on a shard key (e.g., User ID).
- **Pros**: Horizontal scalability (infinite scale).
- **Cons**: Extremely complex routing, joins across shards are slow or impossible.

## 4. Caching
Adding a caching layer (Redis, Memcached) in front of the database.
- **Pros**: Lightning fast, massively reduces DB load.
- **Cons**: Cache invalidation is hard, potential stale data.
      `.trim(),
    },
  });

  // 2. Create Learning Paths
  const hldPath = await prisma.learningPath.upsert({
    where: { id: 'hld-path' }, // Use a stable ID or find by title
    update: {},
    create: {
      id: 'hld-path',
      title: 'High-Level Design Basics',
      description: 'Master the fundamentals of distributed systems and scalable architecture.',
    },
  });

  const lldPath = await prisma.learningPath.upsert({
    where: { id: 'lld-path' },
    update: {},
    create: {
      id: 'lld-path',
      title: 'Low-Level Design Mastery',
      description: 'Learn object-oriented design patterns and clean code principles.',
    },
  });

  // 3. Link Resources to Paths
  await prisma.learningPathItem.upsert({
    where: { learningPathId_resourceId: { learningPathId: hldPath.id, resourceId: capTheorem.id } },
    update: {},
    create: { learningPathId: hldPath.id, resourceId: capTheorem.id, order: 1 },
  });

  await prisma.learningPathItem.upsert({
    where: { learningPathId_resourceId: { learningPathId: hldPath.id, resourceId: scalingDb.id } },
    update: {},
    create: { learningPathId: hldPath.id, resourceId: scalingDb.id, order: 2 },
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
