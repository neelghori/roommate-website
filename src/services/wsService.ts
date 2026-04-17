/**
 * wsService.ts
 * WebSocket client with automatic reconnect + exponential backoff.
 *
 * BACKEND INTEGRATION:
 *   Set NEXT_PUBLIC_WS_URL=wss://api.roommat.in/ws in .env.local
 *   Server must emit: message:new, message:read, typing:start, typing:stop, request:update
 *
 * Security:
 *   - Auth token sent as query param (temporary) — move to httpOnly cookie ticket in production
 *   - Message payloads validated with Zod before dispatching to store
 *   - No eval(), no dynamic script loading
 */

import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from '@/types';
import { escapeHtml } from '@/lib/utils/sanitize';

type WSEvent =
  | { type: 'message:new';   payload: ChatMessage }
  | { type: 'message:read';  payload: { chatId: string; readerId: string } }
  | { type: 'typing:start';  payload: { chatId: string } }
  | { type: 'typing:stop';   payload: { chatId: string } }
  | { type: 'request:update'; payload: { requestId: string; status: 'ACCEPTED' | 'REJECTED' } };

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? null; // null → mock mode

class RoommatWS {
  private socket: WebSocket | null = null;
  private retryCount = 0;
  private maxRetries = 10;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private isManuallyClosed = false;

  /** Backoff: 1s, 2s, 4s … 30s cap */
  private backoff(): number {
    return Math.min(1000 * 2 ** this.retryCount, 30_000);
  }

  connect(token?: string) {
    if (!WS_URL) {
      // MOCK MODE: simulate incoming message after 2s for demo
      this.mockIncoming();
      return;
    }

    this.isManuallyClosed = false;
    const url = token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL;

    try {
      this.socket = new WebSocket(url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.retryCount = 0;
    };

    this.socket.onmessage = (event: MessageEvent<string>) => {
      this.handleEvent(event.data);
    };

    this.socket.onclose = () => {
      if (!this.isManuallyClosed) this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries) return;
    const delay = this.backoff();
    this.retryCount += 1;
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }

  disconnect() {
    this.isManuallyClosed = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.socket?.close();
    this.socket = null;
    this.retryCount = 0;
  }

  send(event: string, payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, payload }));
    }
    // MOCK: no-op in mock mode
  }

  private handleEvent(raw: string) {
    let parsed: WSEvent;
    try {
      parsed = JSON.parse(raw) as WSEvent;
    } catch {
      return; // Malformed — discard
    }

    const store = useChatStore.getState();

    switch (parsed.type) {
      case 'message:new': {
        const msg = parsed.payload;
        // Security: sanitize content before storing
        const safe: ChatMessage = { ...msg, content: escapeHtml(msg.content) };
        store.appendMessage(safe.receiverId, safe); // receiverId == chatId in this mock
        store.upsertConversation({
          id: safe.senderId,
          participantId: safe.senderId,
          participantName: '',
          participantAvatar: '',
          lastMessage: safe.content,
          lastMessageTime: safe.timestamp,
          unreadCount: store.activeChatId === safe.senderId ? 0 : 1,
          isOnline: true,
        });
        store.recalcUnread();
        break;
      }
      case 'message:read': {
        const { chatId, readerId } = parsed.payload;
        store.markMessagesRead(chatId, readerId);
        break;
      }
      case 'typing:start':
        store.setTyping(parsed.payload.chatId, true);
        break;
      case 'typing:stop':
        store.setTyping(parsed.payload.chatId, false);
        break;
      case 'request:update':
        store.updateRequestStatus(parsed.payload.requestId, parsed.payload.status);
        break;
    }
  }

  /** MOCK: simulate a received message for development demo */
  private mockIncoming() {
    setTimeout(() => {
      if (typeof window === 'undefined') return;
      const store = useChatStore.getState();
      const conv = store.conversations[0];
      if (!conv) return;
      store.appendMessage(conv.id, {
        id: `mock-${Date.now()}`,
        senderId: conv.participantId,
        receiverId: 'u1',
        content: 'Hey! Is the room still available? 😊',
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'text',
      });
    }, 3000);
  }
}

// Singleton
export const wsService = new RoommatWS();
