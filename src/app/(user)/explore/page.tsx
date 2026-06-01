import { Suspense } from 'react';
import { JsonLd } from '@/components/seo/JsonLd';
import { CrawlableListings } from '@/components/seo/CrawlableListings';
import { fetchListingsForSeo } from '@/lib/seo/fetch-listings';
import { buildItemListJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata, mergePageKeywords, SITE_URL } from '@/lib/seo/site';
import { SeoLandingBlurb } from '@/components/seo/SeoLandingBlurb';
import ExplorePageClient from './client';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'Explore PG & Rooms in Ahmedabad — 500+ Listings',
  description:
    'Explore verified PG, shared flat, and roommate listings in Ahmedabad & Gandhinagar on roommat.in. Filter by area, rent range, and amenities.',
  path: '/explore',
  keywords: mergePageKeywords(
    'explore PG Ahmedabad',
    'find room Ahmedabad',
    'search PG listings Ahmedabad',
  ),
});

function ExploreFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">
      Loading explore…
    </div>
  );
}

export default async function ExplorePage() {
  const listings = await fetchListingsForSeo(100);

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
      <Suspense fallback={<ExploreFallback />}>
        <ExplorePageClient initialListings={listings} />
      </Suspense>
      <CrawlableListings listings={listings} />
      <SeoLandingBlurb variant="explore" />
    </>
  );
}
