import type { Metadata } from 'next';
import { TermsDocumentBody } from '@/components/legal/TermsDocumentBody';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description:
    'Roommat Living PG & roommate platform terms and conditions for Ahmedabad & Gandhinagar, Gujarat, India.',
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
    <LegalPageLayout
      type="terms"
      effectiveDate="21 April 2026"
      lastUpdated="21 April 2026"
      version="1.0"
    >
      <TermsDocumentBody />
    </LegalPageLayout>
  );
}
