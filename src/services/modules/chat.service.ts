/**
 * chat.service.ts REST chat API (/api/v1/chat/*).
 */

import type { ChatConversation, ChatMessage } from '@/types';
import { apiClient } from '@/services/api';
import { authApiErrorMessage } from '@/services/modules/auth.service';

function apiErr(err: unknown, fallback: string): string {
  return authApiErrorMessage(err, fallback);
}

function parseCreatedAt(raw: unknown): string {
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === 'string' && raw) return raw;
  return new Date().toISOString();
}

/** Maps API / Mongo chat document to UI message (also used by WebSocket handler). */
export function mapChatMessageFromApi(raw: Record<string, unknown>): ChatMessage {
  return {
    id: String(raw._id ?? ''),
    senderId: String(raw.sender ?? ''),
    receiverId: String(raw.receiver ?? ''),
    content: String(raw.message ?? ''),
    timestamp: parseCreatedAt(raw.createdAt),
    isRead: raw.readAt != null,
    type: 'text',
  };
}

function mapMessage(raw: Record<string, unknown>): ChatMessage {
  return mapChatMessageFromApi(raw);
}

export type ChatThreadPartner = {
  id: string;
  fullName: string;
  profileImageUrl?: string;
};

export const chatService = {
  getConversations: async (): Promise<ChatConversation[]> => {
    try {
      const { data } = await apiClient.get<unknown>('/api/v1/chat/conversations');
      const inner = (data as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const items = inner?.items;
      if (!Array.isArray(items)) return [];
      return items as ChatConversation[];
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load conversations'));
    }
  },

  /** Thread with one other user + partner summary for the header. */
  getThread: async (
    partnerUserId: string,
  ): Promise<{ messages: ChatMessage[]; partner: ChatThreadPartner | null }> => {
    try {
      const { data } = await apiClient.get<unknown>(`/api/v1/chat/thread/${partnerUserId}`);
      const inner = (data as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const rawItems = Array.isArray(inner?.items) ? inner.items : [];
      const messages = (rawItems as Record<string, unknown>[]).map(mapMessage);
      const p = inner?.partner as Record<string, unknown> | null | undefined;
      const partner =
        p && typeof p.id === 'string' && typeof p.fullName === 'string'
          ? {
            id: p.id,
            fullName: p.fullName,
            profileImageUrl: typeof p.profileImageUrl === 'string' ? p.profileImageUrl : undefined,
          }
          : null;
      return { messages, partner };
    } catch (err) {
      throw new Error(apiErr(err, 'Could not load messages'));
    }
  },

  getMessages: async (partnerUserId: string): Promise<ChatMessage[]> => {
    const { messages } = await chatService.getThread(partnerUserId);
    return messages;
  },

  sendMessage: async (partnerUserId: string, content: string): Promise<ChatMessage> => {
    try {
      const { data } = await apiClient.post<unknown>('/api/v1/chat/messages', {
        receiverId: partnerUserId,
        message: content.trim(),
      });
      const inner = (data as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
      const raw = inner?.message as Record<string, unknown> | undefined;
      if (!raw || raw._id == null) throw new Error('Invalid send response');
      return mapMessage(raw);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not send message'));
    }
  },

  markAsRead: async (partnerUserId: string): Promise<void> => {
    try {
      await apiClient.post(`/api/v1/chat/thread/${partnerUserId}/read`);
    } catch (err) {
      throw new Error(apiErr(err, 'Could not mark messages read'));
    }
  },
};
