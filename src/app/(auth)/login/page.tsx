import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginPageClient from './client';

export const metadata: Metadata = {
  title: 'Sign In to Roommat',
  description:
    'Sign in to your Roommat account to access your saved listings, messages, and roommate matches in Ahmedabad & Gandhinagar.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
          Loading…
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
