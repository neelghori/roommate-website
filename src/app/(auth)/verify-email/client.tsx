'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { authService } from '@/services/modules/auth.service';
import { useAuthStore } from '@/store/authStore';
export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [status, setStatus] = useState<'idle' | 'working' | 'ok' | 'err'>('idle');
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
      setMessage('Missing verification token. Open the link from your email, or request a new message after signing in.');
      return;
    }
    void runVerify(token);
  }, [searchParams, runVerify]);

  return (
    <div className="w-full max-w-md mx-auto px-1 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 flex flex-col gap-5">
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
        </div>

        <h1 className="text-xl font-semibold text-gray-800 text-center">Email verification</h1>

        {status === 'working' && (
          <div className="flex flex-col items-center gap-3 py-6 text-gray-600">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" aria-hidden />
            <p className="text-sm text-center">Confirming your email…</p>
          </div>
        )}

        {status === 'ok' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" aria-hidden />
            <p className="text-sm text-gray-700">{message}</p>
          </div>
        )}

        {status === 'err' && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <XCircle className="w-12 h-12 text-red-500" aria-hidden />
            <p className="text-sm text-red-700">{message}</p>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              <Link
                href="/login"
                className="w-full inline-flex justify-center rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Sign in
              </Link>
              <Link
                href="/profile"
                className="w-full inline-flex justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Profile
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
