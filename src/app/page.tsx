import { UserAuthGate } from '@/components/shared/UserAuthGate';
import { JsonLd } from '@/components/seo/JsonLd';
import { CrawlableListings } from '@/components/seo/CrawlableListings';
import { fetchListingsForSeo } from '@/lib/seo/fetch-listings';
import { buildItemListJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata, SITE_URL } from '@/lib/seo/site';
import HomePageClient from './(user)/client';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'Verified PG & Shared Flats in Ahmedabad',
  description:
    'Browse verified PG rooms, shared flats, and studio apartments in Ahmedabad & Gandhinagar on roommat.in. Compare rent, photos, and amenities. Find your perfect space today!',
  path: '/',
  keywords: [
    'PG in Ahmedabad',
    'shared flat Ahmedabad',
    'room for rent Ahmedabad',
    'paying guest Ahmedabad',
    'PG Bodakdev',
    'PG Satellite Ahmedabad',
    'PG Navrangpura',
    'flat sharing Ahmedabad',
    'roommat.in',
  ],
});

export default async function HomePage() {
  const listings = await fetchListingsForSeo(24);

  const itemListJsonLd = buildItemListJsonLd(
    'PG and shared flat listings in Ahmedabad',
    'Verified paying guest and shared accommodation listings on Roommat',
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
      <UserAuthGate>
        <HomePageClient initialListings={listings} />
      </UserAuthGate>
    </>
  );
}
