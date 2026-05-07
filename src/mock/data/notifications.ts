/**
 * mock/data/notifications.ts
 * Mock notification data for development and testing.
 */

import { Notification } from '@/types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    icon: 'request',
    title: 'New Roommate Request',
    subtitle: 'Ravi Gupta sent you a roommate request.',
    time: '2026-04-16T08:30:00Z',
    isUnread: true,
    linkUrl: '/roommates/requests',
  },
  {
    id: 'notif2',
    icon: 'request',
    title: 'Request Accepted',
    subtitle: 'Arjun Sharma accepted your roommate request!',
    time: '2026-04-15T18:00:00Z',
    isUnread: true,
    linkUrl: '/roommates/u2',
  },
  {
    id: 'notif3',
    icon: 'match',
    title: 'New Match Found',
    subtitle: 'You have a 92% match with Arjun Sharma in Navrangpura.',
    time: '2026-04-15T14:00:00Z',
    isUnread: true,
    linkUrl: '/roommates/u2',
  },
  {
    id: 'notif4',
    icon: 'application',
    title: 'Listing Application',
    subtitle: 'Simran Kaur applied to your Thaltej 3BHK listing.',
    time: '2026-04-14T16:30:00Z',
    isUnread: true,
    linkUrl: '/listings/l11',
  },
  {
    id: 'notif5',
    icon: 'connect',
    title: 'New Connection',
    subtitle: 'Pooja Desai is now connected with you.',
    time: '2026-04-13T12:00:00Z',
    isUnread: false,
    linkUrl: '/chat/conv3',
  },
  {
    id: 'notif6',
    icon: 'listing',
    title: 'Listing Approved',
    subtitle: 'Your listing "Roommate Wanted Thaltej 3BHK" is now live.',
    time: '2026-04-12T10:00:00Z',
    isUnread: false,
    linkUrl: '/listings/l11',
  },
  {
    id: 'notif7',
    icon: 'request',
    title: 'Request Rejected',
    subtitle: 'Karan Mehta declined your roommate request.',
    time: '2026-04-10T15:45:00Z',
    isUnread: false,
    linkUrl: '/roommates/requests',
  },
  {
    id: 'notif8',
    icon: 'match',
    title: 'Profile Views Up',
    subtitle: 'Your profile was viewed 12 times this week. Complete verification to get more.',
    time: '2026-04-08T09:00:00Z',
    isUnread: false,
    linkUrl: '/profile/settings',
  },
  {
    id: 'notif9',
    icon: 'listing',
    title: 'Saved Listing Updated',
    subtitle: 'The PG you saved in Bodakdev has updated its price.',
    time: '2026-04-05T11:30:00Z',
    isUnread: false,
    linkUrl: '/listings/l5',
  },
  {
    id: 'notif10',
    icon: 'connect',
    title: 'Chat Message',
    subtitle: 'Ramesh Patel sent you a message about your visit request.',
    time: '2026-04-04T14:20:00Z',
    isUnread: false,
    linkUrl: '/chat/conv4',
  },
];
