import { PrismaClient } from '@prisma/client';

// Supabase PostgreSQL direct connection string
const defaultDbUrl =
  'postgresql://postgres:Puttu%40455727@db.ndvolauboofufgwbmlop.supabase.co:5432/postgres';

const activeDbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
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
