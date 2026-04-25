/**
 * Eventrip — Ticketmaster Discovery API v2
 * - Recherche par keyword, géolocalisation, artiste
 * - Pagination complète
 * - Filtrage par segment (Music / Sports / Arts & Theatre)
 * - Prix réels et statut de disponibilité
 * - Cache : 5 min pour les listes, 15 min pour les détails
 *
 * Clé API : developer.ticketmaster.com (gratuit, 5 000 req/jour)
 */

import { Event, ApiResponse, SearchFilters } from '@/types';
import { apiFetch, buildUrl, ApiError } from '@/lib/api-client';

const BASE = 'https://app.ticketmaster.com/discovery/v2';
const KEY  = () => process.env.TICKETMASTER_API_KEY || '';

// ─── Segments Ticketmaster ────────────────────────────────────────────────────
export const TM_SEGMENTS = {
  music:  'KZFzniwnSyZfZ7v7nJ',
  sports: 'KZFzniwnSyZfZ7v7nE',
  arts:   'KZFzniwnSyZfZ7v7na',
  family: 'KZFzniwnSyZfZ7v7n1',
  film:   'KZFzniwnSyZfZ7v7nn',
} as const;

// ─── Mapper brut TM → type Event ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTMEvent(ev: any): Event {
  const venue   = ev._embedded?.venues?.[0];
  const segment = ev.classifications?.[0]?.segment?.name?.toLowerCase() || 'other';
  const typeMap: Record<string, Event['type']> = {
    music: 'concert', sports: 'sport', 'arts & theatre': 'theatre', miscellaneous: 'festival'
  };

  return {
    id:               ev.id,
    title:            ev.name,
    description:      ev.info || ev.pleaseNote || '',
    image:            ev.images?.sort((a: any, b: any) => b.width - a.width)
                        .find((img: any) => img.ratio === '16_9')?.url
                      || ev.images?.[0]?.url || '',
    venue:            venue?.name || 'Lieu inconnu',
    city:             venue?.city?.name || 'Ville inconnue',
    country:          venue?.country?.name || '',
    date:             ev.dates?.start?.localDate || '',
    startTime:        ev.dates?.start?.localTime,
    type:             typeMap[segment] ?? 'concert',
    category:         ev.classifications?.[0]?.genre?.name,
    artists:          ev._embedded?.attractions?.map((a: any) => a.name) || [],
    ticketsAvailable: ev.dates?.status?.code === 'onsale' ? 100 : 0,
    minPrice:         ev.priceRanges?.[0]?.min ?? 0,
    maxPrice:         ev.priceRanges?.[0]?.max ?? 0,
    latitude:         parseFloat(venue?.location?.latitude  || '0') || undefined,
    longitude:        parseFloat(venue?.location?.longitude || '0') || undefined,
    externalId:       ev.id,
    source:           'ticketmaster',
    // Champs supplémentaires utiles pour le pack builder
    status:           ev.dates?.status?.code,      // onsale | offsale | cancelled
    ticketUrl:        ev.url,
    seatMap:          ev.seatmap?.staticUrl,
    accessibility:    ev.accessibility,
  } as Event & Record<string, unknown>;
}

// ─── Recherche principale ────────────────────────────────────────────────────
export interface TMSearchParams {
  keyword?:        string;
  city?:           string;
  countryCode?:    string;
  geoPoint?:       string;          // "lat,lng"
  radius?:         number;          // km autour du geoPoint
  segmentId?:      string;
  classificationName?: string;      // music | sports | arts & theatre
  dateFrom?:       string;          // ISO
  dateTo?:         string;          // ISO
  page?:           number;
  size?:           number;
  sort?:           string;          // date,asc | relevance,desc
  includeFamily?:  boolean;
}

export interface TMSearchResult {
  events: Event[];
  total:  number;
  page:   number;
  size:   number;
  totalPages: number;
}

export async function searchEvents(
  params: TMSearchParams
): Promise<ApiResponse<TMSearchResult>> {
  if (!KEY()) {
    return { success: false, error: 'Ticketmaster API key manquante (TICKETMASTER_API_KEY)', data: undefined };
  }

  try {
    const {
      keyword, city, countryCode, geoPoint, radius = 50,
      segmentId, classificationName, dateFrom, dateTo,
      page = 0, size = 20, sort = 'date,asc', includeFamily = false
    } = params;

    const query: Record<string, string | number | boolean | undefined> = {
      apikey:   KEY(),
      keyword,
      city,
      countryCode,
      segmentId,
      classificationName,
      size,
      page,
      sort,
      locale:   '*',
      includeFamily: includeFamily ? 'yes' : 'no',
    };

    if (geoPoint) {
      query.geoPoint = geoPoint;
      query.radius   = radius;
      query.unit     = 'km';
    }
    if (dateFrom) query.startDateTime = new Date(dateFrom).toISOString().replace('.000', '');
    if (dateTo)   query.endDateTime   = new Date(dateTo).toISOString().replace('.000', '');

    const url = buildUrl(`${BASE}/events.json`, query);

    const data = await apiFetch<any>(url, {
      service:         'ticketmaster',
      cacheTtl:        300, // 5 minutes
      cacheKey:        `tm:events:${JSON.stringify(params)}`,
      rateLimitPerMin: 50,
    });

    const rawEvents = data._embedded?.events || [];
    const pagination = data.page || {};

    return {
      success: true,
      data: {
        events:     rawEvents.map(mapTMEvent),
        total:      pagination.totalElements || rawEvents.length,
        page:       pagination.number        || 0,
        size:       pagination.size          || size,
        totalPages: pagination.totalPages    || 1,
      },
    };
  } catch (err) {
    console.error('[Ticketmaster] searchEvents error:', err);
    const e = err as ApiError;
    return {
      success: false,
      error:   e.message || 'Erreur Ticketmaster',
      data:    { events: [], total: 0, page: 0, size: 0, totalPages: 0 },
    };
  }
}

// ─── Détail d'un événement ────────────────────────────────────────────────────
export async function getEventById(id: string): Promise<ApiResponse<Event>> {
  if (!KEY()) return { success: false, error: 'Clé API manquante' };

  try {
    const url = buildUrl(`${BASE}/events/${id}.json`, { apikey: KEY() });
    const data = await apiFetch<any>(url, {
      service:  'ticketmaster',
      cacheTtl: 900, // 15 min
      cacheKey: `tm:event:${id}`,
    });

    return { success: true, data: mapTMEvent(data) };
  } catch (err) {
    console.error('[Ticketmaster] getEventById error:', err);
    return { success: false, error: (err as Error).message };
  }
}

// ─── Artistes / Attractions (autocomplete) ────────────────────────────────────
export interface TMArtist {
  id:    string;
  name:  string;
  genre: string;
  image: string;
  url:   string;
  upcomingEvents: number;
}

export async function searchAttractions(keyword: string, size = 6): Promise<ApiResponse<TMArtist[]>> {
  if (!KEY()) return { success: false, error: 'Clé API manquante', data: [] };

  try {
    const url = buildUrl(`${BASE}/attractions.json`, {
      apikey: KEY(), keyword, size, locale: '*',
    });

    const data = await apiFetch<any>(url, {
      service:  'ticketmaster',
      cacheTtl: 120, // 2 min
      cacheKey: `tm:attractions:${keyword}`,
    });

    const items = (data._embedded?.attractions || []).map((a: any): TMArtist => ({
      id:             a.id,
      name:           a.name,
      genre:          a.classifications?.[0]?.genre?.name || '',
      image:          a.images?.find((img: any) => img.ratio === '1_1')?.url || '',
      url:            a.url || '',
      upcomingEvents: a.upcomingEvents?.ticketmaster || 0,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: (err as Error).message, data: [] };
  }
}

// ─── Événements d'un artiste (tournée) ───────────────────────────────────────
export async function getArtistEvents(
  attractionId: string,
  opts: { dateFrom?: string; size?: number } = {}
): Promise<ApiResponse<TMSearchResult>> {
  return searchEvents({
    keyword: undefined,
    size:    opts.size || 25,
    dateFrom: opts.dateFrom,
    sort:    'date,asc',
    ...({ attractionId } as any), // paramètre non typé dans TMSearchParams mais valide Ticketmaster
  });
}

// ─── Événements à proximité GPS ───────────────────────────────────────────────
export async function getEventsNearVenue(
  lat: number,
  lng: number,
  radiusKm = 20,
  dateFrom?: string
): Promise<ApiResponse<TMSearchResult>> {
  return searchEvents({
    geoPoint: `${lat},${lng}`,
    radius:   radiusKm,
    dateFrom,
    sort:     'date,asc',
    size:     10,
  });
}

// ─── Vérification disponibilité (live check) ─────────────────────────────────
export async function checkEventAvailability(
  eventId: string
): Promise<{ available: boolean; status: string; lastChecked: string }> {
  try {
    const result = await getEventById(eventId);
    const status = (result.data as any)?.status || 'unknown';
    return {
      available:   status === 'onsale',
      status,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return { available: false, status: 'error', lastChecked: new Date().toISOString() };
  }
}
