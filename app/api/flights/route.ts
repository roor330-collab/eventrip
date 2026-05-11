/**
 * GET /api/flights
 * Recherche de vols A/R depuis une ville de départ vers la ville de l'événement.
 * Utilise Amadeus Self-Service si les credentials sont présents.
 * Fallback : vols mock réalistes pour la démo.
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/api/amadeus';

const CITY_IATA: Record<string, string> = {
  'Paris': 'CDG', 'Lyon': 'LYS', 'Marseille': 'MRS', 'Bordeaux': 'BOD',
  'Toulouse': 'TLS', 'Nice': 'NCE', 'Nantes': 'NTE', 'Strasbourg': 'SXB',
  'Lille': 'LIL', 'Rennes': 'RNS', 'Montpellier': 'MPL', 'Grenoble': 'GNB',
  'Madrid': 'MAD', 'Barcelone': 'BCN', 'Séville': 'SVQ', 'Valence': 'VLC',
  'Bilbao': 'BIO', 'Málaga': 'AGP', 'Saragosse': 'ZAZ', 'Grenade': 'GRX',
  'Rome': 'FCO', 'Milan': 'MXP', 'Florence': 'FLR', 'Naples': 'NAP',
  'Turin': 'TRN', 'Venise': 'VCE', 'Bologne': 'BLQ', 'Palerme': 'PMO',
  'Berlin': 'BER', 'Munich': 'MUC', 'Hambourg': 'HAM', 'Cologne': 'CGN',
  'Francfort': 'FRA', 'Stuttgart': 'STR', 'Düsseldorf': 'DUS', 'Leipzig': 'LEJ',
  'Dortmund': 'DTM', 'Nürburg': 'CGN',
  'Bruxelles': 'BRU', 'Amsterdam': 'AMS', 'Genève': 'GVA', 'Zurich': 'ZRH',
  'Londres': 'LHR', 'Lisbonne': 'LIS',
};

const FLIGHT_DURATIONS: Record<string, number> = {
  'CDG-BCN': 125, 'CDG-MAD': 135, 'CDG-FCO': 145, 'CDG-MXP': 100,
  'CDG-BER': 110, 'CDG-MUC': 100, 'CDG-LYS': 60,  'CDG-NCE': 75,
  'LYS-BCN': 90,  'LYS-MAD': 120, 'LYS-FCO': 90,  'LYS-MXP': 60,
  'LYS-BER': 110, 'LYS-MUC': 90,  'MRS-BCN': 80,  'MRS-FCO': 90,
  'BOD-MAD': 90,  'BOD-BCN': 90,  'TLS-MAD': 80,  'TLS-BCN': 70,
  'NCE-FCO': 75,  'NCE-MXP': 60,  'LIL-BER': 100, 'SXB-MUC': 70,
};

function getDuration(a: string, b: string): number {
  return FLIGHT_DURATIONS[`${a}-${b}`] || FLIGHT_DURATIONS[`${b}-${a}`] || 120;
}

function addMins(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const t = h * 60 + m + mins;
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function getMockFlights(from: string, to: string, date: string) {
  const fi = CITY_IATA[from] || 'CDG';
  const ti = CITY_IATA[to]   || 'BCN';
  const dur = getDuration(fi, ti);
  const base = Math.round(55 + dur * 0.65);
  const deps = ['06:30', '09:15', '12:40', '16:55', '19:20'];
  return [
    { id: `m-${fi}-${ti}-af`, airline: 'Air France',  flightNumber: `AF${100+Math.floor(Math.random()*900)}`, departureAirport: fi, arrivalAirport: ti, departureTime: `${date}T${deps[0]}:00`, arrivalTime: `${date}T${addMins(deps[0],dur)}:00`, price: Math.round(base*1.3), duration: dur, stops: 0, availability: 7 },
    { id: `m-${fi}-${ti}-vy`, airline: 'Vueling',     flightNumber: `VY${2000+Math.floor(Math.random()*999)}`, departureAirport: fi, arrivalAirport: ti, departureTime: `${date}T${deps[1]}:00`, arrivalTime: `${date}T${addMins(deps[1],dur)}:00`, price: Math.round(base*0.95), duration: dur, stops: 0, availability: 14 },
    { id: `m-${fi}-${ti}-fr`, airline: 'Ryanair',     flightNumber: `FR${3000+Math.floor(Math.random()*999)}`, departureAirport: fi, arrivalAirport: ti, departureTime: `${date}T${deps[2]}:00`, arrivalTime: `${date}T${addMins(deps[2],dur)}:00`, price: Math.round(base*0.65), duration: dur, stops: 0, availability: 28 },
    { id: `m-${fi}-${ti}-u2`, airline: 'easyJet',     flightNumber: `U2${4000+Math.floor(Math.random()*999)}`, departureAirport: fi, arrivalAirport: ti, departureTime: `${date}T${deps[3]}:00`, arrivalTime: `${date}T${addMins(deps[3],dur)}:00`, price: Math.round(base*0.85), duration: dur, stops: 0, availability: 19 },
    { id: `m-${fi}-${ti}-lh`, airline: 'Lufthansa',   flightNumber: `LH${5000+Math.floor(Math.random()*999)}`, departureAirport: fi, arrivalAirport: 'FRA',  departureTime: `${date}T${deps[4]}:00`, arrivalTime: `${date}T${addMins(deps[4],dur+60)}:00`, price: Math.round(base*1.1), duration: dur+60, stops: 1, availability: 11 },
  ].sort((a, b) => a.price - b.price);
}

export async function GET(req: NextRequest) {
  const sp         = req.nextUrl.searchParams;
  const from       = sp.get('from')       || '';
  const to         = sp.get('to')         || '';
  const date       = sp.get('date')       || '';
  const adults     = parseInt(sp.get('adults')     || '2');
  const returnDays = parseInt(sp.get('returnDays') || '1');

  if (!from || !to || !date) {
    return NextResponse.json({ success: false, error: 'Paramètres requis : from, to, date', flights: [] }, { status: 400 });
  }

  const destinationIATA = CITY_IATA[to];

  if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET && destinationIATA) {
    try {
      const result = await searchFlights({ originCity: from, destinationIATA, eventDate: date, adults, returnDays });
      if (result.success && result.data?.length) {
        return NextResponse.json({ success: true, flights: result.data, source: 'amadeus' }, { headers: { 'Cache-Control': 'public, s-maxage=180' } });
      }
    } catch (err) {
      console.error('[/api/flights] Amadeus error:', err);
    }
  }

  return NextResponse.json({ success: true, flights: getMockFlights(from, to, date), source: 'mock' }, { headers: { 'Cache-Control': 'public, s-maxage=300' } });
}
