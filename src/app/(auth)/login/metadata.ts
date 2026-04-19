/**
 * Login page metadata
 */
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to Roommat',
  description:
    'Sign in to your Roommat account to access your saved listings, messages, and roommate matches in Ahmedabad & Gandhinagar.',
  robots: {
    index: false, // Login pages shouldn't appear in search results
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
};
