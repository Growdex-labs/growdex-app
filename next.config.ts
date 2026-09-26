import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/og-image.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
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
    const rewrites = [
      {
        source: "/og-image.png",
        destination: "/growdex-link-preview.png",
      },
    ];

    if (apiBase) {
      rewrites.push({
        source: "/api-proxy/:path*",
        destination: `${apiBase}/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
