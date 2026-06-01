import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/seo/JsonLd';
import { CrawlableRoommateDetail } from '@/components/seo/CrawlableRoommateDetail';
import { fetchRoommateByIdForSeo } from '@/lib/seo/fetch-roommates';
import { buildRoommatePageJsonLd, buildRoommatePageMetadata } from '@/lib/seo/roommate';

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await fetchRoommateByIdForSeo(id);
  return buildRoommatePageMetadata(profile, id);
}

export default async function RoommateDetailLayout({ children, params }: Props) {
  const { id } = await params;
  const profile = await fetchRoommateByIdForSeo(id);

  if (!profile) {
    notFound();
  }

  const jsonLd = buildRoommatePageJsonLd(profile, id);

  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
      <CrawlableRoommateDetail profile={profile} />
    </>
  );
}
