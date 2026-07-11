/**
 * Roommate connect/request flow → /api/v1/roommates/*
 *
 *   POST /roommates/request              → send a connect request
 *   GET  /roommates/requests/sent        → requests I sent
 *   GET  /roommates/requests/received    → requests I received
 *   PUT  /roommates/requests/:id/accept  → accept (receiver only)
 *   PUT  /roommates/requests/:id/reject  → reject (receiver only)
 */

import type { RoommateRequest } from '@/types';
import { apiClient } from '@/services/api';
import { authApiErrorMessage } from '@/services/modules/auth.service';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function apiErr(err: unknown, fallback: string): string {
  return authApiErrorMessage(err, fallback);
}

function mapRequest(raw: unknown): RoommateRequest | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id : typeof raw._id === 'string' ? raw._id : '';
  if (!id) return null;
  const status =
    raw.status === 'ACCEPTED' || raw.status === 'REJECTED' ? raw.status : 'PENDING';
  return {
    id,
    senderId: typeof raw.senderId === 'string' ? raw.senderId : '',
    receiverId: typeof raw.receiverId === 'string' ? raw.receiverId : '',
    senderName: typeof raw.senderName === 'string' ? raw.senderName : 'Someone',
    senderAvatar: typeof raw.senderAvatar === 'string' ? raw.senderAvatar : '??',
    receiverName: typeof raw.receiverName === 'string' ? raw.receiverName : 'Someone',
    receiverAvatar: typeof raw.receiverAvatar === 'string' ? raw.receiverAvatar : '??',
    status,
    message: typeof raw.message === 'string' ? raw.message : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
  };
}

function parseRequest(data: unknown): RoommateRequest {
  const inner = isRecord(data) ? data.data : null;
  const r = isRecord(inner) ? mapRequest(inner.request) : null;
  if (!r) throw new Error('Invalid response');
  return r;
}

function parseRequestList(data: unknown): RoommateRequest[] {
  const inner = isRecord(data) ? data.data : null;
  const items = isRecord(inner) && Array.isArray(inner.requests) ? inner.requests : [];
  return items.map(mapRequest).filter((x): x is RoommateRequest => x !== null);
}

export const roommateRequestService = {
  async send(receiverId: string, message?: string): Promise<RoommateRequest> {
    try {
      const res = await apiClient.post<unknown>('/api/v1/roommates/request', {
        receiverId,
        ...(message ? { message } : {}),
      });
      return parseRequest(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not send request'));
    }
  },

  async getSent(): Promise<RoommateRequest[]> {
    try {
      const res = await apiClient.get<unknown>('/api/v1/roommates/requests/sent');
      return parseRequestList(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load sent requests'));
    }
  },

  async getReceived(): Promise<RoommateRequest[]> {
    try {
      const res = await apiClient.get<unknown>('/api/v1/roommates/requests/received');
      return parseRequestList(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load received requests'));
    }
  },

  async accept(requestId: string): Promise<RoommateRequest> {
    try {
      const res = await apiClient.put<unknown>(`/api/v1/roommates/requests/${requestId}/accept`);
      return parseRequest(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not accept request'));
    }
  },

  async reject(requestId: string): Promise<RoommateRequest> {
    try {
      const res = await apiClient.put<unknown>(`/api/v1/roommates/requests/${requestId}/reject`);
      return parseRequest(res.data);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not reject request'));
    }
  },
};
