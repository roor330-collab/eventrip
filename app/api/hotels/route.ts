/**
 * GET /api/hotels
 * Recherche d'hôtels via Amadeus par géolocalisation (5km du venue).
 *
 * Query params:
 *   lat        — latitude du venue
 *   lng        — longitude du venue
 *   cityCode   — code ville Amadeus (ex: "PAR")
 *   checkIn    — YYYY-MM-DD
 *   nights     — durée séjour (défaut: 2)
 *   adults     — nb voyageurs
 *   radius     — km (défaut: 5)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchHotels } from '@/lib/api/amadeus';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const lat      = parseFloat(sp.get('lat')      || '0');
  const lng      = parseFloat(sp.get('lng')      || '0');
  const cityCode = sp.get('cityCode')             || '';
  const checkIn  = sp.get('checkIn')              || '';
  const nights   = parseInt(sp.get('nights')      || '2');
  const adults   = parseInt(sp.get('adults')      || '1');
  const radius   = parseInt(sp.get('radius')      || '5');

  if (!lat || !lng || !checkIn || !cityCode) {
    return NextResponse.json(
      { success: false, error: 'Paramètres requis : lat, lng, cityCode, checkIn' },
      { status: 400 }
    );
  }

  const result = await searchHotels({
    venueLat: lat,
    venueLng: lng,
    cityCode,
    checkIn,
    nights,
    adults,
    radiusKm: radius,
  });

  return NextResponse.json(result, {
    status:  result.success ? 200 : 502,
    headers: { 'Cache-Control': 'public, s-maxage=300' },
  });
}
