/**
 * wsService.ts — realtime layer on top of REST chat.
 *
 * **Why WebSockets?** HTTP POST only saves the message; it does not notify the other browser tab.
 * WS lets the server **push** `{ type: 'message:new', payload }` so the other user (and your other tabs)
 * see new lines **without refresh**. REST + optimistic UI still handles your own send.
 *
 * **URL resolution (first match wins):**
 * 1. `NEXT_PUBLIC_WS_URL` — full `ws(s)://…/ws`
 * 2. `NEXT_PUBLIC_API_URL` — same host, path `/ws`
 * 3. `NEXT_PUBLIC_SITE_URL` — if it is `http(s)://…` (some setups point this at the API origin)
 *
 * Supports frames: `{ type: "message:new", payload }` or `{ event, payload }` (Mongo message doc ok).
 */
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { mapChatMessageFromApi } from '@/services/modules/chat.service';
import type { ChatMessage } from '@/types';
import { getAccessToken } from '@/lib/authToken';
import { escapeHtml } from '@/lib/utils/sanitize';

type WSEvent =
  | { type: 'message:new'; payload: ChatMessage }
  | { type: 'message:read'; payload: { chatId: string; readerId: string } }
  | { type: 'typing:start'; payload: { chatId: string } }
  | { type: 'typing:stop'; payload: { chatId: string } }
  | { type: 'request:update'; payload: { requestId: string; status: 'ACCEPTED' | 'REJECTED' } };

function inferWsUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (explicit) return explicit;

  const candidates: string[] = [];
  const api = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (api && !api.startsWith('/')) candidates.push(api);
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (site && /^https?:\/\//i.test(site)) candidates.push(site);

  for (const raw of candidates) {
    try {
      const u = new URL(raw);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') continue;
      const proto = u.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${u.host}/ws`;
    } catch {
      /* try next */
    }
  }
  return null;
}

const WS_URL = inferWsUrl();

function buildWsUrl(base: string, token: string | null): string {
  try {
    const u = new URL(base);
    if (token) u.searchParams.set('token', token);
    return u.href;
  } catch {
    if (!token) return base;
    const join = base.includes('?') ? '&' : '?';
    return `${base}${join}token=${encodeURIComponent(token)}`;
  }
}

function normalizeEventKind(raw: string): string {
  const k = raw.toLowerCase();
  if (k === 'chat:message' || k === 'new_message' || k === 'message') return 'message:new';
  if (k === 'typingstart') return 'typing:start';
  if (k === 'typingstop') return 'typing:stop';
  return k;
}

function payloadToChatMessage(payload: unknown): ChatMessage | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>;
  if (
    typeof p.id === 'string' &&
    typeof p.senderId === 'string' &&
    typeof p.receiverId === 'string' &&
    typeof p.content === 'string'
  ) {
    return {
      id: p.id,
      senderId: p.senderId,
      receiverId: p.receiverId,
      content: p.content,
      timestamp: typeof p.timestamp === 'string' ? p.timestamp : new Date().toISOString(),
      isRead: Boolean(p.isRead),
      type: 'text',
    };
  }
  if (p._id != null && (p.sender != null || p.receiver != null)) {
    return mapChatMessageFromApi(p);
  }
  const inner = p.message;
  if (inner && typeof inner === 'object' && (inner as Record<string, unknown>)._id != null) {
    return mapChatMessageFromApi(inner as Record<string, unknown>);
  }
  return null;
}

class RoommatWS {
  private socket: WebSocket | null = null;
  private retryCount = 0;
  private maxRetries = 10;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private isManuallyClosed = false;
  private lastToken: string | null = null;
  private lastConnectUrl: string | null = null;

  private backoff(): number {
    return Math.min(1000 * 2 ** this.retryCount, 30_000);
  }

  /**
   * Opens (or replaces) the WebSocket. Pass JWT explicitly or rely on sessionStorage token.
   */
  connect(token?: string) {
    if (!WS_URL) return;

    const resolved = token ?? getAccessToken() ?? null;
    this.lastToken = resolved;
    this.isManuallyClosed = false;

    const url = buildWsUrl(WS_URL, resolved);

    if (this.socket?.readyState === WebSocket.OPEN && this.lastConnectUrl === url) {
      return;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      try {
        this.socket.close();
      } catch {
        /* ignore */
      }
      this.socket = null;
    }

    this.lastConnectUrl = url;

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
      this.handleRawMessage(event.data);
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (!this.isManuallyClosed) this.scheduleReconnect();
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private scheduleReconnect() {
    if (this.retryCount >= this.maxRetries || this.isManuallyClosed) return;
    const delay = this.backoff();
    this.retryCount += 1;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect(this.lastToken ?? undefined);
    }, delay);
  }

  disconnect() {
    this.isManuallyClosed = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      try {
        this.socket.close();
      } catch {
        /* ignore */
      }
      this.socket = null;
    }
    this.retryCount = 0;
    this.lastConnectUrl = null;
  }

  send(event: string, payload: unknown) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, payload }));
    }
  }

  /** True when socket is connected (typing / future client→server events). */
  isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /** Resolved WS URL after env inference (null = realtime push disabled). */
  getUrl(): string | null {
    return WS_URL;
  }

  private handleRawMessage(raw: string) {
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }

    const typeField = typeof obj.type === 'string' ? obj.type : '';
    const eventField = typeof obj.event === 'string' ? obj.event : '';
    const kind = normalizeEventKind(typeField || eventField);
    const payload = obj.payload ?? obj.data ?? obj.body;

    const store = useChatStore.getState();
    const meRaw = useAuthStore.getState().user?.id;

    switch (kind) {
      case 'message:new': {
        const msg = payloadToChatMessage(payload);
        if (!msg?.senderId || !msg.receiverId) return;
        if (meRaw == null || String(meRaw) === '') return;
        const me = String(meRaw);
        const partnerId = msg.senderId === me ? msg.receiverId : msg.receiverId === me ? msg.senderId : '';
        if (!partnerId) return;

        const safe: ChatMessage = { ...msg, content: escapeHtml(msg.content) };
        store.appendMessage(partnerId, safe);

        const conv = store.conversations.find((c) => c.id === partnerId);
        const name = conv?.participantName?.trim() || 'User';
        const avatar =
          conv?.participantAvatar ||
          name
            .split(/\s+/)
            .map((x) => x[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) ||
          'U';

        store.upsertConversation({
          id: partnerId,
          participantId: partnerId,
          participantName: name,
          participantAvatar: avatar,
          lastMessage: safe.content,
          lastMessageTime: safe.timestamp,
          unreadCount: store.activeChatId === partnerId ? 0 : 1,
          isOnline: true,
        });
        store.recalcUnread();
        break;
      }
      case 'message:read': {
        const p = payload as { chatId?: string; readerId?: string } | null;
        if (!p?.chatId || !p?.readerId) return;
        store.markMessagesRead(p.chatId, p.readerId);
        break;
      }
      case 'typing:start': {
        const p = payload as { chatId?: string } | null;
        if (p?.chatId) store.setTyping(p.chatId, true);
        break;
      }
      case 'typing:stop': {
        const p = payload as { chatId?: string } | null;
        if (p?.chatId) store.setTyping(p.chatId, false);
        break;
      }
      case 'request:update': {
        const p = payload as { requestId?: string; status?: 'ACCEPTED' | 'REJECTED' } | null;
        if (p?.requestId && p?.status) store.updateRequestStatus(p.requestId, p.status);
        break;
      }
      default:
        break;
    }
  }
}

export const wsService = new RoommatWS();
