/**
 * listing.service.ts Property API (/api/v1/properties).
 * Property API (/api/v1/properties). Listings can be visible while pending; staff-approved listings show verified UI.
 */

import { isAxiosError } from 'axios';
import type {
  GenderPreference,
  Listing,
  ListingAmenityChip,
  ListingFilter,
  ListingFurnishing,
  ListingPeopleType,
  ListingResidentSnapshot,
  ListingType,
  ListingVerificationBadge,
} from '@/types';
import { isAmenityIconKey } from '@/lib/amenities/amenity-icon';
import { apiClient } from '@/services/api';
import { postMultipartForm } from '@/services/uploadForm';
import { authApiErrorMessage } from '@/services/modules/auth.service';
import { amenityService } from '@/services/modules/amenity.service';
import { hasMapCoordinates } from '@/lib/googleMapsEmbed';
import { mapFurnishingFromApi, mapFurnishingToApi } from '@/lib/furnishing';
import {
  resolveListingRentRange,
  type ListingFormData,
} from '@/lib/validations/listing.schema';
import {
  EMPTY_LISTING_RESIDENT,
  type ListingResidentFormData,
  listingResidentFormSchema,
} from '@/lib/validations/listingResident.schema';

function apiErr(err: unknown, fallback: string): string {
  return authApiErrorMessage(err, fallback);
}

const UI_TO_API_LISTING_TYPE: Partial<Record<ListingType | string, string>> = {
  PG: 'pg',
  Rent: 'room',
  Flat: 'flat',
  Roommate: 'roommate_seeker',
  CoWorkingSpace: 'coworking_space',
  House: 'house',
};

const API_TO_UI_LISTING_TYPE: Record<string, ListingType> = {
  pg: 'PG',
  flat: 'Flat',
  room: 'Rent',
  roommate_seeker: 'Roommate',
  coworking_space: 'CoWorkingSpace',
  house: 'House',
};

function mapGenderToApi(pref: GenderPreference | string): string {
  if (pref === 'Male') return 'male';
  if (pref === 'Female') return 'female';
  return 'any';
}

function mapGenderFromApi(v: string | undefined): GenderPreference {
  if (v === 'male') return 'Male';
  if (v === 'female') return 'Female';
  return 'Any';
}

const API_TO_UI_PEOPLE_TYPE: Record<string, ListingPeopleType> = {
  bachelor: 'Bachelor',
  working: 'Working',
  family: 'Family',
  student: 'Student',
};

function mapPeopleTypesFromApi(raw: unknown): ListingPeopleType[] {
  if (!Array.isArray(raw)) return [];
  const out: ListingPeopleType[] = [];
  for (const x of raw) {
    if (typeof x !== 'string') continue;
    const u = API_TO_UI_PEOPLE_TYPE[x.toLowerCase()];
    if (u && !out.includes(u)) out.push(u);
  }
  return out;
}

function mapPeopleTypesToApi(types: ListingPeopleType[]): string[] {
  return [...new Set(types.map((t) => t.toLowerCase()))];
}

const RESIDENT_PRO_TYPES = new Set([
  'student',
  'work_professional',
  'freelancer',
  'business',
  'other',
]);
const RESIDENT_GENDERS = new Set(['male', 'female', 'other']);
const RESIDENT_DIETS = new Set(['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan']);
const RESIDENT_SMOKING = new Set(['non_smoker', 'smoker']);

export function mapListerSnapshotFromApi(raw: unknown): ListingResidentSnapshot | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const str = (k: string) => (typeof o[k] === 'string' ? (o[k] as string).trim() : undefined);
  const num = (k: string) =>
    typeof o[k] === 'number' && !Number.isNaN(o[k] as number) ? (o[k] as number) : undefined;
  let lifestyle: ListingResidentSnapshot['lifestyle'];
  if (o.lifestyle && typeof o.lifestyle === 'object') {
    const L = o.lifestyle as Record<string, unknown>;
    const diet = typeof L.diet === 'string' && RESIDENT_DIETS.has(L.diet) ? L.diet : undefined;
    const smoking =
      typeof L.smoking === 'string' && RESIDENT_SMOKING.has(L.smoking) ? L.smoking : undefined;
    if (diet || smoking) {
      lifestyle = {
        ...(diet ? { diet: diet as NonNullable<ListingResidentSnapshot['lifestyle']>['diet'] } : {}),
        ...(smoking
          ? { smoking: smoking as NonNullable<ListingResidentSnapshot['lifestyle']>['smoking'] }
          : {}),
      };
    }
  }
  const moveIn =
    o.moveInDate instanceof Date
      ? o.moveInDate.toISOString()
      : typeof o.moveInDate === 'string'
        ? o.moveInDate
        : undefined;
  const moveOut =
    o.moveOutDate instanceof Date
      ? o.moveOutDate.toISOString()
      : typeof o.moveOutDate === 'string'
        ? o.moveOutDate
        : undefined;
  const snap: ListingResidentSnapshot = {};
  if (o._id != null) snap.id = typeof o._id === 'string' ? o._id : String(o._id);
  if (str('fullName')) snap.fullName = str('fullName');
  const age = num('age');
  if (age != null) snap.age = age;
  if (str('profileImageUrl')) snap.profileImageUrl = str('profileImageUrl');
  if (str('phone')) snap.phone = str('phone');
  const g = str('gender');
  if (g && RESIDENT_GENDERS.has(g)) snap.gender = g as ListingResidentSnapshot['gender'];
  const pt = str('professionalType');
  if (pt && RESIDENT_PRO_TYPES.has(pt)) snap.professionalType = pt as ListingResidentSnapshot['professionalType'];
  if (str('collegeOrCompanyName')) snap.collegeOrCompanyName = str('collegeOrCompanyName');
  if (str('propertyOrPgName')) snap.propertyOrPgName = str('propertyOrPgName');
  const mr = num('monthlyRent');
  if (mr != null) snap.monthlyRent = mr;
  const sd = num('securityDeposit');
  if (sd != null) snap.securityDeposit = sd;
  if (moveIn) snap.moveInDate = moveIn;
  if (moveOut) snap.moveOutDate = moveOut;
  if (str('description')) snap.description = str('description');
  if (lifestyle) snap.lifestyle = lifestyle;
  return Object.keys(snap).length > 0 ? snap : undefined;
}

/** Max residents per listing (matches API Joi). */
export const MAX_LISTING_RESIDENTS = 20;

function mapResidentsFromProperty(p: Record<string, unknown>): ListingResidentSnapshot[] {
  const arr = p.listerSnapshots;
  if (Array.isArray(arr) && arr.length > 0) {
    const out: ListingResidentSnapshot[] = [];
    for (const item of arr) {
      if (item && typeof item === 'object') {
        const s = mapListerSnapshotFromApi(item as Record<string, unknown>);
        if (s) out.push(s);
      }
    }
    return out;
  }
  const single = mapListerSnapshotFromApi(p.listerSnapshot);
  return single ? [single] : [];
}

function trimStr(s: string | undefined): string {
  return (s ?? '').trim();
}

function toIsoDate(value: string | undefined): string | undefined {
  const t = trimStr(value);
  if (!t) return undefined;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

function hasResidentFormPayload(r: ListingResidentFormData): boolean {
  if (!r) return false;
  if (trimStr(r.fullName)) return true;
  if (r.age != null && Number.isFinite(r.age)) return true;
  if (trimStr(r.phone)) return true;
  if (trimStr(r.gender)) return true;
  if (trimStr(r.professionalType)) return true;
  if (trimStr(r.collegeOrCompanyName)) return true;
  if (r.monthlyRent != null && Number.isFinite(r.monthlyRent)) return true;
  if (r.securityDeposit != null && Number.isFinite(r.securityDeposit)) return true;
  if (trimStr(r.moveInDate)) return true;
  if (trimStr(r.moveOutDate)) return true;
  if (trimStr(r.description)) return true;
  if (trimStr(r.diet)) return true;
  if (trimStr(r.smoking)) return true;
  return false;
}

function shouldPersistResidentSnapshot(
  r: ListingResidentFormData,
  ctx: { profileImageUrl?: string | null },
): boolean {
  if (hasResidentFormPayload(r)) return true;
  if (ctx.profileImageUrl !== undefined && ctx.profileImageUrl !== null && trimStr(ctx.profileImageUrl)) {
    return true;
  }
  return false;
}

/** Map API / listing snapshot into wizard form defaults. */
export function listingResidentToFormData(
  snap: ListingResidentSnapshot | undefined,
): ListingResidentFormData {
  const base = { ...EMPTY_LISTING_RESIDENT };
  if (!snap) return base;
  return {
    ...base,
    fullName: snap.fullName ?? '',
    age: snap.age,
    phone: snap.phone ?? '',
    gender: snap.gender ?? '',
    professionalType: snap.professionalType ?? '',
    collegeOrCompanyName: snap.collegeOrCompanyName ?? '',
    monthlyRent: snap.monthlyRent,
    securityDeposit: snap.securityDeposit,
    moveInDate: snap.moveInDate ? snap.moveInDate.slice(0, 10) : '',
    moveOutDate: snap.moveOutDate ? snap.moveOutDate.slice(0, 10) : '',
    description: snap.description ?? '',
    diet: snap.lifestyle?.diet ?? '',
    smoking: snap.lifestyle?.smoking ?? '',
  };
}

export type UpdateListingResidentSnapshotOptions = {
  /** Listing title from the property stored as `propertyOrPgName` on the snapshot. */
  listingTitle: string;
  /** Persisted profile image URL, or `null` to clear. Omit / `undefined` to leave unchanged. */
  profileImageUrl?: string | null;
};

function buildListerSnapshotPayload(
  resident: ListingResidentFormData,
  ctx: UpdateListingResidentSnapshotOptions,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (trimStr(resident.fullName)) out.fullName = trimStr(resident.fullName);
  if (resident.age != null && Number.isFinite(resident.age)) out.age = resident.age;
  const ph = trimStr(resident.phone).replace(/\D/g, '');
  if (ph.length >= 10) out.phone = ph.slice(-10);
  if (trimStr(resident.gender)) out.gender = trimStr(resident.gender);
  if (trimStr(resident.professionalType)) out.professionalType = trimStr(resident.professionalType);
  if (trimStr(resident.collegeOrCompanyName)) out.collegeOrCompanyName = trimStr(resident.collegeOrCompanyName);
  if (resident.monthlyRent != null && Number.isFinite(resident.monthlyRent)) out.monthlyRent = resident.monthlyRent;
  if (resident.securityDeposit != null && Number.isFinite(resident.securityDeposit)) {
    out.securityDeposit = resident.securityDeposit;
  }
  const mi = toIsoDate(resident.moveInDate);
  if (mi) out.moveInDate = mi;
  const mo = toIsoDate(resident.moveOutDate);
  if (mo) out.moveOutDate = mo;
  if (trimStr(resident.description)) out.description = trimStr(resident.description);
  const diet = trimStr(resident.diet);
  const smoking = trimStr(resident.smoking);
  if (diet || smoking) {
    const life: Record<string, string> = {};
    if (diet) life.diet = diet;
    if (smoking) life.smoking = smoking;
    out.lifestyle = life;
  }

  if (ctx.profileImageUrl === null) {
    out.profileImageUrl = null;
  } else if (ctx.profileImageUrl !== undefined && trimStr(ctx.profileImageUrl)) {
    out.profileImageUrl = trimStr(ctx.profileImageUrl);
  }

  const keysAfterProfile = Object.keys(out);
  if (
    keysAfterProfile.length === 1 &&
    keysAfterProfile[0] === 'profileImageUrl' &&
    out.profileImageUrl === null
  ) {
    return {};
  }

  const title = trimStr(ctx.listingTitle).slice(0, 200);
  if (Object.keys(out).length > 0 && title) {
    out.propertyOrPgName = title;
  }

  if (Object.keys(out).length > 0) {
    out.roomPhotoUrls = [];
  }

  return out;
}

/** Build one API subdocument from the resident form (used by the listing resident modal). */
export function buildResidentApiPayloadFromForm(
  resident: ListingResidentFormData,
  options: UpdateListingResidentSnapshotOptions,
): Record<string, unknown> {
  if (!shouldPersistResidentSnapshot(resident, options)) return {};
  return buildListerSnapshotPayload(resident, options);
}

function amenityNameMatch(apiName: string, ui: string): boolean {
  return apiName.trim().toLowerCase() === ui.trim().toLowerCase();
}

export async function resolveAmenityIdsFromLabels(labels: string[]): Promise<string[]> {
  const items = await amenityService.list();
  const ids: string[] = [];
  for (const label of labels) {
    const hit = items.find((a) => amenityNameMatch(a.name, label));
    if (hit?._id) ids.push(hit._id);
  }
  return ids;
}

const API_VERIFICATION_BADGES = new Set<ListingVerificationBadge>([
  'none',
  'id_verified',
  'property_verified',
  'premium',
]);

function mapVerificationBadge(raw: unknown): ListingVerificationBadge {
  if (typeof raw === 'string' && API_VERIFICATION_BADGES.has(raw as ListingVerificationBadge)) {
    return raw as ListingVerificationBadge;
  }
  return 'none';
}

/** Show verification when staff approved the listing, API verified flag is set, or a badge is assigned. */
export function listingHasVerification(
  l: Pick<Listing, 'isVerified' | 'verificationBadge' | 'approvalStatus'>,
): boolean {
  if (l.approvalStatus === 'APPROVED') return true;
  if (l.isVerified) return true;
  return Boolean(l.verificationBadge && l.verificationBadge !== 'none');
}

/**
 * Staff-approved listing without `isVerified` or a specific API badge — show Meta-style blue “verified”.
 * (ID / property / premium badges and `isVerified` keep the default teal/green pill.)
 */
export function listingVerificationCompanyStyle(
  l: Pick<Listing, 'isVerified' | 'verificationBadge' | 'approvalStatus'>,
): boolean {
  if (l.approvalStatus !== 'APPROVED') return false;
  if (l.isVerified) return false;
  const b = l.verificationBadge;
  if (b && b !== 'none') return false;
  return true;
}

/** Label for the verification pill (detail page, cards, modal). */
export function listingVerificationLabel(
  l: Pick<Listing, 'isVerified' | 'verificationBadge' | 'approvalStatus'>,
): string {
  const b = l.verificationBadge;
  if (b === 'id_verified') return 'ID verified';
  if (b === 'property_verified') return 'Property verified';
  if (b === 'premium') return 'Premium';
  if (l.isVerified) return 'Verified';
  if (l.approvalStatus === 'APPROVED') return 'verified';
  return 'Verified';
}

function approvalFromProperty(p: Record<string, unknown>): Listing['approvalStatus'] {
  const mod = p.moderationStatus as string | undefined;
  const pub = Boolean(p.isPublished);
  if (mod === 'rejected') return 'REJECTED';
  if (mod === 'on_hold') return 'ON_HOLD';
  if (mod === 'under_review') return 'UNDER_REVIEW';
  if (mod === 'approved' && pub) return 'APPROVED';
  if (mod === 'pending') return 'PENDING';
  if (mod == null || mod === '') return pub ? 'APPROVED' : 'PENDING';
  return 'UNDER_REVIEW';
}

/** Label from a populated Amenity doc (or partial); slug fallback when `name` is missing. */
function amenityLabelFromPopulated(o: Record<string, unknown>): string {
  if (typeof o.name === 'string' && o.name.trim()) return o.name.trim();
  if (typeof o.slug === 'string' && o.slug.trim()) {
    return o.slug
      .split('-')
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
      .filter(Boolean)
      .join(' ');
  }
  return '';
}

function pickIconKeyFromAmenityDoc(o: Record<string, unknown>): string | undefined {
  const candidates = [
    typeof o.iconKey === 'string' ? o.iconKey : undefined,
    typeof o.icon === 'string' ? o.icon : undefined,
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    const t = c.trim().toLowerCase();
    if (isAmenityIconKey(t)) return t;
  }
  return undefined;
}

function mapAmenityDocs(raw: unknown): ListingAmenityChip[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ListingAmenityChip[] = [];
  for (const a of raw) {
    if (!a || typeof a !== 'object') continue;
    const rec = a as Record<string, unknown>;
    const label = amenityLabelFromPopulated(rec);
    if (!label) continue;
    const k = label.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      const iconKey = pickIconKeyFromAmenityDoc(rec);
      out.push(iconKey ? { name: label, iconKey } : { name: label });
    }
  }
  return out;
}

/** Raw ObjectId strings (or unlabeled refs) when populate was not applied on the response. */
function collectAmenityObjectIdsWhenUnlabeled(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const ids: string[] = [];
  for (const a of raw) {
    if (a == null) continue;
    if (typeof a === 'string') {
      const t = a.trim();
      if (/^[a-f0-9]{24}$/i.test(t)) ids.push(t);
      continue;
    }
    if (typeof a !== 'object') continue;
    const o = a as Record<string, unknown>;
    if (amenityLabelFromPopulated(o)) continue;
    let id: string | null = null;
    if (typeof o.$oid === 'string' && /^[a-f0-9]{24}$/i.test(o.$oid)) id = o.$oid;
    else if (typeof o._id === 'string' && /^[a-f0-9]{24}$/i.test(o._id)) id = o._id;
    else if (o._id && typeof o._id === 'object' && o._id !== null) {
      const oid = (o._id as { $oid?: unknown }).$oid;
      if (typeof oid === 'string' && /^[a-f0-9]{24}$/i.test(oid)) id = oid;
    }
    if (id) ids.push(id);
  }
  return ids;
}

async function mapApiPropertyToListingWithAmenities(p: Record<string, unknown>): Promise<Listing> {
  let listing = mapApiPropertyToListing(p);
  if (listing.amenities.length > 0) return listing;
  const ids = collectAmenityObjectIdsWhenUnlabeled(p.amenityIds);
  if (!ids.length) return listing;
  try {
    const master = await amenityService.list();
    const byId = new Map(
      master.map((m) => [
        String(m._id),
        {
          name: typeof m.name === 'string' ? m.name.trim() : '',
          iconKey: typeof m.iconKey === 'string' ? m.iconKey.trim().toLowerCase() : undefined,
        },
      ]),
    );
    const seen = new Set<string>();
    const chips: ListingAmenityChip[] = [];
    for (const id of ids) {
      const row = byId.get(String(id));
      const n = row?.name ?? '';
      if (!n) continue;
      const k = n.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      const ik = row?.iconKey && isAmenityIconKey(row.iconKey) ? row.iconKey : undefined;
      chips.push(ik ? { name: n, iconKey: ik } : { name: n });
    }
    if (chips.length) listing = { ...listing, amenities: chips };
  } catch {
    /* catalogue unavailable leave amenities empty */
  }
  return listing;
}

/** Legacy UI default that was never shipped in `public/` treat as empty when real URLs exist. */
const LEGACY_LISTING_PLACEHOLDER_JPG = '/images/listings/placeholder.jpg';
const LISTING_IMAGE_PLACEHOLDER = '/images/listings/placeholder.svg';

function isHttpImageUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

/**
 * De-dupe cover + imageUrls, drop broken legacy placeholder when any https URL exists,
 * and put absolute URLs first so listing cards show S3 photos instead of a missing local file.
 */
export function collectListingImageUrlsFromProperty(p: Record<string, unknown>): string[] {
  const raw: string[] = [];
  const cover = typeof p.coverImageUrl === 'string' ? p.coverImageUrl.trim() : '';
  if (cover) raw.push(cover);
  if (Array.isArray(p.imageUrls)) {
    for (const u of p.imageUrls) {
      if (typeof u === 'string' && u.trim()) raw.push(u.trim());
    }
  }
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const u of raw) {
    if (seen.has(u)) continue;
    seen.add(u);
    ordered.push(u);
  }
  const hasHttp = ordered.some(isHttpImageUrl);
  const withoutLegacyPlaceholder = hasHttp
    ? ordered.filter((u) => u !== LEGACY_LISTING_PLACEHOLDER_JPG)
    : ordered;
  const http = withoutLegacyPlaceholder.filter(isHttpImageUrl);
  const rest = withoutLegacyPlaceholder.filter((u) => !isHttpImageUrl(u));
  const merged = [...http, ...rest].map((u) =>
    u === LEGACY_LISTING_PLACEHOLDER_JPG ? LISTING_IMAGE_PLACEHOLDER : u,
  );
  if (!merged.length) return [LISTING_IMAGE_PLACEHOLDER];
  return merged;
}

/** City filter: many listings only have area text in `location` while `city` is empty. */
function listingMatchesCityFilter(l: Listing, city: string | undefined): boolean {
  if (!city || !String(city).trim()) return true;
  const c = String(city).trim().toLowerCase();
  const hay = [l.city, l.location, l.formattedAddress, l.addressLine2, l.state]
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .join(' ')
    .toLowerCase();
  return hay.includes(c);
}

/** Area / locality substring on title + location + formatted address. */
function listingMatchesAreaFilter(l: Listing, area: string | undefined): boolean {
  if (!area || !String(area).trim()) return true;
  const q = String(area).trim().toLowerCase();
  const hay = [l.location, l.title, l.formattedAddress, l.city].filter(Boolean).join(' ').toLowerCase();
  return hay.includes(q);
}

/**
 * Amenity filter OR semantics: show listings that have **at least one** of the selected amenities.
 * (AND would hide a TV+AC listing when the user checks TV + Parking because Parking is missing.)
 * Names align with GET /api/v1/amenities; keeps a small fuzzy match for minor label drift.
 */
function listingMatchesAmenityFilters(l: Listing, required: string[]): boolean {
  if (!required.length) return true;
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const have = l.amenities.map((c) => norm(c.name));
  return required.some((req) => {
    const r = norm(req);
    return have.some((a) => a === r || a.includes(r) || r.includes(a));
  });
}

export function mapApiPropertyToListing(p: Record<string, unknown>): Listing {
  const id = String(p._id ?? p.id ?? '');
  const addr = (p.address ?? {}) as Record<string, string | undefined>;
  const rent = (p.rentRange ?? {}) as { min?: number; max?: number };
  const price = typeof rent.min === 'number' && !Number.isNaN(rent.min) ? rent.min : 0;
  const maxPrice =
    typeof rent.max === 'number' && !Number.isNaN(rent.max) && rent.max > price ? rent.max : undefined;
  const city = addr.city ?? '';
  const location = addr.line1 ?? '';
  const addressLine2 = addr.line2?.trim() || undefined;
  const state = addr.state?.trim() || undefined;
  const country = addr.country?.trim() || undefined;
  const postalCode = addr.postalCode?.trim() || undefined;
  const images = collectListingImageUrlsFromProperty(p);
  const owner = (p.owner ?? {}) as Record<string, unknown>;
  const ownerName = typeof owner.fullName === 'string' ? owner.fullName : 'Owner';
  const ownerId = owner._id != null ? String(owner._id) : '';
  const spots =
    typeof p.availableSpots === 'number' && !Number.isNaN(p.availableSpots) ? p.availableSpots : 1;
  const lt = typeof p.listingType === 'string' ? p.listingType : 'room';
  const type = API_TO_UI_LISTING_TYPE[lt] ?? 'Flat';
  const furnishing = mapFurnishingFromApi(
    typeof p.furnishing === 'string' ? p.furnishing : undefined,
  );
  const createdAt =
    typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString();
  const geo = p.location as
    | { coordinates?: unknown; placeId?: string; formattedAddress?: string }
    | undefined;
  const mapPlaceholder =
    !geo || !Array.isArray(geo.coordinates) || geo.coordinates.length < 2;
  const coords = geo?.coordinates as [number, number] | undefined;
  const longitude = coords && typeof coords[0] === 'number' ? coords[0] : undefined;
  const latitude = coords && typeof coords[1] === 'number' ? coords[1] : undefined;
  const placeId = typeof geo?.placeId === 'string' ? geo.placeId : undefined;
  const formattedAddress =
    typeof geo?.formattedAddress === 'string' ? geo.formattedAddress : undefined;
  const rejectionReason =
    typeof p.rejectionReason === 'string' && p.rejectionReason.trim()
      ? p.rejectionReason.trim()
      : undefined;
  const verificationBadge = mapVerificationBadge(p.verificationBadge);
  const residentSnapshots = mapResidentsFromProperty(p);

  return {
    id,
    title: String(p.title ?? ''),
    location,
    city,
    addressLine2,
    state,
    country,
    postalCode,
    latitude,
    longitude,
    placeId,
    formattedAddress,
    price,
    ...(maxPrice != null ? { maxPrice } : {}),
    isVerified: Boolean(p.isVerified),
    verificationBadge,
    spotsLeft: spots,
    ...(typeof p.minimumStayMonths === 'number' &&
    !Number.isNaN(p.minimumStayMonths) &&
    p.minimumStayMonths >= 1
      ? { minimumStayMonths: p.minimumStayMonths }
      : {}),
    amenities: mapAmenityDocs(p.amenityIds),
    badge: approvalFromProperty(p) === 'APPROVED' ? 'New' : null,
    type,
    ...(furnishing ? { furnishing } : {}),
    images,
    description: typeof p.description === 'string' ? p.description : '',
    residentSnapshots,
    residentSnapshot: residentSnapshots[0],
    mapPlaceholder,
    genderPreference: mapGenderFromApi(typeof p.genderPreference === 'string' ? p.genderPreference : undefined),
    peopleTypes: mapPeopleTypesFromApi(p.peopleTypes),
    ownerId,
    ownerName,
    ownerPhone: typeof p.contactPhone === 'string' ? p.contactPhone : undefined,
    approvalStatus: approvalFromProperty(p),
    rejectionReason,
    isSaved: Boolean((p as { isSaved?: unknown }).isSaved),
    createdAt,
  };
}

function unwrapItems(data: unknown): Record<string, unknown>[] {
  if (data == null || typeof data !== 'object') return [];
  const root = data as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === 'object' && Array.isArray((inner as { items?: unknown }).items)) {
    return (inner as { items: Record<string, unknown>[] }).items;
  }
  if (Array.isArray(root.items)) return root.items as Record<string, unknown>[];
  return [];
}

function propertyRowId(row: Record<string, unknown>): string {
  const id = row._id ?? row.id;
  return id != null ? String(id) : '';
}

/** Nearby rows first (server uses `$geoWithin`; order is not strict distance), then remaining rows without duplicates. */
function mergeNearbyFirstThenRest(
  nearbyOrdered: Record<string, unknown>[],
  rest: Record<string, unknown>[],
): Record<string, unknown>[] {
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  for (const row of nearbyOrdered) {
    const id = propertyRowId(row);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  for (const row of rest) {
    const id = propertyRowId(row);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

function buildPropertyListQueryParams(filter: ListingFilter | undefined, includeGeo: boolean): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', '1');
  params.set('limit', '100');
  if (includeGeo && hasMapCoordinates(filter?.nearLatitude, filter?.nearLongitude)) {
    params.set('lat', String(filter.nearLatitude));
    params.set('lng', String(filter.nearLongitude));
    if (filter.radiusKm != null && Number.isFinite(filter.radiusKm) && filter.radiusKm > 0) {
      params.set('radiusKm', String(filter.radiusKm));
    }
  }
  if (filter?.city && filter.city !== 'All') params.set('city', filter.city);
  if (filter?.minPrice != null) params.set('minRent', String(filter.minPrice));
  if (filter?.type && filter.type !== 'All') {
    const apiType = UI_TO_API_LISTING_TYPE[filter.type as ListingType];
    if (apiType) params.set('listingType', apiType);
  }
  return params;
}

export type CreateListingPayload = {
  title: string;
  type: string;
  rentMode?: ListingFormData['rentMode'];
  exactPrice?: number;
  minPrice?: number;
  maxPrice?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  formattedAddress?: string;
  spotsLeft: number;
  genderPreference: string;
  peopleTypes?: ListingPeopleType[];
  amenities: string[];
  description: string;
  phone?: string;
  minimumStayMonths?: number;
  furnishing?: ListingFurnishing;
};

export type UpdateListingPayload = Partial<CreateListingPayload>;

export function buildPropertyCreateBody(
  data: ListingFormData,
  amenityIds: string[],
  imageUrls: string[],
): Record<string, unknown> {
  const listingType = UI_TO_API_LISTING_TYPE[data.type] ?? 'room';
  const line2 = (data.addressLine2 ?? '').trim();
  const postal = (data.postalCode ?? '').trim();
  const body: Record<string, unknown> = {
    title: data.title,
    rentRange: resolveListingRentRange(data),
    listingType,
    furnishing: mapFurnishingToApi(data.furnishing),
    genderPreference: mapGenderToApi(data.genderPreference),
    address: {
      line1: data.addressLine1,
      ...(line2 ? { line2 } : {}),
      city: data.city,
      state: data.state,
      country: data.country || 'India',
      ...(postal ? { postalCode: postal } : {}),
    },
    description: data.description,
    availableSpots: data.spotsLeft,
    amenityIds,
    peopleTypes: mapPeopleTypesToApi(data.peopleTypes),
  };
  const lat = data.latitude;
  const lng = data.longitude;
  const loc: Record<string, unknown> = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  const pid = (data.placeId ?? '').trim();
  const fmt = (data.formattedAddress ?? '').trim();
  if (pid) loc.placeId = pid;
  if (fmt) loc.formattedAddress = fmt;
  body.location = loc;
  const phone = data.phone?.replace(/\D/g, '') ?? '';
  if (phone.length >= 10) body.contactPhone = phone.slice(-10);
  if (listingType === 'pg' && data.minimumStayMonths != null) {
    body.minimumStayMonths = data.minimumStayMonths;
  }
  if (imageUrls.length > 0) {
    body.imageUrls = imageUrls;
    body.coverImageUrl = imageUrls[0];
  }
  return body;
}

export const listingService = {
  getListings: async (filter?: ListingFilter): Promise<Listing[]> => {
    try {
      const hasGeo = hasMapCoordinates(filter?.nearLatitude, filter?.nearLongitude);

      let items: Record<string, unknown>[];
      if (hasGeo) {
        const paramsNear = buildPropertyListQueryParams(filter, true);
        const paramsRest = buildPropertyListQueryParams(filter, false);
        const [nearRes, restRes] = await Promise.all([
          apiClient.get<unknown>(`/api/v1/properties?${paramsNear.toString()}`),
          apiClient.get<unknown>(`/api/v1/properties?${paramsRest.toString()}`),
        ]);
        items = mergeNearbyFirstThenRest(unwrapItems(nearRes.data), unwrapItems(restRes.data));
      } else {
        const params = buildPropertyListQueryParams(filter, false);
        const { data } = await apiClient.get<unknown>(`/api/v1/properties?${params.toString()}`);
        items = unwrapItems(data);
      }
      let listings = await Promise.all(items.map((item) => mapApiPropertyToListingWithAmenities(item)));
      if (filter?.minPrice != null) {
        listings = listings.filter((l) => l.price >= filter.minPrice!);
      }
      if (filter?.maxPrice != null) {
        listings = listings.filter((l) => (l.maxPrice ?? l.price) <= filter.maxPrice!);
      }
      if (filter?.city && String(filter.city).trim()) {
        listings = listings.filter((l) => listingMatchesCityFilter(l, filter.city));
      }
      if (filter?.area && String(filter.area).trim()) {
        listings = listings.filter((l) => listingMatchesAreaFilter(l, filter.area));
      }
      if (filter?.genderPreference && filter.genderPreference !== 'Any') {
        listings = listings.filter(
          (l) => l.genderPreference === filter.genderPreference || l.genderPreference === 'Any',
        );
      }
      if (filter?.isVerified) {
        listings = listings.filter((l) => listingHasVerification(l));
      }
      if (filter?.amenities?.length) {
        listings = listings.filter((l) => listingMatchesAmenityFilters(l, filter.amenities!));
      }
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        listings = listings.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.location.toLowerCase().includes(q) ||
            l.description.toLowerCase().includes(q),
        );
      }
      return listings;
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load listings'));
    }
  },

  /** POST `image` to S3 under `profiles/residents/{propertyId}/`. */
  uploadListingResidentImage: async (file: File, propertyId: string): Promise<{ url: string }> => {
    const fd = new FormData();
    fd.append('image', file);
    const raw = await postMultipartForm(`/api/v1/upload/properties/${propertyId}/resident-profile`, fd);
    const inner = raw.data as Record<string, unknown> | undefined;
    const url = typeof inner?.url === 'string' ? inner.url : undefined;
    if (!url) throw new Error('Invalid upload response');
    return { url };
  },

  /** POST `images[]` to S3 under `properties/{propertyId}/`. */
  uploadPropertyListingImages: async (propertyId: string, files: File[]): Promise<string[]> => {
    if (!files.length) return [];
    const fd = new FormData();
    for (const f of files) fd.append('images', f);
    const raw = await postMultipartForm(`/api/v1/upload/properties/${propertyId}/gallery`, fd);
    const inner = raw.data as Record<string, unknown> | undefined;
    const urls = inner?.urls;
    if (!Array.isArray(urls) || !urls.every((u) => typeof u === 'string')) throw new Error('Invalid upload response');
    return urls as string[];
  },

  /** PATCH only gallery URLs (first becomes cover). */
  patchListingImages: async (propertyId: string, imageUrls: string[]): Promise<Listing> => {
    const coverImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
    try {
      const { data: res } = await apiClient.patch<unknown>(`/api/v1/properties/${propertyId}`, {
        imageUrls,
        coverImageUrl,
      });
      const root = res as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not save listing photos'));
    }
  },

  /** POST one resident row server appends to `listerSnapshots` (does not resend existing rows). */
  addListingResident: async (propertyId: string, body: Record<string, unknown>): Promise<Listing> => {
    try {
      const { data: res } = await apiClient.post<unknown>(
        `/api/v1/properties/${propertyId}/lister-residents`,
        body,
      );
      const root = res as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not add resident'));
    }
  },

  /** PATCH one resident by Mongo subdocument id. */
  patchListingResident: async (
    propertyId: string,
    residentId: string,
    body: Record<string, unknown>,
  ): Promise<Listing> => {
    try {
      const { data: res } = await apiClient.patch<unknown>(
        `/api/v1/properties/${propertyId}/lister-residents/${residentId}`,
        body,
      );
      const root = res as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not update resident'));
    }
  },

  /** DELETE one resident by Mongo subdocument id. */
  removeListingResident: async (propertyId: string, residentId: string): Promise<Listing> => {
    try {
      const { data: res } = await apiClient.delete<unknown>(
        `/api/v1/properties/${propertyId}/lister-residents/${residentId}`,
      );
      const root = res as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not remove resident'));
    }
  },

  getListingById: async (id: string): Promise<Listing> => {
    try {
      const { data } = await apiClient.get<unknown>(`/api/v1/properties/${id}`);
      const root = data as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop || (!prop._id && !prop.id)) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Listing not found'));
    }
  },

  /**
   * PATCH /properties/:id same field shape as create; omits image fields if none uploaded.
   */
  updateListingFromForm: async (
    id: string,
    data: ListingFormData,
    imageUrls: string[] = [],
  ): Promise<Listing> => {
    const amenityIds = await resolveAmenityIdsFromLabels(data.amenities as string[]);
    const body = buildPropertyCreateBody(data, amenityIds, imageUrls);
    try {
      const { data: res } = await apiClient.patch<unknown>(`/api/v1/properties/${id}`, body);
      const root = res as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not update listing'));
    }
  },

  createListingFromForm: async (
    data: ListingFormData,
    imageUrls: string[] = [],
  ): Promise<Listing> => {
    const amenityIds = await resolveAmenityIdsFromLabels(data.amenities as string[]);
    const body = buildPropertyCreateBody(data, amenityIds, imageUrls);
    try {
      const { data: res } = await apiClient.post<unknown>('/api/v1/properties', body);
      const root = res as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid server response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not create listing'));
    }
  },

  createListing: async (payload: CreateListingPayload): Promise<Listing> => {
    const form = {
      title: payload.title,
      type: payload.type as ListingFormData['type'],
      rentMode: payload.rentMode ?? 'exact',
      exactPrice: payload.exactPrice ?? payload.minPrice ?? 8000,
      minPrice: payload.minPrice ?? payload.exactPrice ?? 8000,
      maxPrice: payload.maxPrice ?? payload.exactPrice ?? payload.minPrice ?? 8000,
      addressLine1: payload.addressLine1,
      addressLine2: payload.addressLine2 ?? '',
      city: payload.city,
      state: payload.state,
      country: payload.country ?? 'India',
      postalCode: payload.postalCode ?? '',
      latitude: payload.latitude,
      longitude: payload.longitude,
      placeId: payload.placeId ?? '',
      formattedAddress: payload.formattedAddress ?? '',
      spotsLeft: payload.spotsLeft,
      genderPreference: payload.genderPreference as ListingFormData['genderPreference'],
      peopleTypes: payload.peopleTypes ?? ['Bachelor', 'Working', 'Family'],
      amenities: payload.amenities as ListingFormData['amenities'],
      description: payload.description,
      phone: payload.phone ?? '',
    } as ListingFormData;
    return listingService.createListingFromForm(form, []);
  },

  updateListing: async (id: string, payload: UpdateListingPayload): Promise<Listing> => {
    try {
      const body: Record<string, unknown> = {};
      if (payload.title != null) body.title = payload.title;
      if (
        payload.rentMode != null ||
        payload.exactPrice != null ||
        payload.minPrice != null ||
        payload.maxPrice != null
      ) {
        body.rentRange = resolveListingRentRange({
          rentMode: payload.rentMode,
          exactPrice: payload.exactPrice,
          minPrice: payload.minPrice,
          maxPrice: payload.maxPrice,
        });
      }
      if (payload.description != null) body.description = payload.description;
      if (
        payload.addressLine1 != null ||
        payload.city != null ||
        payload.state != null ||
        payload.country != null
      ) {
        body.address = {
          ...(payload.addressLine1 != null ? { line1: payload.addressLine1 } : {}),
          ...(payload.addressLine2 != null ? { line2: payload.addressLine2 } : {}),
          ...(payload.city != null ? { city: payload.city } : {}),
          ...(payload.state != null ? { state: payload.state } : {}),
          ...(payload.country != null ? { country: payload.country } : {}),
          ...(payload.postalCode != null ? { postalCode: payload.postalCode } : {}),
        };
      }
      if (
        payload.latitude != null &&
        payload.longitude != null &&
        Number.isFinite(payload.latitude) &&
        Number.isFinite(payload.longitude)
      ) {
        const loc: Record<string, unknown> = {
          type: 'Point',
          coordinates: [payload.longitude, payload.latitude],
        };
        if (payload.placeId) loc.placeId = payload.placeId;
        if (payload.formattedAddress) loc.formattedAddress = payload.formattedAddress;
        body.location = loc;
      }
      if (payload.spotsLeft != null) body.availableSpots = payload.spotsLeft;
      if (payload.genderPreference != null) body.genderPreference = mapGenderToApi(payload.genderPreference);
      if (payload.furnishing != null) body.furnishing = mapFurnishingToApi(payload.furnishing);
      if (payload.type != null) {
        const lt = UI_TO_API_LISTING_TYPE[payload.type];
        if (lt) {
          body.listingType = lt;
          if (lt !== 'pg') body.minimumStayMonths = null;
        }
      }
      if (payload.minimumStayMonths != null && body.minimumStayMonths !== null) {
        body.minimumStayMonths = payload.minimumStayMonths;
      }
      if (payload.amenities != null) {
        body.amenityIds = await resolveAmenityIdsFromLabels(payload.amenities);
      }
      if (payload.phone) body.contactPhone = payload.phone.replace(/\D/g, '').slice(-10);
      const { data } = await apiClient.patch<unknown>(`/api/v1/properties/${id}`, body);
      const root = data as Record<string, unknown>;
      const inner = root.data as Record<string, unknown> | undefined;
      const prop = (inner?.property ?? inner) as Record<string, unknown> | undefined;
      if (!prop) throw new Error('Invalid response');
      return mapApiPropertyToListingWithAmenities(prop);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not update listing'));
    }
  },

  deleteListing: async (id: string): Promise<{ message: string }> => {
    try {
      await apiClient.delete(`/api/v1/properties/${id}`);
      return { message: 'Listing deleted' };
    } catch (err) {
      throw new Error(apiErr(err, 'Could not delete listing'));
    }
  },

  getMyListings: async (): Promise<Listing[]> => {
    try {
      const { data } = await apiClient.get<unknown>('/api/v1/properties/mine/listings');
      const items = unwrapItems(data);
      return Promise.all(items.map((item) => mapApiPropertyToListingWithAmenities(item)));
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load your listings'));
    }
  },

  saveListing: async (id: string): Promise<{ message: string }> => {
    try {
      await apiClient.post(`/api/v1/properties/${id}/save`);
      return { message: 'Saved' };
    } catch (err) {
      throw new Error(apiErr(err, 'Could not save listing'));
    }
  },

  unsaveListing: async (id: string): Promise<{ message: string }> => {
    try {
      await apiClient.delete(`/api/v1/properties/${id}/save`);
      return { message: 'Removed' };
    } catch (err) {
      throw new Error(apiErr(err, 'Could not remove save'));
    }
  },

  getSavedListings: async (): Promise<Listing[]> => {
    try {
      const { data } = await apiClient.get<unknown>('/api/v1/properties/saved/mine');
      const root = data as Record<string, unknown>;
      const inner = root.data as { items?: { property?: Record<string, unknown> }[] } | undefined;
      const rows = inner?.items ?? [];
      const props = rows
        .map((r) => r.property)
        .filter((p): p is Record<string, unknown> => p != null && typeof p === 'object');
      return Promise.all(
        props.map(async (p) => ({ ...(await mapApiPropertyToListingWithAmenities(p)), isSaved: true })),
      );
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load saved listings'));
    }
  },

  bookVisit: async (id: string, date: string): Promise<{ message: string }> => {
    void id;
    void date;
    return { message: 'Not available yet' };
  },
};
