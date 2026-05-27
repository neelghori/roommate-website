import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/explore', '/roommates', '/listings/', '/login', '/register', '/terms', '/privacy'],
        disallow: [
          '/admin',
          '/admin-sign-in',
          '/api/',
          '/profile',
          '/chat',
          '/saved',
          '/notifications',
          '/my-listings',
          '/onboarding',
          '/requests',
          '/matches',
          '/listings/add',
          '/*/edit',
        ],
      },
      { userAgent: 'GPTBot', disallow: ['/'] },
      { userAgent: 'ChatGPT-User', disallow: ['/'] },
      { userAgent: 'CCBot', disallow: ['/'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
