'use client';

/**
 * Manage "Who lives here" per property. Uses the same listings as My Listings (any account that owns
 * properties in the API — not only users with role OWNER).
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BellRing,
  ChevronLeft,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ListingResidentEditorModal } from '@/components/features/ListingResidentEditorModal';
import { ListingResidentsViewModal } from '@/components/features/ListingResidentsViewModal';
import { useToast } from '@/hooks/useToast';
import { listingService, MAX_LISTING_RESIDENTS } from '@/services/modules/listing.service';
import { useAuthStore } from '@/store/authStore';
import type { Listing, ListingResidentSnapshot } from '@/types';

const RESIDENT_PRO_LABEL: Record<string, string> = {
  student: 'Student',
  work_professional: 'Working professional',
  freelancer: 'Freelancer',
  business: 'Business',
  other: 'Other',
};

function buildReminderPhone(raw: string | undefined): string | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits.length >= 10 ? digits : null;
}

function propertySelectLabel(l: Listing): string {
  const title = l.title.trim() || 'Untitled';
  const loc = (l.location ?? '').trim();
  const short = title.length > 72 ? `${title.slice(0, 72)}…` : title;
  return loc ? `${short} — ${loc}` : short;
}

export default function TenantProfilePage() {
  const toast = useToast();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [showResidentEditor, setShowResidentEditor] = useState(false);
  const [residentEditorIndex, setResidentEditorIndex] = useState<number | null>(null);
  const [removingResidentIndex, setRemovingResidentIndex] = useState<number | null>(null);
  const [showResidentsViewModal, setShowResidentsViewModal] = useState(false);
  const [residentsForViewModal, setResidentsForViewModal] = useState<ListingResidentSnapshot[]>([]);

  const selectedListing = useMemo(
    () => (selectedId ? (listings.find((l) => l.id === selectedId) ?? null) : null),
    [listings, selectedId],
  );

  const residents = selectedListing?.residentSnapshots ?? [];

  const mergeListing = useCallback((updated: Listing) => {
    setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setListings([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await listingService.getMyListings();
        if (!cancelled) setListings(rows);
      } catch (e) {
        if (!cancelled) {
          setListings([]);
          toast.error('Could not load listings', e instanceof Error ? e.message : 'Try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, toast]);

  /** Refresh one property after picker change so resident rows are current. */
  useEffect(() => {
    if (!selectedId || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await listingService.getListingById(selectedId);
        if (!cancelled) mergeListing(fresh);
      } catch {
        if (!cancelled) {
          toast.error('Could not load property', 'Try another listing or open it from My Listings.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, isAuthenticated, mergeListing, toast]);

  const openAddResident = () => {
    if (!selectedListing) return;
    const rows = selectedListing.residentSnapshots ?? [];
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
    if (!selectedListing) return;
    const rows = selectedListing.residentSnapshots ?? [];
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
      const updated = await listingService.removeListingResident(selectedListing.id, rid);
      mergeListing(updated);
      toast.success('Removed', 'That person was removed from your listing.');
    } catch (e) {
      toast.error('Could not remove', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setRemovingResidentIndex(null);
    }
  };

  const handleSendPaymentReminder = (resident: ListingResidentSnapshot) => {
    if (!selectedListing) return;
    const to = buildReminderPhone(resident.phone);
    if (!to) {
      toast.error('Phone missing', 'Add a valid resident phone number first to send a payment reminder.');
      return;
    }
    const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date());
    const residentName = resident.fullName?.trim() || 'there';
    const rentPart =
      typeof resident.monthlyRent === 'number' && Number.isFinite(resident.monthlyRent)
        ? ` Your monthly rent is ₹${resident.monthlyRent}.`
        : '';
    const msg = `Hi ${residentName}, this is a reminder for your ${monthLabel} rent payment for "${selectedListing.title}".${rentPart} Please clear it at the earliest. Thank you.`;
    const url = `https://wa.me/${to}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('Reminder opened', 'WhatsApp opened with a pre-filled monthly payment reminder.');
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

  const propertyOptions = useMemo(
    () => listings.map((l) => ({ value: l.id, label: propertySelectLabel(l) })),
    [listings],
  );

  if (!isAuthenticated) {
    return (
      <UserLayout pageSuffix="Tenant Profile" showSearch={false} showFab={false}>
        <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 lg:py-10 pb-safe">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronLeft size={18} aria-hidden />
            Back to profile
          </Link>
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-6 py-12 text-center">
            <p className="text-gray-700 font-medium">Sign in to manage residents</p>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Add who lives at each of your listings after you sign in.
            </p>
            <Link
              href={`/login?next=${encodeURIComponent('/profile/tenant-profile')}`}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Sign in
            </Link>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageSuffix="Tenant Profile" showSearch={false} showFab={false}>
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 lg:py-10 pb-safe">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={18} aria-hidden />
          Back to profile
        </Link>

        <div className="flex items-start gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Users size={24} aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tenant Profile</h1>
            <p className="text-sm text-gray-500 mt-1">
              Choose one of your listings, then manage who lives there. This information appears on the public
              listing.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-gray-500">
            <Loader2 className="animate-spin" size={28} aria-label="Loading" />
          </div>
        )}

        {!loading && listings.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-6 py-12 text-center">
            <p className="text-gray-700 font-medium">No listings yet</p>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Post a property first, then you can add residents here.
            </p>
            <Link
              href="/my-listings"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              My listings
            </Link>
          </div>
        )}

        {!loading && listings.length > 0 && (
          <div className="space-y-6">
            <Select
              label="Property *"
              hint="Residents are saved on the listing you select."
              placeholder="Select a property"
              options={propertyOptions}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            />

            {!selectedId && (
              <p className="text-sm text-gray-500">Select a property above to add or edit residents.</p>
            )}

            {selectedId && selectedListing && (
              <>
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
                      <p className="text-xs font-medium text-gray-700 mt-2">{selectedListing.title}</p>
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
                              // eslint-disable-next-line @next/next/no-img-element -- API URL
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
                              aria-label={`Send payment reminder to ${r.fullName?.trim() || 'resident'}`}
                              title="Send monthly payment reminder"
                              onClick={() => handleSendPaymentReminder(r)}
                            >
                              <BellRing size={14} aria-hidden />
                            </Button>
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
                    <p className="text-xs text-gray-500 mt-2">
                      No residents added yet. Use &quot;Add resident&quot; to add the first one.
                    </p>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  <Link href={`/listings/${selectedListing.id}`} className="font-semibold text-primary hover:underline">
                    Open full listing
                  </Link>{' '}
                  to edit photos, price, and other details.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <ListingResidentsViewModal
        isOpen={showResidentsViewModal}
        onClose={closeViewResidentsModal}
        residents={residentsForViewModal}
      />

      {selectedListing && (
        <ListingResidentEditorModal
          isOpen={showResidentEditor}
          onClose={() => setShowResidentEditor(false)}
          propertyId={selectedListing.id}
          listingTitle={selectedListing.title}
          residents={residents}
          editingIndex={residentEditorIndex}
          initialSnapshot={residentEditorIndex === null ? undefined : residents[residentEditorIndex]}
          onSaved={mergeListing}
        />
      )}
    </UserLayout>
  );
}
