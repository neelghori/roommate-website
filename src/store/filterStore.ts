/**
 * filterStore.ts
 * Listing filter state management.
 */
import { create } from 'zustand';
import { ListingFilter } from '@/types';

interface FilterState {
  filters: ListingFilter;
  setFilter: (key: keyof ListingFilter, value: unknown) => void;
  setFilters: (newFilters: Partial<ListingFilter>) => void;
  resetFilters: () => void;
  setSearch: (search: string) => void;
}

const DEFAULT_FILTERS: ListingFilter = {
  type: 'All',
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),
}));
