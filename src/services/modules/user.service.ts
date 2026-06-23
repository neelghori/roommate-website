/**
 * user.service.ts
 * User & roommate service module.
 *
 * Profile: GET/PATCH `/api/v1/auth/me` via apiClient + auth mappers (see auth.service.ts).
 * Other routes remain mock until wired.
 *
 * Expected endpoints:
 *   GET    /api/v1/auth/me                  → User
 *   PATCH  /api/v1/auth/me                 → User
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
import { CURRENT_USER, MATCHES, ROOMMATE_REQUESTS_SENT, ROOMMATE_REQUESTS_RECEIVED } from '@/mock/data/users';
import { tenantRoommateProfileService } from '@/services/modules/tenantRoommateProfile.service';
import { MOCK_NOTIFICATIONS } from '@/mock/data/notifications';
import { apiClient } from '@/services/api';
import { postMultipartForm } from '@/services/uploadForm';
import {
  authService,
  authApiErrorMessage,
  mapApiUserToUser,
  parseAuthResponse,
} from '@/services/modules/auth.service';

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
  /** `YYYY-MM-DD`; empty string clears DOB and age on the server. */
  dateOfBirth?: string;
  phone?: string;
  state?: string;
  occupation?: string;
  /** Set after S3 upload via POST /api/v1/upload/users/me/avatar */
  profileImageUrl?: string;
};

export type RoommateFilters = {
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  lifestyle?: string[];
  role?: string;
};

/** Map app profile form → API body (camelCase; enums lowercase where required). */
function buildProfileUpdateBody(payload: UpdateProfilePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.fullName = payload.name;
  if (payload.bio !== undefined) body.bio = payload.bio;
  if (payload.location !== undefined) body.location = payload.location;
  if (payload.budget !== undefined) body.monthlyBudget = payload.budget;
  if (payload.moveInDate !== undefined && payload.moveInDate !== '') {
    body.moveInDate = payload.moveInDate;
  }
  if (payload.genderPreference !== undefined) {
    body.roommateGenderPreference =
      payload.genderPreference === 'Male'
        ? 'male'
        : payload.genderPreference === 'Female'
          ? 'female'
          : 'any';
  }
  if (payload.lifestyle !== undefined) {
    body.lifestyle = { tags: payload.lifestyle };
  }
  if (payload.dateOfBirth !== undefined) {
    body.dateOfBirth = payload.dateOfBirth === '' ? '' : payload.dateOfBirth;
  }
  if (payload.phone !== undefined) body.mobile = payload.phone;
  if (payload.state !== undefined) body.state = payload.state;
  if (payload.occupation !== undefined) body.occupation = payload.occupation;
  if (payload.profileImageUrl !== undefined) body.profileImageUrl = payload.profileImageUrl;
  return body;
}

export const userService = {
  /**
   * Get current user profile.
   * BACKEND: GET /api/v1/auth/me
   */
  getProfile: async (): Promise<User> => {
    return authService.getMe();
  },

  /**
   * Update current user profile.
   * BACKEND: PATCH /api/v1/auth/me
   */
  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    try {
      const res = await apiClient.patch<unknown>(
        '/api/v1/auth/me',
        buildProfileUpdateBody(payload),
      );
      const { data, status } = res;
      if (status === 204 || data == null || data === '') {
        return authService.getMe();
      }
      const { raw } = parseAuthResponse(data);
      return mapApiUserToUser(raw, {});
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not update profile'));
    }
  },

  /**
   * Get roommate profiles with optional filters.
   * BACKEND: GET /roommates?location=...&minBudget=...
   */
  getRoommateProfiles: async (filters?: RoommateFilters): Promise<RoommateProfile[]> => {
    const searchParts = [filters?.location, filters?.role].filter(Boolean) as string[];
    const search = searchParts.join(' ').trim();
    let results = await tenantRoommateProfileService.list({
      search: search || undefined,
      tags: filters?.lifestyle,
    });

    if (filters?.minBudget !== undefined) {
      results = results.filter((r) => (r.budget ?? 0) >= filters.minBudget!);
    }
    if (filters?.maxBudget !== undefined) {
      results = results.filter((r) => (r.budget ?? Infinity) <= filters.maxBudget!);
    }
    if (filters?.role) {
      results = results.filter((r) => r.role === filters.role);
    }

    return results;
  },

  /**
   * Get a single roommate profile by ID.
   * BACKEND: GET /roommates/:id
   */
  getRoommateById: async (id: string): Promise<RoommateProfile> => {
    return tenantRoommateProfileService.getById(id);
  },

  /**
   * Send a roommate request.
   * BACKEND: POST /roommates/request
   */
  sendRequest: async (roommateId: string, message?: string): Promise<RoommateRequest> => {
    await delay();
    let target: RoommateProfile | null = null;
    try {
      target = await tenantRoommateProfileService.getById(roommateId);
    } catch {
      target = null;
    }
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

  /** POST `image` to S3 under `profiles/users/{userId}/`. */
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    try {
      const fd = new FormData();
      fd.append('image', file);
      const raw = await postMultipartForm('/api/v1/upload/users/me/avatar', fd);
      const inner = raw.data as Record<string, unknown> | undefined;
      const url = typeof inner?.url === 'string' ? inner.url : undefined;
      if (!url) throw new Error('Invalid upload response');
      return { url };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not upload photo'));
    }
  },

  /** POST `document` (image or PDF) — sets identity status to pending on the server. */
  uploadIdentityDocument: async (
    file: File,
  ): Promise<{ url: string; identityVerificationStatus: string }> => {
    try {
      const fd = new FormData();
      fd.append('document', file);
      const raw = await postMultipartForm('/api/v1/upload/users/me/identity-document', fd);
      const inner = raw.data as Record<string, unknown> | undefined;
      const url = typeof inner?.url === 'string' ? inner.url : undefined;
      const identityVerificationStatus =
        typeof inner?.identityVerificationStatus === 'string' ? inner.identityVerificationStatus : '';
      if (!url || !identityVerificationStatus) throw new Error('Invalid upload response');
      return { url, identityVerificationStatus };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not upload verification document'));
    }
  },
};
