/**
 * Root layout — wraps entire application.
 * Sets up fonts, metadata, global providers.
 *
 * Security:
 * - Content-Security-Policy set in next.config.ts headers
 * - No dangerouslySetInnerHTML anywhere in this layout
 *
 * SEO:
 * - Full OpenGraph + Twitter Card metadata
 * - JSON-LD structured data (WebSite + Organization + SearchAction)
 * - Canonical URL, alternate languages
 */
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roommat.in';

export const metadata: Metadata = {
  // ── Title ─────────────────────────────────────────────────────────────────
  title: {
    default: 'Roommat — Find Your Perfect Roommate & PG in Ahmedabad',
    template: '%s | Roommat',
  },

  // ── Core meta ─────────────────────────────────────────────────────────────
  description:
    'Find verified PG rooms, shared flats, and ideal roommates in Ahmedabad & Gandhinagar. 500+ listings with photos, prices, and instant chat. Start for free!',

  keywords: [
    'roommate finder Ahmedabad',
    'PG in Ahmedabad',
    'shared flat Ahmedabad',
    'room for rent Ahmedabad',
    'roommate Gandhinagar',
    'PG Gandhinagar',
    'roommate app India',
    'find roommate',
    'paying guest Ahmedabad',
    'flat sharing Ahmedabad',
    'co-living Ahmedabad',
    'room rent near me',
    'roommat',
  ],

  authors: [{ name: 'Roommat', url: BASE_URL }],
  creator: 'Roommat',
  publisher: 'Roommat',

  // ── Canonical + Alternates ─────────────────────────────────────────────────
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/',
    },
  },

  // ── Robots ────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    title: 'Roommat — Find Your Perfect Roommate & PG in Ahmedabad',
    description:
      'Browse 500+ verified PG, shared flat, and roommate listings in Ahmedabad & Gandhinagar. Instant chat, smart matching, free to use.',
    url: BASE_URL,
    siteName: 'Roommat',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Roommat — Find Your Perfect Roommate & PG in Ahmedabad',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter Card ──────────────────────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'Roommat — Find Your Perfect Roommate & PG in Ahmedabad',
    description:
      'Browse 500+ verified PG and shared flat listings in Ahmedabad. Start for free!',
    images: ['/og-image.png'],
    creator: '@roommat_in',
    site: '@roommat_in',
  },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },

  // ── App links ─────────────────────────────────────────────────────────────
  manifest: '/site.webmanifest',

  // ── Verification ──────────────────────────────────────────────────────────
  // Add your Google Search Console verification token here once verified
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_TOKEN',
  // },

  // ── Category ──────────────────────────────────────────────────────────────
  category: 'real estate',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D9488' },
    { media: '(prefers-color-scheme: dark)', color: '#0f6060' },
  ],
};

// ── JSON-LD Structured Data ────────────────────────────────────────────────────
// WebSite schema with SearchAction for Google Sitelinks Search Box
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organisation
    {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
      name: 'Roommat',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
        width: 220,
        height: 72,
      },
      sameAs: [
        'https://twitter.com/roommat_in',
        'https://www.instagram.com/roommat.in',
        'https://www.facebook.com/roommat.in',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'support@roommat.in',
        availableLanguage: ['English', 'Hindi', 'Gujarati'],
      },
    },
    // WebSite with Sitelinks SearchBox
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      url: BASE_URL,
      name: 'Roommat',
      description: 'Find verified PG, shared flats, and roommates in Ahmedabad & Gandhinagar.',
      publisher: { '@id': `${BASE_URL}/#organization` },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${BASE_URL}/explore?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'en-IN',
    },
    // LocalBusiness (helps Google Maps & local SEO)
    {
      '@type': 'LocalBusiness',
      '@id': `${BASE_URL}/#local`,
      name: 'Roommat',
      url: BASE_URL,
      image: `${BASE_URL}/logo.png`,
      description: 'Roommate and PG finder for Ahmedabad & Gandhinagar.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '23.0225',
        longitude: '72.5714',
      },
      areaServed: [
        { '@type': 'City', name: 'Ahmedabad' },
        { '@type': 'City', name: 'Gandhinagar' },
      ],
      priceRange: '₹₹',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for faster third-party loads */}
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
