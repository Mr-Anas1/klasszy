import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix:
    process.env.VERCEL
      ? undefined
      : process.env.NODE_ENV === 'production'
        ? '.'
        : undefined,
};

export default nextConfig;
