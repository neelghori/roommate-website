/**
 * services/index.ts
 * Re-exports all service modules for easy import.
 */

export { apiClient, default as axiosInstance } from './api';
export { authService } from './modules/auth.service';
export { listingService } from './modules/listing.service';
export { userService } from './modules/user.service';
export { chatService } from './modules/chat.service';
export { adminService } from './modules/admin.service';

export type { LoginPayload, RegisterPayload, ForgotPasswordPayload, ResetPasswordPayload } from './modules/auth.service';
export type { CreateListingPayload, UpdateListingPayload } from './modules/listing.service';
export type { UpdateProfilePayload, RoommateFilters } from './modules/user.service';
export type { UpdateUserPayload, UpdateReportStatusPayload, UpdateCmsPagePayload } from './modules/admin.service';
