import type { NextConfig } from "next";

/** Origins allowed for fetch/XHR/WebSocket (axios, etc.). Cross-port localhost is not same-origin. */
function buildConnectSrcDirective(): string {
  const origins = new Set<string>([
    "'self'",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "ws://localhost:5000",
    "ws://127.0.0.1:5000",
  ]);

  const addUrlOrigin = (raw: string | undefined) => {
    const s = raw?.trim();
    if (!s || s.startsWith("/")) return;
    try {
      const u = new URL(s);
      origins.add(`${u.protocol}//${u.host}`);
      if (u.protocol === "https:") origins.add(`wss://${u.host}`);
      if (u.protocol === "http:") origins.add(`ws://${u.host}`);
    } catch {
      /* ignore invalid */
    }
  };

  addUrlOrigin(process.env.NEXT_PUBLIC_API_URL);
  addUrlOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  addUrlOrigin(process.env.NEXT_PUBLIC_WS_URL);

  /** Maps JavaScript API + Places (autocomplete, place details use XHR to googleapis/gstatic). */
  origins.add("https://maps.googleapis.com");
  origins.add("https://*.googleapis.com");
  origins.add("https://*.gstatic.com");

  return `connect-src ${[...origins].join(" ")}`;
}

function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    /** Loader + chunks for Maps JS API / Places library (blocked without these). */
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://*.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    // `https:` listing/resident photos from S3, CloudFront, or any HTTPS CDN (URLs are server-controlled).
    "img-src 'self' data: blob: https: https://res.cloudinary.com https://avatars.githubusercontent.com",
    buildConnectSrcDirective(),
    /** Google Maps iframe embed nested frames may use other *.google.com hosts */
    "frame-src 'self' https://*.google.com https://*.gstatic.com",
    /** Maps JS API web workers */
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
  ].join("; ");
}

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
];

const nextConfig: NextConfig = {
  // Do not redirect www ↔ apex here — that causes "too many redirects" when the
  // host/CDN (Vercel, Cloudflare, etc.) already redirects the other way. Set
  // canonical domain once in your hosting dashboard (e.g. www → roommat.in).
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      /** S3 virtual-hosted URLs: {bucket}.s3.{region}.amazonaws.com */
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // Disable server-side console.log in production is handled via eslint rule
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
