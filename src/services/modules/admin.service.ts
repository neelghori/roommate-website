/**
 * admin.service.ts
 * Admin service module — all admin-scoped operations.
 *
 * MOCK MODE: Returns mock data with artificial delay.
 * BACKEND INTEGRATION: Replace mock functions with apiClient calls.
 * All endpoints require ADMIN role — enforced by backend middleware.
 *
 * Expected endpoints:
 *   GET    /admin/stats                      → AdminStats
 *   GET    /admin/users                      → AdminUser[]
 *   GET    /admin/users/:id                  → AdminUser
 *   PUT    /admin/users/:id                  → AdminUser
 *   DELETE /admin/users/:id                  → { message }
 *   PUT    /admin/users/:id/toggle-active    → AdminUser
 *   GET    /admin/listings                   → AdminListing[]
 *   GET    /admin/listings/:id               → AdminListing
 *   PUT    /admin/listings/:id/approve       → AdminListing
 *   PUT    /admin/listings/:id/reject        → AdminListing
 *   DELETE /admin/listings/:id               → { message }
 *   GET    /admin/reports                    → Report[]
 *   GET    /admin/reports/:id                → Report
 *   PUT    /admin/reports/:id/status         → Report
 *   GET    /admin/cms                        → CmsPage[]
 *   GET    /admin/cms/:slug                  → CmsPage
 *   PUT    /admin/cms/:id                    → CmsPage
 *   GET    /admin/settings                   → AdminSettings
 *   PUT    /admin/settings                   → AdminSettings
 */

import {
  AdminStats,
  AdminUser,
  AdminListing,
  Report,
  CmsPage,
  AdminSettings,
  ReportStatus,
} from '@/types';
import {
  ADMIN_STATS,
  ADMIN_USERS,
  ADMIN_LISTINGS,
  REPORTS,
  CMS_PAGES,
  ADMIN_SETTINGS,
} from '@/mock/data/admin';

// Mock delay to simulate network latency
const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phone?: string;
  role?: 'TENANT' | 'OWNER' | 'ADMIN';
  isActive?: boolean;
  isVerified?: boolean;
};

export type UpdateReportStatusPayload = {
  status: ReportStatus;
  adminNote?: string;
};

export type UpdateCmsPagePayload = {
  title?: string;
  content?: string;
  isPublished?: boolean;
};

export const adminService = {
  // ─── Stats ─────────────────────────────────────────────────────────────────

  /**
   * Get platform-wide statistics.
   * BACKEND: GET /admin/stats
   */
  getStats: async (): Promise<AdminStats> => {
    await delay(400);
    return ADMIN_STATS;
  },

  // ─── Users ─────────────────────────────────────────────────────────────────

  /**
   * Get all users.
   * BACKEND: GET /admin/users
   */
  getUsers: async (): Promise<AdminUser[]> => {
    await delay();
    return ADMIN_USERS;
  },

  /**
   * Get a single user by ID.
   * BACKEND: GET /admin/users/:id
   */
  getUserById: async (id: string): Promise<AdminUser> => {
    await delay(400);
    const user = ADMIN_USERS.find((u) => u.id === id);
    if (!user) throw new Error(`User not found: ${id}`);
    return user;
  },

  /**
   * Update a user's details.
   * BACKEND: PUT /admin/users/:id
   */
  updateUser: async (id: string, payload: UpdateUserPayload): Promise<AdminUser> => {
    await delay();
    const user = ADMIN_USERS.find((u) => u.id === id);
    if (!user) throw new Error(`User not found: ${id}`);
    return { ...user, ...payload };
  },

  /**
   * Delete a user account.
   * BACKEND: DELETE /admin/users/:id
   */
  deleteUser: async (id: string): Promise<{ message: string }> => {
    await delay();
    const exists = ADMIN_USERS.some((u) => u.id === id);
    if (!exists) throw new Error(`User not found: ${id}`);
    return { message: `User ${id} deleted successfully` };
  },

  /**
   * Toggle a user's active status (ban/unban).
   * BACKEND: PUT /admin/users/:id/toggle-active
   */
  toggleUserActive: async (id: string): Promise<AdminUser> => {
    await delay(500);
    const user = ADMIN_USERS.find((u) => u.id === id);
    if (!user) throw new Error(`User not found: ${id}`);
    return { ...user, isActive: !user.isActive };
  },

  // ─── Listings ───────────────────────────────────────────────────────────────

  /**
   * Get all listings (admin view).
   * BACKEND: GET /admin/listings
   */
  getListings: async (): Promise<AdminListing[]> => {
    await delay();
    return ADMIN_LISTINGS;
  },

  /**
   * Get a single listing by ID (admin view).
   * BACKEND: GET /admin/listings/:id
   */
  getListingById: async (id: string): Promise<AdminListing> => {
    await delay(400);
    const listing = ADMIN_LISTINGS.find((l) => l.id === id);
    if (!listing) throw new Error(`Listing not found: ${id}`);
    return listing;
  },

  /**
   * Approve a pending listing.
   * BACKEND: PUT /admin/listings/:id/approve
   */
  approveListing: async (id: string): Promise<AdminListing> => {
    await delay();
    const listing = ADMIN_LISTINGS.find((l) => l.id === id);
    if (!listing) throw new Error(`Listing not found: ${id}`);
    return { ...listing, status: 'APPROVED' };
  },

  /**
   * Reject a listing.
   * BACKEND: PUT /admin/listings/:id/reject
   */
  rejectListing: async (id: string, reason?: string): Promise<AdminListing> => {
    await delay();
    void reason; // used in real implementation
    const listing = ADMIN_LISTINGS.find((l) => l.id === id);
    if (!listing) throw new Error(`Listing not found: ${id}`);
    return { ...listing, status: 'REJECTED' };
  },

  /**
   * Delete a listing.
   * BACKEND: DELETE /admin/listings/:id
   */
  deleteListing: async (id: string): Promise<{ message: string }> => {
    await delay();
    const exists = ADMIN_LISTINGS.some((l) => l.id === id);
    if (!exists) throw new Error(`Listing not found: ${id}`);
    return { message: `Listing ${id} deleted successfully` };
  },

  // ─── Reports ────────────────────────────────────────────────────────────────

  /**
   * Get all reports.
   * BACKEND: GET /admin/reports
   */
  getReports: async (): Promise<Report[]> => {
    await delay();
    return REPORTS;
  },

  /**
   * Get a single report by ID.
   * BACKEND: GET /admin/reports/:id
   */
  getReportById: async (id: string): Promise<Report> => {
    await delay(400);
    const report = REPORTS.find((r) => r.id === id);
    if (!report) throw new Error(`Report not found: ${id}`);
    return report;
  },

  /**
   * Update the status of a report.
   * BACKEND: PUT /admin/reports/:id/status
   */
  updateReportStatus: async (
    id: string,
    payload: UpdateReportStatusPayload,
  ): Promise<Report> => {
    await delay();
    const report = REPORTS.find((r) => r.id === id);
    if (!report) throw new Error(`Report not found: ${id}`);
    return { ...report, status: payload.status };
  },

  // ─── CMS Pages ──────────────────────────────────────────────────────────────

  /**
   * Get all CMS pages.
   * BACKEND: GET /admin/cms
   */
  getCmsPages: async (): Promise<CmsPage[]> => {
    await delay(400);
    return CMS_PAGES;
  },

  /**
   * Get a single CMS page by slug.
   * BACKEND: GET /admin/cms/:slug
   */
  getCmsPageBySlug: async (slug: string): Promise<CmsPage> => {
    await delay(400);
    const page = CMS_PAGES.find((p) => p.slug === slug);
    if (!page) throw new Error(`CMS page not found: ${slug}`);
    return page;
  },

  /**
   * Update a CMS page by ID.
   * BACKEND: PUT /admin/cms/:id
   */
  updateCmsPage: async (id: string, payload: UpdateCmsPagePayload): Promise<CmsPage> => {
    await delay();
    const page = CMS_PAGES.find((p) => p.id === id);
    if (!page) throw new Error(`CMS page not found: ${id}`);
    return { ...page, ...payload, updatedAt: new Date().toISOString() };
  },

  // ─── Settings ───────────────────────────────────────────────────────────────

  /**
   * Get admin/platform settings.
   * BACKEND: GET /admin/settings
   */
  getSettings: async (): Promise<AdminSettings> => {
    await delay(400);
    return ADMIN_SETTINGS;
  },

  /**
   * Update admin/platform settings.
   * BACKEND: PUT /admin/settings
   */
  updateSettings: async (payload: Partial<AdminSettings>): Promise<AdminSettings> => {
    await delay();
    return { ...ADMIN_SETTINGS, ...payload };
  },
};
