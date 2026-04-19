'use client';

/**
 * login/client.tsx
 * Roommat login page — email + password with React Hook Form + Zod validation.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Home } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPageClient() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const setUser = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      setUser(res.user);
      success('Welcome back!', `Logged in as ${res.user.name}`);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toastError('Login failed', message);
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
          <p className="text-xs text-gray-400 tracking-wide uppercase">Find your perfect match</p>
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800">Welcome back 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password */}
          <div className="flex flex-col gap-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              rightIcon={
                showPassword ? <EyeOff size={16} /> : <Eye size={16} />
              }
              onRightIconClick={() => setShowPassword((v) => !v)}
              {...register('password')}
            />
            {/* Forgot password link — placed below the field */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-medium hover:underline"
                style={{ color: '#1B8F8F' }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold hover:underline"
            style={{ color: '#1B8F8F' }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
