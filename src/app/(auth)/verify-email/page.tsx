import type { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyEmailClient from './client';

export const metadata: Metadata = {
  title: 'Verify email · Roommat',
  description: 'Confirm your Roommat account email address.',
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
          Loading…
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
