/**
 * Forward geocode a free-text place (e.g. profile city) via the local `/api/geocode` proxy.
 */
export async function geocodePlaceName(query: string): Promise<{ lat: number; lng: number } | null> {
  const q = query.trim();
  if (!q) return null;

  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const body = (await res.json()) as { lat?: number | null; lng?: number | null; error?: string };
    if (body.error || body.lat == null || body.lng == null) return null;
    if (!Number.isFinite(body.lat) || !Number.isFinite(body.lng)) return null;
    return { lat: body.lat, lng: body.lng };
  } catch {
    return null;
  }
}
