/**
 * user.service.ts
 * User & roommate service module.
 *
 * MOCK MODE: Returns mock data with artificial delay.
 * BACKEND INTEGRATION: Replace mock functions with apiClient calls.
 *
 * Expected endpoints:
 *   GET    /users/me                        → User
 *   PUT    /users/me                        → User
 *   GET    /roommates                       → RoommateProfile[]
 *   GET    /roommates/:id                   → RoommateProfile
 *   POST   /roommates/request               → RoommateRequest
 *   GET    /roommates/requests/sent         → RoommateRequest[]
 *   GET    /roommates/requests/received     → RoommateRequest[]
 *   PUT    /roommates/requests/:id/accept   → RoommateRequest
 *   PUT    /roommates/requests/:id/reject   → RoommateRequest
 *   GET    /users/matches                   → Match[]
 *   GET    /users/notifications             → Notification[]
 *   PUT    /users/notifications/:id/read    → void
 *   POST   /users/verify-phone             → { message }
 *   POST   /users/avatar                   → { url }
 */

import {
  User,
  RoommateProfile,
  RoommateRequest,
  Match,
  Notification,
} from '@/types';
import { CURRENT_USER, ROOMMATE_PROFILES, MATCHES, ROOMMATE_REQUESTS_SENT, ROOMMATE_REQUESTS_RECEIVED } from '@/mock/data/users';
import { MOCK_NOTIFICATIONS } from '@/mock/data/notifications';

// Mock delay to simulate network latency
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

export type UpdateProfilePayload = {
  name?: string;
  bio?: string;
  location?: string;
  budget?: number;
  moveInDate?: string;
  genderPreference?: string;
  lifestyle?: string[];
  phone?: string;
};

export type RoommateFilters = {
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  lifestyle?: string[];
  role?: string;
};

export const userService = {
  /**
   * Get current user profile.
   * BACKEND: GET /users/me
   */
  getProfile: async (): Promise<User> => {
    await delay(400);
    return CURRENT_USER;
  },

  /**
   * Update current user profile.
   * BACKEND: PUT /users/me
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    await delay();
    return {
      ...CURRENT_USER,
      ...payload,
      lifestyle: (payload.lifestyle as User['lifestyle']) ?? CURRENT_USER.lifestyle,
      genderPreference:
        (payload.genderPreference as User['genderPreference']) ?? CURRENT_USER.genderPreference,
    };
  },

  /**
   * Get roommate profiles with optional filters.
   * BACKEND: GET /roommates?location=...&minBudget=...
   */
  getRoommateProfiles: async (filters?: RoommateFilters): Promise<RoommateProfile[]> => {
    await delay();
    let results = [...ROOMMATE_PROFILES];

    if (filters?.location) {
      const q = filters.location.toLowerCase();
      results = results.filter((r) => r.location?.toLowerCase().includes(q));
    }
    if (filters?.minBudget !== undefined) {
      results = results.filter((r) => (r.budget ?? 0) >= filters.minBudget!);
    }
    if (filters?.maxBudget !== undefined) {
      results = results.filter((r) => (r.budget ?? Infinity) <= filters.maxBudget!);
    }
    if (filters?.lifestyle && filters.lifestyle.length > 0) {
      results = results.filter((r) =>
        filters.lifestyle!.some((tag) => r.tags.includes(tag)),
      );
    }
    if (filters?.role) {
      results = results.filter((r) => r.role === filters.role);
    }

    return results.sort((a, b) => b.matchPercent - a.matchPercent);
  },

  /**
   * Get a single roommate profile by ID.
   * BACKEND: GET /roommates/:id
   */
  getRoommateById: async (id: string): Promise<RoommateProfile> => {
    await delay(500);
    const profile = ROOMMATE_PROFILES.find((r) => r.id === id || r.userId === id);
    if (!profile) {
      throw new Error(`Roommate profile not found: ${id}`);
    }
    return profile;
  },

  /**
   * Send a roommate request.
   * BACKEND: POST /roommates/request
   */
  sendRequest: async (roommateId: string, message?: string): Promise<RoommateRequest> => {
    await delay();
    const target = ROOMMATE_PROFILES.find((r) => r.id === roommateId || r.userId === roommateId);
    const newRequest: RoommateRequest = {
      id: `req${Date.now()}`,
      senderId: 'u1',
      receiverId: target?.userId ?? roommateId,
      senderName: CURRENT_USER.name,
      senderAvatar: CURRENT_USER.avatarInitial,
      receiverName: target?.name ?? 'Unknown',
      receiverAvatar: target?.avatarInitial ?? '??',
      status: 'PENDING',
      message,
      createdAt: new Date().toISOString(),
    };
    return newRequest;
  },

  /**
   * Get requests sent by the current user.
   * BACKEND: GET /roommates/requests/sent
   */
  getRequestsSent: async (): Promise<RoommateRequest[]> => {
    await delay();
    return ROOMMATE_REQUESTS_SENT;
  },

  /**
   * Get requests received by the current user.
   * BACKEND: GET /roommates/requests/received
   */
  getRequestsReceived: async (): Promise<RoommateRequest[]> => {
    await delay();
    return ROOMMATE_REQUESTS_RECEIVED;
  },

  /**
   * Accept a roommate request.
   * BACKEND: PUT /roommates/requests/:id/accept
   */
  acceptRequest: async (requestId: string): Promise<RoommateRequest> => {
    await delay(500);
    const request = ROOMMATE_REQUESTS_RECEIVED.find((r) => r.id === requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }
    return { ...request, status: 'ACCEPTED' };
  },

  /**
   * Reject a roommate request.
   * BACKEND: PUT /roommates/requests/:id/reject
   */
  rejectRequest: async (requestId: string): Promise<RoommateRequest> => {
    await delay(500);
    const request = ROOMMATE_REQUESTS_RECEIVED.find((r) => r.id === requestId);
    if (!request) {
      throw new Error(`Request not found: ${requestId}`);
    }
    return { ...request, status: 'REJECTED' };
  },

  /**
   * Get match suggestions for the current user.
   * BACKEND: GET /users/matches
   */
  getMatches: async (): Promise<Match[]> => {
    await delay();
    return MATCHES;
  },

  /**
   * Get notifications for the current user.
   * BACKEND: GET /users/notifications
   */
  getNotifications: async (): Promise<Notification[]> => {
    await delay(400);
    return MOCK_NOTIFICATIONS;
  },

  /**
   * Mark a single notification as read.
   * BACKEND: PUT /users/notifications/:id/read
   */
  markNotificationRead: async (id: string): Promise<void> => {
    await delay(200);
    void id; // used in real implementation
  },

  /**
   * Verify user phone number with OTP code.
   * BACKEND: POST /users/verify-phone
   */
  verifyPhone: async (code: string): Promise<{ message: string }> => {
    await delay();
    if (code.length !== 6) {
      throw new Error('Invalid OTP code');
    }
    return { message: 'Phone number verified successfully' };
  },

  /**
   * Upload a new avatar image.
   * BACKEND: POST /users/avatar (multipart/form-data)
   */
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    await delay(1200);
    void file; // used in real implementation
    return { url: `/images/avatars/u1-${Date.now()}.jpg` };
  },
};
