const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

type EventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function hasAnalytics(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

export function getGaMeasurementId(): string | undefined {
  return GA_MEASUREMENT_ID;
}

export function trackEvent(name: string, params?: EventParams): void {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params ?? {});
}

/** SPA route changes — use gtag config (not duplicate page_view events). */
export function trackPageView(pagePath: string): void {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID || typeof window.gtag !== 'function') return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: pagePath,
    page_location: window.location.href,
  });
}
