'use client';

/**
 * Read-only popup for “Who lives here” keeps listing pages compact until the user chooses View.
 */
import { Modal } from '@/components/ui/Modal';
import { ListingResidentDetails } from '@/components/features/ListingResidentDetails';
import type { ListingResidentSnapshot } from '@/types';

export type ListingResidentsViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  residents: ListingResidentSnapshot[];
};

export function ListingResidentsViewModal({
  isOpen,
  onClose,
  residents,
}: ListingResidentsViewModalProps) {
  if (residents.length === 0) return null;

  const title = residents.length === 1 ? 'Resident details' : 'Who lives here';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="full" showCloseButton>
      <p className="text-sm text-gray-600 mb-4">
        {residents.length === 1
          ? 'Profile shown on this listing.'
          : 'Current residents in this property.'}
      </p>
      <div className="space-y-4 max-h-[min(70vh,720px)] overflow-y-auto pr-1">
        {residents.map((r, idx) => (
          <ListingResidentDetails key={`resident-view-${idx}-${r.fullName ?? ''}`} resident={r} />
        ))}
      </div>
    </Modal>
  );
}
