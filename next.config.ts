import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,

  async rewrites() {
    return [
      {
        source: "/api/grpc/:path*",
        destination: `https://creditanalyticsbackend-production.up.railway.app/:path*`,
      },
    ];
  },
};

export default nextConfig;
