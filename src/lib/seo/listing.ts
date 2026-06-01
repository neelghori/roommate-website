import type { Metadata } from 'next';
import { buildPageMetadata, resolveOgImageUrl, SITE_URL } from '@/lib/seo/site';
import { buildListingJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { formatRentRange } from '@/lib/utils/format';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') || 'http://localhost:5000';

export type SeoListingSnapshot = {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  price: number;
  maxPrice?: number;
  type: string;
  images: string[];
  updatedAt?: string;
};

function unwrapProperty(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object') return null;
  const root = body as Record<string, unknown>;
  const inner = root.data as Record<string, unknown> | undefined;
  const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
  return prop && typeof prop === 'object' ? prop : null;
}

function mapPropertyToSeo(prop: Record<string, unknown>): SeoListingSnapshot | null {
  const id = String(prop._id ?? prop.id ?? '');
  if (!id) return null;

  const addr = (prop.address ?? {}) as Record<string, string | undefined>;
  const rent = (prop.rentRange ?? {}) as { min?: number; max?: number };
  const min = typeof rent.min === 'number' ? rent.min : 0;
  const max =
    typeof rent.max === 'number' && rent.max > min ? rent.max : undefined;

  const imageUrls = Array.isArray(prop.imageUrls) ? (prop.imageUrls as string[]) : [];
  const cover = typeof prop.coverImageUrl === 'string' ? prop.coverImageUrl : '';
  const images = [cover, ...imageUrls].filter(Boolean);

  const lt = typeof prop.listingType === 'string' ? prop.listingType : 'pg';

  return {
    id,
    title: String(prop.title ?? 'Property listing'),
    description: String(prop.description ?? '').slice(0, 300),
    city: addr.city ?? 'Ahmedabad',
    location: addr.line1 ?? '',
    price: min,
    maxPrice: max,
    type: lt,
    images,
    updatedAt:
      typeof prop.updatedAt === 'string'
        ? prop.updatedAt
        : prop.updatedAt instanceof Date
          ? prop.updatedAt.toISOString()
          : undefined,
  };
}

/** Server-side fetch for listing detail metadata & JSON-LD (always fresh — photos change often). */
export async function fetchListingForSeo(id: string): Promise<SeoListingSnapshot | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/properties/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as unknown;
    const prop = unwrapProperty(body);
    if (!prop) return null;
    return mapPropertyToSeo(prop);
  } catch {
    return null;
  }
}

export async function fetchPublicListingsForSitemap(): Promise<
  { id: string; updatedAt?: string }[]
> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/properties?page=1&limit=500`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as unknown;
    if (!body || typeof body !== 'object') return [];
    const root = body as Record<string, unknown>;
    const inner = root.data as Record<string, unknown> | undefined;
    const items = (inner?.items ?? root.items) as unknown;
    if (!Array.isArray(items)) return [];

    const out: { id: string; updatedAt?: string }[] = [];
    for (const raw of items) {
      if (!raw || typeof raw !== 'object') continue;
      const p = raw as Record<string, unknown>;
      const id = String(p._id ?? p.id ?? '');
      if (!id) continue;
      const updatedAt =
        typeof p.updatedAt === 'string'
          ? p.updatedAt
          : p.updatedAt instanceof Date
            ? p.updatedAt.toISOString()
            : undefined;
      out.push({ id, updatedAt });
    }
    return out;
  } catch {
    return [];
  }
}

export function buildListingPageMetadata(listing: SeoListingSnapshot | null, id: string): Metadata {
  if (!listing) {
    return buildPageMetadata({
      title: 'Property Listing',
      description: 'View PG and shared accommodation listings on Roommat in Ahmedabad & Gandhinagar.',
      path: `/listings/${id}`,
      noIndex: true,
    });
  }

  const rentLabel = formatRentRange(listing.price, listing.maxPrice);
  const title = `${listing.title} — ${rentLabel}/mo | ${listing.city}`;
  const description =
    listing.description ||
    `${listing.title} in ${listing.city}. ${rentLabel} per month. Verified listing on Roommat — PG & shared flats in Ahmedabad.`;

  return buildPageMetadata({
    title,
    description: description.slice(0, 160),
    path: `/listings/${listing.id}`,
    keywords: [
      listing.title,
      `${listing.type} ${listing.city}`,
      `PG ${listing.city}`,
      'room rent Ahmedabad',
      'roommat listing',
    ],
    ogImage: listing.images[0] ? resolveOgImageUrl(listing.images[0]) : undefined,
    ogType: 'article',
  });
}

export function buildListingPageJsonLd(
  listing: SeoListingSnapshot | null,
  id: string,
): Record<string, unknown>[] {
  const path = `/listings/${listing?.id ?? id}`;
  const url = `${SITE_URL}${path}`;

  const graphs: Record<string, unknown>[] = [
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Explore', path: '/explore' },
      { name: listing?.title ?? 'Listing', path },
    ]) as Record<string, unknown>,
  ];

  if (listing) {
    graphs.push(
      buildListingJsonLd({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        city: listing.city,
        location: listing.location,
        price: listing.price,
        maxPrice: listing.maxPrice,
        images: listing.images,
        type: listing.type,
        url,
      }) as Record<string, unknown>,
    );
  }

  return graphs;
}
