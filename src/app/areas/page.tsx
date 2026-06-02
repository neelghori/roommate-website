import Link from 'next/link';
import { Breadcrumb } from '@/components/seo/Breadcrumb';
import { SeoPageShell } from '@/components/seo/SeoPageShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { AREA_PAGES } from '@/lib/seo/areas';
import { buildBreadcrumbJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata, mergePageKeywords, SITE_NAME, SITE_URL } from '@/lib/seo/site';

export const revalidate = 3600;

export const metadata = buildPageMetadata({
  title: 'PG & Rooms by Area in Ahmedabad & Gandhinagar',
  description: `Browse PG and shared flat listings by neighbourhood in Ahmedabad and Gandhinagar. Find rooms in Satellite, Navrangpura, Vastrapur, and more on ${SITE_NAME}.`,
  path: '/areas',
  keywords: mergePageKeywords(
    'PG by area Ahmedabad',
    'rooms by locality Ahmedabad',
    'area wise PG listings',
  ),
});

export default function AreasIndexPage() {
  const breadcrumb = buildBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Areas', path: '/areas' },
  ]);

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PG & rooms by area',
    description: `Neighbourhood guides for PG and shared flats on ${SITE_NAME}.`,
    url: `${SITE_URL}/areas`,
  };

  const ahmedabad = AREA_PAGES.filter((a) => a.city === 'Ahmedabad');
  const gandhinagar = AREA_PAGES.filter((a) => a.city === 'Gandhinagar');

  return (
    <>
      <JsonLd data={[breadcrumb, webPageJsonLd]} />
      <SeoPageShell>
          <Breadcrumb
            className="mb-6"
            items={[
              { label: 'Home', href: '/' },
              { label: 'Areas' },
            ]}
          />

          <section className="seo-crawl-block !max-w-none !p-0 !bg-transparent !border-0">
            <h1>PG &amp; rooms by area</h1>
            <p>
              Choose a neighbourhood in Ahmedabad or Gandhinagar to browse verified PG rooms, shared
              flats, and roommate-friendly listings on {SITE_NAME}.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold text-gray-800 mb-3">Ahmedabad</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ahmedabad.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/areas/${area.slug}`}
                    className="block rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm hover:border-primary-200 hover:bg-primary-50/40 transition-colors"
                  >
                    PG in {area.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {gandhinagar.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-base font-bold text-gray-800 mb-3">Gandhinagar</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gandhinagar.map((area) => (
                  <li key={area.slug}>
                    <Link
                      href={`/areas/${area.slug}`}
                      className="block rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-semibold text-primary-700 shadow-sm hover:border-primary-200 hover:bg-primary-50/40 transition-colors"
                    >
                      PG in {area.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-10">
            <Link href="/explore" className="text-sm font-semibold text-primary-600 hover:underline">
              Browse all listings on Explore →
            </Link>
          </p>
      </SeoPageShell>
    </>
  );
}
