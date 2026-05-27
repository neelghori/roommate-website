import { buildPageMetadata } from '@/lib/seo/site';
import { JsonLd } from '@/components/seo/JsonLd';
import { CrawlableRoommates } from '@/components/seo/CrawlableRoommates';
import { fetchRoommatesForSeo } from '@/lib/seo/fetch-roommates';
import { buildItemListJsonLd } from '@/lib/seo/json-ld';
import { SITE_URL } from '@/lib/seo/site';
import RoommatesPageClient from './client';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'Find Roommates in Ahmedabad & Gandhinagar',
  description:
    'Find compatible roommates in Ahmedabad & Gandhinagar on roommat.in. Browse verified profiles, filter by lifestyle, budget, and location.',
  path: '/roommates',
  keywords: [
    'find roommate Ahmedabad',
    'roommate search Ahmedabad',
    'roommate Gandhinagar',
    'compatible roommate India',
    'roommate for students Ahmedabad',
    'vegetarian roommate Ahmedabad',
  ],
});

export default async function RoommatesPage() {
  const profiles = await fetchRoommatesForSeo(30);
  const itemListJsonLd = buildItemListJsonLd(
    'Roommate profiles in Ahmedabad',
    'Find compatible roommates in Ahmedabad and Gandhinagar',
    profiles.slice(0, 20).map((p) => ({
      id: p.id,
      title: p.name,
      url: `${SITE_URL}/roommates/${p.id}`,
      price: p.budget ?? p.monthlyBudget ?? 0,
      maxPrice: p.budget ?? p.monthlyBudget ?? 0,
      city: p.location ?? 'Ahmedabad',
    })),
  );

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <CrawlableRoommates profiles={profiles} />
      <RoommatesPageClient initialProfiles={profiles} />
    </>
  );
}
