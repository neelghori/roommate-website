import Link from 'next/link';
import { AREA_PAGES } from '@/lib/seo/areas';
import { SITE_NAME } from '@/lib/seo/site';

type SeoLandingBlurbProps = {
  variant: 'home' | 'explore' | 'roommates';
};

const COPY: Record<SeoLandingBlurbProps['variant'], { heading: string; body: string }> = {
  home: {
    heading: 'Find PG, shared flats & roommates in Ahmedabad',
    body: `${SITE_NAME} lists verified paying guest rooms, shared flats, and roommate profiles across Ahmedabad and Gandhinagar — with photos, rent ranges, and direct chat. Search by area, budget, and amenities without brokerage surprises.`,
  },
  explore: {
    heading: 'Explore PG & rooms for rent in Ahmedabad',
    body: `Filter hundreds of verified PG, flat, and house listings on ${SITE_NAME}. Compare monthly rent, furnishing, and location in top neighbourhoods before you schedule a visit.`,
  },
  roommates: {
    heading: 'Find a compatible roommate in Ahmedabad',
    body: `Browse roommate profiles on ${SITE_NAME} — filter by budget, move-in date, lifestyle, and preferred areas. Whether you need a flatmate or a PG buddy, connect safely on roommat.in.`,
  },
};

export function SeoLandingBlurb({ variant }: SeoLandingBlurbProps) {
  const { heading, body } = COPY[variant];

  return (
    <section className="seo-crawl-block border-t border-gray-100 bg-gray-50/80" aria-label="About Roommat">
      <h2>{heading}</h2>
      <p>{body}</p>
      <p>
        Popular areas:{' '}
        {AREA_PAGES.map((area, i) => (
          <span key={area.slug}>
            {i > 0 ? ' · ' : ''}
            <Link href={`/areas/${area.slug}`}>{area.name}</Link>
          </span>
        ))}
      </p>
    </section>
  );
}
