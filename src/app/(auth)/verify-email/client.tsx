'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, ArrowLeft, MailOpen, RefreshCw } from 'lucide-react';
import { authService } from '@/services/modules/auth.service';
import { useAuthStore } from '@/store/authStore';

export default function VerifyEmailClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const setUser      = useAuthStore((s) => s.setUser);
  const [status,  setStatus]  = useState<'idle' | 'working' | 'ok' | 'err'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const runVerify = useCallback(
    async (token: string) => {
      setStatus('working');
      setMessage(null);
      try {
        const { user } = await authService.verifyEmailWithToken(token);
        setUser(user);
        setStatus('ok');
        setMessage('Your email is confirmed. Redirecting to your profile…');
        window.setTimeout(() => router.replace('/profile'), 1800);
      } catch (e) {
        setStatus('err');
        setMessage(e instanceof Error ? e.message : 'Verification failed.');
      }
    },
    [router, setUser],
  );

  useEffect(() => {
    const token = searchParams.get('token')?.trim() ?? '';
    if (!token) {
      setStatus('err');
      setMessage('Missing verification token. Open the link from your email, or request a new one after signing in.');
      return;
    }
    void runVerify(token);
  }, [searchParams, runVerify]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        <Image
          src="/logo.png"
          alt="Roommat"
          width={140}
          height={44}
          className="mx-auto h-9 w-auto object-contain"
        />
        <p className="mt-2 text-[11px] uppercase tracking-widest text-gray-400">
          Find Room · Find People · Feel Home
        </p>
      </div>

      {/* Card */}
      <div className="auth-card w-full max-w-[420px]">
        <div className="auth-accent-bar" />
        <div className="px-8 py-9 sm:px-10 flex flex-col items-center text-center gap-5">

          {/* Working */}
          {status === 'working' && (
            <>
              <div className="auth-card-icon flex h-16 w-16 items-center justify-center rounded-2xl">
                <Loader2 size={28} className="text-primary-600 animate-spin" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Verifying your email</h1>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  Hang tight — this only takes a moment.
                </p>
              </div>
            </>
          )}

          {/* Idle (no token yet) */}
          {status === 'idle' && (
            <>
              <div className="auth-card-icon flex h-16 w-16 items-center justify-center rounded-2xl">
                <MailOpen size={26} className="text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Check your inbox</h1>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  Open the verification link we sent to your email address.
                </p>
              </div>
            </>
          )}

          {/* Success */}
          {status === 'ok' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
                <CheckCircle2 size={30} className="text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Email verified!</h1>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{message}</p>
              </div>
              <div className="w-9 h-9 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
            </>
          )}

          {/* Error */}
          {status === 'err' && (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                <XCircle size={30} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Verification failed</h1>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{message}</p>
              </div>

              <div className="w-full space-y-3 pt-1">
                <Link
                  href="/login"
                  className="auth-btn-teal flex h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200"
                >
                  <ArrowLeft size={15} />
                  Back to Sign In
                </Link>
                <Link
                  href="/forgot-password"
                  className="flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-primary-600/20 text-sm font-semibold text-gray-600 transition-all hover:bg-teal-50/60 hover:border-teal-300 active:scale-[0.98]"
                >
                  <RefreshCw size={14} />
                  Request a new link
                </Link>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-gray-400">
        Having trouble?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
