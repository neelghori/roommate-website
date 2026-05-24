import { hasMapCoordinates } from '@/lib/googleMapsEmbed';

/** Great-circle distance in km between two WGS84 points. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function listingWithinRadiusKm(
  listing: { latitude?: number; longitude?: number },
  center: { lat: number; lng: number },
  radiusKm: number,
): boolean {
  const lat = listing.latitude;
  const lng = listing.longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number' || !hasMapCoordinates(lat, lng)) {
    return false;
  }
  return distanceKm(center, { lat, lng }) <= radiusKm;
}
