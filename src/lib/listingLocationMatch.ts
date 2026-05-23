import type { Listing } from '@/types';

/** Lowercase, collapse spaces — for deduping area chip labels. */
export function compactLocationKey(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '').trim();
}

/** Remove duplicate area names (e.g. "Prahladnagar" vs "Prahlad Nagar"). Keeps first spelling. */
export function dedupeAreaLabels(areas: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const area of areas) {
    const trimmed = area.trim();
    if (!trimmed) continue;
    const key = compactLocationKey(trimmed);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

function locationHaystack(l: Listing): string {
  return [l.location, l.title, l.formattedAddress, l.city, l.addressLine2, l.state]
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .join(' ');
}

/** Match area/locality against listing address fields (spacing-insensitive). */
export function listingMatchesArea(l: Listing, area: string | undefined): boolean {
  if (!area || !String(area).trim()) return true;
  const q = String(area).trim();
  const hay = locationHaystack(l);
  const hayLower = hay.toLowerCase();
  const qLower = q.toLowerCase();
  if (hayLower.includes(qLower)) return true;
  return compactLocationKey(hay).includes(compactLocationKey(q));
}

/** City filter: many listings only have area text in `location` while `city` is empty. */
export function listingMatchesCity(l: Listing, city: string | undefined): boolean {
  if (!city || !String(city).trim()) return true;
  const c = String(city).trim().toLowerCase();
  const hay = locationHaystack(l).toLowerCase();
  return hay.includes(c);
}
