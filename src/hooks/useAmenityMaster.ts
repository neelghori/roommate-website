'use client';

import { useEffect, useState } from 'react';
import { amenityService, type ApiAmenity } from '@/services/modules/amenity.service';

export function useAmenityMaster() {
  const [items, setItems] = useState<ApiAmenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    amenityService
      .list()
      .then((rows) => {
        if (!cancelled) {
          setItems(rows.filter((a) => a.name?.trim()));
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load amenities');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}
