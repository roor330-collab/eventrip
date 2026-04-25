/**
 * GET /api/suggestions
 * Autocomplete artistes — Ticketmaster si clé dispo, sinon MusicBrainz (gratuit).
 *
 * Query params:
 *   q    — texte de recherche (min 2 chars)
 *   size — nombre de résultats (défaut: 6)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAttractions } from '@/lib/api/ticketmaster';
import { apiFetch } from '@/lib/api-client';

const MB_BASE = 'https://musicbrainz.org/ws/2';

export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get('q') || '';
  const size = Math.min(parseInt(req.nextUrl.searchParams.get('size') || '6'), 10);

  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [], source: 'none' });
  }

  // 1. Ticketmaster (données riches : genre, photo, nb concerts)
  if (process.env.TICKETMASTER_API_KEY) {
    const result = await searchAttractions(q, size);
    if (result.success && result.data?.length) {
      return NextResponse.json({ ...result, source: 'ticketmaster' }, {
        headers: { 'Cache-Control': 'public, s-maxage=120' },
      });
    }
  }

  // 2. Fallback MusicBrainz (totalement gratuit, open source, CORS)
  try {
    const url = `${MB_BASE}/artist/?query=${encodeURIComponent(q)}&limit=${size}&fmt=json`;
    const data = await apiFetch<any>(url, {
      headers:  { 'User-Agent': 'Eventrip/1.0 (contact@eventrip.fr)' },
      service:  'musicbrainz',
      cacheTtl: 120,
      cacheKey: `mb:artist:${q}:${size}`,
    });

    const artists = (data.artists || []).map((a: any) => ({
      id:             a.id,
      name:           a.name,
      genre:          a.tags?.[0]?.name || a.type || '',
      country:        a.country || '',
      disambiguation: a.disambiguation || '',
      image:          '',
      source:         'musicbrainz',
    }));

    return NextResponse.json({ success: true, data: artists, source: 'musicbrainz' }, {
      headers: { 'Cache-Control': 'public, s-maxage=120' },
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error:   (err as Error).message,
      data:    [],
      source:  'error',
    }, { status: 502 });
  }
}
