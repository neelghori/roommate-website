/**
 * user.types.ts
 * User domain types. Backend: map to User Prisma model.
 */

export type UserRole = 'TENANT' | 'OWNER' | 'ADMIN';
export type GenderPreference = 'Male' | 'Female' | 'Any';
export type LifestyleTag = 'STUDENT' | 'WORKING' | 'VEGETARIAN' | 'NON_VEG' | 'SMOKER' | 'NON_SMOKER' | 'PET_FRIENDLY' | 'NIGHT_OWL' | 'EARLY_BIRD';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  avatarInitial: string;
  role: UserRole;
  isPhoneVerified: boolean;
  isAadharVerified: boolean;
  isCompanyVerified: boolean;
  listingCount: number;
  shortlistedCount: number;
  connectCount: number;
  bio?: string;
  location?: string;
  budget?: number;
  moveInDate?: string;
  genderPreference?: GenderPreference;
  lifestyle: LifestyleTag[];
  createdAt: string;
}

export interface RoommateProfile {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  avatarInitial: string;
  matchPercent: number;
  tags: string[];
  role: 'Student' | 'Working' | 'Veg Only';
  isConnected: boolean;
  location?: string;
  budget?: number;
  moveInDate?: string;
  bio?: string;
  age?: number;
  occupation?: string;
}

export interface RoommateRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar: string;
  receiverName: string;
  receiverAvatar: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  userId: string;
  name: string;
  avatarInitial: string;
  matchPercent: number;
  location: string;
  budget: number;
  tags: string[];
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image';
  /** Optimistic-send failure flag — set by chatStore.failMessage() */
  failed?: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface Notification {
  id: string;
  icon: 'request' | 'application' | 'connect' | 'listing' | 'match';
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
  linkUrl?: string;
}

export interface SavedListing {
  id: string;
  listingId: string;
  userId: string;
  savedAt: string;
}
