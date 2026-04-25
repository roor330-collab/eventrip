/**
 * GET /api/flights
 * Recherche de vols A/R via Amadeus.
 *
 * Query params:
 *   from       — ville de départ (ex: "Lyon")
 *   to         — IATA destination (ex: "CDG")
 *   date       — date départ YYYY-MM-DD
 *   returnDays — jours après l'événement pour le retour (défaut: 1)
 *   adults     — nb voyageurs
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/api/amadeus';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const from       = sp.get('from') || '';
  const to         = sp.get('to')   || '';
  const date       = sp.get('date') || '';
  const returnDays = parseInt(sp.get('returnDays') || '1');
  const adults     = parseInt(sp.get('adults')     || '1');

  if (!from || !to || !date) {
    return NextResponse.json(
      { success: false, error: 'Paramètres requis : from, to, date' },
      { status: 400 }
    );
  }

  const result = await searchFlights({
    originCity:      from,
    destinationIATA: to,
    eventDate:       date,
    adults,
    returnDays,
  });

  // Si aucun vol, suggérer une alternative
  const response: any = { ...result };
  if (!result.success || !result.data?.length) {
    response.suggestion = {
      message:      `Aucun vol disponible depuis ${from}. Essayez depuis une ville voisine.`,
      alternatives: getSuggestedCities(from),
    };
  }

  return NextResponse.json(response, {
    status:  result.success ? 200 : 502,
    headers: { 'Cache-Control': 'public, s-maxage=180' },
  });
}

function getSuggestedCities(city: string): string[] {
  const alts: Record<string, string[]> = {
    'Lyon':       ['Paris', 'Genève', 'Marseille'],
    'Marseille':  ['Lyon', 'Nice', 'Paris'],
    'Bordeaux':   ['Paris', 'Toulouse', 'Nantes'],
    'Toulouse':   ['Bordeaux', 'Marseille', 'Paris'],
    'Strasbourg': ['Paris', 'Bruxelles', 'Francfort'],
    'Nantes':     ['Paris', 'Bordeaux', 'Rennes'],
    'Genève':     ['Lyon', 'Zurich', 'Paris'],
    'Bruxelles':  ['Paris', 'Amsterdam', 'Lille'],
  };
  return alts[city] || ['Paris', 'Lyon', 'Marseille'];
}
