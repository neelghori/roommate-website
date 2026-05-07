/**
 * Explore page server wrapper exports SEO metadata,
 * then renders the client component.
 *
 * Next.js App Router: metadata must come from a Server Component.
 * Since ExplorePage is 'use client', we wrap it here.
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ExplorePageClient from './client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Explore PG & Rooms in Ahmedabad Search 500+ Listings',
  description:
    'Explore 500+ verified PG, shared flat, and roommate listings across Ahmedabad & Gandhinagar. Filter by area, price & amenities. Find your perfect room today!',
  keywords: [
    'explore PG Ahmedabad',
    'find room Ahmedabad',
    'PG Satellite Ahmedabad',
    'PG Navrangpura',
    'PG Bodakdev',
    'PG Vastrapur',
    'PG SG Highway',
    'cheap PG Ahmedabad',
    'PG for girls Ahmedabad',
    'PG for boys Ahmedabad',
    'bachelor flat Ahmedabad',
    'paying guest near me',
  ],
  alternates: { canonical: '/explore' },
  openGraph: {
    title: 'Explore PG & Rooms in Ahmedabad Roommat',
    description: 'Search 500+ verified PG and shared flat listings in Ahmedabad & Gandhinagar with photos and prices.',
    url: `${BASE_URL}/explore`,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Explore PG listings Ahmedabad' }],
  },
};

function ExploreFallback() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center text-sm text-gray-500">
      Loading explore…
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExplorePageClient />
    </Suspense>
  );
}
