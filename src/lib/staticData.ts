/**
 * staticData.ts
 *
 * PURPOSE: Central mock data used across all static pages.
 * BACKEND NOTE: Replace each exported constant / function with a
 * real API call, Prisma query, or Server Action. The shape of every
 * object here defines the TypeScript interface the backend must match.
 *
 * All monetary values are in INR (₹).
 */

/* ─────────────────────────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────────────────────────── */

export type ListingStatus = "Hot" | "Limited Offer" | "New" | null;
export type ListingType =
  | "PG"
  | "Rent"
  | "Flat"
  | "Roommate"
  | "CoWorkingSpace"
  | "Bachelor"
  | "Family";

export interface Listing {
  id: string;
  title: string;          // e.g. "2 BHK Shared | Prahladnagar"
  location: string;       // area / locality
  city: string;
  price: number;          // per month in ₹
  isVerified: boolean;    // Aadhar / phone verified
  spotsLeft: number;      // available beds
  amenities: { name: string; iconKey?: string }[];
  badge: ListingStatus;   // label shown on card image
  type: ListingType;
  images: string[];       // placeholder backend will provide real URLs
  description: string;
  mapPlaceholder: boolean; // true → render map skeleton
}

export interface RoommateProfile {
  id: string;
  name: string;
  avatarInitial: string;
  matchPercent: number;    // e.g. 88
  tags: string[];          // ["WORKING", "VEGETARIAN", "Non-smoker"]
  isConnected: boolean;
  role: "Student" | "Working" | "Veg Only";
}

export interface Notification {
  id: string;
  icon: "request" | "application" | "connect" | "listing";
  title: string;
  subtitle: string;
  time: string;
  isUnread: boolean;
}

export interface Category {
  id: string;
  label: ListingType;
  icon: string;       // emoji placeholder; backend replaces with real icon/image URL
  count: number;
  unit: "listings" | "profiles";
}

/* ─────────────────────────────────────────────────────────────────
   LISTINGS
   BACKEND: db.listing.findMany({ where:{ status:"APPROVED" }, … })
   ───────────────────────────────────────────────────────────────── */
export const LISTINGS: Listing[] = [
  {
    id: "l1",
    title: "2 BHK Shared | Prahladnagar",
    location: "Prahladnagar",
    city: "Ahmedabad",
    price: 15000,
    isVerified: true,
    spotsLeft: 2,
    amenities: [{ name: "WiFi" }, { name: "AC" }, { name: "Kitchen" }],
    badge: "Hot",
    type: "Flat",
    images: [],
    description: "Spacious 2BHK in a gated society. Well connected to SG Highway.",
    mapPlaceholder: true,
  },
  {
    id: "l2",
    title: "PG Room | Satellite, Ahmedabad",
    location: "Satellite",
    city: "Ahmedabad",
    price: 9000,
    isVerified: true,
    spotsLeft: 3,
    amenities: [{ name: "WiFi" }, { name: "Food" }, { name: "Laundry" }],
    badge: "Limited Offer",
    type: "PG",
    images: [],
    description: "Affordable PG near CG Road. Meals included.",
    mapPlaceholder: true,
  },
  {
    id: "l3",
    title: "Studio Flat | Navrangpura",
    location: "Navrangpura",
    city: "Ahmedabad",
    price: 12000,
    isVerified: false,
    spotsLeft: 1,
    amenities: [{ name: "AC" }, { name: "WiFi" }, { name: "Parking" }],
    badge: "New",
    type: "CoWorkingSpace",
    images: [],
    description: "Brand new studio flat. Ideal for working professionals.",
    mapPlaceholder: true,
  },
  {
    id: "l4",
    title: "3 BHK Shared | Bodakdev",
    location: "Bodakdev",
    city: "Ahmedabad",
    price: 18000,
    isVerified: true,
    spotsLeft: 2,
    amenities: [{ name: "AC" }, { name: "Kitchen" }, { name: "Gym" }],
    badge: null,
    type: "Flat",
    images: [],
    description: "Premium 3BHK in gated society. Gym, security and parking included.",
    mapPlaceholder: true,
  },
  {
    id: "l5",
    title: "Bachelor Room | Maninagar",
    location: "Maninagar",
    city: "Ahmedabad",
    price: 6500,
    isVerified: false,
    spotsLeft: 4,
    amenities: [{ name: "WiFi" }, { name: "Kitchen" }],
    badge: null,
    type: "Bachelor",
    images: [],
    description: "Single non-AC room. Ground floor. Easy bus connectivity.",
    mapPlaceholder: true,
  },
  {
    id: "l6",
    title: "Ladies PG | Chandkheda",
    location: "Chandkheda",
    city: "Ahmedabad",
    price: 8000,
    isVerified: true,
    spotsLeft: 2,
    amenities: [{ name: "WiFi" }, { name: "Food" }, { name: "Laundry" }],
    badge: "Limited Offer",
    type: "PG",
    images: [],
    description: "Ladies-only PG near PDPU. Meals, laundry and WiFi included.",
    mapPlaceholder: true,
  },
  {
    id: "l7",
    title: "1 BHK Furnished | Vastrapur",
    location: "Vastrapur",
    city: "Ahmedabad",
    price: 13500,
    isVerified: true,
    spotsLeft: 1,
    amenities: [{ name: "AC" }, { name: "WiFi" }, { name: "Parking" }],
    badge: "New",
    type: "Flat",
    images: [],
    description: "Fully furnished 1BHK near Vastrapur lake. Ready to move.",
    mapPlaceholder: true,
  },
  {
    id: "l8",
    title: "PG for Girls | Ambawadi",
    location: "Ambawadi",
    city: "Ahmedabad",
    price: 7500,
    isVerified: true,
    spotsLeft: 3,
    amenities: [{ name: "WiFi" }, { name: "Food" }, { name: "AC" }],
    badge: "Hot",
    type: "PG",
    images: [],
    description: "Safe, well-maintained ladies PG near Ambawadi circle.",
    mapPlaceholder: true,
  },
  {
    id: "l9",
    title: "2 BHK Flat Share | Thaltej",
    location: "Thaltej",
    city: "Ahmedabad",
    price: 16000,
    isVerified: true,
    spotsLeft: 2,
    amenities: [{ name: "AC" }, { name: "WiFi" }, { name: "Gym" }],
    badge: null,
    type: "Flat",
    images: [],
    description: "Modern flat near Thaltej metro station. 2 flatmates required.",
    mapPlaceholder: true,
  },
  {
    id: "l10",
    title: "Single Room PG | Gota",
    location: "Gota",
    city: "Ahmedabad",
    price: 5500,
    isVerified: false,
    spotsLeft: 6,
    amenities: [{ name: "WiFi" }, { name: "Kitchen" }, { name: "Laundry" }],
    badge: "Limited Offer",
    type: "PG",
    images: [],
    description: "Affordable single room PG. Kitchen and laundry facilities.",
    mapPlaceholder: true,
  },
  {
    id: "l11",
    title: "Studio Apartment | SG Highway",
    location: "SG Highway",
    city: "Ahmedabad",
    price: 14000,
    isVerified: true,
    spotsLeft: 1,
    amenities: [{ name: "AC" }, { name: "WiFi" }, { name: "Security" }],
    badge: "New",
    type: "CoWorkingSpace",
    images: [],
    description: "Premium studio on SG Highway. 24x7 security and power backup.",
    mapPlaceholder: true,
  },
  {
    id: "l12",
    title: "3 BHK for Working | Prahlad Nagar",
    location: "Prahlad Nagar",
    city: "Ahmedabad",
    price: 22000,
    isVerified: true,
    spotsLeft: 3,
    amenities: [{ name: "AC" }, { name: "WiFi" }, { name: "Kitchen" }],
    badge: "Hot",
    type: "Flat",
    images: [],
    description: "Premium 3BHK ideal for working professionals. Corporate-ready.",
    mapPlaceholder: true,
  },
];

/* ─────────────────────────────────────────────────────────────────
   ROOMMATE PROFILES
   BACKEND: db.profile.findMany({ where:{ isActive:true }, … })
   ───────────────────────────────────────────────────────────────── */
export const ROOMMATE_PROFILES: RoommateProfile[] = [
  {
    id: "r1",
    name: "Rahul Sharma",
    avatarInitial: "RS",
    matchPercent: 88,
    tags: ["WORKING", "VEGETARIAN", "Non-smoker"],
    isConnected: true,
    role: "Working",
  },
  {
    id: "r2",
    name: "Priya Desai",
    avatarInitial: "PD",
    matchPercent: 91,
    tags: ["STUDENT", "VEGETARIAN", "Non-smoker"],
    isConnected: false,
    role: "Student",
  },
  {
    id: "r3",
    name: "Amit Patel",
    avatarInitial: "AP",
    matchPercent: 76,
    tags: ["WORKING", "Non-veg", "Smoker"],
    isConnected: false,
    role: "Working",
  },
  {
    id: "r4",
    name: "Sneha Joshi",
    avatarInitial: "SJ",
    matchPercent: 94,
    tags: ["STUDENT", "VEGETARIAN", "Non-smoker"],
    isConnected: true,
    role: "Veg Only",
  },
];

/* ─────────────────────────────────────────────────────────────────
   CATEGORIES  (Explore page "Browse by Category" section)
   BACKEND: Aggregated counts from db.listing.groupBy({ by:["type"] })
   ───────────────────────────────────────────────────────────────── */
export const CATEGORIES: Category[] = [
  { id: "c1", label: "PG", icon: "🏠", count: 0, unit: "listings" },
  { id: "c2", label: "Flat", icon: "🔑", count: 0, unit: "listings" },
  { id: "c3", label: "Roommate", icon: "👥", count: 0, unit: "profiles" },
  { id: "c4", label: "CoWorkingSpace", icon: "💼", count: 0, unit: "listings" },
  { id: "c5", label: "Bachelor", icon: "👤", count: 0, unit: "listings" },
  { id: "c6", label: "Family", icon: "👨‍👩‍👧", count: 0, unit: "listings" },
];

/* ─────────────────────────────────────────────────────────────────
   NOTIFICATIONS
   BACKEND: db.notification.findMany({ where:{ userId: session.user.id },
             orderBy:{ createdAt:"desc" }, take:20 })
   ───────────────────────────────────────────────────────────────── */
export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: "request",
    title: "Request sent to Nikhil Agarwal",
    subtitle: "Your roommate request has been sent.",
    time: "Just now",
    isUnread: true,
  },
  {
    id: "n2",
    icon: "application",
    title: "Application Sent!",
    subtitle: "Your application for Co-Working Space | Navrangpura has been sent to the owner.",
    time: "Just now",
    isUnread: false,
  },
  {
    id: "n3",
    icon: "request",
    title: "Request sent to Rahul Sharma",
    subtitle: "Your roommate request has been sent.",
    time: "Just now",
    isUnread: false,
  },
  {
    id: "n4",
    icon: "connect",
    title: "Connected with Rahul Sharma!",
    subtitle: "You are now connected with Rahul Sharma.",
    time: "Just now",
    isUnread: false,
  },
  {
    id: "n5",
    icon: "listing",
    title: "New room in Satellite!",
    subtitle: "A new PG Room has been listed in Satellite matching your filters.",
    time: "2 min ago",
    isUnread: false,
  },
];

/* ─────────────────────────────────────────────────────────────────
   POPULAR AREAS  (shown on Explore page)
   BACKEND: Aggregate from listings grouped by locality
   ───────────────────────────────────────────────────────────────── */
export const POPULAR_AREAS = [
  "Prahladnagar", "Satellite", "Navrangpura", "Bodakdev",
  "Vastrapur", "Chandkheda", "Ambawadi", "Thaltej",
  "SG Highway", "Gota", "Maninagar", "Prahlad Nagar",
];

/* ─────────────────────────────────────────────────────────────────
   GUEST USER  (Profile page static state)
   BACKEND: session.user from NextAuth / JWT
   ───────────────────────────────────────────────────────────────── */
export const GUEST_USER = {
  id: "u1",
  name: "Guest User",
  role: "Tenant",      // "Owner" | "Tenant" | "Admin"
  isPhoneVerified: true,
  isCompanyVerified: true,
  listingCount: 0,
  shortlistedCount: 0,
  bookingCount: 0,
  avatarInitial: "GU",
};

/* ─────────────────────────────────────────────────────────────────
   FAQ DATA  (Help & Support modal)
   BACKEND: db.faq.findMany({ where:{ isActive:true } })
   ───────────────────────────────────────────────────────────────── */
export const FAQS = [
  { id: "f1", question: "How do I post a listing?", answer: "Go to Profile → + Add Listing and fill in the property details. Your listing will be reviewed within 24 hours." },
  { id: "f2", question: "Is Roommat free to use?", answer: "Basic browsing and profile creation are free. Premium features like priority listings and unlimited chats require a subscription." },
  { id: "f3", question: "How does roommate matching work?", answer: "Our algorithm matches you based on lifestyle tags, budget, location, and move-in date preferences." },
  { id: "f4", question: "How do I verify my identity?", answer: "Go to Profile → Verify Identity and upload your Aadhar card. Verification is completed within 2 business days." },
];
