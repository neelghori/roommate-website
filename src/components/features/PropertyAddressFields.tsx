'use client';

import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { ListingFormData } from '@/lib/validations/listing.schema';

export type PropertyAddressFieldsProps = {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
};

export function PropertyAddressFields({ register, errors }: PropertyAddressFieldsProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-800">Address</p>

      <Input
        label="Address line 1 *"
        placeholder="Street, building, area"
        error={errors.addressLine1?.message}
        {...register('addressLine1')}
      />
      <Input
        label="Address line 2"
        placeholder="Flat, floor, landmark (optional)"
        error={errors.addressLine2?.message}
        {...register('addressLine2')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="City *" placeholder="City" error={errors.city?.message} {...register('city')} />
        <Input label="State *" placeholder="State" error={errors.state?.message} {...register('state')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Country *" placeholder="Country" error={errors.country?.message} {...register('country')} />
        <Input
          label="Postal code"
          placeholder="PIN / ZIP"
          error={errors.postalCode?.message}
          {...register('postalCode')}
        />
      </div>

      <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2.5 space-y-3">
        <p className="text-xs font-medium text-gray-700">Coordinates *</p>
        <p className="text-[11px] text-gray-500 leading-snug">
          Required for map and search. Paste from Google Maps (right-click a place → the first number is lat, the second
          is lng).
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude *"
            type="number"
            step="any"
            placeholder="e.g. 23.0225"
            error={errors.latitude?.message}
            {...register('latitude', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = typeof v === 'number' ? v : Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
          <Input
            label="Longitude *"
            type="number"
            step="any"
            placeholder="e.g. 72.5714"
            error={errors.longitude?.message}
            {...register('longitude', {
              setValueAs: (v) => {
                if (v === '' || v == null) return undefined;
                const n = typeof v === 'number' ? v : Number(v);
                return Number.isFinite(n) ? n : undefined;
              },
            })}
          />
        </div>
      </div>
    </div>
  );
}
