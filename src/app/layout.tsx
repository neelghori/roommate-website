/**
 * Root layout — wraps entire application.
 * Sets up fonts, metadata, global providers.
 *
 * Security:
 * - Content-Security-Policy set in next.config.ts headers
 * - No dangerouslySetInnerHTML anywhere in this layout
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

export const metadata: Metadata = {
  title: {
    default: 'Roommat — Find Your Perfect Roommate',
    template: '%s | Roommat',
  },
  description:
    'Roommat helps you find verified PG, shared flats, and ideal roommates in your city. Browse 1000+ listings across Ahmedabad and more.',
  keywords: ['roommate', 'PG', 'shared flat', 'room for rent', 'Ahmedabad', 'roommat'],
  authors: [{ name: 'Roommat' }],
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Roommat — Find Your Perfect Roommate',
    description: 'Browse verified PG, shared flats, and roommates.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevent auto-zoom on input focus (mobile UX)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
