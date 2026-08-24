import { PrismaClient } from '@prisma/client';

// Supabase IPv4 Pooler Session connection string (Required for Vercel IPv4 lambdas)
const defaultDbUrl =
  'postgresql://postgres.ndvolauboofufgwbmlop:Puttu%40455727@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

const activeDbUrl =
  process.env.DATABASE_URL &&
  process.env.DATABASE_URL.startsWith('postgres') &&
  !process.env.DATABASE_URL.includes('db.ndvolauboofufgwbmlop.supabase.co')
    ? process.env.DATABASE_URL
    : defaultDbUrl;

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
