import type { NextConfig } from "next";

const lanDevOrigins =
  process.env.NEXT_DEV_EXTRA_ORIGINS?.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  ...(lanDevOrigins.length > 0 ? { allowedDevOrigins: lanDevOrigins } : {}),
};

export default nextConfig;
