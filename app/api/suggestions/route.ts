/**
 * GET /api/suggestions
 * Autocomplete dynamique — artistes + événements depuis Ticketmaster.
 * Fallback MusicBrainz si pas de clé.
 *
 * Query params:
 *   q    — texte de recherche (min 2 chars)
 *   kind — 'artist' | 'event' | 'all' (défaut: 'all')
 *   size — nombre de résultats (défaut: 8, max: 12)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchAttractions, searchEvents } from '@/lib/api/ticketmaster';
import { apiFetch } from '@/lib/api-client';

const MB_BASE = 'https://musicbrainz.org/ws/2';

// Types autorisés — concerts, festivals, sport uniquement
const ALLOWED_TYPES = ['concert', 'festival', 'sport'];

export async function GET(req: NextRequest) {
  const q    = req.nextUrl.searchParams.get('q') || '';
  const kind = req.nextUrl.searchParams.get('kind') || 'all';
  const size = Math.min(parseInt(req.nextUrl.searchParams.get('size') || '8'), 12);

  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [], source: 'none' });
  }

  if (process.env.TICKETMASTER_API_KEY) {
    const results: any[] = [];

    // ── 1. Attractions (artistes) ───────────────────────────────────────────
    if (kind === 'all' || kind === 'artist') {
      try {
        const attrResult = await searchAttractions(q, Math.ceil(size * 0.4));
        if (attrResult.success && attrResult.data?.length) {
          results.push(...attrResult.data.map((a: any) => ({
            id:             a.id || `attr-${a.name}`,
            name:           a.name,
            genre:          a.genre || '',
            country:        a.country || '',
            image:          a.image || '',
            upcomingEvents: a.upcomingEvents,
            kind:           'artist',
          })));
        }
      } catch (_) { /* ignore */ }
    }

    // ── 2. Événements (concerts, festivals, sport) ──────────────────────────
    if (kind === 'all' || kind === 'event') {
      try {
        const perCountry = Math.ceil(size * 0.2);
        const [frRes, esRes, itRes, deRes] = await Promise.allSettled([
          searchEvents({ keyword: q, countryCode: 'FR', size: perCountry, sort: 'relevance,desc' }),
          searchEvents({ keyword: q, countryCode: 'ES', size: perCountry, sort: 'relevance,desc' }),
          searchEvents({ keyword: q, countryCode: 'IT', size: perCountry, sort: 'relevance,desc' }),
          searchEvents({ keyword: q, countryCode: 'DE', size: perCountry, sort: 'relevance,desc' }),
        ]);
        for (const r of [frRes, esRes, itRes, deRes]) {
          if (r.status === 'fulfilled' && r.value.success && r.value.data?.events) {
            for (const ev of r.value.data.events) {
              if (ALLOWED_TYPES.includes(ev.type)) {
                results.push({
                  id:      ev.id,
                  name:    ev.title,
                  genre:   ev.category || ev.type,
                  country: ev.country,
                  city:    ev.city,
                  image:   ev.image,
                  date:    ev.date,
                  kind:    'event',
                });
              }
            }
          }
        }
      } catch (_) { /* ignore */ }
    }

    if (results.length > 0) {
      // Déduplication par nom, artistes en premier
      const seen = new Set<string>();
      const artistsFirst = [
        ...results.filter(r => r.kind === 'artist'),
        ...results.filter(r => r.kind === 'event'),
      ].filter(r => {
        const key = r.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, size);

      return NextResponse.json(
        { success: true, data: artistsFirst, source: 'ticketmaster' },
        { headers: { 'Cache-Control': 'public, s-maxage=60' } }
      );
    }
  }

  // ── Fallback MusicBrainz ────────────────────────────────────────────────────
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
      kind:           'artist',
      source:         'musicbrainz',
    }));

    return NextResponse.json(
      { success: true, data: artists, source: 'musicbrainz' },
      { headers: { 'Cache-Control': 'public, s-maxage=120' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, data: [], source: 'error' },
      { status: 502 }
    );
  }
}
