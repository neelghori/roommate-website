/**
 * Web Push subscription — service worker + POST /api/v1/push/subscribe
 */
import { apiClient } from '@/services/api';
import { getAccessToken } from '@/lib/authToken';
import { authApiErrorMessage } from '@/services/modules/auth.service';
import { useChatStore } from '@/store/chatStore';

const SW_PATH = '/sw.js';
const PROMPTED_KEY = 'roommat-push-prompted';

function supportsWebPush(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const { data } = await apiClient.get<unknown>('/api/v1/push/vapid-public-key');
    if (!data || typeof data !== 'object') return null;
    const root = data as Record<string, unknown>;
    const inner = root.data;
    if (inner && typeof inner === 'object') {
      const pk = (inner as Record<string, unknown>).publicKey;
      if (typeof pk === 'string' && pk.trim()) return pk.trim();
    }
    const pk = root.publicKey;
    if (typeof pk === 'string' && pk.trim()) return pk.trim();
    return null;
  } catch {
    return null;
  }
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!supportsWebPush()) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
  } catch {
    return null;
  }
}

async function getReadyRegistration(): Promise<ServiceWorkerRegistration | null> {
  const reg = await registerServiceWorker();
  if (!reg) return null;
  await navigator.serviceWorker.ready;
  return reg;
}

function subscriptionPayload(sub: PushSubscription) {
  const json = sub.toJSON();
  return {
    endpoint: json.endpoint!,
    keys: {
      p256dh: json.keys!.p256dh!,
      auth: json.keys!.auth!,
    },
    expirationTime: sub.expirationTime,
  };
}

export const pushService = {
  supportsWebPush,

  async requestPermission(): Promise<NotificationPermission> {
    if (!supportsWebPush()) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.requestPermission();
  },

  async subscribeAndSave(): Promise<boolean> {
    if (!supportsWebPush() || !getAccessToken()) return false;
    if (Notification.permission !== 'granted') return false;

    const publicKey = await fetchVapidPublicKey();
    if (!publicKey) return false;

    const registration = await getReadyRegistration();
    if (!registration) return false;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
    }

    try {
      await apiClient.post('/api/v1/push/subscribe', subscriptionPayload(subscription));
      return true;
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not save push subscription'));
    }
  },

  /** Ask once per browser (unless already granted/denied). */
  async ensureSubscribed(): Promise<void> {
    if (!supportsWebPush() || !getAccessToken()) return;

    if (Notification.permission === 'granted') {
      await this.subscribeAndSave().catch(() => {
        /* ignore transient errors */
      });
      return;
    }

    if (Notification.permission === 'denied') return;

    const prompted = localStorage.getItem(PROMPTED_KEY);
    if (prompted === '1') return;

    localStorage.setItem(PROMPTED_KEY, '1');
    const perm = await this.requestPermission();
    if (perm === 'granted') {
      await this.subscribeAndSave().catch(() => {
        /* ignore */
      });
    }
  },

  async unsubscribe(): Promise<void> {
    if (!supportsWebPush()) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration(SW_PATH);
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) return;
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      if (getAccessToken()) {
        await apiClient.post('/api/v1/push/unsubscribe', { endpoint });
      }
    } catch {
      /* ignore */
    }
  },
};

export type PushNotificationPayload = {
  _id: string;
  title: string;
  description?: string;
  type: string;
  payload?: Record<string, unknown>;
  isRead?: boolean;
  createdAt?: string;
};

/** Skip OS alerts when the user is actively reading that chat thread in a visible tab. */
export function shouldShowChatNotification(senderId: string): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;

  if (document.visibilityState === 'hidden') return true;

  if (useChatStore.getState().activeChatId === senderId) return false;

  return true;
}

export function showChatMessageNotification(input: {
  senderId: string;
  senderName: string;
  content: string;
  messageId?: string;
}): void {
  if (!shouldShowChatNotification(input.senderId)) return;

  const url = `/chat/${input.senderId}`;
  const tag = input.messageId ? `roommat-msg-${input.messageId}` : `roommat-chat-${input.senderId}`;

  try {
    const n = new Notification(input.senderName, {
      body: input.content.slice(0, 240),
      icon: '/favicon-32x32.png',
      tag,
      data: { url },
    });
    n.onclick = () => {
      window.focus();
      window.location.href = url;
      n.close();
    };
  } catch {
    /* ignore */
  }
}

export function dispatchNotificationNewEvent(notification: PushNotificationPayload): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('roommat:notification:new', { detail: notification }));
}

export function showBrowserNotificationFromPayload(notification: PushNotificationPayload): void {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  const payload = notification.payload ?? {};
  let url = '/notifications';
  if (notification.type === 'message' && payload.senderId) {
    const senderId = String(payload.senderId);
    if (!shouldShowChatNotification(senderId)) return;
    url = `/chat/${senderId}`;
  } else if (notification.type === 'listing' && payload.propertyId && payload.kind !== 'new_listing_pending') {
    url = `/listings/${String(payload.propertyId)}`;
  }

  try {
    const n = new Notification(notification.title, {
      body: notification.description || '',
      icon: '/favicon-32x32.png',
      tag: `roommat-${notification._id}`,
      data: { url },
    });
    n.onclick = () => {
      window.focus();
      window.location.href = url;
      n.close();
    };
  } catch {
    /* ignore */
  }
}
