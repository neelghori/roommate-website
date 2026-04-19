'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Flag, AlertTriangle, ExternalLink } from 'lucide-react';
import { ADMIN_LISTINGS } from '@/mock/data/admin';
import { ListingApprovalStatus } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';

const STATUS_CONFIG: Record<
  ListingApprovalStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  APPROVED: { label: 'Approved', icon: CheckCircle2, className: 'text-green-500' },
  PENDING: { label: 'Pending', icon: Clock, className: 'text-yellow-500' },
  UNDER_REVIEW: { label: 'Under Review', icon: AlertTriangle, className: 'text-blue-500' },
  REJECTED: { label: 'Rejected', icon: XCircle, className: 'text-red-500' },
};

export default function AdminListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const listing = ADMIN_LISTINGS.find((l) => l.id === id);
  const [status, setStatus] = useState<ListingApprovalStatus>(listing?.status ?? 'PENDING');
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!listing) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[40vh]">
        <p className="text-gray-500 mb-4">Listing not found</p>
        <Link href="/admin/listings" className="text-teal-600 font-medium text-sm underline">
          Back to listings
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  const handleApprove = () => {
    setStatus('APPROVED');
    setShowRejectForm(false);
    toast.success('Listing Approved', `"${listing.title}" is now live.`);
  };

  const handleReject = () => {
    if (!rejectNote.trim()) {
      toast.error('Rejection Note Required', 'Please provide a reason for rejection.');
      return;
    }
    setStatus('REJECTED');
    setShowRejectForm(false);
    toast.success('Listing Rejected', `"${listing.title}" has been rejected.`);
  };

  const handleUnderReview = () => {
    setStatus('UNDER_REVIEW');
    toast.info('Listing marked for further review');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 mb-4 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h1 className="text-lg font-bold text-gray-900 leading-snug">{listing.title}</h1>
          <div className={`flex items-center gap-1.5 flex-shrink-0 ${cfg.className}`}>
            <StatusIcon className="w-4.5 h-4.5" />
            <span className="text-sm font-semibold">{cfg.label}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-gray-600">
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 flex-shrink-0">Owner</span>
            <span>{listing.ownerName}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 flex-shrink-0">Email</span>
            <a href={`mailto:${listing.ownerEmail}`} className="text-teal-600 hover:underline truncate">
              {listing.ownerEmail}
            </a>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 flex-shrink-0">Type</span>
            <span>{listing.type}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 flex-shrink-0">City</span>
            <span>{listing.city}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 flex-shrink-0">Price</span>
            <span className="font-semibold">₹{listing.price.toLocaleString('en-IN')}/mo</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-20 flex-shrink-0">Submitted</span>
            <span>{formatDate(listing.createdAt)}</span>
          </div>
          {listing.flagCount > 0 && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 rounded-xl">
              <Flag className="w-4 h-4 text-red-400" />
              <span className="text-red-600 text-sm font-medium">
                {listing.flagCount} report{listing.flagCount !== 1 ? 's' : ''} on this listing
              </span>
              <Link
                href="/admin/reports"
                className="ml-auto text-xs text-red-500 hover:underline flex items-center gap-0.5"
              >
                View <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* View on site */}
        <Link
          href={`/listings/${listing.id}`}
          className="mt-4 flex items-center gap-1.5 text-sm text-teal-600 hover:underline"
          target="_blank"
        >
          <ExternalLink className="w-4 h-4" />
          Preview listing page
        </Link>
      </div>

      {/* Rejection form */}
      {showRejectForm && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-red-600 mb-2">Rejection Reason</p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Explain why this listing is being rejected (shown to owner)…"
            rows={3}
            className="w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm focus:outline-none resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleReject}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => setShowRejectForm(false)}
              className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      {status !== 'APPROVED' && status !== 'REJECTED' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Review Actions</h2>

          <button
            onClick={handleApprove}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#22C55E' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve Listing
          </button>

          <button
            onClick={() => setShowRejectForm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject Listing
          </button>

          <button
            onClick={handleUnderReview}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            Mark Under Review
          </button>
        </div>
      )}

      {/* Already decided */}
      {(status === 'APPROVED' || status === 'REJECTED') && (
        <div
          className={`rounded-2xl p-4 border ${
            status === 'APPROVED'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <p className={`text-sm font-semibold ${status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}`}>
            {status === 'APPROVED' ? '✓ Listing is live' : '✕ Listing rejected'}
          </p>
          <button
            onClick={() => setStatus('PENDING')}
            className="mt-2 text-xs underline text-gray-500 hover:text-gray-700"
          >
            Undo decision
          </button>
        </div>
      )}
    </div>
  );
}
