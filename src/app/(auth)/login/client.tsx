'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Sparkles, ShieldCheck, Users, MapPin, Lock, BadgeCheck } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useAuthStore } from '@/store/authStore';
import { getAccessToken } from '@/lib/authToken';
import { wsService } from '@/services/wsService';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/Input';
import { AuthBrandPanel, AUTH_SITE_SLOGAN, PanelFeatureList } from '@/components/shared/AuthBrandPanel';
import { AuthActivityFeed } from '@/components/shared/AuthActivityFeed';

import { sanitizeLoginNextPath } from '@/lib/loginRedirect';

const FEATURES = [
  { Icon: Sparkles,    title: 'Smart Matching',      desc: 'Rooms and roommates tailored to your lifestyle'       },
  { Icon: ShieldCheck, title: 'Verified Listings',   desc: 'Every property reviewed before it goes live'          },
  { Icon: Users,       title: 'Active Community',    desc: '10,000+ members across Ahmedabad & Gandhinagar'        },
] as const;



export default function LoginPageClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();
  const setUser      = useAuthStore((s) => s.setUser);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      setUser(res.user);
      wsService.connect(getAccessToken() ?? undefined);
      success('Welcome back!', `Logged in as ${res.user.name}`);
      router.push(sanitizeLoginNextPath(searchParams.get('next')));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toastError('Login failed', message);
    }
  };

  return (
    <div className="flex min-h-[100dvh]">

      {/* ── Left Aurora brand panel ───────────────────────────── */}
      <AuthBrandPanel>
        <div className="flex flex-col gap-7 h-full">

          <div className="space-y-5">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="auth-overline-dash h-px w-5 rounded-full" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500/85">
                  Welcome back
                </p>
              </div>
              <h2 className="text-4xl xl:text-[2.75rem] font-black text-white leading-[1.12] tracking-tight">
                Your home<br />
                <span className="text-amber-500">awaits you.</span>
              </h2>
              <p className="mt-3.5 text-sm xl:text-[0.9rem] leading-relaxed text-white/55">
                Sign in to access your saved listings, roommate matches, and messages — all in one place.
              </p>
            </div>

            {/* Social proof pill */}
            <div className="auth-social-pill inline-flex items-center gap-2.5 px-3.5 py-2">
              <div className="flex -space-x-1.5">
                {[
                  { bg: '#2caaaa', label: 'S' },
                  { bg: '#188888', label: 'N' },
                  { bg: '#3bc4c4', label: 'K' },
                  { bg: '#0f7272', label: 'D' },
                ].map(({ bg, label }, i) => (
                  <span key={i} className="auth-avatar" style={{ background: bg, zIndex: 10 - i }}>
                    {label}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-white/60 leading-snug">
                <span className="font-semibold text-white">Active community</span> across Ahmedabad & Gandhinagar
              </span>
            </div>

            <PanelFeatureList items={FEATURES} />
          </div>

          <div className="mt-auto space-y-4">
            {/* Floating listing card */}
            <div className="auth-float">
              <div className="auth-listing-card px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Sample listing</p>
                    <p className="text-sm font-bold text-white leading-snug truncate">1 BHK Private Room</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/45">
                      <MapPin size={9} />
                      Bopal, Ahmedabad
                    </p>
                  </div>
                  <span className="auth-listing-badge shrink-0">₹6,500/mo</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="auth-pulse h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="auth-verified-badge">Verified</span>
                  </div>
                  <span className="text-[10px] text-white/30">2 hrs ago</span>
                </div>
              </div>
            </div>

            <AuthActivityFeed />
          </div>
        </div>
      </AuthBrandPanel>

      {/* ── Right panel ──────────────────────────────────────── */}
      <main className="bg-background relative flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 min-h-[100dvh] lg:min-h-0 overflow-hidden">
        {/* Subtle right-panel glow */}
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
          {/* Teal → amber gradient top accent line */}
          <div className="auth-accent-bar" />

          <div className="px-8 py-8 sm:px-10">
            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Sign in</h1>
              <p className="mt-1.5 text-sm text-gray-500">
                No account?{' '}
                <Link href="/register" className="font-semibold text-primary-600 hover:underline">
                  Create one free →
                </Link>
              </p>
            </div>

            {/* Welcome-back trust row */}
            <div className="mb-5 flex items-center gap-2 rounded-xl bg-primary-50 border border-primary-100 px-3.5 py-2.5">
              <ShieldCheck size={14} className="text-primary-600 shrink-0" />
              <p className="text-xs text-primary-700 leading-snug">
                Your data is private & never shared with third parties
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  onRightIconClick={() => setShowPassword((v) => !v)}
                  {...register('password')}
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs font-semibold text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-btn-teal w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
                style={{ height: '52px' }}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Trust micro-row */}
              <div className="auth-trust-row pt-1">
                {[
                  { Icon: Lock,       text: 'Encrypted' },
                  { Icon: BadgeCheck, text: 'No spam' },
                  { Icon: ShieldCheck, text: 'Private' },
                ].map(({ Icon, text }) => (
                  <span key={text} className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Icon size={12} className="text-primary-500 shrink-0" />
                    {text}
                  </span>
                ))}
              </div>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-primary-600/10" />
              <span className="text-xs text-gray-400">or</span>
              <div className="h-px flex-1 bg-primary-600/10" />
            </div>

            {/* Secondary CTA */}
            <Link href="/register">
              <button
                type="button"
                className="w-full flex items-center justify-center rounded-xl border-2 border-primary-600/20 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-teal-50/60 hover:border-teal-300 active:scale-[0.98]"
                style={{ height: '50px' }}
              >
                Create Free Account
              </button>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}
