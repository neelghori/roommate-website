/**
 * admin.types.ts
 * Admin domain types. Backend: admin-scoped API responses.
 */

export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type ReportReason = 'SPAM' | 'FRAUD' | 'INAPPROPRIATE' | 'FAKE_LISTING' | 'HARASSMENT' | 'OTHER';

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  pendingListings: number;
  activeUsers: number;
  totalReports: number;
  openReports: number;
  revenueThisMonth: number;
  newUsersThisMonth: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'TENANT' | 'OWNER' | 'ROOMMATE' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  listingCount: number;
  joinedAt: string;
  lastLogin: string;
}

export interface AdminListing {
  id: string;
  title: string;
  ownerName: string;
  ownerEmail: string;
  type: string;
  city: string;
  price: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  createdAt: string;
  flagCount: number;
}

export interface Report {
  id: string;
  reporterName: string;
  reporterEmail: string;
  targetType: 'LISTING' | 'USER';
  targetId: string;
  targetName: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface AdminSettings {
  siteName: string;
  supportEmail: string;
  maxListingsPerUser: number;
  requireListingApproval: boolean;
  enableChat: boolean;
  enableReferrals: boolean;
  referralBonus: number;
  maintenanceMode: boolean;
}
