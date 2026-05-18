'use client';

/**
 * Edit Listing API load/save + confirm modal; shared PropertyListingFormWizard.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/shared/EmptyState';
import { PropertyListingFormWizard } from '@/components/features/PropertyListingFormWizard';
import type { ListingFormData } from '@/lib/validations/listing.schema';
import { useToast } from '@/hooks/useToast';
import { listingService } from '@/services/modules/listing.service';
import type { Listing } from '@/types';

function listingToFormData(listing: Listing): ListingFormData {
  const digits = (listing.ownerPhone ?? '').replace(/\D/g, '');
  const phone = digits.length >= 10 ? digits.slice(-10) : '';
  const amenities = (listing.amenities?.length ? listing.amenities.map((c) => c.name) : []) as ListingFormData['amenities'];
  const raw = listing.description?.trim() ?? '';
  const description =
    raw.length >= 20
      ? raw.slice(0, 2000)
      : `${raw}\n\nAdd more detail about the property (at least 20 characters).`.slice(0, 2000);
  const hasRange =
    listing.maxPrice != null && Number.isFinite(listing.maxPrice) && listing.maxPrice > listing.price;
  return {
    title: listing.title,
    type: listing.type,
    furnishing: listing.furnishing ?? 'SemiFurnished',
    rentMode: hasRange ? 'range' : 'exact',
    exactPrice: listing.price,
    minPrice: listing.price,
    maxPrice: listing.maxPrice ?? listing.price,
    spotsLeft: listing.spotsLeft,
    addressLine1: listing.location,
    addressLine2: listing.addressLine2 ?? '',
    city: listing.city,
    state: listing.state ?? '',
    country: listing.country ?? 'India',
    postalCode: listing.postalCode ?? '',
    latitude: listing.latitude,
    longitude: listing.longitude,
    placeId: listing.placeId ?? '',
    formattedAddress: listing.formattedAddress ?? '',
    genderPreference: listing.genderPreference,
    peopleTypes: listing.peopleTypes ?? [],
    amenities,
    description,
    phone,
    ...(listing.type === 'PG' && listing.minimumStayMonths != null
      ? { minimumStayMonths: listing.minimumStayMonths }
      : {}),
  } as ListingFormData;
}

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<ListingFormData | null>(null);
  const [pendingImages, setPendingImages] = useState<File[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoadState('loading');
    listingService
      .getListingById(id)
      .then((l) => {
        if (cancelled) return;
        setListing(l);
        setLoadState('ok');
      })
      .catch(() => {
        if (!cancelled) {
          setListing(null);
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formDefaults = useMemo(() => (listing ? listingToFormData(listing) : undefined), [listing]);

  const handleFinish = (data: ListingFormData, uploadedImages: File[]) => {
    setPendingData(data);
    setPendingImages(uploadedImages);
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingData || !id) return;
    setShowConfirm(false);
    setIsSubmitting(true);
    try {
      const existing = listing?.images ?? [];
      let merged = existing;
      if (pendingImages.length > 0) {
        const newUrls = await listingService.uploadPropertyListingImages(id, pendingImages);
        merged = [...existing, ...newUrls].slice(0, 30);
      }
      const updated = await listingService.updateListingFromForm(id, pendingData, merged);
      setListing(updated);
      toast.success(
        'Listing updated',
        'Your changes were saved. If it was live before, it may return to pending review.',
      );
      router.push('/my-listings');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      toast.error('Could not save listing', msg);
    } finally {
      setPendingImages([]);
      setIsSubmitting(false);
    }
  };

  if (loadState === 'loading') {
    return (
      <UserLayout pageSuffix="Edit Listing" showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-gray-500">Loading listing…</div>
      </UserLayout>
    );
  }

  if (loadState === 'error' || !listing || !formDefaults) {
    return (
      <UserLayout pageSuffix="Edit Listing" showFab={false}>
        <div className="max-w-lg mx-auto px-4 py-8">
          <EmptyState
            title="Listing not found"
            description="We could not load this listing. It may have been removed or you may not have access."
            actionLabel="My Listings"
            onAction={() => router.push('/my-listings')}
          />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout pageSuffix="Edit Listing" showSearch={false} showFab={false}>
      <PropertyListingFormWizard
        key={listing.id}
        topSlot={
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        }
        title="✏️ Edit Listing"
        subtitle={listing.title}
        initialValues={formDefaults}
        variant="edit"
        submitButtonLabel="Update Listing"
        isSubmitting={isSubmitting}
        photoHint="Leave empty to keep existing photos."
        onFinish={handleFinish}
      />

      <Modal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setPendingImages([]);
        }}
        title="Save Changes?"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF3E0' }}
            >
              <AlertTriangle size={20} style={{ color: '#F57C00' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Confirm Update</p>
              <p className="text-sm text-gray-500">
                Are you sure you want to save the changes to{' '}
                <span className="font-medium text-gray-700">&quot;{pendingData?.title ?? listing.title}&quot;</span>?
                Approved listings go back to pending review after edits.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="md" fullWidth onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" fullWidth isLoading={isSubmitting} onClick={handleConfirmSave}>
              Yes, Save
            </Button>
          </div>
        </div>
      </Modal>
    </UserLayout>
  );
}
