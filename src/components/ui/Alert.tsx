/**
 * Alert.tsx
 * Inline alert component and confirmation dialog.
 */
'use client';
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { Button } from './Button';

// Inline Alert
type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const alertConfig: Record<
  AlertVariant,
  {
    icon: React.ElementType;
    bg: string;
    border: string;
    text: string;
    icon_color: string;
  }
> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon_color: 'text-green-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon_color: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon_color: 'text-yellow-500',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon_color: 'text-blue-500',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  onClose,
  className = '',
}) => {
  const config = alertConfig[variant];
  const Icon = config.icon;
  return (
    <div
      className={[
        'flex gap-3 p-4 rounded-xl border',
        config.bg,
        config.border,
        className,
      ].join(' ')}
      role="alert"
    >
      <Icon size={18} className={['mt-0.5 flex-shrink-0', config.icon_color].join(' ')} />
      <div className="flex-1">
        {title && (
          <p className={['font-semibold text-sm mb-0.5', config.text].join(' ')}>{title}</p>
        )}
        <p className={['text-sm', config.text].join(' ')}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={['p-0.5 rounded hover:opacity-70 transition-opacity', config.text].join(' ')}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

// Confirmation Dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            fullWidth
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
