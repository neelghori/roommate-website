/**
 * "Who lives here" — maps `Listing.residentSnapshot` (API `listerSnapshot`).
 */
'use client';

import React from 'react';
import { User, MapPin, IndianRupee, Calendar, Cigarette, Utensils } from 'lucide-react';
import type { ListingResidentSnapshot } from '@/types';
import { formatRupees } from '@/lib/utils/format';

const PRO_LABELS: Record<string, string> = {
  student: 'Student',
  work_professional: 'Working professional',
  freelancer: 'Freelancer',
  business: 'Business',
  other: 'Other',
};

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

const DIET_LABELS: Record<string, string> = {
  vegetarian: 'Vegetarian',
  non_vegetarian: 'Non-vegetarian',
  eggetarian: 'Eggetarian',
  vegan: 'Vegan',
};

const SMOKING_LABELS: Record<string, string> = {
  non_smoker: 'Non-smoker',
  smoker: 'Smoker',
};

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone;
  return `+91 ${digits.slice(0, 2)}xxxxx${digits.slice(-3)}`;
}

function formatDateLabel(iso?: string): string {
  if (!iso) return '—';
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  return new Date(t).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

type RowProps = { label: string; value: React.ReactNode };

function Row({ label, value }: RowProps) {
  return (
    <div className="grid gap-0.5 border-b border-gray-100 py-2.5 sm:grid-cols-[140px_1fr] sm:items-start last:border-0">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-sm text-gray-900 break-words">{value ?? '—'}</div>
    </div>
  );
}

export function ListingResidentDetails({ resident }: { resident: ListingResidentSnapshot }) {
  if (!resident || Object.keys(resident).length === 0) return null;

  const diet = resident.lifestyle?.diet;
  const smoking = resident.lifestyle?.smoking;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-2">
        <User size={16} style={{ color: '#1B8F8F' }} />
        Who lives here
      </h2>
      <p className="text-xs text-gray-500 mb-3">Current resident / roommate in this property</p>
      <div>
        {resident.fullName && <Row label="Full name" value={resident.fullName} />}
        {resident.age != null && <Row label="Age" value={String(resident.age)} />}
        {resident.profileImageUrl && (
          <div className="mb-3 border-b border-gray-100 pb-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Profile</p>
            <img
              src={resident.profileImageUrl}
              alt=""
              className="h-24 w-24 rounded-full object-cover border border-gray-200"
            />
          </div>
        )}
        {resident.phone && <Row label="Phone" value={maskPhone(resident.phone)} />}
        {resident.gender && <Row label="Gender" value={GENDER_LABELS[resident.gender] ?? resident.gender} />}
        {resident.professionalType && (
          <Row label="Professional" value={PRO_LABELS[resident.professionalType] ?? resident.professionalType} />
        )}
        {resident.collegeOrCompanyName && <Row label="College / company" value={resident.collegeOrCompanyName} />}
        {resident.propertyOrPgName && (
          <Row
            label="Property / PG name"
            value={
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-gray-400 shrink-0" />
                {resident.propertyOrPgName}
              </span>
            }
          />
        )}
        {resident.monthlyRent != null && (
          <Row
            label="Monthly rent (their share)"
            value={
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: '#1B8F8F' }}>
                <IndianRupee size={14} />
                {formatRupees(resident.monthlyRent)}
              </span>
            }
          />
        )}
        {resident.securityDeposit != null && (
          <Row
            label="Security deposit"
            value={
              <span className="inline-flex items-center gap-1">
                <IndianRupee size={14} />
                {formatRupees(resident.securityDeposit)}
              </span>
            }
          />
        )}
        {(resident.moveInDate || resident.moveOutDate) && (
          <Row
            label="Move-in / move-out"
            value={
              <span className="inline-flex items-center gap-1 flex-wrap">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                {formatDateLabel(resident.moveInDate)}
                {resident.moveOutDate ? ` → ${formatDateLabel(resident.moveOutDate)}` : ''}
              </span>
            }
          />
        )}
        {(diet || smoking) && (
          <Row
            label="Lifestyle"
            value={
              <span className="flex flex-wrap items-center gap-2">
                {diet && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
                    <Utensils size={12} />
                    {DIET_LABELS[diet] ?? diet}
                  </span>
                )}
                {smoking && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    <Cigarette size={12} />
                    {SMOKING_LABELS[smoking] ?? smoking}
                  </span>
                )}
              </span>
            }
          />
        )}
        {resident.description && (
          <div className="pt-3 border-t border-gray-100 mt-2">
            <p className="text-xs font-semibold text-gray-500 mb-1">About this resident</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{resident.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}
