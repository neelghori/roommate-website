'use client';

import { MapPin } from 'lucide-react';
import {
  googleMapsIframeEmbedUrl,
  googleMapsOpenUrl,
  hasMapCoordinates,
} from '@/lib/googleMapsEmbed';

type ListingLocationMapProps = {
  latitude?: number;
  longitude?: number;
  /** Address line for fallback label / placeholder text */
  locationLabel: string;
  /** Min height for the “no coordinates” placeholder */
  minHeightClass?: string;
  roundedClass?: string;
  /** Tailwind height classes for the iframe (when coords exist) */
  embedHeightClass?: string;
};

/**
 * Embedded Google Map from lat/lng (iframe URL only — no Maps JS API key).
 * Falls back to a dashed placeholder when coordinates are missing.
 */
export function ListingLocationMap({
  latitude,
  longitude,
  locationLabel,
  minHeightClass = 'min-h-[220px] lg:min-h-[280px]',
  roundedClass = 'rounded-2xl',
  embedHeightClass = 'h-[220px] sm:h-[260px] lg:h-[300px]',
}: ListingLocationMapProps) {
  if (!hasMapCoordinates(latitude, longitude)) {
    return (
      <div
        className={`flex w-full flex-col items-center justify-center gap-2 ${minHeightClass} ${roundedClass}`}
        style={{ backgroundColor: '#EDF5F5', border: '1.5px dashed #1B8F8F44' }}
      >
        <MapPin size={32} style={{ color: '#1B8F8F' }} aria-hidden />
        <p className="text-sm font-semibold" style={{ color: '#1B8F8F' }}>
          {locationLabel || 'Location'}
        </p>
        <p className="text-xs text-gray-400">Add a map pin from the listing form to show the map here.</p>
      </div>
    );
  }

  const lat = latitude as number;
  const lng = longitude as number;
  const embedSrc = googleMapsIframeEmbedUrl(lat, lng);
  const openHref = googleMapsOpenUrl(lat, lng);

  return (
    <div className={`relative w-full overflow-hidden ${roundedClass} border border-gray-200 bg-gray-100 shadow-sm`}>
      <iframe
        title={`Map: ${locationLabel || 'Property location'}`}
        src={embedSrc}
        className={`block w-full border-0 ${embedHeightClass}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 bg-white px-3 py-2 text-xs text-gray-600">
        <span className="truncate">{locationLabel}</span>
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-semibold text-teal-700 underline-offset-2 hover:underline"
        >
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
