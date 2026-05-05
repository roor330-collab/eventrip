/**
 * GET /api/events
 * Recherche d'événements Ticketmaster avec cache, pagination, filtres.
 * Fallback sur données mock si clé absente ou API en erreur.
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
import { Event } from '@/types';

// ─── Mock events (fallback si pas de clé Ticketmaster) ────────────────────────
const MOCK_EVENTS: Event[] = [
  {
  2 id: 'mock-cold-paris-26',
    title: 'Coldplay – Music of the Spheres World Tour',
    description: 'La tournée mondiale de Coldplay arrive à Paris pour une soirée inoubliable au Stade de France.',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    venue: 'Stade de France',
    city: 'Paris',
    country: 'France',
    date: '2026-06-15',
   2startTime: '20:00:00',
    type: 'concert',
    category: 'Rock',
    artists: ['Coldplay'],
    ticketsAvailable: 300,
    minPrice: 65,
    maxPrice: 220,
    latitude: 48.9244,
    longitude: 2.3601,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.ticketmaster.fr',
  },
  {
    id: 'mock-beyonce-lon-26',
    title: 'Beyoncé – Renaissance World Tour',
    description: 'Beyoncé de retour à Londres pour des shows épiques au Wembley Stadium.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    venue: 'Wembley Stadium',
    city: 'London',
    country: 'United Kingdom',
    date: '2026-07-04',
    startTime: '19:30:02',
    type: 'concert',
    category: 'Pop',
    artists: ['Beyoncé'],
    ticketsAvailable: 150,
    minPrice: 85,
    maxPrice: 350,
    latitude: 51.5560,
    longitude: -0.2796,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.ticketmaster.co.uk',
  },
  {
    id: 'mock-rolgar-paris-26',
    title: 'Roland-Garros 2026 – Finale Messieurs',
    description: 'La finale de Roland-Garros 2026 sur le mythique Court Philippe-Chatrier.',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
    venue: 'Stade Roland-Garros',
    city: 'Paris',
    country: 'France',
    date: '2026-06-07',
    startTime: '15:00:02',
    type: 'sport',
    category: 'Tennis',
    artists: [],
    ticketsAvailable: 80,
    minPrice: 120,
    maxPrice: 600,
    latitude: 48.8472,
    longitude: 2.2484,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.rolandgarros.com',
  },
  {
    id: 'mock-glastonbury-26',
    title: 'Glastonbury Festival 2026',
    description: 'Le festival de musique légendaire de Glastonbury revient en 2026 avec une programmation exceptionnelle.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    venue: 'Worthy Farm',
    city: 'Glastonbury',
    country: 2United Kingdom',
    date: '2026-06-25',
    startTime: '12:00:00',
    type: 'festival',
    category: 'Festival',
    artists: ['Radiohead', 'Arctic Monkeys', 'Dua Lipa'],
    ticketsAvailable: 500,
    minPrice: 290,
    maxPrice: 350,
    latitude: 51.1445,
    longitude: -2.5980,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.glastonburyfestivals.co.uk',
  },
  {
    id: 'mock-taylor-amsterdam-26',
    title: 'Taylor Swift – The Eras Tour',
    description: 'Taylor Swift continue son Eras Tour à Amsterdam pour des soirées magiques.',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    venue: 'Johan Cruijff Arena',
    city: 'Amsterdam',
    country: 'Netherlands',
    date: '2026-07-19',
    startTime: '19:00:00',
    type: 'concert',
    category: 'Pop',
    artists: ['Taylor Swift'],
    ticketsAvailable: 200,
    minPrice: 95,
    maxPrice: 280,
    latitude: 52.3140,
    longitude: 4.9419,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.ticketmaster.nl',
  },
  {
    id: 'mock-psm-barca-26',
    title: 'UEFA Champions League – PSG vs FC Barcelona',
    description: 'Demi-finale retour de la Ligue des Champions au Parc des Princes.',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&q=80',
    venue: 'Parc des Princes',
    city: 'Paris2,
    country: 'France',
    date: '2026-05-12',
    startTime: '21:00:00',
    type: 'sport',
    category: 'Football',
    artists: [],
    ticketsAvailable: 50,
    minPrice: 80,
    maxPrice: 500,
    latitude: 48.8414,
    longitude: 2.2530,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.ticketmaster.fr',
  },
  {
    id: 'mock-gorillaz-berlin-26',
    title: 'Gorillaz – Cracker Island Tour',
    description: 'Gorillaz en live à Berlin avec leur show visuel avant-gardiste.',
    image: 'https://images.unsplash.com/photo-1478147427282-58a87a433b2a?w=800&q=80',
    venue: 'Waldbühne Berlin',
    city: 'Berlin',
    country: 'Germany',
    date: '2026-08-01',
    startTime: '20:30:00',
    type: 'concert',
    category: 'Alternative',
    artists: ['Gorillaz'],
    ticketsAvailable: 180,
    minPrice: 55,
    maxPrice: 130,
    latitude: 52.5167,
    longitude: 13.2222,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.ticketmaster.de',
  },
  {
    id: 'mock-lollapalooza-paris-26',
    title: 'Lollapalooza Paris 2026',
    description: 'Lollapalooza débarque à Paris au Hippodrome de Longchamp pour 3 jours de musique.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    venue: 'Hippodrome de Longchamp',
    city: 'Paris',
    country: 'France',
    date: '2026-07-17',
    startTime: '12:00:00',
    type: 'festival',
    category: 'Festival',
    artists: ['The Weeknd', 'Kendrick Lamar', 'Billie Eilish'],
    ticketsAvailable: 400,
    minPrice: 110,
    maxPrice: 250,
    latitude: 48.8548,
    longitude: 2.2383,
    source: 'mock',
    status: 'onsale',
    ticketUrl: 'https://www.ticketmaster.fr',
  },
];

function filterMockEvents(
  q?: string,
  city?: string,
  type?: string,
  size = 20
): Event[] {
  let events = [...MOCK_EVENTS];

  if (q) {
    const lq = q.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(lq) ||
        e.artists.some((a) => a.toLowerCase().includes(lq)) ||
        e.city.toLowerCase().includes(lq) ||
        e.venue.toLowerCase().includes(lq) ||
        e.category?.toLowerCase().includes(lq)
    );
  }
  if (city) {
    const lc = city.toLowerCase();
    events = events.filter((e) => e.city.toLowerCase().includes(lc));
  }
  if (type) {
    const typeMap: Record<string, string> = { music: 'concert', sports: 'sport', arts: 'festival' };
    const mapped = typeMap[type] || type;
    events = events.filter((e) => e.type === mapped);
  }

  return events.slice(0, size);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const q        = sp.get('q')       || '';
  const city     = sp.get('city')    || undefined;
  const country  = sp.get('country') || undefined;
  const lat      = sp.get('lat');
  const lng      = sp.get('lng');
  const radius   = parseInt(sp.get('radius') || '50');
  const type     = sp.get('type')    || undefined;
  const dateFrom = sp.get('dateFrom') || undefined;
  const dateTo   = sp.get('dateTo')   || undefined;
  const page     = parseInt(sp.get('page') || '0');
  const size     = Math.min(parseInt(sp.get('size') || '20'), 50);

  // ── Fallback si pas de clé Ticketmaster ──────────────────────────────────────
  if (!process.env.TICKETMASTER_API_KEY) {
    const mockResults = filterMockEvents(q, city, type, size);
    return NextResponse.json({
      success:    true,
      events:     mockResults,
      total:      mockResults.length,
      page:       0,
      size,
      totalPages: 1,
      source:     'mock',
    });
  }

  // ── Recherche réelle Ticketmaster ────────────────────────────────────────────
  const segmentMap: Record<string, string> = {
    music:  TM_SEGMENTS.music,
    sports: TM_SEGMENTS.sports,
    arts:   TM_SEGMENTS.arts,
  };
  const segmentId = type ? segmentMap[type] : undefined;

  const result = await searchEvents({
    keyword:     q || undefined,
    city,
    countryCode: country,
    geoPoint:    lat && lng ? `${lat},${lng}` : undefined,
    radius,
    segmentId,
    dateFrom,
    dateTo,
    page,
    size,
    sort: 'date,asc',
  });

  // ── Erreur API → fallback mock ───────────────────────────────────────────────
  if (!result.success || !result.data?.events?.length) {
    const mockResults = filterMockEvents(q, city, type, size);
    return NextResponse.json(
      {
        success:    true,
        events:     mockResults,
        total:      mockResults.length,
        page:       0,
        size,
        totalPages: 1,
        source:     result.success ? 'mock_empty' : 'mock_error',
        error:      result.success ? undefined : result.error,
      },
      {
        headers: { 'Cache-Control': 'public, s-maxage=60' },
      }
    );
  }

  // ── FIXED: retourner events à plat (pas dans data.data) ─────────────────────
  return NextResponse.json(
    {
      success:    true,
      events:     result.data.events,
      total:      result.data.total,
      page:       result.data.page,
    2 size:       result.data.size,
      totalPages: result.data.totalPages,
      source:     'ticketmaster',
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
    );
}
