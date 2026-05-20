'use client';

import { resolveYoutubeHref } from '@/lib/youtube';
import { ListingYoutubeLink } from '@/components/features/ListingYoutubeLink';

type ListingYoutubeSectionProps = {
  youtubeUrl: string | undefined;
  className?: string;
  withHeading?: boolean;
};

/** Visible block on listing detail / modal when a YouTube link exists. */
export function ListingYoutubeSection({
  youtubeUrl,
  className = '',
  withHeading = false,
}: ListingYoutubeSectionProps) {
  if (!resolveYoutubeHref(youtubeUrl)) return null;

  return (
    <div className={className}>
      {withHeading ? (
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Property video</h3>
      ) : null}
      <ListingYoutubeLink youtubeUrl={youtubeUrl} variant="button" />
    </div>
  );
}
