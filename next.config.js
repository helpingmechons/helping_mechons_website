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

  // ── HTTP cache headers for static files in /public ──
  // Only files that never change per-user. (A catch-all "/(.*)" rule used to
  // be here, which also marked /profile, /admin and /api/* responses as
  // publicly cacheable for an hour.) Pages and /_next/static get correct
  // caching from Next.js / Vercel automatically.
  async headers() {
    const longCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }];
    return [
      { source: "/brand/:path*",  headers: longCache },
      { source: "/photos/:path*", headers: longCache },
      { source: "/qr-pay.png",    headers: longCache },
    ];
  },

  experimental: {
    serverActions: { bodySizeLimit: "10mb" },
  },
};

module.exports = nextConfig;
