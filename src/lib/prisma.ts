import { PrismaClient } from '@prisma/client';

// Default Supabase PostgreSQL connection string fallback if Vercel ENV is unset or file-based
const defaultDbUrl =
  'postgresql://postgres.ndvolauboofufgwbmlop:Puttu%40455727@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgres')) {
  process.env.DATABASE_URL = defaultDbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
