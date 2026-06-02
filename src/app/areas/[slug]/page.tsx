import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/shared/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { AREA_PAGES, getAreaBySlug } from '@/lib/seo/areas';
import { buildBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata, mergePageKeywords, SITE_NAME, SITE_URL } from '@/lib/seo/site';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return AREA_PAGES.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) {
    return buildPageMetadata({
      title: 'Area not found',
      description: 'Browse PG and roommate listings on Roommat.',
      path: '/explore',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `PG & Rooms in ${area.name}, ${area.city} — Verified Listings`,
    description: `Find verified PG rooms, shared flats, and roommates in ${area.name}, ${area.city}. Compare rent, photos, and amenities on ${SITE_NAME}.`,
    path: `/areas/${area.slug}`,
    keywords: mergePageKeywords(
      `PG in ${area.name}`,
      `room for rent ${area.name}`,
      `shared flat ${area.name} ${area.city}`,
      `roommate ${area.name}`,
    ),
  });
}

export default async function AreaLandingPage({ params }: Props) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const exploreHref = `/explore?q=${encodeURIComponent(area.name)}`;
  const roommatesHref = `/roommates`;

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: area.name, path: `/areas/${area.slug}` },
  ]);

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `PG & rooms in ${area.name}, ${area.city}`,
    description: `Verified PG and shared flat listings in ${area.name} on ${SITE_NAME}.`,
    url: `${SITE_URL}/areas/${area.slug}`,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: {
      '@type': 'Place',
      name: area.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: area.city,
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    },
  };

  return (
    <>
      <JsonLd data={[breadcrumb, webPageJsonLd]} />
      <div className="min-h-[100dvh] flex flex-col bg-background">
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 lg:py-14">
          <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/explore" className="hover:text-primary-600">
              Explore
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{area.name}</span>
          </nav>

          <section className="seo-crawl-block !max-w-none !p-0 !bg-transparent !border-0">
            <h1>PG &amp; rooms in {area.name}, {area.city}</h1>
            <p>
              Browse verified paying guest rooms, shared flats, and roommate-friendly listings in{' '}
              {area.name}. Filter by budget, furnishing, and amenities on {SITE_NAME} — no brokerage,
              direct chat with owners.
            </p>
            <p>
              <Link href={exploreHref}>View listings in {area.name}</Link>
              {' · '}
              <Link href={roommatesHref}>Find roommates in {area.city}</Link>
            </p>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={exploreHref}
              className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
            >
              Explore {area.name} listings
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl border-2 border-primary-600/20 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-teal-50/60 transition-colors"
            >
              Create free account
            </Link>
          </div>

          <section className="mt-10 text-sm text-gray-600">
            <h2 className="text-base font-bold text-gray-800 mb-2">Other popular areas</h2>
            <ul className="flex flex-wrap gap-x-3 gap-y-2">
              {AREA_PAGES.filter((a) => a.slug !== area.slug).map((a) => (
                <li key={a.slug}>
                  <Link href={`/areas/${a.slug}`} className="text-primary-600 hover:underline">
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
