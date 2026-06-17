/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Performance: gzip/Brotli compression ──
  compress: true,

  images: {
    // Serve WebP and AVIF for much smaller file sizes on slow connections
    formats: ["image/avif", "image/webp"],

    // Cache optimised images for 24 hours on CDN/browser
    minimumCacheTTL: 86400,

    // Allowed external image sources
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],

    // Sensible breakpoint set — avoids generating unnecessarily large variants
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── HTTP cache headers for static assets ──
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Allow browser to cache fonts / images / scripts aggressively
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/brand/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, immutable" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

module.exports = nextConfig;
