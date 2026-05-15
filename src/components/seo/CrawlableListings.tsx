/**
 * Server-rendered listing links for crawlers (sr-only — not shown in the UI).
 */
import Link from 'next/link';
import type { Listing } from '@/types';
import { formatRentRange } from '@/lib/utils/format';

export function CrawlableListings({ listings }: { listings: Listing[] }) {
  if (!listings.length) return null;

  return (
    <nav aria-label="Property listings index" className="sr-only">
      <ul>
        {listings.map((l) => (
          <li key={l.id}>
            <Link href={`/listings/${l.id}`}>
              {l.title} — {formatRentRange(l.price, l.maxPrice)}/month — {l.city || 'Ahmedabad'}
              {l.location ? `, ${l.location}` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
