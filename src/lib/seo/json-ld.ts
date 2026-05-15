import { FAQS } from '@/lib/staticData';
import { resolveOgImageUrl, SITE_NAME, SITE_URL, SUPPORT_EMAIL, SUPPORT_PHONE, SOCIAL } from '@/lib/seo/site';

/** Root layout: Organization + WebSite + LocalBusiness + FAQ */
export function buildRootJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`,
          width: 220,
          height: 72,
        },
        sameAs: [SOCIAL.twitterUrl, SOCIAL.instagram, SOCIAL.facebook],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: SUPPORT_EMAIL,
          telephone: SUPPORT_PHONE,
          availableLanguage: ['English', 'Hindi', 'Gujarati'],
          areaServed: 'IN',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description:
          'Find verified PG rooms, shared flats, and compatible roommates in Ahmedabad & Gandhinagar.',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/explore?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${SITE_URL}/#local`,
        name: SITE_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/logo.png`,
        description: 'PG and roommate finder for Ahmedabad & Gandhinagar, Gujarat.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ahmedabad',
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 23.0225,
          longitude: 72.5714,
        },
        areaServed: [
          { '@type': 'City', name: 'Ahmedabad' },
          { '@type': 'City', name: 'Gandhinagar' },
        ],
        priceRange: '₹₹',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/#faq`,
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      },
    ],
  };
}

export type ListingJsonLdInput = {
  id: string;
  title: string;
  description: string;
  city: string;
  location: string;
  price: number;
  maxPrice?: number;
  images: string[];
  type: string;
  url: string;
};

export function buildListingJsonLd(input: ListingJsonLdInput) {
  const image = resolveOgImageUrl(input.images[0]);
  const images = input.images.length
    ? input.images.map((img) => resolveOgImageUrl(img))
    : [image];

  const lowPrice = input.price;
  const highPrice = input.maxPrice && input.maxPrice > input.price ? input.maxPrice : input.price;

  return {
    '@context': 'https://schema.org',
    '@type': ['Accommodation', 'Product'],
    '@id': `${input.url}#listing`,
    name: input.title,
    description: input.description.slice(0, 500),
    url: input.url,
    image: images,
    category: input.type,
    brand: { '@type': 'Brand', name: SITE_NAME },
    address: {
      '@type': 'PostalAddress',
      streetAddress: input.location,
      addressLocality: input.city || 'Ahmedabad',
      addressRegion: 'Gujarat',
      addressCountry: 'IN',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice,
      highPrice,
      offerCount: 1,
      availability: 'https://schema.org/InStock',
      url: input.url,
    },
  };
}

export type ItemListEntry = {
  id: string;
  title: string;
  url: string;
  price: number;
  maxPrice?: number;
  city: string;
};

/** ItemList for homepage / explore — enables rich result carousels where eligible. */
export function buildItemListJsonLd(
  name: string,
  description: string,
  items: ItemListEntry[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: item.url,
      name: item.title,
      item: {
        '@type': 'Accommodation',
        name: item.title,
        url: item.url,
        address: {
          '@type': 'PostalAddress',
          addressLocality: item.city || 'Ahmedabad',
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: item.price,
          highPrice: item.maxPrice && item.maxPrice > item.price ? item.maxPrice : item.price,
        },
      },
    })),
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path === '/' ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
}
