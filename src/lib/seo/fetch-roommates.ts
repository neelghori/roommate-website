import type { RoommateProfile } from '@/types';
import { mapTenantRoommateApiToProfile } from '@/services/modules/tenantRoommateProfile.service';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') || 'http://localhost:5000';

function readItems(body: unknown): unknown[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const inner = root.data as Record<string, unknown> | undefined;
  if (inner && Array.isArray(inner.items)) return inner.items;
  if (Array.isArray(root.items)) return root.items;
  return [];
}

export async function fetchRoommatesForSeo(limit = 24): Promise<RoommateProfile[]> {
  try {
    const params = new URLSearchParams({ page: '1', limit: String(Math.min(limit, 100)) });
    const res = await fetch(`${API_BASE}/api/v1/tenant-roommate-profiles?${params}`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as unknown;
    return readItems(body)
      .map((row) => mapTenantRoommateApiToProfile(row))
      .filter((p): p is RoommateProfile => p !== null);
  } catch {
    return [];
  }
}

export async function fetchRoommateByIdForSeo(id: string): Promise<RoommateProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/tenant-roommate-profiles/${encodeURIComponent(id)}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as unknown;
    if (!body || typeof body !== 'object') return null;
    const root = body as Record<string, unknown>;
    const inner = root.data as Record<string, unknown> | undefined;
    const profileRaw = inner?.profile;
    return mapTenantRoommateApiToProfile(profileRaw);
  } catch {
    return null;
  }
}
