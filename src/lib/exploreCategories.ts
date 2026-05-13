import type { Category, Listing, ListingType } from '@/types';

/** Explore “Browse by category” grid: PG, Flat, Roommate, Co-Working Space, House. */
const EXPLORE_GRID: { label: ListingType; icon: string; unit: Category['unit'] }[] = [
  { label: 'PG', icon: '🏠', unit: 'listings' },
  { label: 'Flat', icon: '🔑', unit: 'listings' },
  { label: 'Roommate', icon: '👥', unit: 'profiles' },
  { label: 'CoWorkingSpace', icon: '💼', unit: 'listings' },
  { label: 'House', icon: '🏡', unit: 'listings' },
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
