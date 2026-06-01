import type { Metadata } from 'next';
import type { RoommateProfile } from '@/types';
import { buildPageMetadata, mergePageKeywords, SITE_URL } from '@/lib/seo/site';
import { buildBreadcrumbJsonLd } from '@/lib/seo/json-ld';

export function buildRoommatePageMetadata(profile: RoommateProfile | null, id: string): Metadata {
  if (!profile) {
    return buildPageMetadata({
      title: 'Roommate profile',
      description: 'Roommate profile on Roommat — find compatible flatmates in Ahmedabad & Gandhinagar.',
      path: `/roommates/${id}`,
      noIndex: true,
    });
  }

  const location = profile.location?.trim() || 'Ahmedabad';
  const budget =
    typeof profile.budget === 'number'
      ? `₹${Math.round(profile.budget).toLocaleString('en-IN')}/mo`
      : typeof profile.monthlyBudget === 'number'
        ? `₹${Math.round(profile.monthlyBudget).toLocaleString('en-IN')}/mo`
        : null;

  const title = `${profile.name} — Roommate in ${location}${budget ? ` · ${budget}` : ''}`;
  const description =
    profile.bio?.trim().slice(0, 155) ||
    `${profile.name} is looking for a roommate in ${location}. ${profile.occupation ? `${profile.occupation}. ` : ''}Connect on Roommat — verified roommate profiles in Ahmedabad & Gandhinagar.`;

  return buildPageMetadata({
    title,
    description,
    path: `/roommates/${profile.id}`,
    keywords: mergePageKeywords(
      `${profile.name} roommate`,
      `roommate ${location}`,
      profile.occupation ? `${profile.occupation} roommate Ahmedabad` : 'roommate Ahmedabad',
    ),
    ogType: 'article',
  });
}

export function buildRoommatePageJsonLd(profile: RoommateProfile, id: string): Record<string, unknown>[] {
  const path = `/roommates/${profile.id || id}`;
  const url = `${SITE_URL}${path}`;
  const location = profile.location?.trim() || 'Ahmedabad';

  const person: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: profile.name,
    url,
    description:
      profile.bio?.trim() ||
      `Looking for a compatible roommate in ${location} on Roommat.`,
    jobTitle: profile.occupation || undefined,
    homeLocation: {
      '@type': 'Place',
      name: location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    },
  };

  return [
    buildBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Roommates', path: '/roommates' },
      { name: profile.name, path },
    ]) as Record<string, unknown>,
    person,
  ];
}
