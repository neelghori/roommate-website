import { TermsDocumentBody } from '@/components/legal/TermsDocumentBody';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { buildPageMetadata } from '@/lib/seo/site';

export const metadata = buildPageMetadata({
  title: 'Terms & Conditions',
  description:
    'Terms and conditions for using Roommat Living (roommat.in) — PG listings, roommate matching, and flat sharing in Ahmedabad & Gandhinagar.',
  path: '/terms',
  ogType: 'article',
});

export default function TermsPage() {
  return (
    <LegalPageLayout
      type="terms"
      effectiveDate="1 May 2025"
      lastUpdated="27 April 2026"
      version="1.0"
    >
      <TermsDocumentBody />
    </LegalPageLayout>
  );
}
