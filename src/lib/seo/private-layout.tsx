import type { Metadata } from 'next';
import { PRIVATE_PAGE_METADATA } from '@/lib/seo/site';

export const metadata: Metadata = PRIVATE_PAGE_METADATA;

export default function PrivateSeoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
