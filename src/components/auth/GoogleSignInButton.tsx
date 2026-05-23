'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';

const LABEL_BY_TEXT = {
  signin_with: 'Sign in with Google',
  signup_with: 'Sign up with Google',
  continue_with: 'Continue with Google',
} as const;

type GoogleSignInButtonProps = {
  onCredential: (idToken: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  loading?: boolean;
  /** GIS button label preset */
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  /** Override visible label */
  label?: string;
};

function GoogleGLogo({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  onCredential,
  onError,
  disabled = false,
  loading = false,
  text = 'continue_with',
  label,
}: GoogleSignInButtonProps) {
  const gsiLayerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;

  const visibleLabel = label ?? LABEL_BY_TEXT[text];
  const isInactive = disabled || loading;

  const mountButton = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !gsiLayerRef.current || !window.google?.accounts?.id) {
      return;
    }
    gsiLayerRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        const token = response.credential;
        if (token) {
          onCredentialRef.current(token);
          return;
        }
        onError?.('Google did not return a sign-in token. Please try again.');
      },
    });
    const width = Math.max(280, wrapRef.current?.offsetWidth ?? 320);
    window.google.accounts.id.renderButton(gsiLayerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text,
      shape: 'rectangular',
      width,
      logo_alignment: 'left',
    });
  }, [text, onError]);

  useEffect(() => {
    if (!isInactive) mountButton();
  }, [mountButton, isInactive]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Google sign-in is not configured. Add{' '}
        <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to the website environment.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={mountButton}
      />
      <div
        ref={wrapRef}
        className={['auth-google-wrap', isInactive ? 'auth-google-wrap--disabled' : ''].join(' ')}
      >
        <div className="auth-google-btn-visual" aria-hidden>
          {loading ? (
            <span className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-primary-600 animate-spin" />
          ) : (
            <GoogleGLogo className="shrink-0" />
          )}
          <span>{loading ? 'Connecting…' : visibleLabel}</span>
        </div>
        {!isInactive ? (
          <div
            ref={gsiLayerRef}
            className="auth-google-gis-layer"
            role="button"
            aria-label={visibleLabel}
            tabIndex={-1}
          />
        ) : null}
      </div>
    </>
  );
}
