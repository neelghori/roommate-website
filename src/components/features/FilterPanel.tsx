/**
 * FilterPanel.tsx
 * Horizontal scrollable filter chips for listing filters.
 * Connects to filterStore for state management.
 *
 * From mockup: "Budget ▼", city chip with ×, amenity chips, gender chips, "Verified"
 * - Active/applied filters show "×" to remove
 * - Budget opens a min/max dropdown
 * - Tapping an amenity/gender chip toggles it
 */
'use client';

import React, { useRef, useState } from 'react';
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { Amenity, GenderPreference } from '@/types';

const AMENITY_CHIPS: Amenity[] = ['WiFi', 'AC', 'Food', 'Laundry', 'Parking', 'Gym', 'Kitchen', 'Security'];
const GENDER_CHIPS: GenderPreference[] = ['Male', 'Female'];

const BUDGET_PRESETS = [
  { label: 'Under ₹5k', min: 0, max: 5000 },
  { label: '₹5k–₹10k', min: 5000, max: 10000 },
  { label: '₹10k–₹15k', min: 10000, max: 15000 },
  { label: '₹15k–₹25k', min: 15000, max: 25000 },
  { label: 'Above ₹25k', min: 25000, max: 200000 },
];

export const FilterPanel: React.FC = () => {
  const { filters, setFilter, resetFilters } = useFilterStore();
  const [budgetOpen, setBudgetOpen] = useState(false);
  const budgetRef = useRef<HTMLDivElement>(null);

  // ── helpers ──────────────────────────────────────────────────────────
  const toggleAmenity = (amenity: Amenity) => {
    const current = (filters.amenities ?? []) as Amenity[];
    if (current.includes(amenity)) {
      setFilter('amenities', current.filter((a) => a !== amenity));
    } else {
      setFilter('amenities', [...current, amenity]);
    }
  };

  const toggleGender = (gender: GenderPreference) => {
    if (filters.genderPreference === gender) {
      setFilter('genderPreference', undefined);
    } else {
      setFilter('genderPreference', gender);
    }
  };

  const toggleVerified = () => {
    setFilter('isVerified', filters.isVerified ? undefined : true);
  };

  const clearCity = () => setFilter('city', undefined);
  const clearBudget = () => {
    setFilter('minPrice', undefined);
    setFilter('maxPrice', undefined);
  };

  const applyBudget = (min: number, max: number) => {
    setFilter('minPrice', min);
    setFilter('maxPrice', max);
    setBudgetOpen(false);
  };

  const budgetLabel =
    filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? `₹${(filters.minPrice ?? 0).toLocaleString('en-IN')} – ₹${(filters.maxPrice ?? 200000).toLocaleString('en-IN')}`
      : 'Budget';

  const hasBudget = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const activeAmenities = (filters.amenities ?? []) as Amenity[];

  // Check if any filter is active (beyond default city)
  const hasAnyFilter =
    hasBudget ||
    activeAmenities.length > 0 ||
    filters.genderPreference !== undefined ||
    filters.isVerified ||
    filters.city !== undefined;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 px-4">
        {/* Reset all — only visible when filters are active */}
        {hasAnyFilter && (
          <button
            onClick={resetFilters}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
            aria-label="Reset all filters"
          >
            <SlidersHorizontal size={11} />
            Reset
          </button>
        )}

        {/* Budget chip */}
        <div className="relative flex-shrink-0" ref={budgetRef}>
          <button
            onClick={() => setBudgetOpen((o) => !o)}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              hasBudget
                ? 'text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400',
            ].join(' ')}
            style={hasBudget ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' } : undefined}
            aria-expanded={budgetOpen}
            aria-haspopup="listbox"
          >
            {budgetLabel}
            {hasBudget ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  clearBudget();
                }}
                className="hover:opacity-70"
                aria-label="Clear budget filter"
              >
                <X size={11} />
              </span>
            ) : (
              <ChevronDown size={11} />
            )}
          </button>

          {/* Budget dropdown */}
          {budgetOpen && (
            <div
              className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-30 w-44 py-1"
              role="listbox"
              aria-label="Budget presets"
            >
              {BUDGET_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  role="option"
                  aria-selected={
                    filters.minPrice === preset.min && filters.maxPrice === preset.max
                  }
                  onClick={() => applyBudget(preset.min, preset.max)}
                  className={[
                    'w-full text-left text-xs px-3 py-2 hover:bg-gray-50 transition-colors',
                    filters.minPrice === preset.min && filters.maxPrice === preset.max
                      ? 'font-semibold'
                      : 'text-gray-700',
                  ].join(' ')}
                  style={
                    filters.minPrice === preset.min && filters.maxPrice === preset.max
                      ? { color: '#1B8F8F' }
                      : undefined
                  }
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City chip (if set) */}
        {filters.city && (
          <button
            onClick={clearCity}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white border-transparent transition-colors"
            style={{ backgroundColor: '#1B8F8F' }}
            aria-label={`Remove city filter: ${filters.city}`}
          >
            {filters.city}
            <X size={11} />
          </button>
        )}

        {/* Amenity chips */}
        {AMENITY_CHIPS.map((amenity) => {
          const active = activeAmenities.includes(amenity);
          return (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400',
              ].join(' ')}
              style={active ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' } : undefined}
              aria-pressed={active}
            >
              {amenity}
              {active && <X size={11} />}
            </button>
          );
        })}

        {/* Gender chips */}
        {GENDER_CHIPS.map((gender) => {
          const active = filters.genderPreference === gender;
          return (
            <button
              key={gender}
              onClick={() => toggleGender(gender)}
              className={[
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                active
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400',
              ].join(' ')}
              style={active ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' } : undefined}
              aria-pressed={active}
            >
              {gender}
              {active && <X size={11} />}
            </button>
          );
        })}

        {/* Verified chip */}
        <button
          onClick={toggleVerified}
          className={[
            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            filters.isVerified
              ? 'text-white border-transparent'
              : 'bg-white text-gray-700 border-gray-200 hover:border-teal-400',
          ].join(' ')}
          style={
            filters.isVerified
              ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' }
              : undefined
          }
          aria-pressed={!!filters.isVerified}
        >
          Verified
          {filters.isVerified && <X size={11} />}
        </button>
      </div>

      {/* Close budget dropdown on outside click */}
      {budgetOpen && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setBudgetOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
