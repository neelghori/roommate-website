import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { AREA_PAGES, getAreaBySlug } from '@/lib/seo/areas';
import { getAreaFaqs, getAreaIntro } from '@/lib/seo/area-content';
import { fetchListingsForSeo } from '@/lib/seo/fetch-listings';
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
  buildItemListJsonLd,
} from '@/lib/seo/json-ld';
import { listingMatchesArea } from '@/lib/listingLocationMatch';
import { formatRentRange } from '@/lib/utils/format';
import { buildPageMetadata, mergePageKeywords, SITE_NAME, SITE_URL } from '@/lib/seo/site';

export const revalidate = 3600;

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
  const roommatesHref = '/roommates';
  const faqs = getAreaFaqs(area);
  const intro = getAreaIntro(area);

  const allListings = await fetchListingsForSeo(100, 3600);
  const areaListings = allListings.filter((l) => listingMatchesArea(l, area.name)).slice(0, 12);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Areas', path: '/areas' },
    { name: area.name, path: `/areas/${area.slug}` },
  ]);

  const faqJsonLd = buildFaqPageJsonLd(faqs);

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

  const jsonLdBlocks: Record<string, unknown>[] = [breadcrumb, faqJsonLd, webPageJsonLd];

  if (areaListings.length > 0) {
    jsonLdBlocks.push(
      buildItemListJsonLd(
        `PG listings in ${area.name}`,
        `Verified PG and shared flats in ${area.name}, ${area.city}`,
        areaListings.slice(0, 10).map((l) => ({
          id: l.id,
          title: l.title,
          url: `${SITE_URL}/listings/${l.id}`,
          price: l.price,
          maxPrice: l.maxPrice,
          city: l.city,
        })),
      ),
    );
  }

  return (
    <>
      <JsonLd data={jsonLdBlocks} />
      <SeoPageShell pageSuffix={area.name}>
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Areas', href: '/areas' },
              { label: area.name },
            ]}
          />

          <section className="seo-crawl-block !max-w-none !p-0 !bg-transparent !border-0">
            <h1>PG &amp; rooms in {area.name}, {area.city}</h1>
            <p>{intro}</p>
            <p>
              <Link href={exploreHref}>View all listings in {area.name}</Link>
              {' · '}
              <Link href={roommatesHref}>Find roommates in {area.city}</Link>
              {' · '}
              <Link href="/areas">All areas</Link>
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

          {areaListings.length > 0 ? (
            <section className="mt-10" aria-labelledby="area-listings-heading">
              <h2 id="area-listings-heading" className="text-base font-bold text-gray-800 mb-3">
                Featured listings in {area.name}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {areaListings.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/listings/${l.id}`}
                      className="block rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm hover:border-primary-200 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">{l.title}</span>
                      <span className="block text-sm text-gray-500 mt-0.5">
                        {formatRentRange(l.price, l.maxPrice)}/month
                        {l.location ? ` · ${l.location}` : ''}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-10" aria-labelledby="area-faq-heading">
            <h2 id="area-faq-heading" className="text-base font-bold text-gray-800 mb-4">
              Frequently asked questions
            </h2>
            <dl className="space-y-4">
              {faqs.map((f) => (
                <div key={f.question} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                  <dt className="font-semibold text-gray-900 text-sm">{f.question}</dt>
                  <dd className="mt-1.5 text-sm text-gray-600 leading-relaxed">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

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
      </SeoPageShell>
    </>
  );
}
