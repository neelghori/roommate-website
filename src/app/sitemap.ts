/**
 * sitemap.ts Auto-generated XML sitemap for Roommat
 * Next.js App Router Metadata API (returns MetadataRoute.Sitemap)
 * Google crawls this at /sitemap.xml
 *
 * SEO impact: Helps Google discover and index all pages.
 * Priority values: 1.0 (most important) → 0.3 (least important)
 * changeFrequency: How often pages are expected to change.
 */

import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    // ── High-priority public pages ────────────────────────────────────────────
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/explore`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/roommates`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },

    // ── Auth pages (lower priority not primary landing) ─────────────────────
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // ── Authenticated app pages (lower priority behind login) ───────────────
    {
      url: `${BASE_URL}/chat`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/saved`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/notifications`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/my-listings`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.4,
    },
  ];
}
