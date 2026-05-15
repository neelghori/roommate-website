import { PrivacyDocumentBody } from '@/components/legal/PrivacyDocumentBody';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import { buildPageMetadata } from '@/lib/seo/site';

export const metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'Roommat Living privacy policy for roommat.in — how we collect, use, and protect your personal data (Ahmedabad & Gandhinagar, India).',
  path: '/privacy',
  ogType: 'article',
});

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
