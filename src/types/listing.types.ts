/**
 * listing.types.ts
 * Listing domain types. Backend: map to Listing Prisma model.
 */

import type { GenderPreference } from './user.types';
export type { GenderPreference };

export type ListingStatus = 'Hot' | 'Limited Offer' | 'New' | null;
/** Matches backend `Property.verificationBadge`. */
export type ListingVerificationBadge =
  | 'none'
  | 'id_verified'
  | 'property_verified'
  | 'premium';
export type ListingType = 'PG' | 'Rent' | 'Roommate' | 'Studio' | 'Bachelor' | 'Family';
export type ListingApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';

/** Who lives here — maps to backend `Property.listerSnapshot`. */
export interface ListingResidentSnapshot {
  /** Mongo subdocument `_id` when stored in `listerSnapshots` (required for PATCH/DELETE). */
  id?: string;
  fullName?: string;
  age?: number;
  profileImageUrl?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  professionalType?: 'student' | 'work_professional' | 'freelancer' | 'business' | 'other';
  collegeOrCompanyName?: string;
  propertyOrPgName?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  moveInDate?: string;
  moveOutDate?: string;
  roomPhotoUrls?: string[];
  description?: string;
  lifestyle?: {
    diet?: 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan';
    smoking?: 'non_smoker' | 'smoker';
  };
}

/** Known amenity keys for filter icons (filters still accept any string from master). */
export type Amenity = 'WiFi' | 'AC' | 'Kitchen' | 'Food' | 'Laundry' | 'Parking' | 'Gym' | 'Security' | 'Power Backup' | 'CCTV';

export interface Listing {
  id: string;
  title: string;
  /** Primary address line (maps to API address.line1). */
  location: string;
  city: string;
  addressLine2?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  formattedAddress?: string;
  price: number;
  isVerified: boolean;
  /** Staff-set badge from API; show even when `isVerified` is false. */
  verificationBadge?: ListingVerificationBadge;
  spotsLeft: number;
  /** Amenity display names from master collection (populated `amenityIds`). */
  amenities: string[];
  badge: ListingStatus;
  type: ListingType;
  images: string[];
  description: string;
  /** Current residents / roommates (optional). Prefer this over `residentSnapshot`. */
  residentSnapshots?: ListingResidentSnapshot[];
  /** First resident only — same as `residentSnapshots?.[0]` when populated from API. */
  residentSnapshot?: ListingResidentSnapshot;
  mapPlaceholder: boolean;
  genderPreference: GenderPreference;
  ownerId: string;
  ownerName: string;
  ownerPhone?: string;
  approvalStatus: ListingApprovalStatus;
  /** Set when staff rejects a listing (shown to the owner). */
  rejectionReason?: string;
  isSaved?: boolean;
  createdAt: string;
}

export interface ListingFilter {
  /** When set with `nearLongitude`, the API filters by Mongo `$near` (meters cap from `radiusKm`). */
  nearLatitude?: number;
  nearLongitude?: number;
  /** Search radius in km (API default 10; capped at 100). */
  radiusKm?: number;
  /** City name — passed to API and matched loosely on `city` / address text client-side. */
  city?: string;
  /** Locality / area (e.g. Satellite) — substring match on title + location. */
  area?: string;
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
