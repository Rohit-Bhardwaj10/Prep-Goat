import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const basePrisma = new PrismaClient({ adapter });

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const maxRetries = 5;
        const delayMs = 2000;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            return await query(args);
          } catch (error: any) {
            const isConnectionError =
              error.code === 'P1001' ||
              error.code === 'P2024' ||
              error.code === 'P1017' ||
              error.message?.toLowerCase().includes('socket') ||
              error.message?.toLowerCase().includes('connect') ||
              error.message?.toLowerCase().includes('terminate') ||
              error.message?.toLowerCase().includes('timeout') ||
              error.message?.toLowerCase().includes('closed');

            if (isConnectionError && attempt < maxRetries) {
              console.log(`[Neon Wakeup] Database connection error on ${model}.${operation}. Retrying attempt ${attempt + 1}/${maxRetries} in ${delayMs}ms...`);
              await new Promise(resolve => setTimeout(resolve, delayMs));
              continue;
            }
            throw error;
          }
        }
      }
    }
  }
}) as unknown as PrismaClient;

export const auth = betterAuth({
  logger: { level: "debug" },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
  trustedOrigins: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:3001", "http://localhost:3002"] : ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "PrepGoat <onboarding@resend.dev>",
        to: user.email,
        subject: "Verify your email address - PrepGoat",
        html: `<p>Click the link below to verify your email address:</p><p><a href="${url}">Verify Email</a></p>`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});
