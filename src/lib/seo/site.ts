/**
 * Central SEO — canonical domain is always https://roommat.in (never localhost).
 */
import type { Metadata } from 'next';

const PRODUCTION_CANONICAL = 'https://roommat.in';

/** Never use localhost for canonicals, sitemap, OG, or JSON-LD. */
export function resolveCanonicalSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (!raw || /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(raw)) {
    return PRODUCTION_CANONICAL;
  }
  let url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  url = url.replace(/^http:\/\//i, 'https://');
  return url;
}

export const SITE_URL = resolveCanonicalSiteUrl();

export const SITE_NAME = 'Roommat';
export const SITE_TAGLINE = 'Find Your Perfect Roommate & PG in Ahmedabad';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;

/** Absolute https OG image URL on roommat.in (never localhost). */
export function resolveOgImageUrl(image?: string | null): string {
  if (!image?.trim()) return DEFAULT_OG_IMAGE;
  const trimmed = image.trim();
  if (/^https:\/\//i.test(trimmed)) return trimmed;
  if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, 'https://');
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SITE_URL}${path}`;
}
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@roommat.in';
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '8866566752';

export const DEFAULT_KEYWORDS = [
  'roommat',
  'roommat.in',
  'PG in Ahmedabad',
  'PG Gandhinagar',
  'shared flat Ahmedabad',
  'room for rent Ahmedabad',
  'paying guest Ahmedabad',
  'roommate finder Ahmedabad',
  'find roommate Ahmedabad',
  'flat sharing Ahmedabad',
  'co-living Ahmedabad',
  'PG near me Ahmedabad',
  'verified PG listings',
  'roommate app India',
] as const;

export const SEO_AREAS = [
  'Satellite',
  'Navrangpura',
  'Bodakdev',
  'Vastrapur',
  'SG Highway',
  'Prahlad Nagar',
  'Thaltej',
  'Maninagar',
  'Gandhinagar',
] as const;

export const SOCIAL = {
  twitter: '@roommat_in',
  instagram: 'https://www.instagram.com/roommatliving',
  facebook: 'https://www.facebook.com/share/1E79f18HU7/',
  twitterUrl: 'https://twitter.com/roommat_in',
} as const;

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  noIndex?: boolean;
};

/** Build metadata with absolute canonical URLs on roommat.in. */
export function buildPageMetadata(input: PageSeoInput): Metadata {
  const canonicalPath = input.path.startsWith('/') ? input.path : `/${input.path}`;
  const canonicalUrl = canonicalPath === '/' ? SITE_URL : `${SITE_URL}${canonicalPath}`;
  const ogImage = resolveOgImageUrl(input.ogImage);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: input.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: input.ogType ?? 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${input.title} | ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [ogImage],
      site: SOCIAL.twitter,
      creator: SOCIAL.twitter,
    },
  };
}

export const PRIVATE_PAGE_METADATA: Metadata = buildPageMetadata({
  title: 'Account',
  description: 'Private account area on Roommat.',
  path: '/account',
  noIndex: true,
});
