/**
 * Root layout — fonts, providers, global SEO (roommat.in).
 */
import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from '@/components/shared/Providers';
import { JsonLd } from '@/components/seo/JsonLd';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { buildRootJsonLd } from '@/lib/seo/json-ld';
import { getGaMeasurementId } from '@/lib/analytics/ga';
import {
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  SOCIAL,
} from '@/lib/seo/site';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const gaId = getGaMeasurementId();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Find verified PG rooms, shared flats, and ideal roommates in Ahmedabad & Gandhinagar. Browse listings with photos, rent ranges, and instant chat. Free on roommat.in.',
  keywords: [...DEFAULT_KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-IN': SITE_URL },
  },
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
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      'Browse verified PG, shared flat, and roommate listings in Ahmedabad & Gandhinagar on roommat.in.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — PG & roommate finder Ahmedabad`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: 'Verified PG & shared flats in Ahmedabad. Start free on roommat.in.',
    images: [DEFAULT_OG_IMAGE],
    site: SOCIAL.twitter,
    creator: SOCIAL.twitter,
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  category: 'real estate',
  verification: {
    google: 'nl-UEhWpej-sCCf8NFhbbjYsVMDSC3UJEw8_WaeXc40',
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <JsonLd data={buildRootJsonLd()} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body suppressHydrationWarning>
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <Providers>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
