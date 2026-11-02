import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  poweredByHeader: false,
  // Keep production builds from overwriting a running dev server's chunks.
  distDir: process.env.STRIKE_FIRST_DIST_DIR ||
    (phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next"),
});
export default nextConfig;
