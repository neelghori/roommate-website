import Link from 'next/link';
import type { RoommateProfile } from '@/types';

export function CrawlableRoommates({ profiles }: { profiles: RoommateProfile[] }) {
  if (!profiles.length) return null;

  return (
    <nav aria-label="Roommate profiles index" className="sr-only">
      <ul>
        {profiles.map((p) => (
          <li key={p.id}>
            <Link href={`/roommates/${p.id}`}>
              {p.name}
              {p.location ? ` — ${p.location}` : ''}
              {typeof p.budget === 'number' ? ` — INR ${Math.round(p.budget)}/month` : ''}
              {p.occupation ? ` — ${p.occupation}` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
