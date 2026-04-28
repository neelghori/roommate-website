/**
 * mock/data/admin.ts
 * Mock admin data for development and testing.
 */

import { AdminStats, AdminUser, AdminListing, Report, CmsPage, AdminSettings } from '@/types';

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export const ADMIN_STATS: AdminStats = {
  totalUsers: 3847,
  totalListings: 512,
  pendingListings: 38,
  activeUsers: 1204,
  totalReports: 96,
  openReports: 14,
  revenueThisMonth: 187500,
  newUsersThisMonth: 243,
};

// ─── Admin Users ──────────────────────────────────────────────────────────────

export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'u1',
    name: 'Guest User',
    email: 'guest@roommat.in',
    phone: '+91 9876543210',
    role: 'TENANT',
    isActive: true,
    isVerified: true,
    listingCount: 1,
    joinedAt: '2024-01-15T10:00:00Z',
    lastLogin: '2026-04-16T09:00:00Z',
  },
  {
    id: 'o1',
    name: 'Ramesh Patel',
    email: 'ramesh.patel@example.com',
    phone: '+91 9876501001',
    role: 'OWNER',
    isActive: true,
    isVerified: true,
    listingCount: 4,
    joinedAt: '2023-06-01T08:00:00Z',
    lastLogin: '2026-04-15T18:00:00Z',
  },
  {
    id: 'o2',
    name: 'Sneha Shah',
    email: 'sneha.shah@example.com',
    phone: '+91 9876502002',
    role: 'OWNER',
    isActive: true,
    isVerified: true,
    listingCount: 2,
    joinedAt: '2023-09-15T10:00:00Z',
    lastLogin: '2026-04-14T14:00:00Z',
  },
  {
    id: 'u2',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@example.com',
    phone: '+91 9876511111',
    role: 'TENANT',
    isActive: true,
    isVerified: true,
    listingCount: 0,
    joinedAt: '2024-03-01T09:00:00Z',
    lastLogin: '2026-04-16T08:00:00Z',
  },
  {
    id: 'u3',
    name: 'Ravi Gupta',
    email: 'ravi.gupta@example.com',
    phone: '+91 9876522222',
    role: 'TENANT',
    isActive: true,
    isVerified: false,
    listingCount: 0,
    joinedAt: '2024-04-10T11:00:00Z',
    lastLogin: '2026-04-13T20:00:00Z',
  },
  {
    id: 'o3',
    name: 'Priya Mehta',
    email: 'priya.mehta@example.com',
    phone: '+91 9876503003',
    role: 'OWNER',
    isActive: false,
    isVerified: true,
    listingCount: 1,
    joinedAt: '2023-11-20T12:00:00Z',
    lastLogin: '2026-03-01T10:00:00Z',
  },
  {
    id: 'o4',
    name: 'Manish Joshi',
    email: 'manish.joshi@example.com',
    phone: '+91 9876504004',
    role: 'OWNER',
    isActive: true,
    isVerified: true,
    listingCount: 3,
    joinedAt: '2023-07-05T08:00:00Z',
    lastLogin: '2026-04-15T16:00:00Z',
  },
  {
    id: 'u4',
    name: 'Neha Patel',
    email: 'neha.patel@example.com',
    phone: '+91 9876533333',
    role: 'TENANT',
    isActive: true,
    isVerified: false,
    listingCount: 0,
    joinedAt: '2025-01-10T07:00:00Z',
    lastLogin: '2026-04-12T19:00:00Z',
  },
  {
    id: 'admin1',
    name: 'Admin Roommat',
    email: 'admin@roommat.in',
    phone: '+91 9800000001',
    role: 'ADMIN',
    isActive: true,
    isVerified: true,
    listingCount: 0,
    joinedAt: '2023-01-01T00:00:00Z',
    lastLogin: '2026-04-16T10:00:00Z',
  },
  {
    id: 'o5',
    name: 'Anita Trivedi',
    email: 'anita.trivedi@example.com',
    phone: '+91 9876505005',
    role: 'OWNER',
    isActive: true,
    isVerified: true,
    listingCount: 5,
    joinedAt: '2023-05-12T09:00:00Z',
    lastLogin: '2026-04-14T11:00:00Z',
  },
];

// ─── Admin Listings ───────────────────────────────────────────────────────────

export const ADMIN_LISTINGS: AdminListing[] = [
  {
    id: 'l1',
    title: 'Spacious PG Near SG Highway',
    ownerName: 'Ramesh Patel',
    ownerEmail: 'ramesh.patel@example.com',
    type: 'PG',
    city: 'Ahmedabad',
    price: 8500,
    status: 'APPROVED',
    createdAt: '2025-12-01T08:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l2',
    title: 'Cozy Studio Apartment in Navrangpura',
    ownerName: 'Sneha Shah',
    ownerEmail: 'sneha.shah@example.com',
    type: 'CoWorkingSpace',
    city: 'Ahmedabad',
    price: 14000,
    status: 'APPROVED',
    createdAt: '2025-12-05T10:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l3',
    title: 'Shared Room for Roommate — Vastrapur',
    ownerName: 'Priya Mehta',
    ownerEmail: 'priya.mehta@example.com',
    type: 'Roommate',
    city: 'Ahmedabad',
    price: 6000,
    status: 'APPROVED',
    createdAt: '2026-01-10T09:00:00Z',
    flagCount: 1,
  },
  {
    id: 'l4',
    title: 'Bachelor Flat Near IIM-A',
    ownerName: 'Manish Joshi',
    ownerEmail: 'manish.joshi@example.com',
    type: 'Bachelor',
    city: 'Ahmedabad',
    price: 11000,
    status: 'APPROVED',
    createdAt: '2026-01-15T07:30:00Z',
    flagCount: 0,
  },
  {
    id: 'l5',
    title: 'Premium PG for Ladies — Bodakdev',
    ownerName: 'Anita Trivedi',
    ownerEmail: 'anita.trivedi@example.com',
    type: 'PG',
    city: 'Ahmedabad',
    price: 9500,
    status: 'APPROVED',
    createdAt: '2026-01-20T11:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l6',
    title: '2BHK Family Apartment in Gota',
    ownerName: 'Vijay Desai',
    ownerEmail: 'vijay.desai@example.com',
    type: 'Family',
    city: 'Ahmedabad',
    price: 18000,
    status: 'UNDER_REVIEW',
    createdAt: '2026-01-25T14:00:00Z',
    flagCount: 2,
  },
  {
    id: 'l7',
    title: 'Affordable PG Near PDPU — Gandhinagar',
    ownerName: 'Kiran Bhatt',
    ownerEmail: 'kiran.bhatt@example.com',
    type: 'PG',
    city: 'Gandhinagar',
    price: 6500,
    status: 'PENDING',
    createdAt: '2026-02-01T08:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l8',
    title: 'Furnished Rent Flat — Maninagar',
    ownerName: 'Dhruv Rana',
    ownerEmail: 'dhruv.rana@example.com',
    type: 'Flat',
    city: 'Ahmedabad',
    price: 12000,
    status: 'APPROVED',
    createdAt: '2026-02-10T10:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l9',
    title: 'Studio Flat in Science City Area',
    ownerName: 'Nisha Kapoor',
    ownerEmail: 'nisha.kapoor@example.com',
    type: 'CoWorkingSpace',
    city: 'Ahmedabad',
    price: 13500,
    status: 'PENDING',
    createdAt: '2026-02-14T09:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l10',
    title: 'PG for Working Professionals — Prahlad Nagar',
    ownerName: 'Rohit Soni',
    ownerEmail: 'rohit.soni@example.com',
    type: 'PG',
    city: 'Ahmedabad',
    price: 10000,
    status: 'APPROVED',
    createdAt: '2026-02-20T12:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l11',
    title: 'Roommate Wanted — Thaltej 3BHK',
    ownerName: 'Guest User',
    ownerEmail: 'guest@roommat.in',
    type: 'Roommate',
    city: 'Ahmedabad',
    price: 7000,
    status: 'PENDING',
    createdAt: '2026-03-01T07:00:00Z',
    flagCount: 0,
  },
  {
    id: 'l12',
    title: 'Luxury PG — Ambawadi with All Amenities',
    ownerName: 'Hetal Modi',
    ownerEmail: 'hetal.modi@example.com',
    type: 'PG',
    city: 'Ahmedabad',
    price: 16000,
    status: 'REJECTED',
    createdAt: '2026-03-05T08:30:00Z',
    flagCount: 3,
  },
];

// ─── Reports ──────────────────────────────────────────────────────────────────

export const REPORTS: Report[] = [
  {
    id: 'rep1',
    reporterName: 'Arjun Sharma',
    reporterEmail: 'arjun.sharma@example.com',
    targetType: 'LISTING',
    targetId: 'l12',
    targetName: 'Luxury PG — Ambawadi with All Amenities',
    reason: 'FAKE_LISTING',
    description:
      'The images shown do not match the actual property. I visited and it was completely different. This listing appears to be fraudulent.',
    status: 'OPEN',
    createdAt: '2026-03-10T10:00:00Z',
  },
  {
    id: 'rep2',
    reporterName: 'Neha Patel',
    reporterEmail: 'neha.patel@example.com',
    targetType: 'USER',
    targetId: 'u5',
    targetName: 'Karan Mehta',
    reason: 'HARASSMENT',
    description:
      'This user sent inappropriate messages after I declined their roommate request. Multiple messages even after blocking.',
    status: 'IN_REVIEW',
    createdAt: '2026-03-15T14:00:00Z',
  },
  {
    id: 'rep3',
    reporterName: 'Ravi Gupta',
    reporterEmail: 'ravi.gupta@example.com',
    targetType: 'LISTING',
    targetId: 'l6',
    targetName: '2BHK Family Apartment in Gota',
    reason: 'FRAUD',
    description:
      'Owner asked for advance payment before showing the property. Looks like a scam — owner not responding after payment.',
    status: 'IN_REVIEW',
    createdAt: '2026-03-20T11:00:00Z',
  },
  {
    id: 'rep4',
    reporterName: 'Pooja Desai',
    reporterEmail: 'pooja.desai@example.com',
    targetType: 'LISTING',
    targetId: 'l3',
    targetName: 'Shared Room for Roommate — Vastrapur',
    reason: 'SPAM',
    description: 'This listing has been reposted multiple times in the same week with different prices.',
    status: 'RESOLVED',
    createdAt: '2026-03-25T09:00:00Z',
  },
  {
    id: 'rep5',
    reporterName: 'Deepak Verma',
    reporterEmail: 'deepak.verma@example.com',
    targetType: 'USER',
    targetId: 'o3',
    targetName: 'Priya Mehta',
    reason: 'INAPPROPRIATE',
    description: 'Profile contains inappropriate photos that violate community standards.',
    status: 'DISMISSED',
    createdAt: '2026-04-01T08:00:00Z',
  },
  {
    id: 'rep6',
    reporterName: 'Simran Kaur',
    reporterEmail: 'simran.kaur@example.com',
    targetType: 'LISTING',
    targetId: 'l12',
    targetName: 'Luxury PG — Ambawadi with All Amenities',
    reason: 'FAKE_LISTING',
    description: 'Amenities listed do not exist at the property. No gym on site.',
    status: 'OPEN',
    createdAt: '2026-04-05T15:00:00Z',
  },
  {
    id: 'rep7',
    reporterName: 'Amit Joshi',
    reporterEmail: 'amit.joshi@example.com',
    targetType: 'USER',
    targetId: 'u3',
    targetName: 'Ravi Gupta',
    reason: 'OTHER',
    description:
      'User misrepresented their lifestyle and household situation significantly during initial discussions.',
    status: 'OPEN',
    createdAt: '2026-04-10T12:00:00Z',
  },
  {
    id: 'rep8',
    reporterName: 'Guest User',
    reporterEmail: 'guest@roommat.in',
    targetType: 'LISTING',
    targetId: 'l12',
    targetName: 'Luxury PG — Ambawadi with All Amenities',
    reason: 'FRAUD',
    description: 'Owner demanded cash before showing property. Likely scam targeting new users.',
    status: 'OPEN',
    createdAt: '2026-04-14T09:00:00Z',
  },
];

// ─── CMS Pages ────────────────────────────────────────────────────────────────

export const CMS_PAGES: CmsPage[] = [
  {
    id: 'cms1',
    slug: 'about',
    title: 'About Roommat',
    content: `# About Roommat

Roommat is India's most trusted platform for finding roommates and rental accommodations. Founded in 2023, we connect tenants, PG seekers, and property owners across major Indian cities.

## Our Mission
To make finding your next home as easy and safe as possible — with verified listings, smart matching, and a trusted community.

## Why Roommat?
- **Verified Listings**: Every listing is reviewed before going live.
- **Smart Matching**: Our algorithm finds roommates based on lifestyle compatibility.
- **Secure Chat**: Communicate safely within the platform.
- **Aadhar & Company Verification**: Trust the people you connect with.

## Our Team
We are a team of 15 passionate individuals based in Ahmedabad, Gujarat, dedicated to solving the housing problem for young India.

Contact us at support@roommat.in`,
    isPublished: true,
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cms2',
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `# Privacy Policy

Last updated: March 1, 2026

## Information We Collect
We collect information you provide directly, such as name, email, phone, and preferences when you create an account.

## How We Use Your Information
- To match you with compatible roommates
- To send notifications about listings and requests
- To improve our services

## Data Security
All data is encrypted in transit and at rest. We never sell your personal information to third parties.

## Your Rights
You can request deletion of your account and data at any time by contacting support@roommat.in.

## Cookies
We use session cookies for authentication and analytics cookies to improve user experience.`,
    isPublished: true,
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cms3',
    slug: 'terms-of-service',
    title: 'Terms of Service',
    content: `# Terms of Service

Last updated: March 1, 2026

## Acceptance of Terms
By using Roommat, you agree to these terms. If you do not agree, please do not use our platform.

## User Responsibilities
- Provide accurate information in your profile and listings.
- Do not post fraudulent or misleading listings.
- Treat all users with respect.

## Listing Rules
- Listings must be for real properties you own or manage.
- Photos must accurately represent the property.
- Pricing must be clear and honest.

## Prohibited Activities
- Harassment or discrimination of any kind.
- Creating fake accounts or listings.
- Using the platform for illegal purposes.

## Limitation of Liability
Roommat is a platform and is not responsible for transactions between users.`,
    isPublished: true,
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'cms4',
    slug: 'faq',
    title: 'Frequently Asked Questions',
    content: `# Frequently Asked Questions

## General

**What is Roommat?**
Roommat is a platform to find roommates, PGs, and rental accommodations across India.

**Is Roommat free to use?**
Basic features are free. Premium features like unlimited connects and priority listing require a subscription.

## Listings

**How do I post a listing?**
Create an account, go to "Post Listing," fill in the details, and submit for review.

**How long does approval take?**
Listings are reviewed within 24-48 hours.

**What makes a listing verified?**
Our team verifies the property documents and owner identity before adding the verified badge.

## Roommates

**How does matching work?**
Our algorithm considers location, budget, lifestyle tags, and move-in date to calculate compatibility.

**How do I send a roommate request?**
Visit a profile and click "Send Request." You can add a personal message.

## Safety

**How do I report someone?**
Use the Report button on any listing or profile. Our team reviews all reports within 48 hours.`,
    isPublished: true,
    updatedAt: '2026-03-15T10:00:00Z',
  },
  {
    id: 'cms5',
    slug: 'contact',
    title: 'Contact Us',
    content: `# Contact Us

We would love to hear from you!

## Support
- **Email**: support@roommat.in
- **Phone**: +91 79 4000 0000 (Mon–Sat, 9am–6pm)
- **WhatsApp**: +91 9800000001

## Headquarters
Roommat Technologies Pvt. Ltd.
4th Floor, GIFT City, Gandhinagar,
Gujarat — 382355, India

## Report an Issue
For urgent safety concerns, email safety@roommat.in

## Media Enquiries
For press and partnerships, contact press@roommat.in

## Feedback
We love feedback! Share your thoughts at feedback@roommat.in`,
    isPublished: true,
    updatedAt: '2026-02-20T10:00:00Z',
  },
];

// ─── Admin Settings ───────────────────────────────────────────────────────────

export const ADMIN_SETTINGS: AdminSettings = {
  siteName: 'Roommat',
  supportEmail: 'support@roommat.in',
  maxListingsPerUser: 10,
  requireListingApproval: true,
  enableChat: true,
  enableReferrals: true,
  referralBonus: 250,
  maintenanceMode: false,
};
