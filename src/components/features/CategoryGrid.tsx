/**
 * CategoryGrid.tsx
 * "Browse by Category" grid from the Explore mockup.
 *
 * - 3-column grid of category cards
 * - Each card: emoji icon, label, count badge
 * - White card with rounded corners, center-aligned
 * - On click: filter listings by that category
 */
'use client';

import React from 'react';
import { Category, ListingType } from '@/types';
import { useFilterStore } from '@/store/filterStore';
import { CATEGORIES } from '@/mock/data';

interface CategoryGridProps {
  categories?: Category[];
  /** Called when a category is selected */
  onSelect?: (type: ListingType) => void;
  /** Currently selected type */
  selectedType?: ListingType | 'All';
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories = CATEGORIES,
  onSelect,
  selectedType,
}) => {
  const { filters, setFilter } = useFilterStore();
  const activeType = selectedType ?? filters.type;

  const handleSelect = (category: Category) => {
    const type = category.label;
    const next = activeType === type ? 'All' : type;
    setFilter('type', next);
    onSelect?.(type);
  };

  return (
    <div
      className="grid grid-cols-3 gap-3"
      role="list"
      aria-label="Browse by category"
    >
      {categories.map((category) => {
        const isActive = activeType === category.label;
        return (
          <button
            key={category.id}
            onClick={() => handleSelect(category)}
            role="listitem"
            aria-pressed={isActive}
            className={[
              'flex flex-col items-center justify-center gap-2 p-3 bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-md',
              isActive ? 'border-transparent' : 'border-transparent hover:border-teal-200',
            ].join(' ')}
            style={isActive ? { borderColor: '#1B8F8F', backgroundColor: '#EDF5F5' } : undefined}
          >
            {/* Emoji icon */}
            <span
              className="text-2xl leading-none"
              aria-hidden="true"
              role="img"
            >
              {category.icon}
            </span>

            {/* Label */}
            <span
              className={[
                'text-xs font-semibold text-center leading-tight',
                isActive ? '' : 'text-gray-700',
              ].join(' ')}
              style={isActive ? { color: '#1B8F8F' } : undefined}
            >
              {category.label}
            </span>

            {/* Count badge */}
            <span
              className={[
                'text-[10px] font-medium px-2 py-0.5 rounded-full',
                isActive ? 'text-white' : 'text-gray-500 bg-gray-100',
              ].join(' ')}
              style={isActive ? { backgroundColor: '#1B8F8F' } : undefined}
              aria-label={`${category.count} ${category.unit}`}
            >
              {category.count} {category.unit === 'profiles' ? 'profiles' : 'listings'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
