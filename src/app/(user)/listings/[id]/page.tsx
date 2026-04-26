'use client';

/**
 * Listing detail page — src/app/(user)/listings/[id]/page.tsx
 * Mobile  : single-column scroll
 * Desktop : left column (image, amenities, description, map, similar) +
 *           sticky right column (price, owner, CTAs)
 */

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, MapPin,
  Wifi, Wind, UtensilsCrossed, ShoppingBag,
  Car, Dumbbell, Shield, Zap, Eye,
  Pencil, Trash2, UserPlus, Users, Sparkles, MessageCircle,
} from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { ListingCard } from '@/components/features/ListingCard';
import { ListingDetailModal } from '@/components/features/ListingDetailModal';
import { ListingVerificationBadge } from '@/components/features/ListingVerificationBadge';
import { ListingLocationMap } from '@/components/features/ListingLocationMap';
import { ListingResidentEditorModal } from '@/components/features/ListingResidentEditorModal';
import { ListingResidentsViewModal } from '@/components/features/ListingResidentsViewModal';
import { BookVisitModal } from '@/components/features/BookVisitModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useToast } from '@/hooks/useToast';
import { listingService, MAX_LISTING_RESIDENTS } from '@/services/modules/listing.service';
import { formatRupees } from '@/lib/utils/format';
import { Listing, type ListingResidentSnapshot } from '@/types';
import { useAuthStore } from '@/store/authStore';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi:           <Wifi size={15} />,
  AC:             <Wind size={15} />,
  Kitchen:        <UtensilsCrossed size={15} />,
  Food:           <UtensilsCrossed size={15} />,
  Laundry:        <ShoppingBag size={15} />,
  Parking:        <Car size={15} />,
  Gym:            <Dumbbell size={15} />,
  Security:       <Shield size={15} />,
  'Power Backup': <Zap size={15} />,
  CCTV:           <Eye size={15} />,
};

const BADGE_VARIANT_MAP: Record<string, 'hot' | 'limited' | 'new'> = {
  Hot: 'hot', 'Limited Offer': 'limited', New: 'new',
};

const TYPE_COLORS: Record<string, string> = {
  PG: '#c8eeee', Rent: '#c8eeee', Roommate: '#cce8cc',
  Studio: '#e8dcc8', Bachelor: '#d8c8e8', Family: '#c8d8e8',
};

function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return phone;
  return `+91 ${digits.slice(0, 2)}xxxxx${digits.slice(-3)}`;
}

const RESIDENT_PRO_LABEL: Record<string, string> = {
  student: 'Student',
  work_professional: 'Working professional',
  freelancer: 'Freelancer',
  business: 'Business',
  other: 'Other',
};

export default function ListingDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const toast    = useToast();
  const user = useAuthStore((s) => s.user);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [showResidentEditor, setShowResidentEditor] = useState(false);
  const [residentEditorIndex, setResidentEditorIndex] = useState<number | null>(null);
  const [removingResidentIndex, setRemovingResidentIndex] = useState<number | null>(null);
  const [showResidentsViewModal, setShowResidentsViewModal] = useState(false);
  const [residentsForViewModal, setResidentsForViewModal] = useState<ListingResidentSnapshot[]>([]);
  /** Gallery hero index — reset when navigating to another listing or image count shrinks. */
  const [photoIndex, setPhotoIndex] = useState(0);

  const id = params?.id as string;

  const openAddResident = () => {
    if (!listing) return;
    const rows = listing.residentSnapshots ?? [];
    if (rows.length >= MAX_LISTING_RESIDENTS) {
      toast.error('Limit reached', `You can add at most ${MAX_LISTING_RESIDENTS} residents per listing.`);
      return;
    }
    setResidentEditorIndex(null);
    setShowResidentEditor(true);
  };

  const openEditResident = (index: number) => {
    setResidentEditorIndex(index);
    setShowResidentEditor(true);
  };

  const handleRemoveResident = async (index: number) => {
    if (!listing) return;
    const rows = listing.residentSnapshots ?? [];
    const rid = rows[index]?.id;
    if (!rid) {
      toast.error(
        'Cannot remove this entry',
        'This row has no server id yet. Refresh the page, or edit and save once to sync.',
      );
      return;
    }
    setRemovingResidentIndex(index);
    try {
      const updated = await listingService.removeListingResident(listing.id, rid);
      setListing(updated);
      toast.success('Removed', 'That person was removed from your listing.');
    } catch (e) {
      toast.error('Could not remove', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setRemovingResidentIndex(null);
    }
  };

  const openViewResidents = (rows: ListingResidentSnapshot[]) => {
    if (rows.length === 0) return;
    setResidentsForViewModal(rows);
    setShowResidentsViewModal(true);
  };

  const closeViewResidentsModal = () => {
    setShowResidentsViewModal(false);
    setResidentsForViewModal([]);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadState('loading');
    (async () => {
      try {
        const l = await listingService.getListingById(id);
        if (cancelled) return;
        setListing(l);
        setLoadState('ok');
        const rows = await listingService.getListings({ type: l.type });
        if (cancelled) return;
        setSimilarListings(rows.filter((x) => x.id !== id).slice(0, 4));
      } catch {
        if (!cancelled) {
          setListing(null);
          setSimilarListings([]);
          setLoadState('error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    setPhotoIndex(0);
  }, [id]);

  useEffect(() => {
    if (!listing?.images?.length) return;
    const n = listing.images.filter(Boolean).length;
    if (n === 0) return;
    setPhotoIndex((p) => (p >= n ? 0 : p));
  }, [listing?.id, listing?.images?.length]);

  if (loadState === 'loading') {
    return (
      <UserLayout pageSuffix="Listing" showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-gray-500">Loading listing…</div>
      </UserLayout>
    );
  }

  if (loadState === 'error' || !listing) {
    return (
      <UserLayout pageSuffix="Listing" showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <EmptyState
            title="Listing not found"
            description="This listing may have been removed or the link is incorrect."
            actionLabel="Browse Listings"
            onAction={() => router.push('/')}
          />
        </div>
      </UserLayout>
    );
  }

  const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';
  const galleryImages = (listing.images ?? []).filter(Boolean);
  const galleryCount = galleryImages.length;
  const activePhotoIdx = galleryCount ? Math.min(photoIndex, galleryCount - 1) : 0;
  const mainPhotoSrc = galleryCount ? galleryImages[activePhotoIdx] : '';

  const ownerInitials = listing.ownerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const isOwner =
    Boolean(user?.id && listing.ownerId) && String(user!.id) === String(listing.ownerId);

  const handleMessageOwner = () => {
    if (!listing.ownerId || isOwner) return;
    const path = `/chat/${listing.ownerId}`;
    if (!user?.id) {
      router.push(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    router.push(path);
  };

  const handleBookVisit = () => {
    setVisitModalOpen(true);
  };
  const residents = listing.residentSnapshots ?? [];

  return (
    <UserLayout pageSuffix="Listing Detail" showSearch={false} showFab={false}>
      <div className="max-w-[1440px] mx-auto pb-8 px-0 lg:px-10 xl:px-14 lg:pt-4">

        {/* Back button */}
        <div className="px-4 lg:px-0 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </div>

        {listing.approvalStatus === 'REJECTED' && listing.rejectionReason && (
          <div
            className="mx-4 lg:mx-0 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            <p className="font-semibold">This listing was not approved</p>
            <p className="mt-1 text-red-800/95">{listing.rejectionReason}</p>
            <p className="mt-2 text-xs text-red-700/90">
              Update your listing and resubmit, or contact support if you think this is a mistake.
            </p>
          </div>
        )}

        {/* ── Desktop: 2-column grid ── */}
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start">

          {/* ── LEFT: Image + Details ── */}
          <div>
            {/* Photo gallery — hero + thumbnails (all listing.images) */}
            <div className="space-y-2">
              <div
                className="relative w-full h-56 md:h-72 lg:h-[22rem] lg:rounded-2xl overflow-hidden bg-gray-100"
                style={{ backgroundColor: cardBg }}
              >
                {mainPhotoSrc ? (
                  <img
                    src={mainPhotoSrc}
                    alt={`${listing.title} — photo ${activePhotoIdx + 1} of ${galleryCount}`}
                    className="h-full w-full object-cover object-center"
                    decoding="async"
                    fetchPriority={activePhotoIdx === 0 ? 'high' : 'auto'}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <svg width="100" height="100" viewBox="0 0 80 80" fill="none" className="opacity-30">
                      <rect x="10" y="30" width="60" height="40" rx="4" fill="#1B8F8F" opacity="0.5" />
                      <rect x="20" y="20" width="40" height="50" rx="4" fill="#1B8F8F" opacity="0.6" />
                      <rect x="30" y="10" width="20" height="60" rx="4" fill="#1B8F8F" opacity="0.7" />
                      <rect x="32" y="50" width="16" height="20" rx="2" fill="white" opacity="0.5" />
                    </svg>
                  </div>
                )}
                {galleryCount > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60"
                      onClick={() =>
                        setPhotoIndex((p) => (p - 1 + galleryCount) % galleryCount)
                      }
                    >
                      <ChevronLeft size={22} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Next photo"
                      className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-sm transition hover:bg-black/60"
                      onClick={() => setPhotoIndex((p) => (p + 1) % galleryCount)}
                    >
                      <ChevronRight size={22} aria-hidden />
                    </button>
                    <div
                      className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                      aria-live="polite"
                    >
                      {activePhotoIdx + 1} / {galleryCount}
                    </div>
                  </>
                )}
                {listing.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant={BADGE_VARIANT_MAP[listing.badge]}>{listing.badge}</Badge>
                  </div>
                )}
                <ListingVerificationBadge listing={listing} variant="heroOverlay" />
              </div>
              {galleryCount > 1 && (
                <div
                  className="flex gap-2 overflow-x-auto px-4 pb-1 pt-0.5 lg:px-0 [scrollbar-width:thin]"
                  role="tablist"
                  aria-label="Listing photos"
                >
                  {galleryImages.map((src, idx) => (
                    <button
                      key={`${src}-${idx}`}
                      type="button"
                      role="tab"
                      aria-selected={idx === activePhotoIdx}
                      aria-label={`Show photo ${idx + 1}`}
                      className={[
                        'relative shrink-0 overflow-hidden rounded-xl border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-teal-500',
                        idx === activePhotoIdx
                          ? 'border-teal-500 ring-2 ring-teal-400/80 ring-offset-1'
                          : 'border-transparent opacity-80 hover:opacity-100',
                      ].join(' ')}
                      onClick={() => setPhotoIndex(idx)}
                    >
                      <img
                        src={src}
                        alt=""
                        width={112}
                        height={72}
                        className="h-[4.5rem] w-[7rem] object-cover sm:h-[5rem] sm:w-[7.5rem]"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="px-4 lg:px-0 space-y-5 mt-4">

              {/* Title + location — shown on mobile only (desktop is in right col) */}
              <div className="lg:hidden">
                <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">{listing.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span>{listing.location}</span>
                </div>
                <ListingVerificationBadge listing={listing} variant="inlinePill" />
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-2">Amenities</h2>
                {listing.amenities.length === 0 ? (
                  <p className="text-sm text-gray-500">No amenities listed for this place.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                    {listing.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100"
                      >
                        <span style={{ color: '#1B8F8F' }}>
                          {AMENITY_ICONS[amenity] ?? (
                            <Sparkles size={15} className="opacity-70" aria-hidden />
                          )}
                        </span>
                        <span className="text-xs text-gray-600 leading-tight">{amenity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-2">About this place</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{listing.description}</p>
              </div>

              {isOwner && (
                <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <Users size={16} className="text-teal-700 shrink-0" aria-hidden />
                        Who lives here
                      </h2>
                      <p className="text-xs text-gray-600 mt-1">
                        Manage people currently staying here (up to {MAX_LISTING_RESIDENTS}). This appears on your
                        public listing.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      onClick={openAddResident}
                      disabled={residents.length >= MAX_LISTING_RESIDENTS}
                    >
                      <UserPlus size={14} className="inline mr-1 -mt-0.5 align-middle" aria-hidden />
                      Add resident
                    </Button>
                  </div>

                  {residents.length > 0 ? (
                    <ul className="mt-3 divide-y divide-teal-100 rounded-xl border border-teal-100 bg-white overflow-hidden">
                      {residents.map((r, i) => (
                        <li
                          key={`resident-row-${i}-${r.profileImageUrl ?? ''}-${r.fullName ?? ''}`}
                          className="flex flex-wrap items-center gap-3 px-3 py-3 text-sm"
                        >
                          <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {r.profileImageUrl ? (
                              <img src={r.profileImageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              (r.fullName?.trim()?.[0] ?? '?').toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {r.fullName?.trim() || 'Unnamed resident'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {r.professionalType
                                ? RESIDENT_PRO_LABEL[r.professionalType] ?? r.professionalType
                                : '—'}
                              {r.collegeOrCompanyName ? ` · ${r.collegeOrCompanyName}` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="!px-2"
                              aria-label={`View details for ${r.fullName?.trim() || 'resident'}`}
                              onClick={() => openViewResidents([residents[i]])}
                            >
                              <Eye size={14} aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="!px-2"
                              aria-label={`Edit ${r.fullName?.trim() || 'resident'}`}
                              disabled={!r.id}
                              title={!r.id ? 'Refresh the page to sync this row with the server.' : undefined}
                              onClick={() => openEditResident(i)}
                            >
                              <Pencil size={14} aria-hidden />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="!px-2 text-red-600 border-red-200 hover:bg-red-50"
                              aria-label={`Remove ${r.fullName?.trim() || 'resident'}`}
                              isLoading={removingResidentIndex === i}
                              disabled={removingResidentIndex != null || !r.id}
                              title={!r.id ? 'Refresh the page to sync this row with the server.' : undefined}
                              onClick={() => void handleRemoveResident(i)}
                            >
                              <Trash2 size={14} aria-hidden />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2">No residents added yet. Use &quot;Add resident&quot; to add the first one.</p>
                  )}
                </div>
              )}

              {!isOwner && residents.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <p className="text-sm text-gray-700 flex items-center gap-2 min-w-0">
                    <Users size={16} className="text-teal-700 shrink-0" aria-hidden />
                    <span>
                      Who lives here
                      <span className="text-gray-500 font-normal">
                        {' '}
                        ({residents.length} {residents.length === 1 ? 'person' : 'people'})
                      </span>
                    </span>
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => openViewResidents(residents)}
                  >
                    <Eye size={14} className="inline mr-1.5 -mt-0.5 align-middle" aria-hidden />
                    View
                  </Button>
                </div>
              )}

              {/* Map — Google embed iframe from lat/lng (no API key) */}
              <div>
                <h2 className="text-sm font-bold text-gray-700 mb-2">Location</h2>
                <ListingLocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  locationLabel={listing.location}
                />
              </div>

              {/* Similar listings */}
              {similarListings.length > 0 && (
                <div className="pb-4">
                  <h2 className="text-sm font-bold text-gray-700 mb-3">Similar Listings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {similarListings.map((l) => (
                      <ListingCard key={l.id} listing={l} onViewDetail={setPreviewListing} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Sticky price + owner + CTAs ── */}
          <div className="px-4 lg:px-0 lg:sticky lg:top-20 space-y-4 mt-4 lg:mt-0">

            {/* Title + location — desktop only */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">{listing.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <span>{listing.location}</span>
              </div>
              <ListingVerificationBadge listing={listing} variant="inlinePill" />
            </div>

            {/* Price card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <span className="text-2xl font-bold" style={{ color: '#1B8F8F' }}>
                    {formatRupees(listing.price)}
                  </span>
                  <span className="text-sm text-gray-400 ml-1">/month</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  {listing.spotsLeft} spot{listing.spotsLeft !== 1 ? 's' : ''} left
                </div>
                <span
                  className="px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
                >
                  {listing.genderPreference} pref.
                </span>
              </div>

              {!isOwner && listing.ownerId ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  className="mb-2"
                  onClick={handleMessageOwner}
                >
                  <MessageCircle size={18} className="inline mr-2 -mt-0.5 align-middle" aria-hidden />
                  Message owner
                </Button>
              ) : null}
              <Button
                variant="accent"
                size="lg"
                fullWidth
                onClick={handleBookVisit}
                disabled={isOwner}
                title={isOwner ? 'You cannot book your own listing' : undefined}
              >
                {isOwner ? 'Your listing' : 'Book Visit'}
              </Button>
            </div>

            {/* Owner card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-700 mb-3">Property Owner</h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                  style={{ backgroundColor: '#1B8F8F' }}
                >
                  {ownerInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{listing.ownerName}</p>
                  <p className="text-xs text-gray-500">Property Owner</p>
                  {listing.ownerPhone && (
                    <p className="text-xs text-gray-500 mt-0.5">📞 {maskPhone(listing.ownerPhone)}</p>
                  )}
                </div>
                <ListingVerificationBadge listing={listing} variant="ownerIconOnly" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ListingDetailModal listing={previewListing} isOpen={!!previewListing} onClose={() => setPreviewListing(null)} />

      <BookVisitModal
        listing={listing}
        isOpen={visitModalOpen}
        onClose={() => setVisitModalOpen(false)}
      />

      <ListingResidentsViewModal
        isOpen={showResidentsViewModal}
        onClose={closeViewResidentsModal}
        residents={residentsForViewModal}
      />

      {isOwner && (
        <ListingResidentEditorModal
          isOpen={showResidentEditor}
          onClose={() => setShowResidentEditor(false)}
          propertyId={listing.id}
          listingTitle={listing.title}
          residents={residents}
          editingIndex={residentEditorIndex}
          initialSnapshot={
            residentEditorIndex === null ? undefined : residents[residentEditorIndex]
          }
          onSaved={(updated) => setListing(updated)}
        />
      )}
    </UserLayout>
  );
}
