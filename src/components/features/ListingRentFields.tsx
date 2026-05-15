'use client';

import React from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { ListingFormData } from '@/lib/validations/listing.schema';

type ListingRentFieldsProps = {
  control: Control<ListingFormData>;
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
  watch: UseFormWatch<ListingFormData>;
  setValue: UseFormSetValue<ListingFormData>;
};

const MODE_OPTIONS: { value: ListingFormData['rentMode']; label: string }[] = [
  { value: 'exact', label: 'Exact rent' },
  { value: 'range', label: 'Rent range' },
];

export function ListingRentFields({
  control,
  register,
  errors,
  watch,
  setValue,
}: ListingRentFieldsProps) {
  const rentMode = watch('rentMode');

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Monthly rent *</p>
        <Controller
          name="rentMode"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {MODE_OPTIONS.map((opt) => {
                const active = field.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      field.onChange(opt.value);
                      if (opt.value === 'exact') {
                        const from = watch('minPrice');
                        if (typeof from === 'number' && !Number.isNaN(from)) {
                          setValue('exactPrice', from, { shouldValidate: true });
                        }
                      } else {
                        const exact = watch('exactPrice');
                        if (typeof exact === 'number' && !Number.isNaN(exact)) {
                          setValue('minPrice', exact, { shouldValidate: true });
                          setValue('maxPrice', exact, { shouldValidate: true });
                        }
                      }
                    }}
                    className={[
                      'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'border-transparent text-white shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                    ].join(' ')}
                    style={active ? { backgroundColor: '#1B8F8F' } : undefined}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      {rentMode === 'exact' ? (
        <Input
          label="Rent / month ₹ *"
          type="number"
          placeholder="8500"
          error={errors.exactPrice?.message}
          {...register('exactPrice', { valueAsNumber: true })}
        />
      ) : (
        <>
          <p className="text-xs text-gray-500">
            For PGs with different room types, enter the lowest and highest monthly rent.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="From ₹ *"
              type="number"
              placeholder="5000"
              error={errors.minPrice?.message}
              {...register('minPrice', { valueAsNumber: true })}
            />
            <Input
              label="To ₹ *"
              type="number"
              placeholder="10000"
              error={errors.maxPrice?.message}
              {...register('maxPrice', { valueAsNumber: true })}
            />
          </div>
        </>
      )}
    </div>
  );
}
