/**
 * Server-rendered roommate summary for crawlers (visible, lightweight — avoids soft 404).
 */
import Link from 'next/link';
import type { RoommateProfile } from '@/types';

export function CrawlableRoommateDetail({ profile }: { profile: RoommateProfile }) {
  const location = profile.location?.trim() || 'Ahmedabad';
  const budget =
    typeof profile.budget === 'number'
      ? profile.budget
      : typeof profile.monthlyBudget === 'number'
        ? profile.monthlyBudget
        : null;

  return (
    <article className="seo-crawl-block" aria-label="Roommate profile summary">
      <h1>{profile.name}</h1>
      {profile.occupation ? <p>Occupation: {profile.occupation}</p> : null}
      <p>Looking for a roommate in {location}.</p>
      {budget != null ? (
        <p>Budget: ₹{Math.round(budget).toLocaleString('en-IN')} per month.</p>
      ) : null}
      {profile.bio?.trim() ? <p>{profile.bio.trim()}</p> : null}
      {profile.tags?.length ? (
        <p>Lifestyle: {profile.tags.join(', ')}</p>
      ) : null}
      <p>
        <Link href="/roommates">Browse more roommates in Ahmedabad</Link>
        {' · '}
        <Link href="/explore">PG &amp; flat listings</Link>
      </p>
    </article>
  );
}
