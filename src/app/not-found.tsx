import Link from 'next/link';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Page not found',
  description: 'The page you requested is not available on Roommat.',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-extrabold text-primary/30 mb-4">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        This listing or profile may have been removed. Browse verified PG and roommate options in Ahmedabad
        instead.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-primary hover:opacity-90"
        >
          Home
        </Link>
        <Link
          href="/explore"
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5"
        >
          Explore listings
        </Link>
        <Link
          href="/roommates"
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-primary border border-primary/30 hover:bg-primary/5"
        >
          Find roommates
        </Link>
      </div>
    </main>
  );
}
