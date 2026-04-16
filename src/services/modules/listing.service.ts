/**
 * listing.service.ts
 * Listing service module.
 *
 * MOCK MODE: Returns mock data with artificial delay.
 * BACKEND INTEGRATION: Replace mock functions with apiClient calls.
 *
 * Expected endpoints:
 *   GET    /listings               → Listing[]
 *   GET    /listings/:id           → Listing
 *   POST   /listings               → Listing
 *   PUT    /listings/:id           → Listing
 *   DELETE /listings/:id           → { message }
 *   GET    /listings/my            → Listing[]
 *   POST   /listings/:id/save      → { message }
 *   DELETE /listings/:id/save      → { message }
 *   GET    /listings/saved         → Listing[]
 *   POST   /listings/:id/apply     → { message }
 *   POST   /listings/:id/visit     → { message }
 */

import { Listing, ListingFilter } from '@/types';
import { MOCK_LISTINGS } from '@/mock/data/listings';
import { SAVED_LISTING_IDS } from '@/mock/data/users';

// Mock delay to simulate network latency
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export type CreateListingPayload = {
  title: string;
  type: string;
  price: number;
  location: string;
  city: string;
  spotsLeft: number;
  genderPreference: string;
  amenities: string[];
  description: string;
  phone?: string;
};

export type UpdateListingPayload = Partial<CreateListingPayload>;

export const listingService = {
  /**
   * Fetch all listings, optionally filtered.
   * BACKEND: GET /listings?city=...&type=...&minPrice=...
   */
  getListings: async (filter?: ListingFilter): Promise<Listing[]> => {
    await delay();
    let results = [...MOCK_LISTINGS];

    if (filter?.city && filter.city !== 'All') {
      results = results.filter((l) => l.city === filter.city);
    }
    if (filter?.type && filter.type !== 'All') {
      results = results.filter((l) => l.type === filter.type);
    }
    if (filter?.minPrice !== undefined) {
      results = results.filter((l) => l.price >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      results = results.filter((l) => l.price <= filter.maxPrice!);
    }
    if (filter?.genderPreference && filter.genderPreference !== 'Any') {
      results = results.filter(
        (l) => l.genderPreference === filter.genderPreference || l.genderPreference === 'Any',
      );
    }
    if (filter?.isVerified) {
      results = results.filter((l) => l.isVerified);
    }
    if (filter?.amenities && filter.amenities.length > 0) {
      results = results.filter((l) =>
        filter.amenities!.every((a) => l.amenities.includes(a as Listing['amenities'][number])),
      );
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q),
      );
    }

    return results;
  },

  /**
   * Fetch a single listing by ID.
   * BACKEND: GET /listings/:id
   */
  getListingById: async (id: string): Promise<Listing> => {
    await delay(500);
    const listing = MOCK_LISTINGS.find((l) => l.id === id);
    if (!listing) {
      throw new Error(`Listing not found: ${id}`);
    }
    return { ...listing, isSaved: SAVED_LISTING_IDS.includes(id) };
  },

  /**
   * Create a new listing.
   * BACKEND: POST /listings
   */
  createListing: async (payload: CreateListingPayload): Promise<Listing> => {
    await delay();
    const newListing: Listing = {
      id: `l${Date.now()}`,
      title: payload.title,
      location: payload.location,
      city: payload.city,
      price: payload.price,
      isVerified: false,
      spotsLeft: payload.spotsLeft,
      amenities: payload.amenities as Listing['amenities'],
      badge: 'New',
      type: payload.type as Listing['type'],
      images: ['/images/listings/placeholder.jpg'],
      description: payload.description,
      mapPlaceholder: true,
      genderPreference: payload.genderPreference as Listing['genderPreference'],
      ownerId: 'u1',
      ownerName: 'Guest User',
      ownerPhone: payload.phone,
      approvalStatus: 'PENDING',
      isSaved: false,
      createdAt: new Date().toISOString(),
    };
    return newListing;
  },

  /**
   * Update an existing listing.
   * BACKEND: PUT /listings/:id
   */
  updateListing: async (id: string, payload: UpdateListingPayload): Promise<Listing> => {
    await delay();
    const existing = MOCK_LISTINGS.find((l) => l.id === id);
    if (!existing) {
      throw new Error(`Listing not found: ${id}`);
    }
    return {
      ...existing,
      ...payload,
      amenities: (payload.amenities as Listing['amenities']) ?? existing.amenities,
      type: (payload.type as Listing['type']) ?? existing.type,
      genderPreference:
        (payload.genderPreference as Listing['genderPreference']) ?? existing.genderPreference,
    };
  },

  /**
   * Delete a listing.
   * BACKEND: DELETE /listings/:id
   */
  deleteListing: async (id: string): Promise<{ message: string }> => {
    await delay(500);
    const exists = MOCK_LISTINGS.some((l) => l.id === id);
    if (!exists) {
      throw new Error(`Listing not found: ${id}`);
    }
    return { message: 'Listing deleted successfully' };
  },

  /**
   * Fetch listings owned by the current user.
   * BACKEND: GET /listings/my
   */
  getMyListings: async (): Promise<Listing[]> => {
    await delay();
    return MOCK_LISTINGS.filter((l) => l.ownerId === 'u1');
  },

  /**
   * Save a listing to user's shortlist.
   * BACKEND: POST /listings/:id/save
   */
  saveListing: async (id: string): Promise<{ message: string }> => {
    await delay(400);
    return { message: `Listing ${id} saved successfully` };
  },

  /**
   * Remove a listing from user's shortlist.
   * BACKEND: DELETE /listings/:id/save
   */
  unsaveListing: async (id: string): Promise<{ message: string }> => {
    await delay(400);
    return { message: `Listing ${id} removed from saved` };
  },

  /**
   * Fetch all saved listings for the current user.
   * BACKEND: GET /listings/saved
   */
  getSavedListings: async (): Promise<Listing[]> => {
    await delay();
    return MOCK_LISTINGS.filter((l) => SAVED_LISTING_IDS.includes(l.id)).map((l) => ({
      ...l,
      isSaved: true,
    }));
  },

  /**
   * Apply to a listing (express interest as a tenant).
   * BACKEND: POST /listings/:id/apply
   */
  applyToListing: async (id: string, message?: string): Promise<{ message: string }> => {
    await delay();
    void message; // used in real implementation
    return { message: `Application to listing ${id} submitted successfully` };
  },

  /**
   * Book a property visit.
   * BACKEND: POST /listings/:id/visit
   */
  bookVisit: async (id: string, date: string): Promise<{ message: string }> => {
    await delay();
    return { message: `Visit booked for listing ${id} on ${date}` };
  },
};
