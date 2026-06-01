import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { CrawlableListingDetail } from '@/components/seo/CrawlableListingDetail';
import {
  buildListingPageJsonLd,
  buildListingPageMetadata,
  fetchListingForSeo,
} from '@/lib/seo/listing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await fetchListingForSeo(id);
  return buildListingPageMetadata(listing, id);
}

export default async function ListingDetailLayout({ children, params }: Props) {
  const { id } = await params;
  const listing = await fetchListingForSeo(id);

  if (!listing) {
    notFound();
  }

  const jsonLd = buildListingPageJsonLd(listing, id);

  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
      <CrawlableListingDetail listing={listing} />
    </>
  );
}
