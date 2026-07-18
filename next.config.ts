import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";

// Load the single shared .env at the repo root. next.config is evaluated in the
// Node process before the server starts, so these vars are available to all
// server-side code (route handlers, server components, Prisma).
loadEnv({ path: "../.env" });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
