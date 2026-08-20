import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Fix for Vercel Serverless Functions + SQLite:
// Vercel serverless environment is read-only except /tmp
if (process.env.VERCEL) {
  const tmpDb = '/tmp/dev.db';
  process.env.DATABASE_URL = `file:${tmpDb}`;

  if (!fs.existsSync(tmpDb)) {
    try {
      const sourceDb = path.join(process.cwd(), 'prisma', 'dev.db');
      if (fs.existsSync(sourceDb)) {
        fs.copyFileSync(sourceDb, tmpDb);
      } else {
        execSync('npx prisma db push --accept-data-loss', {
          env: { ...process.env, DATABASE_URL: `file:${tmpDb}` },
        });
        execSync('npx tsx prisma/seed.ts', {
          env: { ...process.env, DATABASE_URL: `file:${tmpDb}` },
        });
      }
    } catch (err) {
      console.error('Vercel SQLite auto-initialization error:', err);
    }
  }
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
