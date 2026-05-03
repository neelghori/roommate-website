import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, FileText, Shield, ExternalLink } from 'lucide-react';

interface LegalPageLayoutProps {
  type: 'terms' | 'privacy';
  effectiveDate: string;
  lastUpdated?: string;
  version?: string;
  children: React.ReactNode;
}

const DOCS = {
  terms: {
    slug: '/terms',
    label: 'Terms & Conditions',
    Icon: FileText,
    badge: 'Legal',
    altSlug: '/privacy',
    altLabel: 'Privacy Policy',
    AltIcon: Shield,
  },
  privacy: {
    slug: '/privacy',
    label: 'Privacy Policy',
    Icon: Shield,
    badge: 'Legal',
    altSlug: '/terms',
    altLabel: 'Terms & Conditions',
    AltIcon: FileText,
  },
} as const;

export function LegalPageLayout({
  type,
  effectiveDate,
  lastUpdated,
  version,
  children,
}: LegalPageLayoutProps) {
  const doc = DOCS[type];

  return (
    <div className="bg-background min-h-screen">

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-primary-600/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Left — logo + back */}
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Back to home">
              <Image
                src="/logo.png"
                alt="Roommat"
                width={110}
                height={34}
                className="h-7 w-auto object-contain"
                priority
              />
            </Link>
            <span className="hidden h-4 w-px bg-gray-200 sm:block" aria-hidden />
            <Link
              href="/"
              className="hidden items-center gap-1 text-xs font-medium text-gray-400 hover:text-primary-600 transition-colors sm:inline-flex"
            >
              <ArrowLeft size={12} />
              Home
            </Link>
          </div>

          {/* Right — current doc badge + alt doc link */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
              <doc.Icon size={11} />
              {doc.label}
            </span>
            <Link
              href={doc.altSlug}
              className="hidden items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-500 transition-all hover:border-primary-600/30 hover:text-primary-600 sm:inline-flex"
            >
              <doc.AltIcon size={11} />
              {doc.altLabel}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Page body ─────────────────────────────────────────────── */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">

        {/* Document meta card */}
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-primary-600/10 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50">
              <doc.Icon size={16} className="text-primary-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{doc.badge}</p>
              <p className="text-sm font-bold text-gray-900">{doc.label}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span>
              <span className="font-semibold text-gray-700">Effective: </span>
              {effectiveDate}
            </span>
            {lastUpdated && (
              <span>
                <span className="font-semibold text-gray-700">Updated: </span>
                {lastUpdated}
              </span>
            )}
            {version && (
              <span>
                <span className="font-semibold text-gray-700">Version: </span>
                {version}
              </span>
            )}
          </div>
        </div>

        {/* Document content card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Teal accent bar */}
          <div className="auth-accent-bar" />
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {children}
          </div>
        </div>

        {/* Bottom nav — switch docs */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Roommat
          </Link>

          <Link
            href={doc.altSlug}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary-600/20 px-4 py-2.5 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-50 hover:border-primary-600/40"
          >
            <doc.AltIcon size={14} />
            Read our {doc.altLabel}
            <ExternalLink size={12} className="text-gray-400" />
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Roommat Living · Ahmedabad, Gujarat, India ·{' '}
          <a href="mailto:support@roommat.in" className="underline hover:text-primary-600">
            support@roommat.in
          </a>
        </p>
      </main>
    </div>
  );
}
