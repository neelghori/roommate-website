/**
 * auth.service.ts
 * Authentication service module.
 *
 * Register/login/me: real apiClient calls. Forgot/reset password still mocked with delay.
 * User DTO: maps Mongo-style `_id`, `fullName`, `mobile`, lowercase `role`, etc.
 * Login: POST /api/v1/auth/login
 *
 * Expected endpoints:
 *   POST /api/v1/auth/register → { user, token } (shape may nest under `data`)
 *   POST /api/v1/auth/login    → { user, token }
 *   POST /auth/forgot-password → { message }
 *   POST /auth/reset-password  → { message }
 *   POST /auth/logout          → { message }
 *   GET  /auth/me              → { user }
 *   POST /api/v1/auth/change-password → { message } (current + new password)
 */

import { isAxiosError } from 'axios';
import type { GenderPreference, LifestyleTag } from '@/types';
import { User } from '@/types';
import {
  computeAgeFromDateOfBirthYmd,
  dateOfBirthYmdFromApi,
} from '@/lib/dateOfBirthAge';
import { apiClient } from '@/services/api';
import { clearAccessToken, setAccessToken } from '@/lib/authToken';
import { extractAccessTokenFromUnknown } from '@/lib/extractAccessToken';

// Mock delay to simulate network latency
const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

/** Backend register DTO — enums are lowercase strings (see API validation). */
export type RegisterApiRole = 'tenant' | 'owner' | 'roommate';
export type RegisterApiProfessionalType =
  | 'student'
  | 'work_professional'
  | 'freelancer'
  | 'business'
  | 'other';
export type RegisterApiGender = 'male' | 'female' | 'other';

/** Profile fields required by the register API but not collected on the sign-up form. */
const REGISTER_API_DEFAULTS: {
  professionalType: RegisterApiProfessionalType;
  lifestyle: Record<string, unknown>;
  age: number;
  gender: RegisterApiGender;
} = {
  professionalType: 'other',
  lifestyle: {},
  age: 22,
  gender: 'other',
};

function mapAppRoleToApi(role: RegisterPayload['role']): RegisterApiRole {
  if (role === 'TENANT') return 'tenant';
  if (role === 'ROOMMATE') return 'roommate';
  return 'owner';
}

function mapApiRoleToUserRole(v: unknown): User['role'] | undefined {
  if (v === 'tenant' || v === 'TENANT') return 'TENANT';
  if (v === 'owner' || v === 'OWNER') return 'OWNER';
  if (v === 'roommate' || v === 'ROOMMATE') return 'ROOMMATE';
  if (v === 'admin' || v === 'ADMIN') return 'ADMIN';
  return undefined;
}

function mapGenderFromApi(v: unknown): GenderPreference | undefined {
  if (v === 'Any' || v === 'any') return 'Any';
  if (v === 'Male' || v === 'male') return 'Male';
  if (v === 'Female' || v === 'female') return 'Female';
  return undefined;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterResult = {
  user: User;
  token: string;
  /** Backend sent confirmation email (requires Resend + APP_PUBLIC_FRONTEND_URL on API). */
  emailVerificationSent: boolean;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'TENANT' | 'OWNER' | 'ROOMMATE';
  /** Optional — used when callers supply full profile data; otherwise defaults below are sent. */
  professionalType?: RegisterApiProfessionalType;
  /** API expects a JSON object; arrays are wrapped as `{ tags: [...] }`. */
  lifestyle?: Record<string, unknown> | string[];
  age?: number;
  gender?: RegisterApiGender;
  profileImageUrl?: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '??';
}

function pickToken(obj: Record<string, unknown>): string | undefined {
  const direct = obj.token ?? obj.accessToken ?? obj.access_token;
  if (typeof direct === 'string' && direct.length > 0) return direct;
  const nested = obj.data;
  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    const d = nested as Record<string, unknown>;
    const t = d.token ?? d.accessToken ?? d.access_token;
    if (typeof t === 'string' && t.length > 0) return t;
  }
  return undefined;
}

function mergeToken(...candidates: (string | undefined | null)[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c;
  }
  return undefined;
}

/**
 * Accepts common API wrappers: `{ data: { user, token } }`, `{ user, token }`, or user fields at root.
 * Also used for GET /auth/me (user only). Token is resolved with deep search as fallback.
 */
export function parseAuthResponse(data: unknown): {
  raw: Record<string, unknown>;
  token?: string;
} {
  if (data == null || typeof data !== 'object') {
    throw new Error('Invalid server response');
  }
  const root = data as Record<string, unknown>;
  const inner = root.data;
  const fallbackToken = mergeToken(
    pickToken(root),
    extractAccessTokenFromUnknown(root) ?? undefined,
  );

  if (inner && typeof inner === 'object') {
    const block = inner as Record<string, unknown>;
    const userObj = (block.user ?? block.profile ?? block) as Record<string, unknown>;
    const token = mergeToken(
      pickToken(block),
      pickToken(root),
      extractAccessTokenFromUnknown(block) ?? undefined,
      fallbackToken,
    );
    return { raw: userObj, token };
  }
  const userObj = (root.user ?? root.profile ?? root) as Record<string, unknown>;
  const token = mergeToken(pickToken(root), extractAccessTokenFromUnknown(root) ?? undefined);
  return { raw: userObj, token };
}

const LIFESTYLE_TAG_CANONICAL = new Set<LifestyleTag>([
  'STUDENT',
  'WORKING',
  'VEGETARIAN',
  'NON_VEG',
  'SMOKER',
  'NON_SMOKER',
  'PET_FRIENDLY',
  'NIGHT_OWL',
  'EARLY_BIRD',
]);

/** Human-readable labels (older responses) → app enum. DB stores canonical uppercase. */
const LIFESTYLE_TAG_LABEL_TO_APP: Record<string, LifestyleTag> = {
  Student: 'STUDENT',
  Working: 'WORKING',
  Vegetarian: 'VEGETARIAN',
  'Non-Veg': 'NON_VEG',
  'Non-Smoker': 'NON_SMOKER',
  Smoker: 'SMOKER',
  'Pet Friendly': 'PET_FRIENDLY',
  'Night Owl': 'NIGHT_OWL',
  'Early Bird': 'EARLY_BIRD',
};

function mapLifestyleTagFromApi(t: string): LifestyleTag | undefined {
  const trimmed = t.trim();
  if (!trimmed) return undefined;
  if (LIFESTYLE_TAG_CANONICAL.has(trimmed as LifestyleTag)) return trimmed as LifestyleTag;
  return LIFESTYLE_TAG_LABEL_TO_APP[trimmed];
}

export function mapApiUserToUser(
  raw: Record<string, unknown>,
  fallbacks?: {
    email?: string;
    name?: string;
    phone?: string;
    role?: User['role'];
  },
): User {
  const name = String(raw.fullName ?? raw.name ?? fallbacks?.name ?? 'User');
  const email = String(raw.email ?? fallbacks?.email ?? '');
  const phone = String(raw.mobile ?? raw.phone ?? fallbacks?.phone ?? '');
  const id = String(raw.id ?? raw._id ?? raw.userId ?? `user-${email}`);

  let role: User['role'] = fallbacks?.role ?? 'TENANT';
  const mapped = mapApiRoleToUserRole(raw.role);
  if (mapped) role = mapped;

  const lifestyleRaw = raw.lifestyle;
  let lifestyle: User['lifestyle'] = [];
  if (Array.isArray(lifestyleRaw)) {
    const tags = lifestyleRaw
      .filter((x): x is string => typeof x === 'string')
      .map((x) => mapLifestyleTagFromApi(x))
      .filter((x): x is LifestyleTag => Boolean(x));
    if (tags.length) lifestyle = tags;
  } else if (lifestyleRaw && typeof lifestyleRaw === 'object' && !Array.isArray(lifestyleRaw)) {
    const tags = (lifestyleRaw as { tags?: unknown }).tags;
    if (Array.isArray(tags)) {
      const strs = tags
        .filter((x): x is string => typeof x === 'string')
        .map((x) => mapLifestyleTagFromApi(x))
        .filter((x): x is LifestyleTag => Boolean(x));
      if (strs.length) lifestyle = strs;
    }
  }

  if (!lifestyle.length && Array.isArray(raw.lifestyleTags)) {
    const fromTags = (raw.lifestyleTags as unknown[])
      .filter((t): t is string => typeof t === 'string')
      .map((t) => mapLifestyleTagFromApi(t))
      .filter((x): x is LifestyleTag => Boolean(x));
    if (fromTags.length) lifestyle = fromTags;
  }

  const avatarUrl =
    typeof raw.avatarUrl === 'string'
      ? raw.avatarUrl
      : typeof raw.profileImageUrl === 'string'
        ? raw.profileImageUrl
        : undefined;

  const bio = typeof raw.bio === 'string' ? raw.bio : undefined;
  const location = typeof raw.location === 'string' ? raw.location : undefined;

  let budget: number | undefined;
  if (typeof raw.monthlyBudget === 'number' && !Number.isNaN(raw.monthlyBudget)) {
    budget = raw.monthlyBudget;
  } else if (typeof raw.budget === 'number' && !Number.isNaN(raw.budget)) {
    budget = raw.budget;
  }

  let moveInDate: string | undefined;
  if (typeof raw.moveInDate === 'string') {
    const s = raw.moveInDate.trim();
    moveInDate = s.length >= 10 ? s.slice(0, 10) : s || undefined;
  } else if (typeof raw.move_in_date === 'string') {
    const s = raw.move_in_date.trim();
    moveInDate = s.length >= 10 ? s.slice(0, 10) : s || undefined;
  }

  /** Roommate search preference (Any/Male/Female) — not the same as account `gender` (male/female/other). */
  const genderPreference = mapGenderFromApi(
    raw.roommateGenderPreference ?? raw.genderPreference ?? raw.gender_preference,
  );

  const num = (v: unknown): number | undefined =>
    typeof v === 'number' && !Number.isNaN(v) ? v : undefined;

  const dateOfBirth = dateOfBirthYmdFromApi(raw.dateOfBirth);
  let age: number | undefined;
  if (typeof raw.age === 'number' && Number.isFinite(raw.age)) {
    age = raw.age;
  } else if (dateOfBirth) {
    const fromDob = computeAgeFromDateOfBirthYmd(dateOfBirth);
    if (fromDob != null) age = fromDob;
  }

  const idStatusRaw = raw.identityVerificationStatus;
  const idStatus =
    idStatusRaw === 'none' ||
    idStatusRaw === 'pending' ||
    idStatusRaw === 'verified' ||
    idStatusRaw === 'rejected'
      ? idStatusRaw
      : undefined;

  const isAadharFromStatus = idStatus === 'verified';
  const isAadharVerified =
    typeof raw.isAadharVerified === 'boolean'
      ? raw.isAadharVerified
      : isAadharFromStatus || false;

  return {
    id,
    name,
    email,
    phone,
    avatarInitial: initialsFromName(name),
    role,
    lifestyle,
    avatarUrl,
    bio,
    location,
    budget,
    moveInDate,
    genderPreference,
    age,
    dateOfBirth: dateOfBirth || undefined,
    isPhoneVerified: typeof raw.isPhoneVerified === 'boolean' ? raw.isPhoneVerified : false,
    emailVerified: raw.emailVerified === true,
    mobileVerifiedByAdmin: raw.mobileVerifiedByAdmin === true,
    isAadharVerified,
    isCompanyVerified: typeof raw.isCompanyVerified === 'boolean' ? raw.isCompanyVerified : false,
    identityVerificationStatus: idStatus ?? 'none',
    identityDocumentUrl: typeof raw.identityDocumentUrl === 'string' ? raw.identityDocumentUrl : undefined,
    identityRejectionReason:
      typeof raw.identityRejectionReason === 'string' ? raw.identityRejectionReason : undefined,
    identitySubmittedAt: typeof raw.identitySubmittedAt === 'string' ? raw.identitySubmittedAt : undefined,
    listingCount: num(raw.listingCount) ?? 0,
    shortlistedCount: num(raw.shortlistedCount ?? raw.savedCount) ?? 0,
    bookingCount: num(raw.bookingCount) ?? 0,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.updatedAt === 'string'
          ? raw.updatedAt
          : new Date().toISOString(),
  };
}

function mapRegisterUser(raw: Record<string, unknown>, payload: RegisterPayload): User {
  return mapApiUserToUser(raw, {
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    role: payload.role,
  });
}

export function authApiErrorMessage(err: unknown, fallback: string): string {
  if (!isAxiosError(err)) {
    return err instanceof Error ? err.message : fallback;
  }
  const data = err.response?.data as
    | { message?: unknown; error?: string | string[] }
    | undefined;
  const msg = data?.message ?? data?.error;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.map(String).join(' ');
  return err.message || fallback;
}

function buildRegisterLifestyleObject(
  payload: RegisterPayload,
): Record<string, unknown> {
  if (payload.lifestyle === undefined) {
    return { ...REGISTER_API_DEFAULTS.lifestyle };
  }
  if (Array.isArray(payload.lifestyle)) {
    return { tags: payload.lifestyle };
  }
  return { ...payload.lifestyle };
}

export const authService = {
  /**
   * Login user with email & password.
   * BACKEND: POST /api/v1/auth/login
   */
  login: async (payload: LoginPayload): Promise<{ user: User; token: string }> => {
    if (!payload.email?.trim() || !payload.password) {
      throw new Error('Email and password are required');
    }
    try {
      const { data } = await apiClient.post<unknown>('/api/v1/auth/login', {
        email: payload.email.trim(),
        password: payload.password,
      });
      const { raw, token } = parseAuthResponse(data);
      const user = mapApiUserToUser(raw, { email: payload.email.trim() });
      const accessToken = token ?? '';
      if (accessToken) setAccessToken(accessToken);
      else setAccessToken(null);
      return { user, token: accessToken };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Login failed'));
    }
  },

  /**
   * Confirm email using the token from the verification link.
   * BACKEND: POST /api/v1/auth/verify-email
   */
  verifyEmailWithToken: async (token: string): Promise<{ user: User; token: string }> => {
    const trimmed = token.trim();
    if (!trimmed) throw new Error('Verification token is missing.');
    try {
      const { data } = await apiClient.post<unknown>('/api/v1/auth/verify-email', { token: trimmed });
      const { raw, token: access } = parseAuthResponse(data);
      const user = mapApiUserToUser(raw, {});
      const accessToken = access ?? '';
      if (accessToken) setAccessToken(accessToken);
      else setAccessToken(null);
      return { user, token: accessToken };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Email verification failed'));
    }
  },

  /**
   * Resend signup confirmation (public; does not reveal whether email exists).
   * BACKEND: POST /api/v1/auth/resend-verification
   */
  resendSignupVerificationEmail: async (email: string): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post<{ status?: string; message?: string }>(
        '/api/v1/auth/resend-verification',
        { email: email.trim().toLowerCase() },
      );
      const message =
        typeof data?.message === 'string' && data.message.length > 0
          ? data.message
          : 'If an account exists for this email, a verification message was sent.';
      return { message };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not resend verification email'));
    }
  },

  /**
   * Register a new user.
   * BACKEND: POST /api/v1/auth/register
   */
  register: async (payload: RegisterPayload): Promise<RegisterResult> => {
    const body: Record<string, unknown> = {
      fullName: payload.name,
      mobile: payload.phone,
      email: payload.email.trim(),
      role: mapAppRoleToApi(payload.role),
      password: payload.password,
      professionalType: payload.professionalType ?? REGISTER_API_DEFAULTS.professionalType,
      lifestyle: buildRegisterLifestyleObject(payload),
      age: payload.age ?? REGISTER_API_DEFAULTS.age,
      gender: payload.gender ?? REGISTER_API_DEFAULTS.gender,
    };
    if (payload.profileImageUrl) {
      body.profileImageUrl = payload.profileImageUrl;
    }

    try {
      const { data } = await apiClient.post<unknown>('/api/v1/auth/register', body);
      const { raw, token } = parseAuthResponse(data);
      const user = mapRegisterUser(raw, payload);
      const accessToken = token ?? '';
      if (accessToken) setAccessToken(accessToken);
      let emailVerificationSent = false;
      const block = (data as Record<string, unknown>).data;
      if (block && typeof block === 'object' && !Array.isArray(block)) {
        emailVerificationSent = (block as Record<string, unknown>).emailVerificationSent === true;
      }
      return { user, token: accessToken, emailVerificationSent };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Registration failed'));
    }
  },

  /**
   * Send password reset email.
   * BACKEND: POST /api/v1/auth/forgot-password
   */
  forgotPassword: async (payload: ForgotPasswordPayload): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post<{ status?: string; message?: string }>(
        '/api/v1/auth/forgot-password',
        { email: payload.email.trim().toLowerCase() },
      );
      const message =
        typeof data?.message === 'string' && data.message.length > 0
          ? data.message
          : `Password reset link sent to ${payload.email}`;
      return { message };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not send reset link'));
    }
  },

  /**
   * Reset password with token.
   * BACKEND: POST /api/v1/auth/reset-password
   */
  resetPassword: async (payload: ResetPasswordPayload): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post<{ status?: string; message?: string }>(
        '/api/v1/auth/reset-password',
        {
          token: payload.token,
          newPassword: payload.password,
        },
      );
      const message =
        typeof data?.message === 'string' && data.message.length > 0
          ? data.message
          : 'Password reset successfully';
      return { message };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Reset failed'));
    }
  },

  /**
   * Logout user — clears client token; optional server invalidation.
   * BACKEND: POST /api/v1/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/v1/auth/logout', {}).catch(() => {
        /* ignore 401 if session already gone */
      });
    } finally {
      clearAccessToken();
    }
  },

  /**
   * Current user profile (session / bearer).
   * BACKEND: GET /api/v1/auth/me
   */
  getMe: async (): Promise<User> => {
    try {
      const { data } = await apiClient.get<unknown>('/api/v1/auth/me');
      const { raw } = parseAuthResponse(data);
      return mapApiUserToUser(raw, {});
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not load profile'));
    }
  },

  /**
   * Change password for the signed-in user.
   * BACKEND: POST /api/v1/auth/change-password
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    try {
      const { data } = await apiClient.post<{ status?: string; message?: string }>(
        '/api/v1/auth/change-password',
        {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        },
      );
      const message =
        typeof data?.message === 'string' && data.message.length > 0
          ? data.message
          : 'Your password has been updated successfully.';
      return { message };
    } catch (err) {
      throw new Error(authApiErrorMessage(err, 'Could not change password'));
    }
  },
};
