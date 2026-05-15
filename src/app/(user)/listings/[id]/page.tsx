import ListingDetailClient from './listing-detail-client';
import { fetchListingByIdForPage } from '@/lib/seo/fetch-listings';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const initialListing = await fetchListingByIdForPage(id);

  return <ListingDetailClient listingId={id} initialListing={initialListing} />;
}
