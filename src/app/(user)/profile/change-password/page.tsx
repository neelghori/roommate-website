'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { UserLayout } from '@/components/shared/UserLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/modules/auth.service';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations/changePassword.schema';

export default function ChangePasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true);
    try {
      const { message } = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
      toast.success('Password updated', message);
      router.push('/profile');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toast.error('Could not change password', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout pageSuffix="Change password" showSearch={false} showFab={false}>
      <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Change password</h1>
            <p className="text-xs text-gray-500">Use a strong password you have not used elsewhere.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your current password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
            Update password
          </Button>
        </form>
      </div>
    </UserLayout>
  );
}
