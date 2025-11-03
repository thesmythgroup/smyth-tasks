import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Only use basePath in production builds (for GitHub Pages)
  // In development, serve from root path
  basePath: process.env.NODE_ENV === "production" ? "/smyth-tasks" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
