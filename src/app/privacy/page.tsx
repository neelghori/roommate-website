import type { Metadata } from 'next';
import { PrivacyDocumentBody } from '@/components/legal/PrivacyDocumentBody';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Roommat Living privacy policy covering personal data collection, usage, sharing, security, and user rights.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | Roommat',
    description: 'Understand how Roommat Living collects, uses, and protects your personal information.',
    url: `${SITE}/privacy`,
    type: 'article',
  },
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      type="privacy"
      effectiveDate="1 May 2025"
      lastUpdated="27 April 2026"
      version="1.0"
    >
      <PrivacyDocumentBody />
    </LegalPageLayout>
  );
}
