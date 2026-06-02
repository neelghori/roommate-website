'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics/ga';

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrlRef = useRef<string>('');

  useEffect(() => {
    const query = searchParams.toString();
    const currentUrl = query ? `${pathname}?${query}` : pathname;
    if (!currentUrl || previousUrlRef.current === currentUrl) return;
    previousUrlRef.current = currentUrl;

    trackPageView(currentUrl);
  }, [pathname, searchParams]);

  return null;
}
