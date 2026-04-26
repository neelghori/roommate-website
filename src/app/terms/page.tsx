import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TermsDocumentBody } from '@/components/legal/TermsDocumentBody';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Roommat Living — PG & roommate platform terms and conditions for Ahmedabad & Gandhinagar, Gujarat, India.',
  alternates: { canonical: '/terms' },
  openGraph: {
    title: 'Terms and Conditions | Roommat',
    description: 'Legal terms for using the Roommat Living platform.',
    url: `${SITE}/terms`,
    type: 'article',
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-gray-100 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <TermsDocumentBody />
        </div>
      </article>
    </div>
  );
}
