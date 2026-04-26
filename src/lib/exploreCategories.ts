import type { Category, Listing, ListingType } from '@/types';

/** Explore “Browse by category” — 3×2 grid: PG, Rent, Roommate, Studio, Bachelor, Family. */
const EXPLORE_GRID: { label: ListingType; icon: string; unit: Category['unit'] }[] = [
  { label: 'PG', icon: '🏠', unit: 'listings' },
  { label: 'Rent', icon: '🔑', unit: 'listings' },
  { label: 'Roommate', icon: '👥', unit: 'profiles' },
  { label: 'Studio', icon: '🏡', unit: 'listings' },
  { label: 'Bachelor', icon: '👤', unit: 'listings' },
  { label: 'Family', icon: '👨‍👩‍👧', unit: 'listings' },
];

export function buildExploreCategoriesFromListings(listings: Listing[]): Category[] {
  return EXPLORE_GRID.map((def, idx) => ({
    id: `explore-cat-${idx}-${def.label}`,
    label: def.label,
    icon: def.icon,
    unit: def.unit,
    count: listings.filter((l) => l.type === def.label).length,
  }));
}
