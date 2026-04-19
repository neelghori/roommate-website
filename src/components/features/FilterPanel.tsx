/**
 * FilterPanel.tsx  –  Redesigned filter bar
 *
 * Layout:
 *   [Budget ▼]  [Amenities (n) ▼]  [Gender ▼]  [✓ Verified]
 *   ── divider ──  active chip × active chip × …  [Reset]
 *
 * Dropdowns open below the bar; clicking outside closes them.
 */
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  ChevronDown, X, SlidersHorizontal, BadgeCheck,
  Wifi, Wind, UtensilsCrossed, ShoppingBag,
  Car, Dumbbell, Shield, Zap, Eye,
} from 'lucide-react';
import { useFilterStore } from '@/store/filterStore';
import { Amenity, GenderPreference } from '@/types';

/* ─── Static data ─────────────────────────────────────────────────── */

const AMENITY_META: { key: Amenity; icon: React.ReactNode }[] = [
  { key: 'WiFi', icon: <Wifi size={13} /> },
  { key: 'AC', icon: <Wind size={13} /> },
  { key: 'Food', icon: <UtensilsCrossed size={13} /> },
  { key: 'Kitchen', icon: <UtensilsCrossed size={13} /> },
  { key: 'Laundry', icon: <ShoppingBag size={13} /> },
  { key: 'Parking', icon: <Car size={13} /> },
  { key: 'Gym', icon: <Dumbbell size={13} /> },
  { key: 'Security', icon: <Shield size={13} /> },
  { key: 'Power Backup', icon: <Zap size={13} /> },
  { key: 'CCTV', icon: <Eye size={13} /> },
];

const BUDGET_PRESETS = [
  { label: 'Under ₹5k', min: 0, max: 5000 },
  { label: '₹5k – ₹10k', min: 5000, max: 10000 },
  { label: '₹10k – ₹15k', min: 10000, max: 15000 },
  { label: '₹15k – ₹25k', min: 15000, max: 25000 },
  { label: 'Above ₹25k', min: 25000, max: 200000 },
];

const GENDER_OPTIONS: GenderPreference[] = ['Male', 'Female', 'Any'];

/* ─── Small helpers ───────────────────────────────────────────────── */

/** Teal pill shown when a filter value is active */
function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className={[
        'flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-primary',
      ].join(' ')}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="hover:opacity-70 transition-opacity ml-0.5"
      >
        <X size={10} />
      </button>
    </span>
  );
}

/** The small trigger button that opens a dropdown */
function TriggerBtn({
  label,
  count = 0,
  isOpen,
  onClick,
}: {
  label: string;
  count?: number;
  isOpen: boolean;
  onClick: () => void;
}) {
  const active = count > 0;
  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      className={[
        'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150',
        active || isOpen
          ? 'bg-primary text-white border-transparent shadow-sm'
          : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-700',
      ].join(' ')}
    >
      {label}
      {active && count > 0 && (
        <span className="bg-white/30 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
          {count}
        </span>
      )}
      <ChevronDown
        size={12}
        className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </button>
  );
}

/* ─── Main component ──────────────────────────────────────────────── */

export const FilterPanel: React.FC = () => {
  const { filters, setFilter, setFilters, resetFilters } = useFilterStore();
  const [openDropdown, setOpenDropdown] = useState<'budget' | 'amenities' | 'gender' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openDropdown]);

  const toggle = (name: 'budget' | 'amenities' | 'gender') =>
    setOpenDropdown((prev) => (prev === name ? null : name));

  /* ── helpers ── */
  const activeAmenities = (filters.amenities ?? []) as Amenity[];

  const toggleAmenity = useCallback(
    (amenity: Amenity) => {
      const curr = (filters.amenities ?? []) as Amenity[];
      setFilter(
        'amenities',
        curr.includes(amenity) ? curr.filter((a) => a !== amenity) : [...curr, amenity],
      );
    },
    [filters.amenities, setFilter],
  );

  const toggleGender = (g: GenderPreference) =>
    setFilter('genderPreference', filters.genderPreference === g ? undefined : g);

  const toggleVerified = () =>
    setFilter('isVerified', filters.isVerified ? undefined : true);

  const clearBudget = () => setFilters({ minPrice: undefined, maxPrice: undefined });
  const clearCity = () => setFilter('city', undefined);

  const applyBudget = (min: number, max: number) => {
    if (filters.minPrice === min && filters.maxPrice === max) clearBudget();
    else setFilters({ minPrice: min, maxPrice: max });
  };

  const hasBudget = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const hasAnyFilter =
    hasBudget ||
    activeAmenities.length > 0 ||
    !!filters.genderPreference ||
    !!filters.isVerified ||
    !!filters.city;

  /* Active budget label */
  const activeBudgetLabel = hasBudget
    ? BUDGET_PRESETS.find(
      (p) => p.min === filters.minPrice && p.max === filters.maxPrice,
    )?.label ?? 'Custom'
    : null;

  return (
    <div ref={barRef} className="relative">

      {/* ── Trigger row ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-1">

        {/* Budget */}
        <TriggerBtn
          label="Budget"
          count={hasBudget ? 1 : 0}
          isOpen={openDropdown === 'budget'}
          onClick={() => toggle('budget')}
        />

        {/* Amenities */}
        <TriggerBtn
          label="Amenities"
          count={activeAmenities.length}
          isOpen={openDropdown === 'amenities'}
          onClick={() => toggle('amenities')}
        />

        {/* Gender */}
        <TriggerBtn
          label="Gender"
          count={filters.genderPreference ? 1 : 0}
          isOpen={openDropdown === 'gender'}
          onClick={() => toggle('gender')}
        />

        {/* Verified toggle (no dropdown) */}
        <button
          onClick={toggleVerified}
          aria-pressed={!!filters.isVerified}
          className={[
            'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150',
            filters.isVerified
              ? 'bg-primary text-white border-transparent shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400 hover:text-teal-700',
          ].join(' ')}
        >
          <BadgeCheck size={12} />
          Verified
        </button>

        {/* ── Active chips + divider ── */}
        {hasAnyFilter && (
          <>
            <div className="flex-shrink-0 w-px h-5 bg-gray-200 mx-1" />

            {activeBudgetLabel && (
              <ActiveChip label={activeBudgetLabel} onRemove={clearBudget} />
            )}
            {filters.city && (
              <ActiveChip label={filters.city} onRemove={clearCity} />
            )}
            {activeAmenities.map((a) => (
              <ActiveChip key={a} label={a} onRemove={() => toggleAmenity(a)} />
            ))}
            {filters.genderPreference && (
              <ActiveChip
                label={filters.genderPreference}
                onRemove={() => setFilter('genderPreference', undefined)}
              />
            )}
            {filters.isVerified && (
              <ActiveChip label="Verified" onRemove={() => setFilter('isVerified', undefined)} />
            )}

            {/* Reset all */}
            <button
              onClick={resetFilters}
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors ml-1"
            >
              <SlidersHorizontal size={10} />
              Reset
            </button>
          </>
        )}
      </div>

      {/* ── Dropdown panels ──────────────────────────────────────── */}
      {openDropdown && (
        <div className="absolute left-4 top-full mt-2 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 min-w-[260px] max-w-[340px]">

          {/* Budget panel */}
          {openDropdown === 'budget' && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Budget Range</p>
              <div className="flex flex-col gap-2">
                {BUDGET_PRESETS.map((p) => {
                  const active = filters.minPrice === p.min && filters.maxPrice === p.max;
                  return (
                    <button
                      key={p.label}
                      onClick={() => { applyBudget(p.min, p.max); setOpenDropdown(null); }}
                      className={[
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition-all',
                        active
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-teal-300 hover:bg-teal-50',
                      ].join(' ')}
                    >
                      <span>{p.label}</span>
                      {active && <X size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Amenities panel */}
          {openDropdown === 'amenities' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amenities</p>
                {activeAmenities.length > 0 && (
                  <button
                    onClick={() => setFilter('amenities', [])}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AMENITY_META.map(({ key, icon }) => {
                  const active = activeAmenities.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleAmenity(key)}
                      className={[
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all',
                        active
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-teal-300 hover:bg-teal-50',
                      ].join(' ')}
                    >
                      <span className={active ? 'text-white' : 'text-gray-400'}>{icon}</span>
                      {key}
                    </button>
                  );
                })}
              </div>
              {activeAmenities.length > 0 && (
                <button
                  onClick={() => setOpenDropdown(null)}
                  className="mt-3 w-full py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 bg-primary"
                >
                  Apply ({activeAmenities.length} selected)
                </button>
              )}
            </div>
          )}

          {/* Gender panel */}
          {openDropdown === 'gender' && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Gender Preference</p>
              <div className="flex flex-col gap-2">
                {GENDER_OPTIONS.map((g) => {
                  const active = filters.genderPreference === g;
                  const emoji = g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🤝';
                  return (
                    <button
                      key={g}
                      onClick={() => { toggleGender(g); setOpenDropdown(null); }}
                      className={[
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all',
                        active
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-gray-50 text-gray-700 border-gray-100 hover:border-teal-300 hover:bg-teal-50',
                      ].join(' ')}
                    >
                      <span>{emoji}</span>
                      <span>{g === 'Any' ? 'Any gender' : `${g} only`}</span>
                      {active && <X size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
