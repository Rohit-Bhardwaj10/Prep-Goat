import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.problem.deleteMany({});
  console.log('Deleted all problems');
  const count = await prisma.problem.count();
  console.log('Problem count:', count);
}

main().finally(() => prisma.$disconnect());
