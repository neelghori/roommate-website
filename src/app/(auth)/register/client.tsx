'use client';

/**
 * register/client.tsx
 * Roommat registration page — full sign-up form with role selection.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, User, Building2, Users } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TermsDocumentBody } from '@/components/legal/TermsDocumentBody';
import { PrivacyDocumentBody } from '@/components/legal/PrivacyDocumentBody';

export default function RegisterPageClient() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'TENANT',
      agreeToTerms: false,
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await authService.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      if (result.emailVerificationSent) {
        success(
          'Account created',
          'We sent a confirmation email — click the link inside to verify your address.',
        );
      } else {
        success(
          'Account created',
          'You can sign in now. If email confirmation is enabled on the server, check your inbox or ask support.',
        );
      }
      reset({
        role: 'TENANT',
        agreeToTerms: false,
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      setShowPassword(false);
      setShowConfirm(false);
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toastError('Registration failed', message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-1">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col gap-5 w-full overflow-visible">

        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <Image src="/logo.png" alt="Roommat logo" width={180} height={56} className="h-12 w-auto object-contain" />
          <p className="text-xs text-gray-400 tracking-wide uppercase">Find Room, Find People, Feel Home</p>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Roommat today</p>
        </div>

        {/* Role Toggle */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">I am a…</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: 'TENANT', label: "I'm a Tenant", Icon: User },
                { value: 'ROOMMATE', label: 'I want a roommate', Icon: Users },
                { value: 'OWNER', label: "I'm an Owner", Icon: Building2 },
              ] as const
            ).map(({ value, label, Icon }) => {
              const active = selectedRole === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('role', value, { shouldValidate: true })}
                  className={[
                    'flex flex-col items-center gap-1.5 py-3 px-1.5 sm:px-2 rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-200 text-center leading-tight',
                    active
                      ? 'text-white'
                      : 'border-gray-200 text-gray-600 bg-white hover:border-teal-300',
                  ].join(' ')}
                  style={
                    active
                      ? { backgroundColor: '#1B8F8F', borderColor: '#1B8F8F' }
                      : undefined
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          {/* hidden controller to register the role field */}
          <Controller
            name="role"
            control={control}
            render={() => <></>}
          />
          {errors.role && (
            <p className="text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-3.5 relative z-0"
        >
          {/* Full Name */}
          <Input
            label="Full Name"
            type="text"
            placeholder="Rahul Sharma"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Phone */}
          <Input
            label="Phone"
            type="tel"
            placeholder="9876543210"
            autoComplete="tel"
            maxLength={10}
            error={errors.phone?.message}
            {...register('phone')}
          />

          {/* Password */}
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min 8 chars, A–Z, 0–9"
            autoComplete="new-password"
            error={errors.password?.message}
            rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowPassword((v) => !v)}
            {...register('password')}
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            onRightIconClick={() => setShowConfirm((v) => !v)}
            {...register('confirmPassword')}
          />

          {/* Terms — native checkbox (reliable tap targets on mobile vs sr-only + custom box) */}
          <div className="mt-1 flex flex-col gap-1.5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="register-agree-terms"
                {...register('agreeToTerms')}
                className={[
                  'mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-2 border-gray-300',
                  'text-[#1B8F8F] focus:ring-2 focus:ring-[#1B8F8F]/40 focus:ring-offset-0',
                  'accent-[#1B8F8F]',
                ].join(' ')}
              />
              <label
                htmlFor="register-agree-terms"
                className="text-sm text-gray-600 leading-snug min-w-0 cursor-pointer select-none"
              >
                I agree to the{' '}
                <button
                  type="button"
                  className="font-semibold hover:underline text-[#1B8F8F] relative z-10"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalModal('terms');
                  }}
                >
                  Terms
                </button>{' '}
                &amp;{' '}
                <button
                  type="button"
                  className="font-semibold hover:underline text-[#1B8F8F] relative z-10"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalModal('privacy');
                  }}
                >
                  Privacy Policy
                </button>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>
            )}
          </div>

          {/* Submit — explicit colors so the CTA never blends into the card */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            className="mt-3 relative z-10 bg-[#1B8F8F] hover:bg-[#178080] border-[#1B8F8F] text-white shadow-sm"
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: '#1B8F8F' }}
          >
            Login
          </Link>
        </p>
      </div>

      <Modal
        isOpen={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
        size="full"
        showCloseButton
      >
        {legalModal === 'terms' ? <TermsDocumentBody /> : null}
        {legalModal === 'privacy' ? <PrivacyDocumentBody /> : null}
      </Modal>
    </div>
  );
}
