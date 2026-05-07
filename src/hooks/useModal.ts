/**
 * useModal.ts
 * Convenience hook for modal management.
 */
import { useUIStore } from '@/store/uiStore';

export const useModal = () => {
  const { modal, openModal, closeModal } = useUIStore();
  return { modal, openModal, closeModal, isOpen: modal.isOpen };
};
