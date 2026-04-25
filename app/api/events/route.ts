/**
 * GET /api/events
 * Recherche d'événements Ticketmaster avec cache, pagination, filtres.
 *
 * Query params:
 *   q           — mot-clé (artiste, événement)
 *   city        — ville
 *   country     — code pays (FR, GB, DE…)
 *   lat, lng    — géolocalisation (optionnel, remplace city)
 *   radius      — km autour du geoPoint (défaut: 50)
 *   type        — music | sports | arts
 *   dateFrom    — YYYY-MM-DD
 *   dateTo      — YYYY-MM-DD
 *   page        — numéro de page (défaut: 0)
 *   size        — résultats par page (défaut: 20, max: 50)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchEvents, TM_SEGMENTS } from '@/lib/api/ticketmaster';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const q       = sp.get('q')       || '';
  const city    = sp.get('city')    || undefined;
  const country = sp.get('country') || undefined;
  const lat     = sp.get('lat');
  const lng     = sp.get('lng');
  const radius  = parseInt(sp.get('radius') || '50');
  const type    = sp.get('type')    || undefined;
  const dateFrom = sp.get('dateFrom') || undefined;
  const dateTo   = sp.get('dateTo')   || undefined;
  const page     = parseInt(sp.get('page') || '0');
  const size     = Math.min(parseInt(sp.get('size') || '20'), 50);

  // Mapping type → segmentId Ticketmaster
  const segmentMap: Record<string, string> = {
    music:  TM_SEGMENTS.music,
    sports: TM_SEGMENTS.sports,
    arts:   TM_SEGMENTS.arts,
  };
  const segmentId = type ? segmentMap[type] : undefined;

  const result = await searchEvents({
    keyword:      q || undefined,
    city,
    countryCode:  country,
    geoPoint:     lat && lng ? `${lat},${lng}` : undefined,
    radius,
    segmentId,
    dateFrom,
    dateTo,
    page,
    size,
    sort:         'date,asc',
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
