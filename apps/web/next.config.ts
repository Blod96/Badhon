import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_EXPORT === "1" ? "export" : undefined,
  reactStrictMode: true,
  transpilePackages: ["@badhon/domain", "@badhon/api-contracts"]
};

export default nextConfig;
