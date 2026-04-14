import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  // Standalone output for Docker production builds
  output: "standalone",

  // Disable x-powered-by header (security + smaller response)
  poweredByHeader: false,

  // React Compiler — stable in Next.js 16 (ref: nextjs.org/blog/next-16)
  // Provides automatic memoization (useMemo/useCallback/React.memo) at build time
  // Eliminates unnecessary re-renders without manual optimization
  reactCompiler: true,

  // Tree-shake heavy icon libraries — only import used icons
  experimental: {
    optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
    // Prefetch staleness — reduce unnecessary prefetch re-fetches
    staleTimes: {
      dynamic: 30,  // dynamic routes cached 30s before re-prefetch
      static: 300,  // static routes cached 5min before re-prefetch
    },
  },

  // Image optimization — auto-convert to AVIF/WebP
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Security + caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Immutable caching for static assets (fonts, images, JS chunks)
      {
        source: "/(.*)\\.(woff2|woff|ttf|otf|ico|svg|png|jpg|webp|avif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // Compression — enabled by default in Next.js 16 but explicit here
  compress: true,
};

// Paper #7: Bundle analyzer — run with `ANALYZE=true npm run build`
export default withBundleAnalyzer(nextConfig);
