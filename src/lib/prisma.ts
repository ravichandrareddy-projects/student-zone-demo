import { PrismaClient } from '@prisma/client';

// Fast IPv4 Supabase Pooler Connection String (Zero Timeout Lag)
const fastSupabasePoolerUrl =
  'postgresql://postgres.ndvolauboofufgwbmlop:Puttu%40455727@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=3';

// Force fast IPv4 pooler domain to eliminate 4.5s IPv6 socket timeouts
const activeDbUrl =
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith('postgres') &&
  !process.env.DATABASE_URL.includes('db.ndvolauboofufgwbmlop.supabase.co')
    ? process.env.DATABASE_URL
    : fastSupabasePoolerUrl;

process.env.DATABASE_URL = activeDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: activeDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
