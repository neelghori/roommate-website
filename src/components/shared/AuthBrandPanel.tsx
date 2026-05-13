import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

/** Shown under the logo on auth screens — keep in sync with marketing copy. */
export const AUTH_SITE_SLOGAN = 'Find Room · Find People · Feel Home';

interface AuthBrandPanelProps {
  children: React.ReactNode;
  stats?: Array<{ val: string; label: string }>;
}

/**
 * Shared left-panel for all auth pages.
 *
 * Design rules:
 * – Gradient: directional teal only (no amber blobs they create olive mud with teal)
 * – Aurora orbs: cool-toned whites + deep teal only
 * – Amber (#FFB300) is ONLY used as text colour overlines, stat numbers, accent words
 * – Stats rendered as frosted-glass tiles
 */
export function AuthBrandPanel({ children, stats }: AuthBrandPanelProps) {
  return (
    <aside
      className="auth-panel-bg hidden lg:flex lg:w-[42%] xl:w-[40%] flex-col justify-between flex-shrink-0 sticky top-0 h-screen overflow-hidden p-10 xl:p-12"
    >
      {/* ── Cool aurora orbs (no amber avoids olive mud) ───────── */}

      {/* Bright teal-white spotlight top right */}
      <div
        aria-hidden="true"
        className="auth-orb-teal pointer-events-none absolute"
        style={{ top: '-18%', right: '-12%', width: '420px', height: '420px', borderRadius: '50%' }}
      />

      {/* Subtle white haze left edge */}
      <div
        aria-hidden="true"
        className="auth-orb-white pointer-events-none absolute"
        style={{ top: '28%', left: '-18%', width: '320px', height: '320px', borderRadius: '50%' }}
      />

      {/* Deep teal shadow bottom */}
      <div
        aria-hidden="true"
        className="auth-orb-dark pointer-events-none absolute"
        style={{ bottom: '-12%', right: '4%', width: '340px', height: '340px', borderRadius: '50%' }}
      />

      {/* Content spotlight radial glow behind the feature area */}
      <div
        aria-hidden="true"
        className="auth-orb-glow pointer-events-none absolute inset-0"
      />

      {/* ── Large decorative background numeral ──────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute select-none text-white/[0.028]"
        style={{
          bottom: '8%', right: '-4%',
          fontSize: '280px', fontWeight: 900, lineHeight: 1,
          fontFamily: 'Inter, system-ui, sans-serif',
          letterSpacing: '-0.04em',
        }}
      >
        R
      </div>

      {/* ── Logo + slogan (entire block links home) ─────────────── */}
      <Link
        href="/"
        className="relative z-10 inline-block max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm hover:opacity-95 transition-opacity"
        aria-label="Roommat — home"
      >
        <Image
          src="/logo.png"
          alt=""
          width={144}
          height={44}
          className="h-8 w-auto object-contain brightness-0 invert"
          priority
        />
        <p className="mt-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
          {AUTH_SITE_SLOGAN}
        </p>
      </Link>

      {/* ── Main content slot ────────────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
        {children}
      </div>

      {/* ── Frosted-glass stat tiles ─────────────────────────────── */}
      {stats && stats.length > 0 && (
        <div className="relative z-10 flex gap-3">
          {stats.map(({ val, label }) => (
            <div
              key={label}
              className="auth-stat-tile flex-1 rounded-xl px-4 py-3.5"
            >
              <p className="text-xl font-black leading-none text-amber-500">
                {val}
              </p>
              <p className="mt-1 text-[11px] leading-none text-white/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PanelFeatureList timeline-style feature list
   Use this inside AuthBrandPanel children for consistent styling.
───────────────────────────────────────────────────────────────── */
interface PanelFeature {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
}

interface PanelFeatureListProps {
  items: readonly PanelFeature[];
}

export function PanelFeatureList({ items }: PanelFeatureListProps) {
  return (
    <ul className="relative space-y-4">
      {/* Vertical connector line centred on the 40px icon circles */}
      <div
        aria-hidden="true"
        className="auth-connector-line absolute"
        style={{ left: '19px', top: '24px', bottom: '24px', width: '1px' }}
      />

      {items.map(({ Icon, title, desc }) => (
        <li key={title} className="flex items-start gap-4">
          {/* Icon bubble */}
          <span className="auth-feature-icon relative z-10 flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-full">
            <Icon size={18} className="text-white/90" />
          </span>
          <div className="pt-1.5">
            <p className="text-sm font-semibold leading-none text-white">{title}</p>
            <p className="mt-1 text-xs leading-snug text-white/50">{desc}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
