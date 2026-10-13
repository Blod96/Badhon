import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  transpilePackages: ["@badhon/domain", "@badhon/api-contracts"]
};

export default nextConfig;
