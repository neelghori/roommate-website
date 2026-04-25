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
    } catch {
      /* ignore invalid */
    }
  };

  addUrlOrigin(process.env.NEXT_PUBLIC_API_URL);
  addUrlOrigin(process.env.NEXT_PUBLIC_WS_URL);

  return `connect-src ${[...origins].join(" ")}`;
}

function buildContentSecurityPolicy(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://avatars.githubusercontent.com",
    buildConnectSrcDirective(),
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
