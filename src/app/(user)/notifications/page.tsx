/**
 * notifications/page.tsx loads from GET /api/v1/notifications
 */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UserLayout } from '@/components/shared/UserLayout';
import { useToast } from '@/hooks/useToast';
import {
  Home,
  MessageCircle,
  Bell,
  Star,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { notificationService, type ApiNotification } from '@/services/modules/notification.service';
import { formatRelativeTime } from '@/lib/utils/formatRelativeTime';

type RowCategory = 'listing' | 'message' | 'match' | 'system' | 'review' | 'alert';

function apiTypeToCategory(type: string): RowCategory {
  const t = (type || '').toLowerCase();
  if (t === 'listing') return 'listing';
  if (t === 'message') return 'message';
  if (t === 'booking') return 'alert';
  if (t === 'payment') return 'review';
  return 'system';
}

const categoryConfig: Record<
  RowCategory,
  { icon: React.ElementType; bg: string; color: string }
> = {
  listing: { icon: Home, bg: 'bg-primary/10', color: 'text-primary' },
  message: { icon: MessageCircle, bg: 'bg-green-50', color: 'text-green-600' },
  match: { icon: Bell, bg: 'bg-pink-50', color: 'text-pink-500' },
  system: { icon: Bell, bg: 'bg-yellow-50', color: 'text-yellow-600' },
  review: { icon: Star, bg: 'bg-purple-50', color: 'text-purple-600' },
  alert: { icon: Bell, bg: 'bg-orange-50', color: 'text-orange-600' },
};

function NotificationRow({
  n,
  onOpen,
}: {
  n: ApiNotification;
  onOpen: (n: ApiNotification) => void;
}) {
  const cat = apiTypeToCategory(n.type);
  const config = categoryConfig[cat];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(n)}
      className={[
        'flex w-full items-start gap-3 border-b border-gray-100 px-4 py-3.5 text-left transition-colors last:border-0',
        !n.isRead ? 'bg-primary/5' : 'bg-white hover:bg-gray-50',
      ].join(' ')}
    >
      <div
        className={['mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full', config.bg].join(' ')}
      >
        <Icon size={18} className={config.color} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={[
              'text-sm leading-snug',
              !n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700',
            ].join(' ')}
          >
            {n.title}
          </p>
          {!n.isRead ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" /> : null}
        </div>
        {n.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{n.description}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-gray-400">{formatRelativeTime(n.createdAt)}</p>
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ApiNotification | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await notificationService.listMine());
    } catch (e) {
      toast.error('Could not load', e instanceof Error ? e.message : '');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    const unread = items.filter((n) => !n.isRead);
    if (!unread.length) return;
    try {
      await Promise.all(unread.map((n) => notificationService.markRead(n._id)));
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All caught up!', 'Marked all notifications as read.');
    } catch (e) {
      toast.error('Update failed', e instanceof Error ? e.message : '');
    }
  };

  const openDetail = async (n: ApiNotification) => {
    setDetail(n);
    if (!n.isRead) {
      try {
        await notificationService.markRead(n._id);
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      } catch {
        /* still show modal */
      }
    }
  };

  return (
    <UserLayout pageSuffix="Notifications" showSearch={false} showFab={false}>
      <div className="mx-auto max-w-2xl px-0 py-0">
        <div className="flex items-center justify-between px-4 pb-3 pt-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 ? (
              <p className="mt-0.5 text-xs text-gray-500">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-gray-400">You&apos;re all caught up</p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllRead()}
              className="flex items-center gap-1.5 rounded-full border border-primary px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Bell size={28} className="text-primary" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-gray-800">No notifications yet</h3>
              <p className="text-sm text-gray-500">
                We&apos;ll notify you about listing updates and messages here.
              </p>
            </div>
          ) : (
            items.map((n) => <NotificationRow key={n._id} n={n} onOpen={(x) => void openDetail(x)} />)
          )}
        </div>

        <p className="py-6 text-center text-xs text-gray-400">
          Notifications older than 30 days may be archived.
        </p>
      </div>

      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? 'Notification'} size="sm">
        {detail ? (
          <div className="space-y-4">
            {detail.description ? <p className="text-sm text-gray-600">{detail.description}</p> : null}
            <p className="text-xs text-gray-400">{formatRelativeTime(detail.createdAt)}</p>
            {detail.type?.toLowerCase() === 'message' && detail.payload?.senderId ? (
              <Link
                href={`/chat/${detail.payload.senderId}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => setDetail(null)}
              >
                Open chat
              </Link>
            ) : detail.payload?.propertyId ? (
              <Link
                href={`/listings/${detail.payload.propertyId}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-95"
                onClick={() => setDetail(null)}
              >
                View listing
              </Link>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </UserLayout>
  );
}
