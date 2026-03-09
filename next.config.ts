import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://creditanalyticsbackend-production.up.railway.app/";
    // "http://localhost:8001";
    return [
      // gRPC-Web proxy: /api.<package>.<Service>/<Method>
      { source: "/api.applicant.v1.:service/:method", destination: `${backendUrl}/api.applicant.v1.:service/:method` },
      { source: "/api.application.v1.:service/:method", destination: `${backendUrl}/api.application.v1.:service/:method` },
      { source: "/api.reference.v1.:service/:method", destination: `${backendUrl}/api.reference.v1.:service/:method` },
      { source: "/api.survey.v1.:service/:method", destination: `${backendUrl}/api.survey.v1.:service/:method` },
      { source: "/api.financial.v1.:service/:method", destination: `${backendUrl}/api.financial.v1.:service/:method` },
      { source: "/api.decision.v1.:service/:method", destination: `${backendUrl}/api.decision.v1.:service/:method` },
      { source: "/api.media.v1.:service/:method", destination: `${backendUrl}/api.media.v1.:service/:method` },
    ];
  },
};

export default nextConfig;
