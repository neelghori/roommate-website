import { JsonLd } from '@/components/seo/JsonLd';
import { buildPageMetadata, SITE_URL, SOCIAL } from '@/lib/seo/site';
import AboutPageClient from './client';

export const metadata = buildPageMetadata({
  title: 'About Us | Verified PG & Shared Flats in Ahmedabad',
  description:
    "Roommat is Ahmedabad's most trusted platform for verified PG rooms, shared flats, and studio apartments. Learn about our mission to make finding a home simple, safe, and transparent.",
  path: '/about',
  keywords: [
    'about Roommat',
    'PG in Ahmedabad',
    'verified PG Ahmedabad',
    'shared flat Ahmedabad',
    'room for rent Ahmedabad',
    'paying guest Ahmedabad',
    'roommat.in',
  ],
});

const aboutOrganizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Roommat',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "Roommat is Ahmedabad's trusted platform for verified PG rooms, shared flats, and studio apartments.",
  foundingLocation: {
    '@type': 'Place',
    name: 'Ahmedabad, Gujarat, India',
  },
  areaServed: [
    { '@type': 'City', name: 'Ahmedabad' },
    { '@type': 'City', name: 'Gandhinagar' },
  ],
  sameAs: [SOCIAL.twitterUrl, SOCIAL.instagram, SOCIAL.facebook],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    availableLanguage: ['English', 'Hindi', 'Gujarati'],
  },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutOrganizationJsonLd} />
      <AboutPageClient />
    </>
  );
}
