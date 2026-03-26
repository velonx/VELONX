import type { NextConfig } from "next";

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Enable compression for all text-based assets
  compress: true,

  // Enable React strict mode
  reactStrictMode: true,

  // Image optimization configuration
  images: {
    // Enable modern image formats (AVIF and WebP)
    formats: ['image/avif', 'image/webp'],
    // Allowed quality values used across the app (75=default, 80=avatars, 85=heroes)
    qualities: [75, 80, 85],
    // Configure remote image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Google OAuth profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // GitHub OAuth profile images
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    // Device sizes for responsive images
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200, 1920],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Set appropriate cache TTL (60 seconds)
    minimumCacheTTL: 60,
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features for optimization
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-icons'],
  },

  // Disable production source maps for smaller bundles
  productionBrowserSourceMaps: false,

  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {
    // Empty config to acknowledge Turbopack usage
  },
};

export default withBundleAnalyzer(nextConfig);
