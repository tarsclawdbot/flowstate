import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "/home/aravhawk/.openclaw/workspace/projects/flowstate-build",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
