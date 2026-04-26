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
export { faqService } from './modules/faq.service';
export { amenityService } from './modules/amenity.service';
export { adminAuthService } from './modules/adminAuth.service';
export { tenantRoommateProfileService } from './modules/tenantRoommateProfile.service';
export { bookingService } from './modules/booking.service';
export type { MyVisitBooking, BookingStatus } from './modules/booking.service';
export { notificationService } from './modules/notification.service';
export type { ApiNotification } from './modules/notification.service';

export type {
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ChangePasswordPayload,
} from './modules/auth.service';
export type { CreateListingPayload, UpdateListingPayload } from './modules/listing.service';
export type { UpdateProfilePayload, RoommateFilters } from './modules/user.service';
export type { UpdateUserPayload, UpdateReportStatusPayload, UpdateCmsPagePayload } from './modules/admin.service';
export type { FaqItem } from './modules/faq.service';
export type { TenantRoommateProfileMine, TenantRoommateListParams } from './modules/tenantRoommateProfile.service';
