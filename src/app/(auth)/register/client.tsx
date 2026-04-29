'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, ArrowRight,
  User, Building2, Users,
  BadgeCheck, MapPin, Star, Lock,
} from 'lucide-react';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth.schema';
import { authService } from '@/services/modules/auth.service';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { TermsDocumentBody } from '@/components/legal/TermsDocumentBody';
import { PrivacyDocumentBody } from '@/components/legal/PrivacyDocumentBody';
import { AuthBrandPanel, PanelFeatureList } from '@/components/shared/AuthBrandPanel';
import { AuthActivityFeed } from '@/components/shared/AuthActivityFeed';

/* ── Password strength ─────────────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; colorClass: string; hexColor: string } {
  if (!pw) return { score: 0, label: '', colorClass: '', hexColor: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: 'Weak', colorClass: 'text-red-500', hexColor: '#ef4444' };
  if (s <= 2) return { score: 2, label: 'Fair', colorClass: 'text-orange-500', hexColor: '#f97316' };
  if (s <= 3) return { score: 3, label: 'Good', colorClass: 'text-yellow-500', hexColor: '#eab308' };
  if (s <= 4) return { score: 4, label: 'Strong', colorClass: 'text-green-500', hexColor: '#22c55e' };
  return { score: 5, label: 'Very Strong', colorClass: 'text-green-600', hexColor: '#16a34a' };
}

/* ── Static data ────────────────────────────────────────────────── */
const BENEFITS = [
  { Icon: BadgeCheck, title: '100% free', desc: 'No hidden charges, ever' },
  { Icon: MapPin, title: 'Local listings', desc: 'Ahmedabad & Gandhinagar coverage' },
  { Icon: Star, title: 'Verified profiles', desc: 'Properties reviewed by our team' },
  { Icon: Lock, title: 'Safe platform', desc: 'Secure, private & trusted by thousands' },
] as const;


const ROLES = [
  { value: 'TENANT', Icon: User, label: "I'm a Tenant", desc: 'Looking for a room' },
  { value: 'ROOMMATE', Icon: Users, label: 'Find Roommate', desc: 'Need a flatmate' },
  { value: 'OWNER', Icon: Building2, label: "I'm an Owner", desc: 'Have a room to rent' },
] as const;

/* ── Component ──────────────────────────────────────────────────── */
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
      role: 'TENANT', agreeToTerms: false,
      name: '', email: '', phone: '', password: '', confirmPassword: '',
    },
  });

  const selectedRole = watch('role');
  const passwordValue = watch('password') ?? '';
  const strength = getStrength(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await authService.register({
        name: data.name, email: data.email,
        phone: data.phone, password: data.password, role: data.role,
      });
      if (result.emailVerificationSent) {
        success('Account created', 'We sent a confirmation email click the link to verify your address.');
      } else {
        success('Account created', 'You can sign in now. Check your inbox if email confirmation is enabled.');
      }
      reset({ role: 'TENANT', agreeToTerms: false, name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setShowPassword(false);
      setShowConfirm(false);
      router.push('/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      toastError('Registration failed', message);
    }
  };

  return (
    <div className="flex min-h-[100dvh]">

      {/* ── Aurora brand panel ────────────────────────────────── */}
      <AuthBrandPanel>
        <div className="flex flex-col gap-8 h-full">
          {/* Headline + feature list */}
          <div className="space-y-8">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="auth-overline-dash h-px w-5 rounded-full" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500/85">
                  Get started free
                </p>
              </div>
              <h2 className="text-4xl xl:text-[2.75rem] font-black text-white leading-tight tracking-tight">
                Start your<br />search{' '}
                <span className="text-amber-500">today.</span>
              </h2>
              <p className="mt-4 text-sm xl:text-base leading-relaxed text-white/60">
                Join thousands of tenants, roommates and owners finding their perfect match in Ahmedabad & Gandhinagar.
              </p>
            </div>

            {/* Timeline feature list */}
            <PanelFeatureList items={BENEFITS} />
          </div>

          {/* Metrics — pinned to bottom */}
          <div className="mt-auto">
            <AuthActivityFeed />
          </div>
        </div>
      </AuthBrandPanel>

      {/* ── Right scrollable panel ────────────────────────────── */}
      <main className="bg-background relative flex-1 overflow-y-auto">
        {/* Subtle glow */}
        <div
          aria-hidden="true"
          className="auth-panel-glow pointer-events-none absolute inset-0"
        />

        <div className="relative z-10 flex flex-col items-center px-5 py-10 sm:px-8 lg:px-10 xl:px-14">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center w-full">
            <Image src="/logo.png" alt="Roommat" width={140} height={44}
              className="mx-auto h-9 w-auto object-contain" />
            <p className="mt-2 text-[11px] uppercase tracking-widest text-gray-400">
              Find Room · Find People · Feel Home
            </p>
          </div>

          {/* ── White form card ──────────────────────────────── */}
          <div className="auth-card w-full max-w-2xl">
            {/* Teal → amber gradient top accent line */}
            <div className="auth-accent-bar" />

            <div className="px-8 py-8 sm:px-10 sm:py-10">
              {/* Card header */}
              <div className="flex items-start justify-between mb-7">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
                  <p className="mt-1.5 text-sm text-gray-500">Free forever · takes less than 2 minutes</p>
                </div>
                <p className="hidden sm:block text-sm text-gray-400 pt-1 whitespace-nowrap">
                  Have an account?{' '}
                  <Link href="/login" className="font-semibold text-primary-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Role selector */}
              <div className="mb-7">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  I am a…
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {ROLES.map(({ value, label, Icon, desc }) => {
                    const active = selectedRole === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setValue('role', value, { shouldValidate: true })}
                        className={`flex flex-col items-start gap-2.5 rounded-xl p-4 text-left transition-all duration-200 focus-visible:outline-none ${active ? 'auth-role-active-card' : 'auth-role-idle-card'}`}
                      >
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'auth-role-icon-active' : 'auth-role-icon-idle'}`}>
                          <Icon size={17} className={active ? 'text-white' : 'text-primary-600'} />
                        </span>
                        <div>
                          <p className={`text-sm font-bold leading-none ${active ? 'text-white' : 'text-gray-800'}`}>
                            {label}
                          </p>
                          <p className={`mt-1 text-[11px] leading-snug ${active ? 'text-white/70' : 'text-gray-400'}`}>
                            {desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <Controller name="role" control={control} render={() => <></>} />
                {errors.role && <p className="mt-2 text-xs text-red-500">{errors.role.message}</p>}
              </div>

              {/* Divider */}
              <div className="mb-6 h-px bg-primary-600/10" />

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  Your details
                </p>

                {/* Row: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Rahul Sharma"
                    autoComplete="name"
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="9876543210"
                    autoComplete="tel"
                    maxLength={10}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>

                {/* Email */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />

                {/* Row: Password + Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 chars, A–Z, 0–9"
                      autoComplete="new-password"
                      error={errors.password?.message}
                      rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      onRightIconClick={() => setShowPassword((v) => !v)}
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
                            {strength.label}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Input
                    label="Confirm Password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    onRightIconClick={() => setShowConfirm((v) => !v)}
                    {...register('confirmPassword')}
                  />
                </div>

                {/* Divider */}
                <div className="h-px bg-primary-600/10" />

                {/* Terms */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="register-agree-terms"
                      {...register('agreeToTerms')}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-2 border-gray-300 accent-primary-600 focus:ring-2 focus:ring-primary-600/30 focus:ring-offset-0"
                    />
                    <label htmlFor="register-agree-terms"
                      className="cursor-pointer select-none text-sm leading-snug text-gray-500">
                      I agree to the{' '}
                      <button type="button"
                        className="font-semibold text-primary-600 hover:underline relative z-10"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLegalModal('terms'); }}>
                        Terms of Service
                      </button>
                      {' '}&amp;{' '}
                      <button type="button"
                        className="font-semibold text-primary-600 hover:underline relative z-10"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLegalModal('privacy'); }}>
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>
                  )}
                </div>

                {/* Orange CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-btn-orange w-full flex items-center justify-center gap-2 rounded-xl font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
                  style={{ height: '52px' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Mobile sign-in */}
              <p className="sm:hidden mt-5 text-center text-sm text-gray-500">
                Already a member?{' '}
                <Link href="/login" className="font-semibold text-primary-600 hover:underline">
                  Sign in
                </Link>
              </p>

            </div>
          </div>
          <div className="h-10" />
        </div>
      </main>

      {/* Legal modals */}
      <Modal
        isOpen={legalModal !== null}
        onClose={() => setLegalModal(null)}
        title={legalModal === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
        size="full"
        showCloseButton
      >
        {legalModal === 'terms' ? <TermsDocumentBody /> : null}
        {legalModal === 'privacy' ? <PrivacyDocumentBody /> : null}

        {/* Open full page link */}
        {legalModal !== null && (
          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <a
              href={legalModal === 'terms' ? '/terms' : '/privacy'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
            >
              Open full {legalModal === 'terms' ? 'Terms' : 'Privacy Policy'} page ↗
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
}
