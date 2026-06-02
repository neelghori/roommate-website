import type { MetadataRoute } from 'next';
import { fetchPublicListingsForSitemap } from '@/lib/seo/listing';
import { fetchRoommatesForSeo } from '@/lib/seo/fetch-roommates';
import { AREA_PAGES } from '@/lib/seo/areas';
import { SITE_URL } from '@/lib/seo/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/explore`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${SITE_URL}/roommates`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/areas`, lastModified: now, changeFrequency: 'weekly', priority: 0.75 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const listings = await fetchPublicListingsForSitemap();
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${SITE_URL}/listings/${l.id}`,
    lastModified: l.updatedAt ? new Date(l.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const areaPages: MetadataRoute.Sitemap = AREA_PAGES.map((area) => ({
    url: `${SITE_URL}/areas/${area.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const roommateProfiles = await fetchRoommatesForSeo(200);
  const roommatePages: MetadataRoute.Sitemap = roommateProfiles.map((p) => ({
    url: `${SITE_URL}/roommates/${p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...areaPages, ...listingPages, ...roommatePages];
}
