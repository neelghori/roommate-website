import type { Metadata } from 'next';
import RoommatesPageClient from './client';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Find Roommates in Ahmedabad & Gandhinagar Roommat',
  description:
    'Find compatible roommates in Ahmedabad & Gandhinagar. Browse verified profiles, filter by lifestyle, budget & location. 90%+ match accuracy. Free to use!',
  keywords: [
    'find roommate Ahmedabad',
    'roommate search Ahmedabad',
    'roommate Gandhinagar',
    'compatible roommate India',
    'flatmate Ahmedabad',
    'co-living Ahmedabad',
    'roommate for working professionals Ahmedabad',
    'roommate for students Ahmedabad',
    'non-smoker roommate Ahmedabad',
    'vegetarian roommate',
  ],
  alternates: {
    canonical: '/roommates',
  },
  openGraph: {
    title: 'Find Roommates in Ahmedabad & Gandhinagar Roommat',
    description: 'Browse verified roommate profiles in Ahmedabad. Filter by lifestyle, budget, and location.',
    url: `${BASE_URL}/roommates`,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Find Roommates in Ahmedabad' }],
  },
};

export default function RoommatesPage() {
  return <RoommatesPageClient />;
}
