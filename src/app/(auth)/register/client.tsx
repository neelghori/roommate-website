'use client';

/**
 * register/client.tsx
 * Roommat registration page — full sign-up form with role selection.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Home, User, Building2 } from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

export default function RegisterPageClient() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'TENANT',
      agreeToTerms: false,
    },
  });

  const selectedRole = watch('role');
  const agreeToTerms = watch('agreeToTerms');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
      });
      setUser(res.user);
      success('Account created!', 'Let\'s set up your profile.');
      router.push('/onboarding');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toastError('Registration failed', message);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-5">

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
          <p className="text-xs text-gray-400 tracking-wide uppercase">Find your perfect match</p>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join Roommat today — it&apos;s free</p>
        </div>

        {/* Role Toggle */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">I am a…</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'TENANT', label: "I'm a Tenant", Icon: User },
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
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-sm font-medium transition-all duration-200',
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
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3.5">
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

          {/* Terms Checkbox */}
          <div className="mt-1">
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) =>
                setValue('agreeToTerms', e.target.checked, { shouldValidate: true })
              }
              error={errors.agreeToTerms?.message}
              label=""
            />
            {/* Custom label with link (placed alongside checkbox via flex) */}
            <div className="flex items-start gap-2.5 -mt-6 pl-8">
              <p className="text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="font-semibold hover:underline" style={{ color: '#1B8F8F' }}>
                  Terms
                </Link>{' '}
                &amp;{' '}
                <Link href="/privacy" className="font-semibold hover:underline" style={{ color: '#1B8F8F' }}>
                  Privacy Policy
                </Link>
              </p>
            </div>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-500 mt-1 ml-7">{errors.agreeToTerms.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            className="mt-1"
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
    </div>
  );
}
