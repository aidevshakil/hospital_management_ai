import 'server-only';

/**
 * Shared Prisma Client for Next.js server code (Server Components, Route
 * Handlers, Server Actions).
 *
 * - Prisma 7 removed the bundled query engine, so the client is constructed with
 *   the `@prisma/adapter-pg` driver adapter using DATABASE_URL.
 * - In development, Next.js hot-reload re-evaluates modules on every change; we
 *   cache the client on `globalThis` so we don't exhaust the connection pool.
 * - `server-only` makes the build fail if this module is ever imported into a
 *   Client Component, keeping DB credentials out of the browser bundle.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to frontend/.env');
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
