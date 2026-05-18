'use client';

import { Input } from '@/components/ui/Input';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { ListingFormData } from '@/lib/validations/listing.schema';

type PgMinimumStayFieldProps = {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
};

/** Shown only when listing type is PG — minimum months a tenant must stay. */
export function PgMinimumStayField({ register, errors }: PgMinimumStayFieldProps) {
  return (
    <Input
      label="Minimum stay (months) *"
      type="number"
      min={1}
      max={36}
      placeholder="e.g. 3"
      hint="Tenants must stay at least this many months."
      error={errors.minimumStayMonths?.message}
      {...register('minimumStayMonths', { valueAsNumber: true })}
    />
  );
}
