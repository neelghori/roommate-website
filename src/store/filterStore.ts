/**
 * filterStore.ts
 * Listing filter state management.
 */
import { create } from 'zustand';
import { ListingFilter } from '@/types';

interface FilterState {
  filters: ListingFilter;
  setFilter: (key: keyof ListingFilter, value: unknown) => void;
  resetFilters: () => void;
  setSearch: (search: string) => void;
}

const DEFAULT_FILTERS: ListingFilter = {
  city: 'Ahmedabad',
  type: 'All',
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),
}));
