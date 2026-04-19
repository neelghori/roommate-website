'use client';

/**
 * My Listings page — src/app/(user)/my-listings/page.tsx
 * Shows the current user's listings with edit/delete actions.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Trash2,
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Wifi,
  Wind,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Dumbbell,
  Shield,
  Zap,
  Eye,
} from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';

import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { MOCK_LISTINGS } from '@/mock/data';
import { useToast } from '@/hooks/useToast';
import { formatRupees } from '@/lib/utils/format';
import { Listing } from '@/types';

// Use first 3 mock listings as "my listings" with hardcoded statuses
type MyListing = Listing & { myStatus: 'Active' | 'Pending' | 'Rejected' };

const INITIAL_MY_LISTINGS: MyListing[] = [
  { ...MOCK_LISTINGS[0], myStatus: 'Active' },
  { ...MOCK_LISTINGS[1], myStatus: 'Active' },
  { ...MOCK_LISTINGS[2], myStatus: 'Pending' },
];

const TYPE_COLORS: Record<string, string> = {
  PG: '#c8eeee',
  Rent: '#c8eeee',
  Roommate: '#cce8cc',
  Studio: '#e8dcc8',
  Bachelor: '#d8c8e8',
  Family: '#c8d8e8',
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={12} />,
  AC: <Wind size={12} />,
  Kitchen: <UtensilsCrossed size={12} />,
  Food: <UtensilsCrossed size={12} />,
  Laundry: <ShoppingBag size={12} />,
  Parking: <Car size={12} />,
  Gym: <Dumbbell size={12} />,
  Security: <Shield size={12} />,
  'Power Backup': <Zap size={12} />,
  CCTV: <Eye size={12} />,
};

function StatusBadge({ status }: { status: 'Active' | 'Pending' | 'Rejected' }) {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle size={11} />
        Active
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <Clock size={11} />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
      <XCircle size={11} />
      Rejected
    </span>
  );
}

export default function MyListingsPage() {
  const toast = useToast();
  const [listings, setListings] = useState<MyListing[]>(INITIAL_MY_LISTINGS);
  const [deleteTarget, setDeleteTarget] = useState<MyListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeCount = listings.filter((l) => l.myStatus === 'Active').length;
  const pendingCount = listings.filter((l) => l.myStatus === 'Pending').length;
  const rejectedCount = listings.filter((l) => l.myStatus === 'Rejected').length;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    // BACKEND: DELETE /listings/{id}
    await new Promise((r) => setTimeout(r, 800));
    setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
    setIsDeleting(false);
    setDeleteTarget(null);
    toast.success('Listing deleted', `"${deleteTarget.title}" has been removed.`);
  };

  return (
    <UserLayout pageSuffix="My Listings" showSearch={false} showFab={false}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-5">

        {/* ── Page title ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your posted properties</p>
          </div>
          <Link href="/listings/add">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
            >
              Add New
            </Button>
          </Link>
        </div>

        {/* ── Stats bar ──────────────────────────────────────────── */}
        <div
          className="flex items-center justify-around rounded-2xl px-4 py-3 mb-5"
          style={{ backgroundColor: '#EDF5F5' }}
        >
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1B8F8F' }}>{activeCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Active</p>
          </div>
          <div className="w-px h-8 bg-teal-100" />
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Pending</p>
          </div>
          <div className="w-px h-8 bg-teal-100" />
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">{rejectedCount}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Rejected</p>
          </div>
        </div>

        {/* ── Listing cards ───────────────────────────────────────── */}
        {listings.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="You haven't posted any listings. Add your first listing to get started!"
            actionLabel="+ Add Listing"
            onAction={() => (window.location.href = '/listings/add')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listings.map((listing) => {
              const cardBg = TYPE_COLORS[listing.type] ?? '#c8eeee';
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="flex gap-0">
                    {/* Image / placeholder */}
                    <div
                      className="flex-shrink-0 w-28 h-full min-h-[120px] relative overflow-hidden"
                      style={{ backgroundColor: cardBg }}
                    >
                      {listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover absolute inset-0"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <svg width="48" height="48" viewBox="0 0 80 80" fill="none" className="opacity-30">
                            <rect x="10" y="30" width="60" height="40" rx="4" fill="#1B8F8F" opacity="0.5" />
                            <rect x="20" y="20" width="40" height="50" rx="4" fill="#1B8F8F" opacity="0.6" />
                            <rect x="30" y="10" width="20" height="60" rx="4" fill="#1B8F8F" opacity="0.7" />
                          </svg>
                        </div>
                      )}
                      {/* Type label */}
                      <div className="absolute bottom-2 left-2">
                        <span
                          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                        >
                          {listing.type}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-3">
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                          {listing.title}
                        </h3>
                        <StatusBadge status={listing.myStatus} />
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1.5">
                        <MapPin size={11} className="flex-shrink-0" />
                        <span className="truncate">{listing.location}</span>
                      </div>

                      {/* Price */}
                      <p className="text-sm font-bold mb-2" style={{ color: '#1B8F8F' }}>
                        {formatRupees(listing.price)}
                        <span className="text-gray-400 font-normal text-xs">/mo</span>
                      </p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {listing.amenities.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-0.5 text-gray-500 text-[11px]"
                          >
                            {AMENITY_ICONS[a]}
                            {a}
                          </span>
                        ))}
                        {listing.amenities.length > 4 && (
                          <span className="text-[11px] text-gray-400">
                            +{listing.amenities.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={`/listings/${listing.id}/edit`} className="flex-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            leftIcon={<Pencil size={13} />}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 size={13} />}
                          onClick={() => setDeleteTarget(listing)}
                          className="flex-shrink-0"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FAB — mobile only (desktop uses header button) */}
        <Link
          href="/listings/add"
          className="lg:hidden fixed bottom-20 right-4 z-30 flex items-center gap-1.5 text-white font-semibold px-4 py-2.5 rounded-full shadow-lg active:opacity-90 transition-opacity"
          style={{ backgroundColor: '#F57C00' }}
          aria-label="Add new listing"
        >
          <Plus size={16} />
          <span className="text-sm">Add Listing</span>
        </Link>
      </div>

      {/* ── Delete Confirm Modal ────────────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Listing?"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  This action cannot be undone
                </p>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-700">"{deleteTarget.title}"</span>?
                  All applications and enquiries for this listing will also be removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                fullWidth
                isLoading={isDeleting}
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </UserLayout>
  );
}
