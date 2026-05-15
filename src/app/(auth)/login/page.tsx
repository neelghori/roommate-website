import { Suspense } from 'react';
import { buildPageMetadata } from '@/lib/seo/site';
import LoginPageClient from './client';

export const metadata = buildPageMetadata({
  title: 'Sign In',
  description:
    'Sign in to your Roommat account on roommat.in to access saved listings, messages, and roommate matches.',
  path: '/login',
  noIndex: true,
});

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
