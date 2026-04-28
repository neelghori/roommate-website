/**
 * chatStore.ts
 * Zustand store for chat + request state.
 *
 * Realtime: populated by wsService events (message:new, message:read, typing).
 * BACKEND: hydrate on mount via chatService.getConversations() + getMessages().
 */
import { create } from 'zustand';
import { ChatConversation, ChatMessage, RoommateRequest } from '@/types';

interface TypingState {
  [conversationId: string]: boolean; // true = other party is typing
}

/** Merge GET /thread snapshot with in-flight local messages (avoids race: slow fetch overwriting a send). */
function mergeThreadMessages(local: ChatMessage[], server: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const m of server) {
    if (m.id) byId.set(m.id, m);
  }
  for (const m of local) {
    if (!m.id) continue;
    if (m.id.startsWith('temp-')) {
      byId.set(m.id, m);
      continue;
    }
    if (!byId.has(m.id)) {
      byId.set(m.id, m);
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

interface ChatState {
  // ── Conversations ──────────────────────────────────────────────────────────
  conversations: ChatConversation[];
  activeChatId: string | null;
  setConversations: (c: ChatConversation[]) => void;
  setActiveChatId: (id: string | null) => void;
  markConversationRead: (id: string) => void;
  upsertConversation: (c: ChatConversation) => void;

  // ── Messages ───────────────────────────────────────────────────────────────
  messagesByChatId: Record<string, ChatMessage[]>;
  setMessages: (chatId: string, msgs: ChatMessage[]) => void;
  /** Merge server thread with local (temp + messages not yet in server snapshot). */
  mergeThreadFromServer: (chatId: string, serverMsgs: ChatMessage[]) => void;
  appendMessage: (chatId: string, msg: ChatMessage) => void;
  /** Optimistic update: replace tempId with real id from server */
  confirmMessage: (chatId: string, tempId: string, confirmed: ChatMessage) => void;
  /** Mark a message as failed (optimistic rollback) */
  failMessage: (chatId: string, tempId: string) => void;
  markMessagesRead: (chatId: string, readerId: string) => void;

  // ── Typing ─────────────────────────────────────────────────────────────────
  typing: TypingState;
  setTyping: (chatId: string, isTyping: boolean) => void;

  // ── Unread total ───────────────────────────────────────────────────────────
  totalUnread: number;
  recalcUnread: () => void;

  // ── Requests ───────────────────────────────────────────────────────────────
  requestsReceived: RoommateRequest[];
  requestsSent: RoommateRequest[];
  setRequestsReceived: (r: RoommateRequest[]) => void;
  setRequestsSent: (r: RoommateRequest[]) => void;
  updateRequestStatus: (id: string, status: RoommateRequest['status']) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  // ── Conversations ───────────────────────────────────────────────────────────
  conversations: [],
  activeChatId: null,

  setConversations: (conversations) => {
    set({ conversations });
    get().recalcUnread();
  },

  setActiveChatId: (id) => set({ activeChatId: id }),

  markConversationRead: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ),
    })),

  upsertConversation: (conv) =>
    set((state) => {
      const exists = state.conversations.find((c) => c.id === conv.id);
      const next = exists
        ? state.conversations.map((c) => (c.id === conv.id ? conv : c))
        : [conv, ...state.conversations];
      return { conversations: next };
    }),

  // ── Messages ────────────────────────────────────────────────────────────────
  messagesByChatId: {},

  setMessages: (chatId, msgs) =>
    set((state) => ({
      messagesByChatId: { ...state.messagesByChatId, [chatId]: msgs },
    })),

  mergeThreadFromServer: (chatId, serverMsgs) =>
    set((state) => {
      const local = state.messagesByChatId[chatId] ?? [];
      const merged = mergeThreadMessages(local, serverMsgs);
      return { messagesByChatId: { ...state.messagesByChatId, [chatId]: merged } };
    }),

  appendMessage: (chatId, msg) =>
    set((state) => {
      const existing = state.messagesByChatId[chatId] ?? [];
      if (msg.id && existing.some((m) => m.id === msg.id)) {
        return {
          messagesByChatId: {
            ...state.messagesByChatId,
            [chatId]: existing.map((m) => (m.id === msg.id ? msg : m)),
          },
        };
      }
      return {
        messagesByChatId: { ...state.messagesByChatId, [chatId]: [...existing, msg] },
      };
    }),

  confirmMessage: (chatId, tempId, confirmed) =>
    set((state) => {
      const msgs = state.messagesByChatId[chatId] ?? [];
      const next = msgs
        .filter((m) => m.id !== tempId && m.id !== confirmed.id)
        .concat([confirmed])
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      return { messagesByChatId: { ...state.messagesByChatId, [chatId]: next } };
    }),

  failMessage: (chatId, tempId) =>
    set((state) => {
      const msgs = (state.messagesByChatId[chatId] ?? []).map((m) =>
        m.id === tempId ? { ...m, failed: true } : m
      );
      return { messagesByChatId: { ...state.messagesByChatId, [chatId]: msgs } };
    }),

  markMessagesRead: (chatId, readerId) =>
    set((state) => {
      const msgs = (state.messagesByChatId[chatId] ?? []).map((m) =>
        m.senderId !== readerId ? { ...m, isRead: true } : m
      );
      return { messagesByChatId: { ...state.messagesByChatId, [chatId]: msgs } };
    }),

  // ── Typing ──────────────────────────────────────────────────────────────────
  typing: {},
  setTyping: (chatId, isTyping) =>
    set((state) => ({ typing: { ...state.typing, [chatId]: isTyping } })),

  // ── Unread ──────────────────────────────────────────────────────────────────
  totalUnread: 0,
  recalcUnread: () =>
    set((state) => ({
      totalUnread: state.conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
    })),

  // ── Requests ────────────────────────────────────────────────────────────────
  requestsReceived: [],
  requestsSent: [],
  setRequestsReceived: (r) => set({ requestsReceived: r }),
  setRequestsSent: (r) => set({ requestsSent: r }),
  updateRequestStatus: (id, status) =>
    set((state) => ({
      requestsReceived: state.requestsReceived.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
      requestsSent: state.requestsSent.map((r) =>
        r.id === id ? { ...r, status } : r
      ),
    })),
}));
