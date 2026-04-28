/**
 * Register page metadata
 */
import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Create Your Free Roommat Account — Find Roommates & PG',
  description:
    'Sign up for free on Roommat to find verified PG rooms, shared flats, and compatible roommates in Ahmedabad & Gandhinagar. Takes less than 2 minutes!',
  keywords: [
    'roommat signup',
    'create roommate account',
    'register roommat',
    'free roommate app India',
  ],
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Create Your Free Roommat Account',
    description: 'Join thousands finding verified PG and roommates in Ahmedabad. Free sign-up in under 2 minutes.',
    url: `${BASE_URL}/register`,
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sign up for Roommat' }],
  },
};
