'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/Input';
import {
  CheckCircle2, Eye, EyeOff,
  Lock, ShieldCheck, ArrowLeft, RefreshCw,
  KeyRound, UserCheck, Hash,
} from 'lucide-react';
import { AuthBrandPanel, AUTH_SITE_SLOGAN, PanelFeatureList } from '@/components/shared/AuthBrandPanel';

/* ── Password strength ─────────────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; colorClass: string; hexColor: string } {
  if (!pw) return { score: 0, label: '', colorClass: '', hexColor: '' };
  let s = 0;
  if (pw.length >= 8)           s++;
  if (pw.length >= 12)          s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw))  s++;
  if (s <= 1) return { score: 1, label: 'Weak',        colorClass: 'text-red-500',    hexColor: '#ef4444' };
  if (s <= 2) return { score: 2, label: 'Fair',        colorClass: 'text-orange-500', hexColor: '#f97316' };
  if (s <= 3) return { score: 3, label: 'Good',        colorClass: 'text-yellow-500', hexColor: '#eab308' };
  if (s <= 4) return { score: 4, label: 'Strong',      colorClass: 'text-green-500',  hexColor: '#22c55e' };
  return              { score: 5, label: 'Very Strong', colorClass: 'text-green-600',  hexColor: '#16a34a' };
}

const TIPS = [
  { Icon: Hash,       title: 'Length matters',      desc: 'Use at least 8 characters'            },
  { Icon: KeyRound,   title: 'Mix character types', desc: 'Uppercase, lowercase, and numbers'     },
  { Icon: UserCheck,  title: 'Stay unique',         desc: "Don't reuse a previous password"       },
  { Icon: Lock,       title: 'Keep it private',     desc: 'Never share your password with anyone' },
] as const;

/* ── Inner form ────────────────────────────────────────────────── */
function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? 'mock-token';
  const toast        = useToast();

  const [isLoading,    setIsLoading]    = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema) });

  const passwordValue = watch('password') ?? '';
  const strength      = getStrength(passwordValue);

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

  /* ── Success ───────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="flex min-h-[100dvh]">
        <AuthBrandPanel>
          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="auth-overline-dash h-px w-5 rounded-full" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500/85">
                  All done
                </p>
              </div>
              <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
                Account<br />
                <span className="text-amber-500">secured.</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Your new password has been set. Redirecting you to sign in…
              </p>
            </div>
          </div>
        </AuthBrandPanel>

        <main className="bg-background relative flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 min-h-[100dvh] lg:min-h-0 overflow-hidden">
          <div aria-hidden="true" className="auth-panel-glow pointer-events-none absolute inset-0" />
          <div className="auth-card relative z-10 w-full max-w-[420px] text-center">
            <div className="auth-accent-bar" />
            <div className="px-8 py-10">
              <div className="auth-card-icon mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <CheckCircle2 size={30} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900">Password Updated!</h2>
              <p className="mt-2 text-sm text-gray-500">Redirecting you to login…</p>
              <div className="mx-auto mt-6 h-7 w-7 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Form ──────────────────────────────────────────────────── */
  return (
    <div className="flex min-h-[100dvh]">

      {/* Aurora brand panel */}
      <AuthBrandPanel>
        <div className="space-y-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="auth-overline-dash h-px w-5 rounded-full" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500/85">
                Almost there
              </p>
            </div>
            <h2 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.12] tracking-tight">
              Secure your<br />
              <span className="text-amber-500">account.</span>
            </h2>
            <p className="mt-3.5 text-sm xl:text-[0.9rem] leading-relaxed text-white/55">
              Choose a strong, unique password to keep your Roommat account and personal data safe.
            </p>
          </div>

          {/* Password tips as timeline list */}
          <PanelFeatureList items={TIPS} />

          {/* Security note */}
          <div className="auth-panel-note flex items-start gap-3 rounded-xl px-4 py-3.5">
            <ShieldCheck size={15} className="flex-shrink-0 mt-0.5 text-white/60" />
            <p className="text-xs leading-relaxed text-white/60">
              This link is single-use and expires after 30 minutes. Your old password stays active until you submit.
            </p>
          </div>
        </div>
      </AuthBrandPanel>

      {/* Right panel */}
      <main className="bg-background relative flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 min-h-[100dvh] lg:min-h-0 overflow-hidden">
        <div aria-hidden="true" className="auth-panel-glow pointer-events-none absolute inset-0" />

        {/* Mobile logo + slogan → home */}
        <Link
          href="/"
          className="lg:hidden mb-8 text-center relative z-10 inline-block mx-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 rounded-sm"
          aria-label="Roommat — home"
        >
          <Image src="/logo.png" alt="" width={140} height={44}
            className="mx-auto h-9 w-auto object-contain" />
          <p className="mt-2 text-[11px] uppercase tracking-widest text-gray-400">
            {AUTH_SITE_SLOGAN}
          </p>
        </Link>

        {/* Form card */}
        <div className="auth-card relative z-10 w-full max-w-[420px]">
          <div className="auth-accent-bar" />
          <div className="px-8 py-8 sm:px-10">
            {/* Heading */}
            <div className="mb-7 flex items-center gap-4">
              <div className="auth-card-icon flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                <Lock size={20} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">New Password</h1>
                <p className="mt-0.5 text-sm text-gray-500">Choose something strong and unique</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <div className="space-y-1.5">
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
                {passwordValue.length > 0 && (
                  <div className="space-y-1 pt-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= strength.score ? strength.hexColor : '#e5e7eb' }}
                        />
                      ))}
                    </div>
                    {strength.label && (
                      <p className={`text-[11px] font-semibold ${strength.colorClass}`}>
                        {strength.label} password
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                error={errors.confirmPassword?.message}
                rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                onRightIconClick={() => setShowConfirm((p) => !p)}
                autoComplete="new-password"
                {...register('confirmPassword')}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="auth-btn-teal w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
                style={{ height: '52px' }}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Resetting…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Reset Password
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 flex flex-col items-center gap-3">
              <Link href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
              <Link href="/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:underline hover:text-gray-500">
                <RefreshCw size={11} />
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-[100dvh] items-center justify-center">
          <div className="h-9 w-9 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
