import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/panel/wallet/transactions",
        destination: "/panel/billing?tab=transactions",
        permanent: false,
      },
      {
        source: "/panel/wallet",
        destination: "/panel/billing",
        permanent: false,
      },
      {
        source: "/panel/wallet/:path*",
        destination: "/panel/billing/:path*",
        permanent: false,
      },
      {
        source: "/panel/campaigns/thrashed",
        destination: "/panel/campaigns/trashed",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const apiBase = process.env.BACKEND_API_BASE_URL;
    if (!apiBase) return [];
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
