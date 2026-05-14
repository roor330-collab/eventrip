/**
 * GET /api/trains
 * Recherche de trains via Duffel.
 *
 * Query params:
 *   from       — ville de départ (ex: "Paris")
 *   to         — ville destination (ex: "Lyon")
 *   date       — date départ YYYY-MM-DD
 *   passengers — nb passagers (défaut: 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchTrains } from '@/lib/api/duffel';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const from = sp.get('from') || '';
  const to = sp.get('to') || '';
  const date = sp.get('date') || '';
  const passengers = parseInt(sp.get('passengers') || '1');

  if (!from || !to || !date) {
    return NextResponse.json(
      { success: false, error: 'Paramètres requis : from, to, date' },
      { status: 400 }
    );
  }

  try {
    const result = await searchTrains({
      originCity: from,
      destinationCity: to,
      departureDate: date,
      passengers,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 502,
      headers: { 'Cache-Control': 'public, s-maxage=300' },
    });
  } catch (error) {
    console.error('[/api/trains] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Erreur lors de la recherche de trains',
      },
      { status: 500 }
    );
  }
}
