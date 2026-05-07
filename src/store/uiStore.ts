/**
 * uiStore.ts
 * Global UI state: toasts, modals, loading states.
 */
import { create } from 'zustand';
import { Toast, ModalState } from '@/types';

interface UIState {
  toasts: Toast[];
  modal: ModalState;
  isSidebarOpen: boolean;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  modal: { isOpen: false, type: null },
  isSidebarOpen: false,

  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { ...toast, id: `toast-${Date.now()}-${Math.random()}` },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (type, data) =>
    set({ modal: { isOpen: true, type, data } }),

  closeModal: () =>
    set({ modal: { isOpen: false, type: null, data: undefined } }),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
