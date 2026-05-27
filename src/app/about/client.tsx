'use client';

import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import { AboutPageContent } from '@/components/about/AboutPageContent';
import { UserLayout } from '@/components/shared/UserLayout';
import '@/styles/about-page.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-about-sans',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-about-serif',
});

export default function AboutPageClient() {
  return (
    <UserLayout pageSuffix="About Us" showSearch={false} showFab={false}>
      <div className={`${dmSans.variable} ${dmSerif.variable}`}>
        <AboutPageContent />
      </div>
    </UserLayout>
  );
}
