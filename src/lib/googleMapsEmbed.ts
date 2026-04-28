/**
 * Google Maps in an iframe using the public query URL (no Maps JavaScript API key).
 * @see https://developers.google.com/maps/documentation/urls/guide
 */
export function hasMapCoordinates(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

/** `maps.google.com` embed used by <iframe src="…"> — no API key. */
export function googleMapsIframeEmbedUrl(lat: number, lng: number, zoom = 15): string {
  const q = `${lat},${lng}`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed&hl=en`;
}

/** Opens full Google Maps (same coordinates) in a new tab. */
export function googleMapsOpenUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
