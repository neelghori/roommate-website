'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle2, Eye, EyeOff, Lock, Home } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? 'mock-token';
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({ token, password: data.password });
      setIsSuccess(true);
      toast.success('Password reset!', 'You can now log in with your new password.');
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      toast.error('Reset failed', 'This link may have expired. Request a new one.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 text-center space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: '#E8F7F7' }}
        >
          <CheckCircle2 size={32} style={{ color: '#1B8F8F' }} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Password Updated!</h2>
        <p className="text-gray-500 text-sm">Redirecting you to login…</p>
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-teal-600 animate-spin mx-auto"
          style={{ borderTopColor: '#1B8F8F' }} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg, #1B8F8F 0%, #0f6060 100%)' }}>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
          <Lock size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Roommat</h1>
        <p className="text-teal-100 text-sm mt-1">Set new password</p>
      </div>

      {/* Form */}
      <div className="p-6 space-y-5">
        <div className="space-y-1">
          <p className="text-gray-600 text-sm text-center">
            Choose a strong password with at least 8 characters including uppercase, lowercase, and a number.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowPassword((p) => !p)}
            autoComplete="new-password"
            {...register('password')}
          />

          <Input
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Re-enter password"
            error={errors.confirmPassword?.message}
            rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowConfirm((p) => !p)}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: '#1B8F8F' }}
          >
            <Home size={14} />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-teal-600 animate-spin"
          style={{ borderTopColor: '#1B8F8F' }} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
