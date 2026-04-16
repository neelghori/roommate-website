/**
 * notifications/page.tsx
 * Notifications list page.
 * Unread items have a light teal background.
 * "Mark all read" button dismisses all unread state.
 */
'use client';
import React, { useState } from 'react';
import { UserLayout } from '@/components/shared/UserLayout';
import { PageContainer } from '@/components/shared/PageContainer';
import { useToast } from '@/components/ui/Toast';
import {
  Home,
  Heart,
  MessageCircle,
  Bell,
  Star,
  CheckCircle,
  AlertCircle,
  User,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationCategory =
  | 'listing'
  | 'message'
  | 'match'
  | 'system'
  | 'review'
  | 'alert';

interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  subtitle: string;
  time: string;
  read: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    category: 'message',
    title: 'New message from Ravi Sharma',
    subtitle: 'Hey! Is the room in Satellite still available?',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    category: 'match',
    title: 'Roommate match found!',
    subtitle: 'Priya M. matches 92% of your preferences in Navrangpura.',
    time: '15 min ago',
    read: false,
  },
  {
    id: '3',
    category: 'listing',
    title: 'Your listing was approved',
    subtitle: '2BHK in Bodakdev has been published successfully.',
    time: '1 hr ago',
    read: false,
  },
  {
    id: '4',
    category: 'review',
    title: 'New review on your profile',
    subtitle: 'Ankit left you a 5-star review. "Great flatmate, very clean!"',
    time: '3 hr ago',
    read: false,
  },
  {
    id: '5',
    category: 'listing',
    title: 'Listing saved by 3 people',
    subtitle: 'Your Paldi listing is getting attention. 3 new saves today.',
    time: '5 hr ago',
    read: true,
  },
  {
    id: '6',
    category: 'system',
    title: 'Complete your profile',
    subtitle: 'Add a profile photo to get 3x more responses from landlords.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '7',
    category: 'alert',
    title: 'Price drop alert',
    subtitle: 'A saved listing in Vastrapur dropped from ₹8,500 to ₹7,000/mo.',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '8',
    category: 'message',
    title: 'New message from Deepa Patel',
    subtitle: 'Can we schedule a visit this weekend?',
    time: '2 days ago',
    read: true,
  },
];

// ─── Icon & color maps ────────────────────────────────────────────────────────

const categoryConfig: Record<
  NotificationCategory,
  { icon: React.ElementType; bg: string; color: string }
> = {
  listing: { icon: Home, bg: '#E0F4F4', color: '#1B8F8F' },
  message: { icon: MessageCircle, bg: '#E8F5E9', color: '#388E3C' },
  match: { icon: Heart, bg: '#FCE4EC', color: '#E91E63' },
  system: { icon: Bell, bg: '#FFF8E1', color: '#F9A825' },
  review: { icon: Star, bg: '#F3E5F5', color: '#8E24AA' },
  alert: { icon: AlertCircle, bg: '#FFF3E0', color: '#F57C00' },
};

// ─── Single notification row ──────────────────────────────────────────────────

interface NotificationItemProps {
  notification: AppNotification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const config = categoryConfig[notification.category];
  const Icon = config.icon;

  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 transition-colors',
        !notification.read ? 'bg-teal-50/60' : 'bg-white',
      ].join(' ')}
    >
      {/* Category icon circle */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
        style={{ backgroundColor: config.bg }}
      >
        <Icon size={18} style={{ color: config.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={[
              'text-sm leading-snug',
              !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700',
            ].join(' ')}
          >
            {notification.title}
          </p>
          {/* Unread dot */}
          {!notification.read && (
            <span
              className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
              style={{ backgroundColor: '#1B8F8F' }}
              aria-label="Unread"
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.subtitle}</p>
        <p className="text-[11px] text-gray-400 mt-1">{notification.time}</p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const { toast } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All caught up!', 'Marked all notifications as read.');
  };

  return (
    <UserLayout pageSuffix=" Notifications" showSearch={false} showFab={false}>
      <PageContainer maxWidth="lg" className="px-0 py-0">
        {/* Header row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 ? (
              <p className="text-xs text-gray-500 mt-0.5">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">You're all caught up</p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-teal-50"
              style={{ color: '#1B8F8F', borderColor: '#1B8F8F' }}
            >
              <CheckCircle size={13} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mx-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: '#E0F4F4' }}
              >
                <Bell size={28} style={{ color: '#1B8F8F' }} />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">No notifications yet</h3>
              <p className="text-sm text-gray-500">
                We'll notify you about messages, matches, and listing updates.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          )}
        </div>

        {/* Today / Earlier section labels could go here in a real implementation */}
        <p className="text-center text-xs text-gray-400 py-6">
          Notifications older than 30 days are automatically removed.
        </p>
      </PageContainer>
    </UserLayout>
  );
}
