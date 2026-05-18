import type { ListingFormData } from '@/lib/validations/listing.schema';

export type PeopleTypeOption = {
  value: ListingFormData['peopleTypes'][number];
  label: string;
};

const BASE_OPTIONS: PeopleTypeOption[] = [
  { value: 'Bachelor', label: 'Bachelor' },
  { value: 'Working', label: 'Working' },
  { value: 'Family', label: 'Family' },
];

const STUDENT_OPTION: PeopleTypeOption = { value: 'Student', label: 'Student' };

/** People-type chips for listing forms — Student only when type is PG/Hostel. */
export function getPeopleTypeOptionsForListingType(
  listingType: ListingFormData['type'] | string | undefined,
): PeopleTypeOption[] {
  if (listingType === 'PG') {
    return [...BASE_OPTIONS, STUDENT_OPTION];
  }
  return [...BASE_OPTIONS];
}

export function stripStudentFromPeopleTypes(
  types: ListingFormData['peopleTypes'] | undefined,
): ListingFormData['peopleTypes'] {
  if (!types?.length) return [];
  return types.filter((t) => t !== 'Student');
}
