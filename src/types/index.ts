/**
 * types/index.ts
 * Central type exports for the entire application.
 * All API response shapes must match these types exactly.
 * Backend developer: ensure your response DTOs mirror these interfaces.
 */

// Re-export all domain types
export * from './user.types';
export * from './listing.types';
export * from './admin.types';

// ─── Common / Shared ─────────────────────────────────────────────────────────

export type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

export type PaginatedResponse<T> = ApiResponse<{
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export type ID = string;

export type Timestamp = {
  createdAt: string; // ISO 8601
  updatedAt: string;
};

export type SelectOption = {
  label: string;
  value: string;
};

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 3000
};

export type ModalState = {
  isOpen: boolean;
  type: string | null;
  data?: unknown;
};
