import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: "@lingui/loader",
      },
    });
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://dots-ca-be-production.up.railway.app";
    return [
      {
        source: "/:service(api\\.[a-zA-Z0-9_.-]+)/:method",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "https://dots-ca-be-production.up.railway.app"}/:service/:method`,
      },
    ];
  },
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
