/**
 * Property visit bookings POST /api/v1/bookings, GET /api/v1/bookings/me (auth required).
 */

import { apiClient } from '@/services/api';
import { authApiErrorMessage } from '@/services/modules/auth.service';
import { collectListingImageUrlsFromProperty } from '@/services/modules/listing.service';

function apiErr(err: unknown, fallback: string): string {
  return authApiErrorMessage(err, fallback);
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

type ApiGeo = { formattedAddress?: string };
type ApiAddress = { line1?: string; line2?: string; city?: string; state?: string };
type ApiPropertyPopulated = {
  _id?: string;
  title?: string;
  coverImageUrl?: string;
  imageUrls?: string[];
  address?: ApiAddress;
  location?: ApiGeo;
  /** Listing owner (ObjectId string or populated `{ _id }`). */
  owner?: string | { _id?: string } | null;
} | null;

type ApiBookingLean = {
  _id: string;
  status?: string;
  preferredDate?: string;
  preferredTimeStart?: string | null;
  preferredTimeEnd?: string | null;
  contactName?: string;
  contactPhone?: string;
  createdAt?: string;
  property?: ApiPropertyPopulated;
  requester?: { _id?: string; fullName?: string } | null;
  viewerAsOwner?: boolean;
  /** Other party for in-app chat (property owner vs visit requester). */
  chatWithUserId?: string | null;
  requesterUserId?: string | null;
  propertyOwnerId?: string | null;
};

export type MyVisitBooking = {
  id: string;
  status: BookingStatus;
  preferredDate: string;
  preferredTimeStart: string | null;
  preferredTimeEnd: string | null;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  propertyId: string | null;
  propertyTitle: string;
  propertyImageUrl: string | null;
  propertyLocationLabel: string;
  /** True when this row is someone else's request on your listing. */
  viewerAsOwner: boolean;
  requesterDisplayName: string | null;
  /** User id to open `/chat/[id]` with the other party; null if unknown. */
  chatWithUserId: string | null;
  /** For client-side chat fallback when `chatWithUserId` is missing. */
  requesterUserId: string | null;
  propertyOwnerId: string | null;
};

/** 24-char hex Mongo ObjectId (normalized lowercase). */
function extractMongoObjectId(val: unknown): string | null {
  if (val == null) return null;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return /^[a-f0-9]{24}$/.test(s) ? s : null;
  }
  if (typeof val === 'object' && val !== null && '_id' in val) {
    return extractMongoObjectId((val as { _id: unknown })._id);
  }
  return null;
}

function normalizeBookingStatus(v: unknown): BookingStatus {
  const s = String(v ?? 'pending').toLowerCase();
  if (s === 'confirmed' || s === 'cancelled' || s === 'completed') return s;
  return 'pending';
}

function propertyLocationLabel(p: ApiPropertyPopulated): string {
  if (!p) return '';
  const fmt = typeof p.location?.formattedAddress === 'string' ? p.location.formattedAddress.trim() : '';
  if (fmt) return fmt;
  const a = p.address;
  const parts = [a?.line1, a?.line2, a?.city, a?.state].filter((x) => typeof x === 'string' && x.trim());
  return parts.length ? parts.join(', ') : '';
}

function mapBookingFromApi(raw: ApiBookingLean): MyVisitBooking {
  const prop = raw.property ?? null;
  const pid = prop?._id ? String(prop._id) : null;
  /** Same ordering as listing cards: prefer real https URLs, drop legacy cover placeholder when gallery has S3 URLs. */
  const gallery = prop ? collectListingImageUrlsFromProperty(prop as Record<string, unknown>) : [];
  const img = gallery.length > 0 ? gallery[0] : null;
  const reqName =
    typeof raw.requester === 'object' && raw.requester && typeof raw.requester.fullName === 'string'
      ? raw.requester.fullName.trim()
      : '';
  const requesterUserId =
    extractMongoObjectId(raw.requesterUserId) ?? extractMongoObjectId(raw.requester);
  const propertyOwnerId =
    extractMongoObjectId(raw.propertyOwnerId) ?? extractMongoObjectId(prop?.owner);

  let chatWithUserId = extractMongoObjectId(raw.chatWithUserId);
  if (!chatWithUserId) {
    if (raw.viewerAsOwner === true) chatWithUserId = requesterUserId;
    else if (raw.viewerAsOwner === false) chatWithUserId = propertyOwnerId;
  }

  return {
    id: String(raw._id),
    status: normalizeBookingStatus(raw.status),
    preferredDate: raw.preferredDate ? String(raw.preferredDate) : '',
    preferredTimeStart: raw.preferredTimeStart != null && raw.preferredTimeStart !== '' ? String(raw.preferredTimeStart) : null,
    preferredTimeEnd: raw.preferredTimeEnd != null && raw.preferredTimeEnd !== '' ? String(raw.preferredTimeEnd) : null,
    contactName: typeof raw.contactName === 'string' ? raw.contactName : '',
    contactPhone: typeof raw.contactPhone === 'string' ? raw.contactPhone : '',
    createdAt: raw.createdAt ? String(raw.createdAt) : '',
    propertyId: pid,
    propertyTitle: typeof prop?.title === 'string' && prop.title.trim() ? prop.title : 'Listing unavailable',
    propertyImageUrl: img,
    propertyLocationLabel: prop ? propertyLocationLabel(prop) : '',
    viewerAsOwner: Boolean(raw.viewerAsOwner),
    requesterDisplayName: reqName || null,
    chatWithUserId,
    requesterUserId,
    propertyOwnerId,
  };
}

export type CreateVisitBookingPayload = {
  propertyId: string;
  preferredDate: string;
  preferredTime: string;
  contactName: string;
  contactPhone: string;
  notes?: string;
};

export const bookingService = {
  getMyBookings: async (): Promise<MyVisitBooking[]> => {
    try {
      const { data } = await apiClient.get<{ status?: string; data?: { items?: ApiBookingLean[] } }>(
        '/api/v1/bookings/me',
      );
      const items = data?.data?.items;
      if (!Array.isArray(items)) return [];
      return items.map(mapBookingFromApi);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load your bookings'));
    }
  },

  createVisitBooking: async (payload: CreateVisitBookingPayload): Promise<void> => {
    const digits = payload.contactPhone.replace(/\D/g, '');
    const phone = digits.length >= 10 ? digits.slice(-10) : payload.contactPhone.trim();
    const body = {
      propertyId: payload.propertyId,
      preferredDate: payload.preferredDate,
      preferredTimeStart: payload.preferredTime,
      preferredTimeEnd: '',
      contactName: payload.contactName.trim(),
      contactPhone: phone,
      notes: payload.notes?.trim() || undefined,
    };
    try {
      await apiClient.post('/api/v1/bookings', body);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not submit booking'));
    }
  },
};
