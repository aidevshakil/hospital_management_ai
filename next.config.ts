import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";

// Load the shared .env. next.config is evaluated in the Node process before the
// server starts, so these vars are available to all server-side code (route
// handlers, server components, Prisma). `../.env` is kept last as a fallback for
// the old monorepo layout where this package lived in a `frontend/` subdir.
loadEnv({ path: [".env.local", ".env", "../.env"] });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
