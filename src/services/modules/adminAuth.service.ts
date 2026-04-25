import { isAxiosError } from 'axios';
import { adminApiClient } from '@/services/adminApi';
import { setAdminAccessToken, clearAdminAccessToken } from '@/lib/adminAuthToken';
import { extractAccessTokenFromUnknown } from '@/lib/extractAccessToken';

function pickToken(root: Record<string, unknown>): string | undefined {
  const direct = root.token ?? root.accessToken;
  if (typeof direct === 'string' && direct.length > 0) return direct;
  const inner = root.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>;
    const t = d.token ?? d.accessToken;
    if (typeof t === 'string' && t.length > 0) return t;
  }
  return extractAccessTokenFromUnknown(root) ?? undefined;
}

function errorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) return err instanceof Error ? err.message : fallback;
  const data = err.response?.data as { message?: unknown } | undefined;
  const msg = data?.message;
  if (typeof msg === 'string') return msg;
  return err.message || fallback;
}

export const adminAuthService = {
  login: async (email: string, password: string): Promise<void> => {
    try {
      const { data } = await adminApiClient.post<unknown>('/api/v1/admin/auth/login', {
        email: email.trim(),
        password,
      });
      const root = data as Record<string, unknown>;
      const token = pickToken(root);
      if (!token) throw new Error('No token in response');
      setAdminAccessToken(token);
    } catch (e) {
      throw new Error(errorMessage(e, 'Admin login failed'));
    }
  },

  logout: () => {
    clearAdminAccessToken();
  },
};
