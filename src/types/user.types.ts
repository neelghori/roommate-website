/**
 * user.types.ts
 * User domain types. Backend: map to User Prisma model.
 */

export type UserRole = 'TENANT' | 'OWNER' | 'ROOMMATE' | 'ADMIN';

/** Stored on the user record; super admin approves in the admin panel. */
export type IdentityVerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';
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
  identityVerificationStatus?: IdentityVerificationStatus;
  identityDocumentUrl?: string;
  identityRejectionReason?: string;
  identitySubmittedAt?: string;
  listingCount: number;
  /** Saved properties (wishlist) count from API. */
  shortlistedCount: number;
  /** Property visit bookings requested by this user. */
  bookingCount: number;
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
  /** `tenant_profile` = seeker form; `user_account` = main User only (no seeker doc yet). */
  listingSource?: 'tenant_profile' | 'user_account';
  /** Same as `id` — tenant roommate profile document id. */
  profileId?: string;
  userId: string;
  name: string;
  displayName?: string;
  avatarUrl?: string;
  avatarInitial: string;
  matchPercent: number;
  tags: string[];
  /** Seeker-facing tags from API (`lifestyleTags`). */
  lifestyleTags?: string[];
  role: 'Student' | 'Working' | 'Veg Only';
  isConnected: boolean;
  location?: string;
  budget?: number;
  monthlyBudget?: number;
  moveInDate?: string;
  bio?: string;
  age?: number;
  occupation?: string;
  /** Linked account (User) — public list API includes these. */
  accountFullName?: string;
  accountRole?: string;
  email?: string;
  mobile?: string;
  createdAt?: string;
  updatedAt?: string;
  /** From `User.professionalType` (e.g. `student`, `work_professional`). */
  professionalType?: string;
  gender?: string;
  roommateGenderPreference?: string;
  lifestyleSnippet?: {
    diet?: string;
    smoking?: string;
    maritalStatus?: string;
  };
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
