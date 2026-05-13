'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Flag, ChevronRight } from 'lucide-react';
import { AdminListing, ListingApprovalStatus } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { adminService } from '@/services/modules/admin.service';

type StatusFilter = 'ALL' | ListingApprovalStatus;

const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ON_HOLD'];

const STATUS_CONFIG: Record<
  ListingApprovalStatus,
  { label: string; className: string }
> = {
  APPROVED: { label: 'Approved', className: 'bg-green-50 text-green-600 border-green-100' },
  PENDING: { label: 'Pending', className: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  UNDER_REVIEW: { label: 'Review', className: 'bg-blue-50 text-blue-600 border-blue-100' },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-100' },
  ON_HOLD: { label: 'On hold', className: 'bg-slate-50 text-slate-600 border-slate-100' },
};

export default function AdminListingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    setLoading(true);
    adminService
      .getListings()
      .then((rows) => {
        if (!c) setListings(rows);
      })
      .catch((e) => {
        if (!c) setLoadError(e instanceof Error ? e.message : 'Failed to load');
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesSearch =
        !search ||
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, listings]);

  const counts = useMemo(
    () => ({
      ALL: listings.length,
      PENDING: listings.filter((l) => l.status === 'PENDING').length,
      UNDER_REVIEW: listings.filter((l) => l.status === 'UNDER_REVIEW').length,
      APPROVED: listings.filter((l) => l.status === 'APPROVED').length,
      REJECTED: listings.filter((l) => l.status === 'REJECTED').length,
      ON_HOLD: listings.filter((l) => l.status === 'ON_HOLD').length,
    }),
    [listings],
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{listings.length} total in directory</p>
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Could not load listings from API</p>
          <p className="text-xs mt-1 opacity-90">{loadError}</p>
          <Link href="/admin-sign-in" className="text-xs font-semibold text-teal-700 underline mt-2 inline-block">
            Staff sign in
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by title, owner, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                statusFilter === s
                  ? 'border-teal-600 text-teal-700 bg-teal-50'
                  : 'border-gray-200 text-gray-600 bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s as ListingApprovalStatus]?.label ?? s}
              <span className="text-[10px] font-bold">
                ({counts[s as keyof typeof counts] ?? 0})
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-2">
        {loading ? 'Loading…' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`}
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!loading && filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">No listings match the filters</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ListingRow({ listing }: { listing: AdminListing }) {
  const cfg = STATUS_CONFIG[listing.status];
  return (
    <Link
      href={`/admin/listings/${listing.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
        <p className="text-xs text-gray-400">
          {listing.ownerName} · {listing.city} ·{' '}
          <span className="font-medium">₹{listing.price.toLocaleString('en-IN')}/mo</span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {listing.flagCount > 0 && (
          <div className="flex items-center gap-0.5 text-red-400">
            <Flag className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{listing.flagCount}</span>
          </div>
        )}
        <span
          className={`hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.className}`}
        >
          {cfg.label}
        </span>
        <span
          className={`md:hidden w-2 h-2 rounded-full ${
            listing.status === 'APPROVED'
              ? 'bg-green-500'
              : listing.status === 'PENDING'
                ? 'bg-yellow-400'
                : listing.status === 'UNDER_REVIEW'
                  ? 'bg-blue-500'
                  : listing.status === 'ON_HOLD'
                    ? 'bg-slate-400'
                    : 'bg-red-500'
          }`}
        />
        <span className="text-xs text-gray-400 hidden md:inline">{formatDate(listing.createdAt)}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
    </Link>
  );
}
