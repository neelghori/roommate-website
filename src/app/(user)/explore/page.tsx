import { Suspense } from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import { CrawlableListings } from '@/components/seo/CrawlableListings';
import { fetchListingsForSeo } from '@/lib/seo/fetch-listings';
import { buildItemListJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata, SITE_URL } from '@/lib/seo/site';
import ExplorePageClient from './client';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'Explore PG & Rooms in Ahmedabad — 500+ Listings',
  description:
    'Explore verified PG, shared flat, and roommate listings in Ahmedabad & Gandhinagar on roommat.in. Filter by area, rent range, and amenities.',
  path: '/explore',
  keywords: [
    'explore PG Ahmedabad',
    'find room Ahmedabad',
    'PG Satellite Ahmedabad',
    'PG Navrangpura',
    'PG Bodakdev',
    'PG Vastrapur',
    'cheap PG Ahmedabad',
    'PG for girls Ahmedabad',
    'PG for boys Ahmedabad',
  ],
});

function ExploreFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">
      Loading explore…
    </div>
  );
}

export default async function ExplorePage() {
  const listings = await fetchListingsForSeo(24);

  const itemListJsonLd = buildItemListJsonLd(
    'Explore PG listings Ahmedabad',
    'Search verified PG and shared flats in Ahmedabad and Gandhinagar',
    listings.slice(0, 20).map((l) => ({
      id: l.id,
      title: l.title,
      url: `${SITE_URL}/listings/${l.id}`,
      price: l.price,
      maxPrice: l.maxPrice,
      city: l.city,
    })),
  );

  return (
    <>
      <JsonLd data={itemListJsonLd} />
      <CrawlableListings listings={listings} />
      <Suspense fallback={<ExploreFallback />}>
        <ExplorePageClient initialListings={listings} />
      </Suspense>
    </>
  );
}
