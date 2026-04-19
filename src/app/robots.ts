/**
 * robots.ts — robots.txt for Roommat
 * Next.js App Router MetadataRoute.Robots
 * Served at /robots.txt
 *
 * SEO impact: Controls what Googlebot and other crawlers can access.
 * - Allow public pages (/, /explore, /roommates, /login, /register)
 * - Disallow private/admin pages to save crawl budget
 */

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/explore',
          '/roommates',
          '/login',
          '/register',
          '/forgot-password',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/profile',
          '/chat',
          '/saved',
          '/notifications',
          '/my-listings',
          '/onboarding',
          '/requests',
          '/matches',
        ],
      },
      // Block AI scrapers from crawling the app
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
