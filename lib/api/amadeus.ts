/**
 * Eventrip — Amadeus Self-Service API (sandbox gratuit)
 * - OAuth 2.0 client_credentials avec renouvellement automatique
 * - Vols A/R calés sur la date de l'événement (veille → lendemain)
 * - Hôtels dans un rayon de 5km autour du venue (coordonnées GPS)
 * - Fallback gracieux : si aucun vol → propose de changer ville départ
 *
 * Inscription : developers.amadeus.com → Self-Service (gratuit, pas de CB)
 * Test : https://test.api.amadeus.com  |  Production : https://api.amadeus.com
 */

import { Flight, Hotel, ApiResponse } from '@/types';
import { apiFetch, buildUrl, parseDuration, haversineKm, addDays, ApiError } from '@/lib/api-client';

const AM_BASE = process.env.AMADEUS_ENV === 'prod'
  ? 'https://api.amadeus.com'
  : 'https://test.api.amadeus.com';

const CLIENT_ID     = () => process.env.AMADEUS_CLIENT_ID     || '';
const CLIENT_SECRET = () => process.env.AMADEUS_CLIENT_SECRET || '';

// ─── Token manager (serveur uniquement) ──────────────────────────────────────
interface Token { value: string; expiresAt: number; }
let _token: Token | null = null;

async function getToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt - 30_000) return _token.value;

  if (!CLIENT_ID() || !CLIENT_SECRET()) {
    throw new ApiError('Amadeus credentials manquants (AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET)', 401, 'amadeus');
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     CLIENT_ID(),
    client_secret: CLIENT_SECRET(),
  });

  const res = await fetch(`${AM_BASE}/v1/security/oauth2/token`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    throw new ApiError(`Amadeus OAuth failed: ${res.status} ${res.statusText}`, res.status, 'amadeus');
  }

  const data = await res.json();
  _token = {
    value:     data.access_token,
    expiresAt: Date.now() + (data.expires_in || 1800) * 1000,
  };

  return _token.value;
}

function amHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}`, Accept: 'application/json' };
}

// ─── Mapping IATA depuis villes françaises/européennes ───────────────────────
export const CITY_TO_IATA: Record<string, string> = {
  // France
  'Lyon': 'LYS', 'Marseille': 'MRS', 'Bordeaux': 'BOD', 'Toulouse': 'TLS',
  'Nantes': 'NTE', 'Strasbourg': 'SXB', 'Nice': 'NCE', 'Montpellier': 'MPL',
  'Lille': 'LIL', 'Rennes': 'RNS', 'Grenoble': 'GNB', 'Paris': 'CDG',
  // Europe
  'Bruxelles': 'BRU', 'Genève': 'GVA', 'Zurich': 'ZRH', 'Amsterdam': 'AMS',
  'Berlin': 'BER', 'Munich': 'MUC', 'Francfort': 'FRA', 'Madrid': 'MAD',
  'Barcelone': 'BCN', 'Milan': 'MXP', 'Rome': 'FCO', 'Vienne': 'VIE',
  'Prague': 'PRG', 'Stockholm': 'ARN', 'Copenhague': 'CPH', 'Londres': 'LHR',
  'Lisbonne': 'LIS', 'Dublin': 'DUB',
};

// City code Amadeus (3 lettres, différent de IATA aéroport)
export const CITY_CODE: Record<string, string> = {
  'Paris': 'PAR', 'Lyon': 'LYS', 'Marseille': 'MRS', 'Bordeaux': 'BOD',
  'Toulouse': 'TLS', 'Nice': 'NCE', 'Nantes': 'NTE', 'Strasbourg': 'SXB',
  'Bruxelles': 'BRU', 'Genève': 'GVA', 'Amsterdam': 'AMS', 'Berlin': 'BER',
  'Munich': 'MUC', 'Madrid': 'MAD', 'Barcelone': 'BCN', 'Milan': 'MIL',
  'Rome': 'ROM', 'Vienne': 'VIE', 'Londres': 'LON', 'Lisbonne': 'LIS',
};

// ─── Vols ─────────────────────────────────────────────────────────────────────
export interface FlightSearchParams {
  originCity:       string;          // Ville de départ (ex: "Lyon")
  destinationIATA:  string;          // IATA destination (ex: "CDG")
  eventDate:        string;          // YYYY-MM-DD
  adults:           number;
  returnDays?:      number;          // nb jours après événement pour retour (défaut: 1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFlight(offer: any, originCity: string): Flight {
  const out   = offer.itineraries?.[0];   // aller
  const back  = offer.itineraries?.[1];   // retour (si A/R)
  const segOut  = out?.segments?.[0];
  const segBack = back?.segments?.[back.segments.length - 1];

  return {
    id:               offer.id || `${originCity}-${Date.now()}`,
    departureAirport: segOut?.departure?.iataCode  || CITY_TO_IATA[originCity] || '???',
    arrivalAirport:   segOut?.arrival?.iataCode    || '???',
    departureTime:    segOut?.departure?.at         || '',
    arrivalTime:      segBack?.arrival?.at || segOut?.arrival?.at || '',
    airline:          segOut?.carrierCode           || 'Unknown',
    price:            parseFloat(offer.price?.grandTotal || offer.price?.total || '0'),
    duration:         parseDuration(out?.duration  || 'PT0H'),
    stops:            (out?.segments?.length || 1) - 1,
    availability:     parseInt(offer.numberOfBookableSeats || '9'),
    flightNumber:     segOut?.number,
    aircraft:         segOut?.aircraft?.code,
  };
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<ApiResponse<Flight[]>> {
  const { originCity, destinationIATA, eventDate, adults, returnDays = 1 } = params;

  const originIATA = CITY_TO_IATA[originCity];
  if (!originIATA) {
    return {
      success: false,
      error: `Aéroport introuvable pour "${originCity}". Essayez une autre ville de départ.`,
      data: [],
      fallback: 'change_city',
    } as ApiResponse<Flight[]> & { fallback: string };
  }

  const returnDate = addDays(eventDate, returnDays);

  try {
    const token = await getToken();
    const url = buildUrl(`${AM_BASE}/v2/shopping/flight-offers`, {
      originLocationCode:      originIATA,
      destinationLocationCode: destinationIATA,
      departureDate:           eventDate,
      returnDate,
      adults,
      max:                     10,
      currencyCode:            'EUR',
      nonStop:                 false,
    });

    const data = await apiFetch<any>(url, {
      headers:         amHeaders(token),
      service:         'amadeus-flights',
      cacheTtl:        180, // 3 min (les prix changent vite)
      cacheKey:        `am:flights:${originCity}:${destinationIATA}:${eventDate}:${adults}`,
      rateLimitPerMin: 40,
    });

    const flights = (data.data || []).map((o: any) => mapFlight(o, originCity));

    if (!flights.length) {
      return {
        success: false,
        error: `Aucun vol trouvé depuis ${originCity} vers ${destinationIATA} le ${eventDate}.`,
        data: [],
        fallback: 'change_city',
      } as ApiResponse<Flight[]> & { fallback: string };
    }

    return { success: true, data: flights };
  } catch (err) {
    const e = err as ApiError;
    console.error('[Amadeus] flights error:', e.message);
    return {
      success: false,
      error:   e.message,
      data:    [],
      fallback: e.isServerError() ? 'retry' : 'change_city',
    } as ApiResponse<Flight[]> & { fallback: string };
  }
}

// ─── Hôtels ───────────────────────────────────────────────────────────────────
export interface HotelSearchParams {
  venueLat:    number;         // Latitude du lieu de l'événement
  venueLng:    number;         // Longitude du lieu de l'événement
  cityCode:    string;         // Code ville Amadeus (ex: "PAR")
  checkIn:     string;         // YYYY-MM-DD (jour de l'événement ou veille)
  nights:      number;         // durée du séjour
  adults:      number;
  radiusKm?:   number;         // défaut: 5km
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHotel(offer: any, venueLat: number, venueLng: number): Hotel {
  const hotel  = offer.hotel;
  const offerData = offer.offers?.[0];
  const lat  = parseFloat(hotel?.latitude  || '0');
  const lng  = parseFloat(hotel?.longitude || '0');

  return {
    id:           hotel?.hotelId || offer.id || '',
    name:         hotel?.name    || 'Hôtel',
    city:         hotel?.cityCode || '',
    latitude:     lat,
    longitude:    lng,
    distance:     (lat && lng) ? haversineKm(venueLat, venueLng, lat, lng) : 0,
    stars:        hotel?.rating  || 0,
    price:        parseFloat(offerData?.price?.total || offerData?.price?.base || '0'),
    currency:     offerData?.price?.currency || 'EUR',
    image:        hotel?.media?.[0]?.uri || '',
    amenities:    hotel?.amenities || [],
    reviews:      hotel?.numberOfReviews,
    rating:       parseFloat(hotel?.rating || '0'),
    availability: offerData?.availability?.isAvailable ?? true,
  };
}

export async function searchHotels(
  params: HotelSearchParams
): Promise<ApiResponse<Hotel[]>> {
  const { venueLat, venueLng, cityCode, checkIn, nights, adults, radiusKm = 5 } = params;

  try {
    const token    = await getToken();
    const checkOut = addDays(checkIn, nights);

    // Étape 1 — récupérer les hôtels à proximité
    const listUrl = buildUrl(`${AM_BASE}/v1/reference-data/locations/hotels/by-geocode`, {
      latitude:  venueLat,
      longitude: venueLng,
      radius:    radiusKm,
      radiusUnit:'KM',
      ratings:   '3,4,5',
    });

    const listData = await apiFetch<any>(listUrl, {
      headers:  amHeaders(token),
      service:  'amadeus-hotels-list',
      cacheTtl: 3600, // 1h — les hôtels ne bougent pas
      cacheKey: `am:hotels-list:${venueLat}:${venueLng}:${radiusKm}`,
    });

    const hotelIds = (listData.data || [])
      .slice(0, 20)
      .map((h: any) => h.hotelId)
      .join(',');

    if (!hotelIds) {
      return { success: false, error: `Aucun hôtel trouvé dans un rayon de ${radiusKm}km du venue.`, data: [] };
    }

    // Étape 2 — récupérer les offres et prix
    const offUrl = buildUrl(`${AM_BASE}/v3/shopping/hotel-offers`, {
      hotelIds,
      checkInDate:  checkIn,
      checkOutDate: checkOut,
      adults,
      max:          15,
      currencyCode: 'EUR',
      bestRateOnly: true,
    });

    const offData = await apiFetch<any>(offUrl, {
      headers:         amHeaders(token),
      service:         'amadeus-hotels-offers',
      cacheTtl:        300, // 5 min
      cacheKey:        `am:hotels-offers:${cityCode}:${checkIn}:${nights}:${adults}`,
      rateLimitPerMin: 30,
    });

    const hotels = (offData.data || [])
      .map((o: any) => mapHotel(o, venueLat, venueLng))
      .filter((h: Hotel) => h.availability && h.price > 0)
      .sort((a: Hotel, b: Hotel) => a.distance - b.distance); // tri par proximité

    return { success: true, data: hotels };
  } catch (err) {
    const e = err as ApiError;
    console.error('[Amadeus] hotels error:', e.message);
    return { success: false, error: e.message, data: [] };
  }
}

// ─── Aéroports proches d'un point GPS ────────────────────────────────────────
export async function getNearestAirport(lat: number, lng: number): Promise<string | null> {
  try {
    const token = await getToken();
    const url   = buildUrl(`${AM_BASE}/v1/reference-data/locations/airports`, {
      latitude:  lat,
      longitude: lng,
      radius:    200,
      pageLimit: 1,
      sort:      'analytics.travelers.score',
    });

    const data = await apiFetch<any>(url, {
      headers:  amHeaders(token),
      service:  'amadeus-airports',
      cacheTtl: 86400, // 24h
      cacheKey: `am:airport:${lat}:${lng}`,
    });

    return data.data?.[0]?.iataCode || null;
  } catch {
    return null;
  }
}
