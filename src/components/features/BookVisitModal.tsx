'use client';

/**
 * Authenticated users book a property visit (date, time, contact from profile by default).
 * Guests see a sign-in prompt with `next` returning to the current page.
 */
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { bookVisitSchema, type BookVisitFormData } from '@/lib/validations/bookVisit.schema';
import { bookingService } from '@/services/modules/booking.service';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import type { Listing } from '@/types';

export type BookVisitModalProps = {
  listing: Pick<Listing, 'id' | 'title' | 'ownerId'> | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful booking (e.g. close parent detail modal). */
  onBooked?: () => void;
};

function todayInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toPreferredDateIso(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split('-').map((x) => parseInt(x, 10));
  if (!y || !m || !d) return yyyyMmDd;
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
}

export function BookVisitModal({ listing, isOpen, onClose, onBooked }: BookVisitModalProps) {
  const pathname = usePathname() || '/';
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [justBooked, setJustBooked] = useState(false);

  const isOwnListing = Boolean(user?.id && listing?.ownerId && String(user.id) === String(listing.ownerId));
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  const defaultValues = useMemo(
    () => ({
      preferredDate: todayInputValue(),
      preferredTime: '',
      contactName: user?.name?.trim() ?? '',
      contactPhone: user?.phone?.trim() ?? '',
    }),
    [user?.name, user?.phone],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookVisitFormData>({
    resolver: zodResolver(bookVisitSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!isOpen) {
      setJustBooked(false);
      return;
    }
    if (!listing) return;
    reset({
      preferredDate: todayInputValue(),
      preferredTime: '',
      contactName: user?.name?.trim() ?? '',
      contactPhone: user?.phone?.trim() ?? '',
    });
  }, [isOpen, listing, user?.name, user?.phone, reset]);

  const onSubmit = async (data: BookVisitFormData) => {
    if (!listing || !isAuthenticated || isOwnListing) return;
    try {
      await bookingService.createVisitBooking({
        propertyId: listing.id,
        preferredDate: toPreferredDateIso(data.preferredDate),
        preferredTime: data.preferredTime.trim(),
        contactName: data.contactName,
        contactPhone: data.contactPhone,
      });
      const u = useAuthStore.getState().user;
      if (u) {
        setUser({ ...u, bookingCount: (u.bookingCount ?? 0) + 1 });
      }
      toast.success('Visit requested', 'Message the host anytime about this visit.');
      onBooked?.();
      setJustBooked(true);
    } catch (e) {
      toast.error('Booking failed', e instanceof Error ? e.message : 'Try again.');
    }
  };

  if (!listing) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Book a visit" size="md">
      <p className="text-sm text-gray-600 mb-4">
        Choose when you would like to see <span className="font-medium text-gray-800">{listing.title}</span>.
      </p>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Sign in to book a visit</p>
          <p className="mt-1 text-amber-900/90">We need your account so the owner knows who is coming.</p>
          <Link
            href={loginHref}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 focus:outline-none active:opacity-80"
          >
            Sign in
          </Link>
        </div>
      ) : isOwnListing ? (
        <p className="text-sm text-gray-600 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          You cannot book a visit to your own listing.
        </p>
      ) : justBooked ? (
        <div className="rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-4 space-y-4">
          <p className="text-sm font-medium text-gray-900">Your visit request was sent.</p>
          <p className="text-sm text-gray-600">
            Coordinate details with the host in chat (same as Profile → Visit bookings).
          </p>
          {listing.ownerId ? (
            <Link
              href={`/chat/${encodeURIComponent(String(listing.ownerId))}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5 transition-colors"
            >
              <MessageSquare size={18} aria-hidden />
              Message host
            </Link>
          ) : null}
          <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            type="date"
            label="Preferred date"
            min={todayInputValue()}
            error={errors.preferredDate?.message}
            {...register('preferredDate')}
          />
          <Input
            type="time"
            label="Preferred time"
            error={errors.preferredTime?.message}
            {...register('preferredTime')}
          />
          <Input label="Your name" error={errors.contactName?.message} {...register('contactName')} />
          <Input
            type="tel"
            label="Phone number"
            hint="Prefilled from your profile; you can change it for this visit."
            error={errors.contactPhone?.message}
            {...register('contactPhone')}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" size="md" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" size="md" fullWidth isLoading={isSubmitting}>
              Request visit
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
