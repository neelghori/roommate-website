'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2, Mail, KeyRound, SendHorizonal, ShieldCheck } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/Input';
import { AuthBrandPanel, PanelFeatureList } from '@/components/shared/AuthBrandPanel';

const STEPS = [
  { Icon: Mail, title: 'Enter your email', desc: "We'll look up your account instantly" },
  { Icon: SendHorizonal, title: 'Receive a secure link', desc: 'Single-use link, valid for 30 minutes' },
  { Icon: KeyRound, title: 'Set a new password', desc: 'Choose something strong and memorable' },
] as const;

export default function ForgotPasswordPage() {
  const { error: toastError } = useToast();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ resolver: zodResolver(forgotPasswordSchema) });

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
    <div className="flex min-h-[100dvh]">

      {/* ── Aurora brand panel ────────────────────────────────── */}
      <AuthBrandPanel>
        <div className="space-y-8">
          {/* Overline + headline */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="auth-overline-dash h-px w-5 rounded-full" />
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500/85">
                Account recovery
              </p>
            </div>
            <h2 className="text-4xl xl:text-[2.75rem] font-black text-white leading-tight tracking-tight">
              Reset in<br />
              <span className="text-amber-500">3 easy steps.</span>
            </h2>
            <p className="mt-4 text-sm xl:text-base leading-relaxed text-white/60">
              No worries forgetting passwords happens to everyone. You&apos;ll be back in minutes.
            </p>
          </div>

          {/* Timeline steps */}
          <PanelFeatureList items={STEPS} />

          {/* Security note */}
          <div className="auth-panel-note flex items-start gap-3 rounded-xl px-4 py-3.5">
            <ShieldCheck size={15} className="flex-shrink-0 mt-0.5 text-white/60" />
            <p className="text-xs leading-relaxed text-white/60">
              Reset links are single-use and expire in 30 minutes. Your current password stays active until you submit a new one.
            </p>
          </div>
        </div>
      </AuthBrandPanel>

      {/* ── Right panel ──────────────────────────────────────── */}
      <main className="bg-background relative flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 min-h-[100dvh] lg:min-h-0 overflow-hidden">
        {/* Subtle glow */}
        <div aria-hidden="true" className="auth-panel-glow pointer-events-none absolute inset-0" />

        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center relative z-10">
          <Image src="/logo.png" alt="Roommat" width={140} height={44}
            className="mx-auto h-9 w-auto object-contain" />
          <p className="mt-2 text-[11px] uppercase tracking-widest text-gray-400">
            Find Room · Find People · Feel Home
          </p>
        </div>

        {sent ? (
          /* ── Success card ──────────────────────────────────── */
          <div className="auth-card relative z-10 w-full max-w-[420px]">
            <div className="auth-accent-bar" />
            <div className="px-8 py-8 sm:px-10 text-center">
              <div className="auth-card-icon mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl">
                <CheckCircle2 size={30} className="text-primary-600" />
              </div>

              <h1 className="text-xl font-bold tracking-tight text-gray-900">Check your inbox</h1>
              <p className="mt-2.5 text-sm leading-relaxed text-gray-500">
                We sent a reset link to{' '}
                <span className="font-semibold text-gray-700">{sentEmail}</span>.
                <br />
                Check your inbox and spam folder.
              </p>

              <div className="bg-background text-primary-600 mx-auto mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium">
                <Mail size={14} />
                Link expires in 30 minutes
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="w-full flex items-center justify-center rounded-xl border-2 border-primary-600/20 font-semibold text-sm text-gray-600 transition-all hover:bg-teal-50/60 hover:border-teal-300 active:scale-[0.98]"
                  style={{ height: '48px' }}
                >
                  Try a different email
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── Form card ─────────────────────────────────────── */
          <div className="auth-card relative z-10 w-full max-w-[420px]">
            <div className="auth-accent-bar" />
            <div className="px-8 py-8 sm:px-10">
              {/* Icon + heading */}
              <div className="mb-7 flex items-center gap-4">
                <div className="auth-card-icon flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl">
                  <KeyRound size={20} className="text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Reset Password</h1>
                  <p className="mt-0.5 text-sm text-gray-500">Enter your email to receive a reset link</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  error={errors.email?.message}
                  {...register('email')}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-btn-teal w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
                  style={{ height: '52px' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Mail size={15} />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>

              <div className="mt-7 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
