/**
 * Server-rendered listing summary for crawlers (sr-only — not shown in the UI).
 */
import Link from 'next/link';
import type { SeoListingSnapshot } from '@/lib/seo/listing';
import { formatRentRange } from '@/lib/utils/format';

export function CrawlableListingDetail({ listing }: { listing: SeoListingSnapshot }) {
  const rent = formatRentRange(listing.price, listing.maxPrice);
  const description =
    listing.description?.trim() ||
    `${listing.title} available for ${rent} per month in ${listing.city || 'Ahmedabad'}.`;

  return (
    <article className="seo-crawl-block" aria-label="Listing details">
      <h1>{listing.title}</h1>
      <p>
        Rent: {rent}/month. Location: {listing.city}
        {listing.location ? `, ${listing.location}` : ''}.
      </p>
      <p>{description}</p>
      <Link href="/explore">More PG listings in Ahmedabad</Link>
    </article>
  );
}
