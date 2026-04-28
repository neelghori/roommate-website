/**
 * Toast.tsx
 * Toast/Snackbar notification component.
 * Reads toasts from uiStore, auto-dismisses after duration,
 * and animates in from the right (top-right corner).
 */
'use client';

import React, { useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { Toast, ToastType } from '@/types';

// ─── Toast Config ─────────────────────────────────────────────────────────────

interface ToastConfig {
  icon: React.ElementType;
  border: string;
  iconColor: string;
}

const toastConfig: Record<ToastType, ToastConfig> = {
  success: {
    icon: CheckCircle,
    border: 'border-green-200',
    iconColor: 'text-green-500',
  },
  error: {
    icon: XCircle,
    border: 'border-red-200',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-yellow-200',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: Info,
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
  },
};

// Progress bar accent colors per type
const progressColor: Record<ToastType, string> = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// ─── Single Toast Item ────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration ?? 4000;

  const remove = useCallback(() => onRemove(toast.id), [toast.id, onRemove]);

  // Auto-dismiss after duration
  useEffect(() => {
    const timer = setTimeout(remove, duration);
    return () => clearTimeout(timer);
  }, [duration, remove]);

  return (
    <div
      className={[
        'relative flex items-start gap-3 w-full',
        'bg-white rounded-xl border shadow-lg p-4 overflow-hidden',
        config.border,
      ].join(' ')}
      style={{
        animation: 'toastSlideIn 0.3s ease-out forwards',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className={['flex-shrink-0 mt-0.5', config.iconColor].join(' ')}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-gray-900 leading-tight">
            {toast.title}
          </p>
        )}
        {toast.message && (
          <p
            className={[
              'text-sm text-gray-600 leading-snug',
              toast.title ? 'mt-0.5' : '',
            ].join(' ')}
          >
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={remove}
        className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* Auto-dismiss progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] rounded-b-xl"
        style={{
          backgroundColor: progressColor[toast.type],
          width: '100%',
          animation: `toastShrink ${duration}ms linear forwards`,
          transformOrigin: 'left',
        }}
      />
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <>
      {/* Keyframe animations injected once via a style tag */}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastShrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {toasts.length > 0 && (
        <div
          className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
          aria-label="Notifications"
        >
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={removeToast} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── useToast hook ────────────────────────────────────────────────────────────

export const useToast = () => {
  const { addToast, removeToast } = useUIStore();

  return {
    toast: {
      success: (title: string, message?: string, duration?: number) =>
        addToast({ type: 'success', title, message, duration }),
      error: (title: string, message?: string, duration?: number) =>
        addToast({ type: 'error', title, message, duration }),
      warning: (title: string, message?: string, duration?: number) =>
        addToast({ type: 'warning', title, message, duration }),
      info: (title: string, message?: string, duration?: number) =>
        addToast({ type: 'info', title, message, duration }),
    },
    removeToast,
  };
};
