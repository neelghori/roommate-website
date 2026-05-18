'use client';

import React, { useMemo } from 'react';
import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import type { ListingFormData } from '@/lib/validations/listing.schema';
import { getPeopleTypeOptionsForListingType } from '@/lib/people-types';

type ListingPeopleTypeCheckboxesProps = {
  control: Control<ListingFormData>;
  errors?: FieldErrors<ListingFormData>;
  listingType: ListingFormData['type'];
};

export function ListingPeopleTypeCheckboxes({
  control,
  errors,
  listingType,
}: ListingPeopleTypeCheckboxesProps) {
  const options = useMemo(
    () => getPeopleTypeOptionsForListingType(listingType),
    [listingType],
  );

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">People type *</label>
      <p className="text-xs text-gray-500 mb-2">
        Select who this listing is suitable for
        {listingType === 'PG' ? ' (Student is available for PG/Hostel only)' : ''}.
      </p>
      {errors?.peopleTypes && (
        <p className="text-xs text-red-500 mb-2">{errors.peopleTypes.message as string}</p>
      )}
      <Controller
        name="peopleTypes"
        control={control}
        render={({ field }) => {
          const current = (field.value as ListingFormData['peopleTypes']) ?? [];
          const toggle = (value: (typeof options)[number]['value']) => {
            const set = new Set(current);
            if (set.has(value)) set.delete(value);
            else set.add(value);
            field.onChange([...set]);
          };
          return (
            <div className="flex flex-wrap gap-2">
              {options.map(({ value, label }) => {
                const active = current.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle(value)}
                    className={[
                      'rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-primary/40',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
