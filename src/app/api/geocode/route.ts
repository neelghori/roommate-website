import { NextRequest, NextResponse } from 'next/server';

const MAX_Q = 200;

/**
 * Proxies OpenStreetMap Nominatim (browser-safe, proper User-Agent).
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (!q || q.length > MAX_Q) {
    return NextResponse.json({ error: 'Invalid or missing query' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'RoommatWebsite/1.0',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding service error' }, { status: 502 });
    }

    const data = (await res.json()) as { lat?: string; lon?: string }[];
    const first = Array.isArray(data) ? data[0] : undefined;
    if (!first?.lat || !first?.lon) {
      return NextResponse.json({ lat: null, lng: null });
    }

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ lat: null, lng: null });
    }

    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
