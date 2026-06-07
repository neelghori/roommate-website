import type { Metadata } from 'next';
import ListingDetailClient from './listing-detail-client';
import { fetchListingByIdForPage } from '@/lib/seo/fetch-listings';
import { fetchListingForSeo, buildListingPageMetadata } from '@/lib/seo/listing';

/** Listing photos and moderation change frequently; avoid hour-long stale gallery. */
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingForSeo(id);
  return buildListingPageMetadata(listing, id);
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialListing = await fetchListingByIdForPage(id);

  return <ListingDetailClient listingId={id} initialListing={initialListing} />;
}
