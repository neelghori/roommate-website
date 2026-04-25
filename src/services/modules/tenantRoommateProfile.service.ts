/**
 * Tenant roommate seeker profiles — /api/v1/tenant-roommate-profiles
 */

import { isAxiosError } from 'axios';
import type { RoommateProfile } from '@/types';
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

function parseListPayload(data: unknown): RoommateProfile[] {
  if (!isRecord(data)) return [];
  const inner = data.data;
  if (!isRecord(inner)) return [];
  const items = inner.items;
  if (!Array.isArray(items)) return [];
  return items.filter((x): x is RoommateProfile => x != null && typeof x === 'object' && 'id' in x) as RoommateProfile[];
}

function parseProfilePayload(data: unknown): RoommateProfile | null {
  if (!isRecord(data)) return null;
  const inner = data.data;
  if (!isRecord(inner)) return null;
  const p = inner.profile;
  if (p == null || typeof p !== 'object') return null;
  return p as RoommateProfile;
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
};

export const tenantRoommateProfileService = {
  async list(params?: TenantRoommateListParams): Promise<RoommateProfile[]> {
    try {
      const q = new URLSearchParams();
      if (params?.search?.trim()) q.set('search', params.search.trim());
      if (params?.tags?.length) q.set('tags', params.tags.join(','));
      const qs = q.toString();
      const url = qs ? `/api/v1/tenant-roommate-profiles?${qs}` : '/api/v1/tenant-roommate-profiles';
      const res = await apiClient.get<unknown>(url);
      return parseListPayload(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load roommate profiles'));
    }
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
