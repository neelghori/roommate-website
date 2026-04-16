'use client';

/**
 * forgot-password/page.tsx
 * Roommat forgot-password page — sends a reset link to the user's email.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Home, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const { error: toastError } = useToast();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not send reset link. Please try again.';
      toastError('Request failed', message);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl mb-1"
            style={{ backgroundColor: '#EDF5F5' }}
          >
            <Home size={24} style={{ color: '#1B8F8F' }} />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#1B8F8F' }}>
            Roommat
          </span>
        </div>

        {sent ? (
          /* ── Success State ─────────────────────────────────── */
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="flex items-center justify-center w-16 h-16 rounded-full"
              style={{ backgroundColor: '#EDF5F5' }}
            >
              <CheckCircle2 size={36} style={{ color: '#1B8F8F' }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Check your email</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                We&apos;ve sent a password reset link to{' '}
                <span className="font-medium text-gray-700">{sentEmail}</span>.
                <br />
                Check your inbox (and spam folder).
              </p>
            </div>

            <div
              className="flex items-center gap-2 w-full justify-center rounded-xl py-3 px-4 text-sm"
              style={{ backgroundColor: '#EDF5F5', color: '#1B8F8F' }}
            >
              <Mail size={16} />
              <span>Link expires in 30 minutes</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={() => setSent(false)}
            >
              Use a different email
            </Button>

            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: '#1B8F8F' }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        ) : (
          /* ── Form State ────────────────────────────────────── */
          <>
            {/* Heading */}
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-800">Reset Password</h1>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Enter your registered email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </Button>
            </form>

            {/* Back link */}
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-medium hover:underline"
              style={{ color: '#1B8F8F' }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
