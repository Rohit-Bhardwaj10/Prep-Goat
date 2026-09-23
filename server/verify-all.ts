import { prisma } from './src/auth';

prisma.user.updateMany({
  data: {
    emailVerified: true
  }
}).then(res => console.log('Updated users:', res)).finally(() => prisma.$disconnect());

