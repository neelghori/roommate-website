'use client';

/**
 * Add Listing — delegates to shared PropertyListingFormWizard (per-step Zod validation).
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserLayout } from '@/components/shared/UserLayout';
import { PropertyListingFormWizard } from '@/components/features/PropertyListingFormWizard';
import type { ListingFormData } from '@/lib/validations/listing.schema';
import { useToast } from '@/hooks/useToast';
import { listingService } from '@/services/modules/listing.service';

export default function AddListingPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinish = async (data: ListingFormData, uploadedImages: File[]) => {
    setIsSubmitting(true);
    try {
      const created = await listingService.createListingFromForm(data, []);
      const pid = created.id;
      if (uploadedImages.length > 0 && pid) {
        const urls = await listingService.uploadPropertyListingImages(pid, uploadedImages);
        await listingService.patchListingImages(pid, urls);
      }
      toast.success(
        'Listing submitted',
        'Your property is pending admin approval. You will see it on the home page after it is approved.',
      );
      router.push('/my-listings');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toast.error('Could not submit listing', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout pageSuffix="Add Listing" showSearch={false} showFab={false}>
      <PropertyListingFormWizard
        title="📋 Post New Listing"
        subtitle="Fill in the details to list your property"
        variant="create"
        submitButtonLabel="Submit Listing"
        isSubmitting={isSubmitting}
        onFinish={handleFinish}
      />
    </UserLayout>
  );
}
