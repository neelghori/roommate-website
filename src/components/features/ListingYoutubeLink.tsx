'use client';

import { resolveYoutubeHref } from '@/lib/youtube';

type ListingYoutubeLinkProps = {
  youtubeUrl: string | undefined;
  className?: string;
  size?: number;
  variant?: 'icon' | 'button';
};

function YoutubeIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/** Opens the property YouTube video in a new tab when the listing has a valid link. */
export function ListingYoutubeLink({
  youtubeUrl,
  className = '',
  size = 22,
  variant = 'icon',
}: ListingYoutubeLinkProps) {
  const href = resolveYoutubeHref(youtubeUrl);
  if (!href) return null;

  if (variant === 'button') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title="Watch property video on YouTube"
        aria-label="Watch property video on YouTube (opens in new tab)"
        className={[
          'inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5',
          'text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors',
          className,
        ].join(' ')}
      >
        <YoutubeIcon size={20} />
        Watch on YouTube
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title="Watch property video on YouTube"
      aria-label="Watch property video on YouTube (opens in new tab)"
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full p-2',
        'text-red-600 bg-red-50 border border-red-100',
        'hover:bg-red-100 hover:border-red-200 transition-colors',
        className,
      ].join(' ')}
    >
      <YoutubeIcon size={size} />
    </a>
  );
}
