import type { Metadata } from 'next';
import RoommateDetailClient from './roommate-detail-client';
import { fetchRoommateByIdForSeo } from '@/lib/seo/fetch-roommates';
import { buildRoommatePageMetadata } from '@/lib/seo/roommate';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchRoommateByIdForSeo(id);
  return buildRoommatePageMetadata(profile, id);
}

export default function RoommateDetailPage() {
  return <RoommateDetailClient />;
}
