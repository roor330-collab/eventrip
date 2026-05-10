/**
 * Eventrip — Duffel API v2 (vols)
 * Docs: https://duffel.com/docs/api
 * Endpoint: POST /air/offer_requests?return_offers=true
 */

import { Flight, ApiResponse } from '@/types';

const BASE = 'https://api.duffel.com';
const TOKEN = () => process.env.DUFFEL_API_KEY || '';

// ─── Mapping IATA aéroports ───────────────────────────────────────────────────
export const AIRPORT_IATA: Record<string, string> = {
  // France
  'Paris': 'CDG', 'Lyon': 'LYS', 'Marseille': 'MRS', 'Bordeaux': 'BOD',
  'Toulouse': 'TLS', 'Nice': 'NCE', 'Nantes': 'NTE', 'Strasbourg': 'SXB',
  'Lille': 'LIL', 'Rennes': 'RNS', 'Montpellier': 'MPL',
  // Europe
  'Bruxelles': 'BRU', 'Genève': 'GVA', 'Zurich': 'ZRH', 'Amsterdam': 'AMS',
  'Berlin': 'BER', 'Munich': 'MUC', 'Francfort': 'FRA', 'Madrid': 'MAD',
  'Barcelone': 'BCN', 'Milan': 'MXP', 'Rome': 'FCO', 'Vienne': 'VIE',
  'Prague': 'PRG', 'Stockholm': 'ARN', 'Copenhague': 'CPH', 'Londres': 'LHR',
  'Lisbonne': 'LIS', 'Dublin': 'DUB',
};

function headers() {
  return {
    'Authorization': `Bearer ${TOKEN()}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Duffel-Version': 'v2',
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function parseDurationMinutes(iso: string): number {
  // PT2H30M → 150 min
  const h = iso.match(/(\d+)H/)?.[1] || '0';
  const m = iso.match(/(\d+)M/)?.[1] || '0';
  return parseInt(h) * 60 + parseInt(m);
}

// ─── Types Duffel ─────────────────────────────────────────────────────────────
interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  base_amount?: string;
  available_services?: any[];
  slices: {
    id: string;
    origin: { iata_code: string; name: string };
    destination: { iata_code: string; name: string };
    duration: string;
    segments: {
      id: string;
      marketing_carrier: { iata_code: string; name: string };
      marketing_carrier_flight_number: string;
      aircraft?: { iata_code: string };
      departing_at: string;
      arriving_at: string;
      stops: any[];
    }[];
  }[];
  passengers: { id: string; type: string }[];
}

// ─── Mapping Duffel offer → Flight ───────────────────────────────────────────
function mapOffer(offer: DuffelOffer): Flight {
  const slice = offer.slices[0];
  const seg = slice.segments[0];
  const lastSeg = slice.segments[slice.segments.length - 1];

  return {
    id: offer.id,
    departureAirport: slice.origin.iata_code,
    arrivalAirport: slice.destination.iata_code,
    departureTime: seg.departing_at,
    arrivalTime: lastSeg.arriving_at,
    airline: seg.marketing_carrier.iata_code,
    price: parseFloat(offer.total_amount || '0'),
    duration: parseDurationMinutes(slice.duration || 'PT0H'),
    stops: slice.segments.length - 1,
    availability: 9,
    flightNumber: seg.marketing_carrier.iata_code + seg.marketing_carrier_flight_number,
    aircraft: seg.aircraft?.iata_code || 'Unknown',
  };
}

// ─── Paramètres recherche ─────────────────────────────────────────────────────
export interface FlightSearchParams {
  originCity: string;
  destinationCity: string;
  eventDate: string;       // YYYY-MM-DD
  adults?: number;
  children?: number;
  returnDays?: number;
}

// ─── Données mock (fallback si API indisponible) ──────────────────────────────
function mockFlights(from: string, to: string, date: string): Flight[] {
  const fromIATA = AIRPORT_IATA[from] || 'CDG';
  const toIATA = AIRPORT_IATA[to] || 'LHR';

  return [
    {
      id: `mock-${fromIATA}-${toIATA}-1`,
      departureAirport: fromIATA,
      arrivalAirport: toIATA,
      departureTime: `${date}T07:15:00`,
      arrivalTime: `${date}T09:30:00`,
      airline: 'AF',
      price: 89 + Math.floor(Math.random() * 80),
      duration: 135,
      stops: 0,
      availability: 12,
      flightNumber: 'AF1234',
      aircraft: '320',
    },
    {
      id: `mock-${fromIATA}-${toIATA}-2`,
      departureAirport: fromIATA,
      arrivalAirport: toIATA,
      departureTime: `${date}T11:40:00`,
      arrivalTime: `${date}T14:10:00`,
      airline: 'VY',
      price: 54 + Math.floor(Math.random() * 50),
      duration: 150,
      stops: 0,
      availability: 5,
      flightNumber: 'VY8842',
      aircraft: '320',
    },
    {
      id: `mock-${fromIATA}-${toIATA}-3`,
      departureAirport: fromIATA,
      arrivalAirport: toIATA,
      departureTime: `${date}T18:00:00`,
      arrivalTime: `${date}T21:45:00`,
      airline: 'U2',
      price: 42 + Math.floor(Math.random() * 60),
      duration: 225,
      stops: 1,
      availability: 3,
      flightNumber: 'U24521',
      aircraft: '319',
    },
  ];
}

// ─── Recherche vols via Duffel API ────────────────────────────────────────────
export async function searchFlights(
  params: FlightSearchParams
): Promise<ApiResponse<Flight[]>> {
  const { originCity, destinationCity, eventDate, adults = 1, children = 0, returnDays = 1 } = params;

  const originIATA = AIRPORT_IATA[originCity];
  const destIATA = AIRPORT_IATA[destinationCity];

  if (!originIATA || !destIATA) {
    return {
      success: true,
      data: mockFlights(originCity, destinationCity, eventDate),
    };
  }

  if (!TOKEN()) {
    console.warn('[Duffel] Pas de clé API — utilisation des données mock');
    return { success: true, data: mockFlights(originCity, destinationCity, eventDate) };
  }

  const returnDate = addDays(eventDate, returnDays);

  const passengers = [
    ...Array(adults).fill({ type: 'adult' }),
    ...Array(children).fill({ type: 'child' }),
  ];

  // Aller-retour = 2 slices
  const body = {
    data: {
      slices: [
        { origin: originIATA, destination: destIATA, departure_date: eventDate },
        { origin: destIATA, destination: originIATA, departure_date: returnDate },
      ],
      passengers,
      cabin_class: 'economy',
    },
  };

  try {
    const res = await fetch(`${BASE}/air/offer_requests?return_offers=true`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[Duffel] API error', res.status, errText);
      return { success: true, data: mockFlights(originCity, destinationCity, eventDate) };
    }

    const json = await res.json();
    const offers: DuffelOffer[] = json.data?.offers || [];

    if (!offers.length) {
      return { success: true, data: mockFlights(originCity, destinationCity, eventDate) };
    }

    const sorted = offers
      .sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount))
      .slice(0, 6)
      .map(mapOffer);

    return { success: true, data: sorted };
  } catch (err) {
    console.error('[Duffel] Fetch error:', err);
    return { success: true, data: mockFlights(originCity, destinationCity, eventDate) };
  }
}

// ─── Recherche trains (mock ─ Duffel Rail non dispo sur comptes gratuits) ──────
export interface TrainSearchParams {
  originCity: string;
  destinationCity: string;
  departureDate: string;
  passengers?: number;
}

export async function searchTrains(
  params: TrainSearchParams
): Promise<ApiResponse<any[]>> {
  const { originCity, destinationCity, departureDate, passengers = 1 } = params;

  const trains = [
    {
      id: `train-${originCity}-${destinationCity}-1`,
      type: 'TGV',
      operator: 'SNCF',
      origin: originCity,
      destination: destinationCity,
      departureTime: `${departureDate}T06:30:00`,
      arrivalTime: `${departureDate}T09:45:00`,
      duration: 195,
      price: 35 * passengers + Math.floor(Math.random() * 30),
      class: '2ème classe',
      availability: 15,
    },
    {
      id: `train-${originCity}-${destinationCity}-2`,
      type: 'TGV',
      operator: 'SNCF',
      origin: originCity,
      destination: destinationCity,
      departureTime: `${departureDate}T08:00:00`,
      arrivalTime: `${departureDate}T11:30:00`,
      duration: 210,
      price: 49 * passengers + Math.floor(Math.random() * 20),
      class: '1ère classe',
      availability: 6,
    },
    {
      id: `train-${originCity}-${destinationCity}-3`,
      type: 'Intercités',
      operator: 'SNCF',
      origin: originCity,
      destination: destinationCity,
      departureTime: `${departureDate}T13:15:00`,
      arrivalTime: `${departureDate}T17:30:00`,
      duration: 255,
      price: 22 * passengers + Math.floor(Math.random() * 15),
      class: '2ème classe',
      availability: 22,
    },
  ];

  return { success: true, data: trains };
}
