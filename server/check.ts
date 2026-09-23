import { prisma } from './src/auth';

prisma.user.findMany().then(users => console.log(users)).finally(() => prisma.$disconnect());

