/**
 * GET /api/flights
 * Recherche de vols A/R depuis une ville de départ vers la ville de l'événement.
 * Utilise Amadeus Self-Service si les credentials sont présents.
 * Fallback : vols mock réalistes pour la démo.
 *
 * Query params:
 *   from       — ville de départ (ex: "Paris", "Lyon")
 *   to         — ville destination (ex: "Berlin", "Barcelone")
 *   date       — date aller YYYY-MM-DD
 *   adults     — nb voyageurs (défaut: 2)
 *   returnDays — jours après l'événement pour le retour (défaut: 1)
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, CITY_TO_IATA } from '@/lib/api/amadeus';

// ─── Mapping complet ville → IATA (FR + EN + local) ─────────────────────────
// Inclut noms français, anglais ET locaux pour matcher les réponses Ticketmaster
const CITY_IATA: Record<string, string> = {
  // France (noms FR)
  'Paris': 'CDG', 'Lyon': 'LYS', 'Marseille': 'MRS', 'Bordeaux': 'BOD',
  'Toulouse': 'TLS', 'Nice': 'NCE', 'Nantes': 'NTE', 'Strasbourg': 'SXB',
  'Lille': 'LIL', 'Rennes': 'RNS', 'Montpellier': 'MPL', 'Grenoble': 'GNB',
  'Saint-Denis': 'CDG',   // Stade de France
  // Espagne (FR + EN + ES)
  'Madrid': 'MAD',
  'Barcelone': 'BCN', 'Barcelona': 'BCN',
  'Séville': 'SVQ',   'Seville': 'SVQ',   'Sevilla': 'SVQ',
  'Valence': 'VLC',   'Valencia': 'VLC',
  'Bilbao': 'BIO',
  'Málaga': 'AGP',    'Malaga': 'AGP',
  'Saragosse': 'ZAZ', 'Zaragoza': 'ZAZ',
  'Grenade': 'GRX',   'Granada': 'GRX',
  // Italie (FR + EN + IT)
  'Rome': 'FCO',      'Roma': 'FCO',
  'Milan': 'MXP',     'Milano': 'MXP',
  'Florence': 'FLR',  'Firenze': 'FLR',
  'Naples': 'NAP',    'Napoli': 'NAP',    'Naples (Italy)': 'NAP',
  'Turin': 'TRN',     'Torino': 'TRN',
  'Venise': 'VCE',    'Venice': 'VCE',    'Venezia': 'VCE',
  'Bologne': 'BLQ',   'Bologna': 'BLQ',
  'Palerme': 'PMO',   'Palermo': 'PMO',
  'Monza': 'MXP',     // GP Italie → aéroport Milan
  // Allemagne (FR + EN + DE)
  'Berlin': 'BER',
  'Munich': 'MUC',    'München': 'MUC',
  'Hambourg': 'HAM',  'Hamburg': 'HAM',
  'Cologne': 'CGN',   'Köln': 'CGN',
  'Francfort': 'FRA', 'Frankfurt': 'FRA', 'Frankfurt am Main': 'FRA',
  'Stuttgart': 'STR',
  'Düsseldorf': 'DUS', 'Dusseldorf': 'DUS',
  'Leipzig': 'LEJ',
  'Dortmund': 'DTM',
  'Nürburg': 'CGN',   'Nurburg': 'CGN',   // Nürburgring → Cologne
  'Nürburgring': 'CGN',
  // Portugal / Belgique / Autres
  'Bruxelles': 'BRU', 'Brussels': 'BRU',  'Brussel': 'BRU',
  'Amsterdam': 'AMS',
  'Genève': 'GVA',    'Geneva': 'GVA',    'Genf': 'GVA',
  'Zurich': 'ZRH',    'Zürich': 'ZRH',
  'Londres': 'LHR',   'London': 'LHR',
  'Lisbonne': 'LIS',  'Lisbon': 'LIS',    'Lisboa': 'LIS',
  'Dublin': 'DUB',
  'Vienne': 'VIE',    'Vienna': 'VIE',    'Wien': 'VIE',
  'Prague': 'PRG',
  'Budapest': 'BUD',
  'Varsovie': 'WAW',  'Warsaw': 'WAW',    'Warszawa': 'WAW',
};

// Durées de vol approximatives (minutes) entre grandes villes
const FLIGHT_DURATIONS: Record<string, number> = {
  'CDG-BCN': 125, 'CDG-MAD': 135, 'CDG-FCO': 145, 'CDG-MXP': 100,
  'CDG-BER': 110, 'CDG-MUC': 100, 'CDG-LYS': 60,  'CDG-NCE': 75,
  'LYS-BCN': 90,  'LYS-MAD': 120, 'LYS-FCO': 90,  'LYS-MXP': 60,
  'LYS-BER': 110, 'LYS-MUC': 90,  'MRS-BCN': 80,  'MRS-FCO': 90,
  'BOD-MAD': 90,  'BOD-BCN': 90,  'TLS-MAD': 80,  'TLS-BCN': 70,
  'NCE-FCO': 75,  'NCE-MXP': 60,  'LIL-BER': 100, 'SXB-MUC': 70,
};

function getDuration(fromIATA: string, toIATA: string): number {
  return FLIGHT_DURATIONS[`${fromIATA}-${toIATA}`]
    || FLIGHT_DURATIONS[`${toIATA}-${fromIATA}`]
    || 120; // défaut 2h
}

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getMockFlights(from: string, to: string, date: string, adults: number, returnDays = 1, returnDateOverride?: string) {
  const fromIATA = CITY_IATA[from] || 'CDG';
  const toIATA   = CITY_IATA[to]   || 'BCN';
  const duration = getDuration(fromIATA, toIATA);

  // Prix de base selon durée
  const base = Math.round(50 + duration * 0.7 + Math.random() * 40);

  const addMinutes = (time: string, mins: number) => {
    const [h, m] = time.split(':').map(Number);
    const total  = h * 60 + m + mins;
    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  };

  const departures = ['06:30', '09:15', '12:40', '16:55', '19:20'];

  const retDate   = returnDateOverride || addDays(date, returnDays);
  // Prix A/R = aller × 1.85 (remise groupe A/R)
  const mkFlight  = (id: string, airline: string, fn: string, dep: string, factor: number, stop = 0, arrIATA = toIATA) => ({
    id, airline, flightNumber: fn,
    departureAirport: fromIATA, arrivalAirport: arrIATA,
    departureTime:    `${date}T${dep}:00`,
    arrivalTime:      `${date}T${addMinutes(dep, duration + (stop ? 60 : 0))}:00`,
    // retour
    returnDate:        retDate,
    returnDepartureTime: `${retDate}T${dep}:00`,
    returnArrivalTime:   `${retDate}T${addMinutes(dep, duration + (stop ? 60 : 0))}:00`,
    // prix A/R par personne
    price:       Math.round(base * factor * 1.85),
    priceOneWay: Math.round(base * factor),
    duration: duration + (stop ? 60 : 0),
    stops: stop,
    availability: Math.floor(7 + Math.random() * 22),
  });

  return [
    mkFlight(`mock-${fromIATA}-${toIATA}-af`, 'Air France', `AF${100 + Math.floor(Math.random() * 900)}`, departures[0], 1.3),
    mkFlight(`mock-${fromIATA}-${toIATA}-vy`, 'Vueling',    `VY${2000 + Math.floor(Math.random() * 999)}`, departures[1], 0.95),
    mkFlight(`mock-${fromIATA}-${toIATA}-fr`, 'Ryanair',    `FR${3000 + Math.floor(Math.random() * 999)}`, departures[2], 0.65),
    mkFlight(`mock-${fromIATA}-${toIATA}-u2`, 'easyJet',    `U2${4000 + Math.floor(Math.random() * 999)}`, departures[3], 0.85),
    mkFlight(`mock-${fromIATA}-${toIATA}-lh`, 'Lufthansa',  `LH${5000 + Math.floor(Math.random() * 999)}`, departures[4], 1.1, 1, 'FRA'),
  ].sort((a, b) => a.price - b.price);
}

export async function GET(req: NextRequest) {
  const sp         = req.nextUrl.searchParams;
  const from             = sp.get('from')       || '';
  const to               = sp.get('to')         || '';
  const date             = sp.get('date')       || '';
  const adults           = parseInt(sp.get('adults')     || '2');
  const returnDays       = parseInt(sp.get('returnDays') || '1');
  const returnDateParam  = sp.get('returnDate') || '';

  if (!from || !to || !date) {
    return NextResponse.json(
      { success: false, error: 'Paramètres requis : from, to, date', flights: [] },
      { status: 400 }
    );
  }

  // Normalisation : cherche le code IATA avec ou sans accents, casse insensible
  const toNorm = to.trim();
  const destinationIATA = CITY_IATA[toNorm]
    ?? CITY_IATA[toNorm.charAt(0).toUpperCase() + toNorm.slice(1)]
    ?? Object.entries(CITY_IATA).find(([k]) => k.toLowerCase() === toNorm.toLowerCase())?.[1]
    ?? null;

  if (!destinationIATA) {
    // Ville inconnue → mock avec code générique mais vols plausibles
    return NextResponse.json({
      success: true,
      flights: getMockFlights(from, to, date, adults),
      source: 'mock',
      notice: `Code IATA inconnu pour "${to}" — vols estimés depuis ${from}`,
    });
  }

  // ── Amadeus si credentials configurés ────────────────────────────────────────
  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    try {
      const result = await searchFlights({
        originCity: from,
        destinationIATA,
        eventDate: date,
        adults,
        returnDays,
      });

      if (result.success && result.data?.length) {
        return NextResponse.json(
          { success: true, flights: result.data, source: 'amadeus' },
          { headers: { 'Cache-Control': 'public, s-maxage=180' } }
        );
      }
    } catch (err) {
      console.error('[/api/flights] Amadeus error:', err);
    }
  }

  // ── Fallback mock réaliste ────────────────────────────────────────────────────
  const mockFlights = getMockFlights(from, to, date, adults, returnDays, returnDateParam || undefined);
  return NextResponse.json({
    success: true,
    flights: mockFlights,
    source: 'mock',
  }, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
}
