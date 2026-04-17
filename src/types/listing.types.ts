/**
 * listing.types.ts
 * Listing domain types. Backend: map to Listing Prisma model.
 */

import type { GenderPreference } from './user.types';
export type { GenderPreference };

export type ListingStatus = 'Hot' | 'Limited Offer' | 'New' | null;
export type ListingType = 'PG' | 'Rent' | 'Roommate' | 'Studio' | 'Bachelor' | 'Family';
export type ListingApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';

export type Amenity = 'WiFi' | 'AC' | 'Kitchen' | 'Food' | 'Laundry' | 'Parking' | 'Gym' | 'Security' | 'Power Backup' | 'CCTV';

export interface Listing {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  isVerified: boolean;
  spotsLeft: number;
  amenities: Amenity[];
  badge: ListingStatus;
  type: ListingType;
  images: string[];
  description: string;
  mapPlaceholder: boolean;
  genderPreference: GenderPreference;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  approvalStatus: ListingApprovalStatus;
  isSaved?: boolean;
  createdAt: string;
}

export interface ListingFilter {
  city?: string;
  type?: ListingType | 'All';
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  genderPreference?: GenderPreference | 'Any';
  isVerified?: boolean;
  search?: string;
}

export interface Category {
  id: string;
  label: ListingType;
  icon: string;
  count: number;
  unit: 'listings' | 'profiles';
}
