'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ChevronLeft, Clock, MapPin, Loader2, MessageSquare } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { bookingService, type MyVisitBooking, type BookingStatus } from '@/services/modules/booking.service';
import { useToast } from '@/hooks/useToast';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';

function statusBadgeVariant(s: BookingStatus): 'warning' | 'success' | 'danger' | 'default' {
  if (s === 'confirmed') return 'success';
  if (s === 'cancelled') return 'danger';
  if (s === 'completed') return 'default';
  return 'warning';
}

function statusLabel(s: BookingStatus): string {
  if (s === 'pending') return 'Pending';
  if (s === 'confirmed') return 'Confirmed';
  if (s === 'cancelled') return 'Cancelled';
  return 'Completed';
}

function formatVisitDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Resolves the other user’s id for `/chat/[id]` (handles missing API `chatWithUserId`). */
function effectiveChatPartner(b: MyVisitBooking, currentUserId: string): string | null {
  if (b.chatWithUserId) return b.chatWithUserId;
  const r = b.requesterUserId;
  const o = b.propertyOwnerId;
  const m = currentUserId.trim().toLowerCase();
  if (!r || !o || !m) return null;
  if (m === r) return o;
  if (m === o) return r;
  return null;
}

export default function ProfileBookingsPage() {
  const toast = useToast();
  const currentUserId = useAuthStore((s) => s.user?.id ?? '');
  const [items, setItems] = useState<MyVisitBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await bookingService.getMyBookings();
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setItems([]);
          toast.error('Could not load bookings', e instanceof Error ? e.message : 'Try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
  }, []);

  return (
    <UserLayout pageSuffix="Visit bookings" showSearch={false} showFab={false}>
      <div className="max-w-3xl mx-auto px-4 lg:px-0 py-6 lg:py-10 pb-safe">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={18} aria-hidden />
          Back to profile
        </Link>

        <div className="flex items-start gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CalendarDays size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Visit bookings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Visits you requested and visits others requested on your listings.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16 text-gray-500">
            <Loader2 className="animate-spin" size={28} aria-label="Loading" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/80 px-6 py-12 text-center">
            <p className="text-gray-700 font-medium">No visit bookings yet</p>
            <p className="text-sm text-gray-500 mt-2 mb-6">
              Browse listings and tap Book Visit to schedule a time, or wait for guests to book a visit on your
              properties.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Browse listings
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-4">
            {items.map((b) => {
              const partnerId = effectiveChatPartner(b, currentUserId);
              const me = currentUserId.trim().toLowerCase();
              const showChat =
                partnerId != null &&
                partnerId.length > 0 &&
                (me.length === 0 || partnerId.toLowerCase() !== me);
              return (
              <li
                key={b.id}
                className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:border-primary/20 transition-colors"
              >
                <div className="flex gap-4 p-4 sm:p-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 shrink-0 overflow-hidden">
                    {b.propertyImageUrl ? (
                      <img
                        src={b.propertyImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h2 className="text-base font-bold text-gray-900 leading-snug">{b.propertyTitle}</h2>
                      <Badge variant={statusBadgeVariant(b.status)}>{statusLabel(b.status)}</Badge>
                    </div>
                    {b.propertyLocationLabel ? (
                      <p className="flex items-start gap-1.5 text-xs text-gray-500">
                        <MapPin size={14} className="shrink-0 mt-0.5" aria-hidden />
                        <span className="line-clamp-2">{b.propertyLocationLabel}</span>
                      </p>
                    ) : null}
                    {b.viewerAsOwner ? (
                      <p className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-2 py-1.5 w-fit">
                        Visit request on your listing
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} className="text-gray-400 shrink-0" aria-hidden />
                        {formatVisitDate(b.preferredDate)}
                      </span>
                      {b.preferredTimeStart ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} className="text-gray-400 shrink-0" aria-hidden />
                          {b.preferredTimeStart}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-400">
                      {b.viewerAsOwner
                        ? `Guest: ${b.requesterDisplayName || b.contactName} · ${b.contactPhone}`
                        : `Your contact: ${b.contactName} · ${b.contactPhone}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {showChat && partnerId ? (
                        <Link
                          href={`/chat/${encodeURIComponent(partnerId)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          <MessageSquare size={16} aria-hidden />
                          {b.viewerAsOwner ? 'Message guest' : 'Message host'}
                        </Link>
                      ) : null}
                      {b.propertyId ? (
                        <Link
                          href={`/listings/${b.propertyId}`}
                          className="inline-flex text-sm font-semibold text-gray-700 hover:text-primary hover:underline"
                        >
                          View listing
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </UserLayout>
  );
}
