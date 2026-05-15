import type { Metadata } from 'next';
import AdminGroupClient from './admin-group-client';
import { PRIVATE_PAGE_METADATA } from '@/lib/seo/site';

export const metadata: Metadata = PRIVATE_PAGE_METADATA;

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <AdminGroupClient>{children}</AdminGroupClient>;
}
