/**
 * Explore page metadata
 * Target keywords: "find room Ahmedabad", "explore PG listings"
 */
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Explore PG & Rooms in Ahmedabad Search 500+ Listings',
  description:
    'Explore 500+ verified PG, shared flat, and roommate listings in Ahmedabad & Gandhinagar. Filter by area, price, and amenities. Find the perfect room today!',
  keywords: [
    'explore PG Ahmedabad',
    'find room Ahmedabad',
    'PG Satellite Ahmedabad',
    'PG Navrangpura',
    'PG Bodakdev',
    'PG Vastrapur',
    'cheap PG Ahmedabad',
    'PG for girls Ahmedabad',
    'PG for boys Ahmedabad',
    'bachelor flat Ahmedabad',
  ],
  alternates: {
    canonical: '/explore',
  },
  openGraph: {
    title: 'Explore PG & Rooms in Ahmedabad Roommat',
    description: 'Search verified PG and shared flat listings in Ahmedabad & Gandhinagar with photos and prices.',
    url: `${BASE_URL}/explore`,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Explore PG Listings in Ahmedabad' }],
  },
};
