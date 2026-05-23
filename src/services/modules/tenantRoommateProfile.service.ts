/**
 * Tenant roommate seeker profiles /api/v1/tenant-roommate-profiles
 */

import { isAxiosError } from 'axios';
import type { RoommateProfile } from '@/types';
import { normalizeAvatarUrl } from '@/lib/avatarUrl';
import { apiClient } from '@/services/api';
import { authApiErrorMessage } from '@/services/modules/auth.service';

function apiErr(err: unknown, fallback: string): string {
  return authApiErrorMessage(err, fallback);
}

export type TenantRoommateProfileMine = {
  id: string;
  displayName: string;
  occupation: string;
  location: string;
  monthlyBudget: number;
  moveInDate: string;
  bio: string;
  lifestyleTags: string[];
  displayRole: 'Student' | 'Working' | 'Veg Only';
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function profileIdFromRaw(raw: Record<string, unknown>): string | null {
  if (typeof raw.id === 'string' && raw.id.trim()) return raw.id.trim();
  const oid = raw._id;
  if (typeof oid === 'string' && oid.trim()) return oid.trim();
  if (oid != null && typeof oid === 'object' && typeof (oid as { toString?: () => string }).toString === 'function') {
    const s = String(oid);
    if (s && s !== '[object Object]') return s;
  }
  return null;
}

/**
 * Maps GET /tenant-roommate-profiles list items or GET /:id `profile` to {@link RoommateProfile}.
 */
export function mapTenantRoommateApiToProfile(raw: unknown): RoommateProfile | null {
  if (!isRecord(raw)) return null;
  const id = profileIdFromRaw(raw);
  if (!id) return null;

  const userId = typeof raw.userId === 'string' ? raw.userId : '';
  const name =
    typeof raw.name === 'string' && raw.name.trim()
      ? raw.name.trim()
      : typeof raw.displayName === 'string' && raw.displayName.trim()
        ? raw.displayName.trim()
        : 'Roommate';

  let avatarInitial =
    typeof raw.avatarInitial === 'string' && raw.avatarInitial.trim()
      ? raw.avatarInitial.trim().slice(0, 3)
      : '';
  if (!avatarInitial) {
    const parts = name.split(/\s+/).filter(Boolean);
    avatarInitial =
      parts.length >= 2
        ? `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
        : (parts[0]?.slice(0, 2) ?? 'RM').toUpperCase();
  }

  const matchPercent =
    typeof raw.matchPercent === 'number' && Number.isFinite(raw.matchPercent)
      ? Math.min(100, Math.max(0, Math.round(raw.matchPercent)))
      : 85;

  const tags = Array.isArray(raw.tags)
    ? raw.tags.filter((t): t is string => typeof t === 'string' && t.length > 0)
    : Array.isArray(raw.lifestyleTags)
      ? raw.lifestyleTags.filter((t): t is string => typeof t === 'string' && t.length > 0)
      : [];

  const roleVal = raw.role ?? raw.displayRole;
  const role: RoommateProfile['role'] =
    roleVal === 'Student' || roleVal === 'Veg Only' || roleVal === 'Working' ? roleVal : 'Working';

  let budget: number | undefined;
  if (typeof raw.budget === 'number' && Number.isFinite(raw.budget)) budget = raw.budget;
  else if (typeof raw.monthlyBudget === 'number' && Number.isFinite(raw.monthlyBudget))
    budget = raw.monthlyBudget;

  const moveInDate = typeof raw.moveInDate === 'string' ? raw.moveInDate : undefined;

  const displayName =
    typeof raw.displayName === 'string' && raw.displayName.trim() ? raw.displayName.trim() : undefined;
  const monthlyBudget =
    typeof raw.monthlyBudget === 'number' && Number.isFinite(raw.monthlyBudget)
      ? raw.monthlyBudget
      : undefined;
  const lifestyleTagsRaw = raw.lifestyleTags;
  const lifestyleTags = Array.isArray(lifestyleTagsRaw)
    ? lifestyleTagsRaw.filter((t): t is string => typeof t === 'string' && t.length > 0)
    : undefined;

  const listingSource =
    raw.listingSource === 'tenant_profile' || raw.listingSource === 'user_account'
      ? raw.listingSource
      : undefined;

  const profileIdRaw = raw.profileId;
  const isSyntheticUserRow = id.startsWith('user-');
  const profileId =
    typeof profileIdRaw === 'string' && profileIdRaw.trim()
      ? profileIdRaw.trim()
      : listingSource === 'user_account' || isSyntheticUserRow
        ? undefined
        : id;

  return {
    id,
    listingSource,
    profileId,
    userId,
    name,
    displayName: displayName ?? name,
    avatarUrl: normalizeAvatarUrl(
      typeof raw.avatarUrl === 'string'
        ? raw.avatarUrl
        : typeof raw.profileImageUrl === 'string'
          ? raw.profileImageUrl
          : undefined,
    ),
    avatarInitial,
    matchPercent,
    tags,
    lifestyleTags: lifestyleTags?.length ? lifestyleTags : tags,
    role,
    isConnected: Boolean(raw.isConnected),
    location: typeof raw.location === 'string' ? raw.location : undefined,
    budget,
    monthlyBudget: monthlyBudget ?? budget,
    moveInDate,
    bio: typeof raw.bio === 'string' ? raw.bio : undefined,
    occupation: typeof raw.occupation === 'string' ? raw.occupation : undefined,
    accountFullName:
      typeof raw.accountFullName === 'string' && raw.accountFullName.trim()
        ? raw.accountFullName.trim()
        : undefined,
    accountRole: typeof raw.accountRole === 'string' && raw.accountRole.trim() ? raw.accountRole.trim() : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
    professionalType: typeof raw.professionalType === 'string' ? raw.professionalType : undefined,
    age: typeof raw.age === 'number' && Number.isFinite(raw.age) ? raw.age : undefined,
    gender: typeof raw.gender === 'string' ? raw.gender : undefined,
    roommateGenderPreference:
      typeof raw.roommateGenderPreference === 'string' ? raw.roommateGenderPreference : undefined,
    lifestyleSnippet:
      raw.lifestyleSnippet != null && typeof raw.lifestyleSnippet === 'object' && !Array.isArray(raw.lifestyleSnippet)
        ? (raw.lifestyleSnippet as RoommateProfile['lifestyleSnippet'])
        : undefined,
  };
}

function parseListPayload(data: unknown): RoommateProfile[] {
  if (!isRecord(data)) return [];
  const inner = data.data;
  if (!isRecord(inner)) return [];
  const items = inner.items;
  if (!Array.isArray(items)) return [];
  return items.map(mapTenantRoommateApiToProfile).filter((x): x is RoommateProfile => x !== null);
}

function parseProfilePayload(data: unknown): RoommateProfile | null {
  if (!isRecord(data)) return null;
  const inner = data.data;
  if (!isRecord(inner)) return null;
  const p = inner.profile;
  if (p == null || typeof p !== 'object') return null;
  return mapTenantRoommateApiToProfile(p);
}

function parseMinePayload(data: unknown): TenantRoommateProfileMine | null {
  if (!isRecord(data)) return null;
  const inner = data.data;
  if (!isRecord(inner)) return null;
  const p = inner.profile;
  if (p == null || typeof p !== 'object') return null;
  return p as TenantRoommateProfileMine;
}

export type TenantRoommateListParams = {
  search?: string;
  tags?: string[];
  tagsMatch?: 'all' | 'any';
  budget?: number;
};

function listQueryKey(params?: TenantRoommateListParams): string {
  if (!params) return '';
  const parts: string[] = [];
  if (params.search?.trim()) parts.push(`s=${encodeURIComponent(params.search.trim())}`);
  if (params.tags?.length) parts.push(`t=${[...params.tags].sort().join(',')}`);
  if (params.tagsMatch) parts.push(`m=${params.tagsMatch}`);
  if (params.budget != null && Number.isFinite(params.budget)) parts.push(`b=${Math.round(params.budget)}`);
  return parts.join('&');
}

/** Coalesce identical in-flight list GETs (duplicate panels, React Strict Mode, etc.). */
const listInflight = new Map<string, Promise<RoommateProfile[]>>();

export const tenantRoommateProfileService = {
  async list(params?: TenantRoommateListParams): Promise<RoommateProfile[]> {
    const key = listQueryKey(params);
    const hit = listInflight.get(key);
    if (hit) return hit;

    const promise = (async () => {
      try {
        const q = new URLSearchParams();
        if (params?.search?.trim()) q.set('search', params.search.trim());
        if (params?.tags?.length) q.set('tags', params.tags.join(','));
        if (params?.tagsMatch) q.set('tagsMatch', params.tagsMatch);
        if (params?.budget != null && Number.isFinite(params.budget)) {
          q.set('budget', String(Math.round(params.budget)));
        }
        const qs = q.toString();
        const url = qs ? `/api/v1/tenant-roommate-profiles?${qs}` : '/api/v1/tenant-roommate-profiles';
        const res = await apiClient.get<unknown>(url);
        return parseListPayload(res.data);
      } catch (err) {
        throw new Error(apiErr(err, 'Could not load roommate profiles'));
      }
    })();

    listInflight.set(key, promise);
    void promise.finally(() => {
      if (listInflight.get(key) === promise) listInflight.delete(key);
    });

    return promise;
  },

  async getById(id: string): Promise<RoommateProfile> {
    try {
      const res = await apiClient.get<unknown>(`/api/v1/tenant-roommate-profiles/${id}`);
      const p = parseProfilePayload(res.data);
      if (!p) throw new Error('Invalid response');
      return p;
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        throw new Error('Profile not found');
      }
      throw new Error(apiErr(err, 'Could not load profile'));
    }
  },

  async getMine(): Promise<TenantRoommateProfileMine | null> {
    try {
      const res = await apiClient.get<unknown>('/api/v1/tenant-roommate-profiles/me');
      return parseMinePayload(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load your roommate profile'));
    }
  },

  async saveMine(body: Omit<TenantRoommateProfileMine, 'id'> & { moveInDate: string }): Promise<TenantRoommateProfileMine> {
    try {
      const payload = {
        displayName: body.displayName,
        occupation: body.occupation,
        location: body.location,
        monthlyBudget: body.monthlyBudget,
        moveInDate: body.moveInDate,
        bio: body.bio,
        lifestyleTags: body.lifestyleTags,
        displayRole: body.displayRole,
      };
      const res = await apiClient.put<unknown>('/api/v1/tenant-roommate-profiles/me', payload);
      const inner = isRecord(res.data) ? res.data.data : null;
      const p = isRecord(inner) ? inner.profile : null;
      if (p == null || typeof p !== 'object') throw new Error('Invalid response');
      return p as TenantRoommateProfileMine;
    } catch (err) {
      throw new Error(apiErr(err, 'Could not save your roommate profile'));
    }
  },
};
