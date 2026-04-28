/**
 * In-app notifications — GET /api/v1/notifications, PATCH .../:id/read
 */
import { isAxiosError } from 'axios';
import { apiClient } from '@/services/api';

export type ApiNotification = {
  _id: string;
  title: string;
  description?: string;
  type: string;
  payload?: {
    kind?: string;
    propertyId?: string;
    title?: string;
    senderId?: string;
    messageId?: string;
  };
  isRead: boolean;
  createdAt: string;
};

function unwrapList(data: unknown): ApiNotification[] {
  if (!data || typeof data !== 'object') return [];
  const inner = (data as Record<string, unknown>).data;
  if (inner && typeof inner === 'object' && Array.isArray((inner as { items?: unknown }).items)) {
    return (inner as { items: ApiNotification[] }).items;
  }
  return [];
}

function apiErr(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const d = err.response?.data as Record<string, unknown> | undefined;
    const msg = typeof d?.message === 'string' ? d.message : undefined;
    if (msg) return msg;
  }
  return err instanceof Error ? err.message : fallback;
}

export const notificationService = {
  listMine: async (): Promise<ApiNotification[]> => {
    try {
      const { data } = await apiClient.get<unknown>('/api/v1/notifications');
      return unwrapList(data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load notifications'));
    }
  },

  markRead: async (id: string): Promise<void> => {
    try {
      await apiClient.patch(`/api/v1/notifications/${id}/read`);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not update notification'));
    }
  },
};
