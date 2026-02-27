import type { NextConfig } from "next";

function buildApiDestination() {
  const internalUrl = process.env.SEVENDAYS_API_INTERNAL_URL;
  const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
  const baseUrl = (internalUrl ?? publicUrl).replace(/\/$/, "");

  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${buildApiDestination()}/:path*`,
      },
    ];
  },
};

export default nextConfig;
