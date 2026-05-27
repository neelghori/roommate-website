import type { Listing } from '@/types';
import { mapApiPropertyToListing } from '@/services/modules/listing.service';
import type { SeoListingSnapshot } from '@/lib/seo/listing';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') || 'http://localhost:5000';

function unwrapItems(body: unknown): Record<string, unknown>[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const inner = root.data as Record<string, unknown> | undefined;
  if (inner && Array.isArray((inner as { items?: unknown }).items)) {
    return (inner as { items: Record<string, unknown>[] }).items;
  }
  if (Array.isArray(root.items)) return root.items as Record<string, unknown>[];
  return [];
}

/** Server-side listing fetch for HTML content + ItemList schema (ISR configurable). */
export async function fetchListingsForSeo(limit = 24, revalidateSeconds = 3600): Promise<Listing[]> {
  try {
    const params = new URLSearchParams({ page: '1', limit: String(Math.min(limit, 100)) });
    const res = await fetch(`${API_BASE}/api/v1/properties?${params}`, {
      next: { revalidate: revalidateSeconds },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as unknown;
    return unwrapItems(body)
      .map((row) => {
        try {
          return mapApiPropertyToListing(row);
        } catch {
          return null;
        }
      })
      .filter((l): l is Listing => l != null && Boolean(l.id) && Boolean(l.title));
  } catch {
    return [];
  }
}

/** Full listing for server page props + client hydration. */
export async function fetchListingByIdForPage(id: string): Promise<Listing | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/properties/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as unknown;
    if (!body || typeof body !== 'object') return null;
    const root = body as Record<string, unknown>;
    const inner = root.data as Record<string, unknown> | undefined;
    const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
    if (!prop || typeof prop !== 'object') return null;
    return mapApiPropertyToListing(prop);
  } catch {
    return null;
  }
}

export function listingToSeoSnapshot(l: Listing): SeoListingSnapshot {
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    city: l.city,
    location: l.location,
    price: l.price,
    maxPrice: l.maxPrice,
    type: l.type,
    images: l.images,
  };
}
