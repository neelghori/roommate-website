import type { Metadata } from 'next';
import { UserAuthGate } from '@/components/shared/UserAuthGate';
import HomePageClient from './(user)/client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Verified PG & Shared Flats in Ahmedabad — Roommat',
  description:
    'Browse 500+ verified PG rooms, shared flats, and studio apartments in Ahmedabad & Gandhinagar. Compare prices, photos, and amenities. Find your perfect space today!',
  keywords: [
    'PG in Ahmedabad',
    'shared flat Ahmedabad',
    'room for rent Ahmedabad',
    'paying guest Ahmedabad',
    'studio apartment Ahmedabad',
    '1BHK Ahmedabad rent',
    'flat sharing Ahmedabad',
    'room Satellite Ahmedabad',
    'room Navrangpura',
    'PG Bodakdev',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Verified PG & Shared Flats in Ahmedabad — Roommat',
    description:
      'Browse 500+ verified PG rooms and shared flats in Ahmedabad & Gandhinagar. Photos, prices, and instant chat included.',
    url: BASE_URL,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Roommat Listings in Ahmedabad' }],
  },
};

/** Root `/` — lives outside `(user)` so Next always resolves the homepage route. */
export default function HomePage() {
  return (
    <UserAuthGate>
      <HomePageClient />
    </UserAuthGate>
  );
}
