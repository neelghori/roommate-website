import type { ListingFormData } from '@/lib/validations/listing.schema';
import type { UserRole } from '@/types/user.types';

export type ListingTypeSelectValue = ListingFormData['type'];

/** Options shown in listing create/edit forms (subset of `listingSchema` types; excludes legacy `Rent`). */
export const LISTING_TYPE_SELECT_OPTIONS: { label: string; value: ListingTypeSelectValue }[] = [
  { label: 'PG/Hostel', value: 'PG' },
  { label: 'Flat', value: 'Flat' },
  { label: 'Roommate', value: 'Roommate' },
  { label: 'Co-Working Space', value: 'CoWorkingSpace' },
  { label: 'House', value: 'House' },
];

/**
 * Roommate-seeker listings are only for accounts with role ROOMMATE.
 * Tenants and owners (and unknown session) get every type except Roommate; ADMIN keeps full list.
 */
export function getListingTypeSelectOptionsForRole(
  role: UserRole | undefined | null,
): { label: string; value: ListingTypeSelectValue }[] {
  if (role === 'ROOMMATE') {
    return LISTING_TYPE_SELECT_OPTIONS.filter((o) => o.value === 'Roommate');
  }
  if (role === 'ADMIN') {
    return [...LISTING_TYPE_SELECT_OPTIONS];
  }
  return LISTING_TYPE_SELECT_OPTIONS.filter((o) => o.value !== 'Roommate');
}
