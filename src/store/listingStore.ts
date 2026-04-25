import { create } from 'zustand';
import { Listing } from '@/types';

interface ListingState {
  listings: Listing[];
  visibleCount: number;
  isLoading: boolean;
  hasMore: boolean;
  
  // Actions
  setListings: (listings: Listing[]) => void;
  loadMore: () => void;
  resetPagination: () => void;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  visibleCount: 12,
  isLoading: false,
  hasMore: false,

  setListings: (listings) =>
    set({
      listings,
      hasMore: listings.length > 12,
      visibleCount: 12,
    }),
  
  loadMore: () => {
    set((state) => {
      if (state.isLoading || !state.hasMore) return state;
      
      const newCount = state.visibleCount + 12;
      return {
        visibleCount: newCount,
        hasMore: newCount < state.listings.length,
      };
    });
  },

  resetPagination: () => set({ visibleCount: 12, hasMore: true }),
}));
