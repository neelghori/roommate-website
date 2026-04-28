'use client';

import { Sparkles } from 'lucide-react';
import type { ListingAmenityChip } from '@/types';
import {
  AmenityIcon,
  isAmenityIconKey,
  resolveAmenityIconKeyFromName,
} from '@/lib/amenities/amenity-icon';

type ListingAmenityIconProps = {
  chip: ListingAmenityChip;
  /** Pixel size for fallback Sparkles; AmenityIcon uses className for dimensions */
  size?: number;
  iconClassName?: string;
};

export function ListingAmenityIcon({ chip, size = 14, iconClassName = 'h-4 w-4' }: ListingAmenityIconProps) {
  const raw = chip.iconKey?.trim().toLowerCase();
  const fromApi = raw && isAmenityIconKey(raw) ? raw : undefined;
  const fromName = fromApi ?? resolveAmenityIconKeyFromName(chip.name);
  if (fromName) {
    return <AmenityIcon name={fromName} className={iconClassName} />;
  }
  return <Sparkles size={size} className="opacity-70" aria-hidden />;
}
