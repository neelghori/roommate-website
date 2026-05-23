'use client';

import { normalizeAvatarUrl } from '@/lib/avatarUrl';

type UserAvatarImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

/**
 * User profile photo from API (S3 or Google). Uses no-referrer so Google avatars load in browsers.
 */
export function UserAvatarImage({ src, alt = '', className }: UserAvatarImageProps) {
  const url = normalizeAvatarUrl(src);
  if (!url) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- external CDN / Google URLs
    <img
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      decoding="async"
    />
  );
}
