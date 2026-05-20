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
/** `Rent` = legacy API `room`; not offered on new listing forms. */
export type ListingType =
  | 'PG'
  | 'Rent'
  | 'Flat'
  | 'Roommate'
  | 'CoWorkingSpace'
  | 'House';

/** Preferred occupant categories (multi-select); maps to API `peopleTypes`. */
export type ListingPeopleType = 'Bachelor' | 'Working' | 'Family' | 'Student';

/** Furnishing level; maps to API `furnishing`. */
export type ListingFurnishing = 'Unfurnished' | 'SemiFurnished' | 'FullyFurnished';
export type ListingApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'ON_HOLD';

/** Who lives here maps to backend `Property.listerSnapshot`. */
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

/** One amenity on a listing `iconKey` matches admin catalogue (`wifi`, `tv`, …). */
export interface ListingAmenityChip {
  name: string;
  iconKey?: string;
}

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
  /** Starting rent (API `rentRange.min`). */
  price: number;
  /** Upper rent when room types differ (API `rentRange.max`). */
  maxPrice?: number;
  isVerified: boolean;
  /** Staff-set badge from API; show even when `isVerified` is false. */
  verificationBadge?: ListingVerificationBadge;
  spotsLeft: number;
  /** PG only — minimum months a tenant must stay. */
  minimumStayMonths?: number;
  /** Amenity labels + optional `iconKey` from master / populated `amenityIds`. */
  amenities: ListingAmenityChip[];
  badge: ListingStatus;
  type: ListingType;
  furnishing?: ListingFurnishing;
  /** Suitable for (subset of bachelor / working / family). */
  peopleTypes?: ListingPeopleType[];
  images: string[];
  description: string;
  /** Optional property tour video (YouTube). */
  youtubeUrl?: string;
  /** Current residents / roommates (optional). Prefer this over `residentSnapshot`. */
  residentSnapshots?: ListingResidentSnapshot[];
  /** First resident only same as `residentSnapshots?.[0]` when populated from API. */
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
  /** City name passed to API and matched loosely on `city` / address text client-side. */
  city?: string;
  /** Locality / area (e.g. Satellite) substring match on title + location. */
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
