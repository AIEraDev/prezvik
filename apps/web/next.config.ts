import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@prezvik/core",
    "@prezvik/ai",
    "@prezvik/schema",
    "@prezvik/layout",
    "@prezvik/design",
    "@prezvik/renderer-pptx",
    "@prezvik/logger",
  ],
  experimental: {
    turbo: {
      root: "/Users/AIEraDev/Documents/prezvik",
    },
  },
  // Prevent webpack from trying to bundle native Node.js addons
  // canvas is pulled in transitively via konva -> visual-layer -> core
  serverExternalPackages: ["canvas", "konva", "pino", "pino-pretty"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark canvas and konva as external to prevent bundling native addons
      // Also externalize pino to prevent worker thread issues
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("canvas", "konva", "sharp", "pino", "pino-pretty");
      }
    }
    return config;
  },
};

export default nextConfig;
