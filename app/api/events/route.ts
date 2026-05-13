/**
 * GET /api/events
 * Homepage : TOP événements uniquement
 *  - Top 20 concerts  : artistes majeurs (minPrice ≥ 50 €)
 *  - Top 20 sports    : Football, Basket, Formule 1, Tennis uniquement
 *  - Top 20 festivals : grands festivals (minPrice ≥ 60 €)
 *
 * Query params optionnels :
 *   q, city, country, lat, lng, radius, type, dateFrom, dateTo, page, size
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchEvents, TM_SEGMENTS } from '@/lib/api/ticketmaster';
import { Event } from '@/types';

// ─── Mock events fallback ─────────────────────────────────────────────────────
const MOCK_EVENTS: Event[] = [
  {
    id: 'mock-cold-paris-26',
    title: 'Coldplay – Music of the Spheres World Tour',
    description: 'La tournée mondiale de Coldplay arrive à Paris pour une soirée inoubliable au Stade de France.',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
    venue: 'Stade de France', city: 'Paris', country: 'France',
    date: '2026-06-15', startTime: '20:00:00', type: 'concert', category: 'Rock',
    artists: ['Coldplay'], ticketsAvailable: 300, minPrice: 65, maxPrice: 220,
    latitude: 48.9244, longitude: 2.3601, source: 'ticketmaster',
  },
  {
    id: 'mock-rolgar-paris-26',
    title: 'Roland-Garros 2026 – Finale Messieurs',
    description: 'La finale de Roland-Garros sur le mythique Court Philippe-Chatrier.',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&q=80',
    venue: 'Stade Roland-Garros', city: 'Paris', country: 'France',
    date: '2026-06-07', startTime: '15:00:00', type: 'sport', category: 'Tennis',
    artists: [], ticketsAvailable: 80, minPrice: 120, maxPrice: 600,
    latitude: 48.8472, longitude: 2.2484, source: 'ticketmaster',
  },
  {
    id: 'mock-lolla-paris-26',
    title: 'Lollapalooza Paris 2026',
    description: 'Lollapalooza à Paris au Hippodrome de Longchamp — 3 jours de musique.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    venue: 'Hippodrome de Longchamp', city: 'Paris', country: 'France',
    date: '2026-07-17', startTime: '12:00:00', type: 'festival', category: 'Festival',
    artists: ['The Weeknd', 'Kendrick Lamar', 'Billie Eilish'],
    ticketsAvailable: 400, minPrice: 110, maxPrice: 250,
    latitude: 48.8548, longitude: 2.2383, source: 'ticketmaster',
  },
  {
    id: 'mock-barca-concert-26',
    title: 'Bad Bunny – Most Wanted Tour',
    description: 'Bad Bunny au Estadi Olímpic de Barcelona pour un show explosif.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    venue: 'Estadi Olímpic Lluís Companys', city: 'Barcelone', country: 'Espagne',
    date: '2026-07-10', startTime: '21:00:00', type: 'concert', category: 'Latin',
    artists: ['Bad Bunny'], ticketsAvailable: 200, minPrice: 75, maxPrice: 300,
    latitude: 41.3649, longitude: 2.1558, source: 'ticketmaster',
  },
  {
    id: 'mock-liga-madrid-26',
    title: 'Real Madrid vs FC Barcelona – El Clásico',
    description: 'El Clásico au Santiago Bernabéu — le match le plus regardé au monde.',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&q=80',
    venue: 'Santiago Bernabéu', city: 'Madrid', country: 'Espagne',
    date: '2026-05-23', startTime: '21:00:00', type: 'sport', category: 'Football',
    artists: [], ticketsAvailable: 60, minPrice: 150, maxPrice: 800,
    latitude: 40.4531, longitude: -3.6883, source: 'ticketmaster',
  },
  {
    id: 'mock-primavera-bcn-26',
    title: 'Primavera Sound Barcelona 2026',
    description: 'Le festival Primavera Sound revient avec une programmation internationale de rêve.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80',
    venue: 'Parc del Fòrum', city: 'Barcelone', country: 'Espagne',
    date: '2026-05-28', startTime: '16:00:00', type: 'festival', category: 'Festival',
    artists: ['Radiohead', 'Charli XCX', 'FKA twigs'],
    ticketsAvailable: 500, minPrice: 195, maxPrice: 280,
    latitude: 41.4097, longitude: 2.2234, source: 'ticketmaster',
  },
  {
    id: 'mock-rome-concert-26',
    title: 'Måneskin – Rush! Tour Roma',
    description: 'Les Måneskin en concert dans leur ville natale au Circo Massimo.',
    image: 'https://images.unsplash.com/photo-1478147427282-58a87a433b2a?w=800&q=80',
    venue: 'Circo Massimo', city: 'Rome', country: 'Italie',
    date: '2026-07-04', startTime: '21:00:00', type: 'concert', category: 'Rock',
    artists: ['Måneskin'], ticketsAvailable: 350, minPrice: 55, maxPrice: 180,
    latitude: 41.8858, longitude: 12.4854, source: 'ticketmaster',
  },
  {
    id: 'mock-milan-f1-26',
    title: 'Grand Prix d\'Italie F1 2026 – Monza',
    description: 'La cathédrale de la vitesse — le Grand Prix d\'Italie à Monza.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    venue: 'Autodromo Nazionale di Monza', city: 'Milan', country: 'Italie',
    date: '2026-09-06', startTime: '15:00:00', type: 'sport', category: 'Motorsport',
    artists: [], ticketsAvailable: 120, minPrice: 89, maxPrice: 450,
    latitude: 45.6156, longitude: 9.2811, source: 'ticketmaster',
  },
  {
    id: 'mock-milan-concert-26',
    title: 'Taylor Swift – The Eras Tour Milano',
    description: 'Taylor Swift en concert au San Siro pour deux soirées inoubliables.',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    venue: 'Stadio San Siro', city: 'Milan', country: 'Italie',
    date: '2026-07-13', startTime: '19:30:00', type: 'concert', category: 'Pop',
    artists: ['Taylor Swift'], ticketsAvailable: 150, minPrice: 95, maxPrice: 320,
    latitude: 45.4781, longitude: 9.1239, source: 'ticketmaster',
  },
  {
    id: 'mock-rammstein-berlin-26',
    title: 'Rammstein – Zeit Tour',
    description: 'Rammstein déploie son show pyrotechnique spectaculaire à l\'Olympiastadion de Berlin.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    venue: 'Olympiastadion Berlin', city: 'Berlin', country: 'Allemagne',
    date: '2026-06-20', startTime: '20:00:00', type: 'concert', category: 'Metal',
    artists: ['Rammstein'], ticketsAvailable: 280, minPrice: 75, maxPrice: 250,
    latitude: 52.5147, longitude: 13.2395, source: 'ticketmaster',
  },
  {
    id: 'mock-rockamring-26',
    title: 'Rock am Ring 2026',
    description: 'Le plus grand festival rock d\'Allemagne avec 3 jours de concerts légendaires au Nürburgring.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
    venue: 'Nürburgring', city: 'Nürburg', country: 'Allemagne',
    date: '2026-06-05', startTime: '12:00:00', type: 'festival', category: 'Festival',
    artists: ['Metallica', 'Billie Eilish', 'Twenty One Pilots'],
    ticketsAvailable: 600, minPrice: 180, maxPrice: 299,
    latitude: 50.3358, longitude: 6.9475, source: 'ticketmaster',
  },
  {
    id: 'mock-bvb-munich-26',
    title: 'Borussia Dortmund vs Bayern Munich – Der Klassiker',
    description: 'Le choc au sommet de la Bundesliga : BVB contre le Bayern à Signal Iduna Park.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
    venue: 'Signal Iduna Park', city: 'Dortmund', country: 'Allemagne',
    date: '2026-04-25', startTime: '18:30:00', type: 'sport', category: 'Football',
    artists: [], ticketsAvailable: 90, minPrice: 45, maxPrice: 350,
    latitude: 51.4926, longitude: 7.4517, source: 'ticketmaster',
  },
];

function filterMockEvents(q?: string, city?: string, country?: string, type?: string, size = 20): Event[] {
  let events = [...MOCK_EVENTS];
  if (q) {
    const lq = q.toLowerCase();
    events = events.filter(e =>
      e.title.toLowerCase().includes(lq) ||
      e.artists.some(a => a.toLowerCase().includes(lq)) ||
      e.city.toLowerCase().includes(lq) ||
      e.venue.toLowerCase().includes(lq) ||
      e.category?.toLowerCase().includes(lq)
    );
  }
  if (city) {
    const lc = city.toLowerCase();
    events = events.filter(e => e.city.toLowerCase().includes(lc));
  }
  if (country) {
    const countryMap: Record<string, string> = { FR: 'france', ES: 'espagne', IT: 'italie', DE: 'allemagne' };
    const mapped = countryMap[country.toUpperCase()];
    if (mapped) events = events.filter(e => e.country.toLowerCase().includes(mapped));
  }
  if (type) {
    const typeMap: Record<string, string> = { music: 'concert', sports: 'sport', arts: 'festival' };
    const mapped = typeMap[type] || type;
    events = events.filter(e => e.type === mapped);
  }
  return events.slice(0, size);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dedupe(events: Event[], limit: number): Event[] {
  const seen = new Set<string>();
  return events
    .filter(e => { if (seen.has(e.id)) return false; seen.add(e.id); return true; })
    .slice(0, limit);
}

function scoreEvent(e: Event): number {
  return (e.maxPrice || 0) + (e.minPrice || 0);
}

const COUNTRIES = ['FR', 'ES', 'IT', 'DE'] as const;

// ─── Top Concerts : artistes majeurs (minPrice ≥ 50 €) ───────────────────────
async function fetchTopConcerts(size = 20): Promise<Event[]> {
  const results = await Promise.allSettled(
    COUNTRIES.map(cc =>
      searchEvents({
        countryCode: cc,
        segmentId: TM_SEGMENTS.music,
        sort: 'relevance,desc',
        size: Math.ceil(size / 2),        // demande plus, on filtre après
      })
    )
  );

  const all: Event[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.success && r.value.data?.events) {
      all.push(...r.value.data.events);
    }
  }

  return dedupe(
    all
      .filter(e => e.type === 'concert' && e.minPrice >= 50) // seuil artiste majeur
      .sort((a, b) => scoreEvent(b) - scoreEvent(a)),
    size
  );
}

// ─── Top Sports : Football, Basket, F1, Tennis uniquement ────────────────────
// Mots-clés ciblés Ticketmaster — détectés sur la classification genre
const SPORT_KEYWORDS = [
  'football',      // foot européen (La Liga, Bundesliga, Serie A, Ligue 1)
  'soccer',        // terme TM alternatif
  'basketball',    // EuroLeague, NBA Paris, etc.
  'formula 1',     // Grand Prix
  'grand prix',    // F1 / MotoGP
  'tennis',        // ATP, WTA, Roland-Garros, Wimbledon qualif.
  'ATP',
  'Champions League',
  'UEFA',
  'NBA',
] as const;

async function fetchTopSports(size = 20): Promise<Event[]> {
  // On parallélise : 4 pays × quelques keywords ciblés
  const searches = SPORT_KEYWORDS.slice(0, 6).flatMap(kw =>
    COUNTRIES.map(cc =>
      searchEvents({
        keyword:    kw,
        countryCode: cc,
        segmentId: TM_SEGMENTS.sports,
        sort:       'relevance,desc',
        size:       5,
      })
    )
  );

  const results = await Promise.allSettled(searches);
  const all: Event[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.success && r.value.data?.events) {
      all.push(...r.value.data.events);
    }
  }

  // Garder uniquement les disciplines cibles
  const ALLOWED_CATEGORIES = [
    'football', 'soccer', 'basketball', 'formula 1', 'motorsport', 'tennis',
    'f1', 'grand prix', 'football european', 'football club',
  ];
  function isSportAllowed(e: Event): boolean {
    const cat = (e.category || '').toLowerCase();
    const title = e.title.toLowerCase();
    return (
      ALLOWED_CATEGORIES.some(c => cat.includes(c) || title.includes(c)) ||
      title.includes('formula') || title.includes('grand prix') ||
      title.includes('tennis') || title.includes('basketball') ||
      title.includes('champions league') || title.includes('ligue 1') ||
      title.includes('la liga') || title.includes('serie a') ||
      title.includes('bundesliga') || title.includes('premier league') ||
      title.includes('nba') || title.includes('euroleague') ||
      title.includes('roland') || title.includes('wimbledon') ||
      title.includes('us open') || title.includes('atp') || title.includes('wta')
    );
  }

  return dedupe(
    all
      .filter(e => e.type === 'sport' && e.minPrice >= 25 && isSportAllowed(e))
      .sort((a, b) => scoreEvent(b) - scoreEvent(a)),
    size
  );
}

// ─── Top Festivals : grands festivals uniquement (minPrice ≥ 60 €) ───────────
async function fetchTopFestivals(size = 20): Promise<Event[]> {
  const results = await Promise.allSettled(
    COUNTRIES.map(cc =>
      searchEvents({
        keyword:     'festival',
        countryCode:  cc,
        segmentId:   TM_SEGMENTS.music,
        sort:        'relevance,desc',
        size:        Math.ceil(size / 2),
      })
    )
  );

  const all: Event[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.success && r.value.data?.events) {
      all.push(...r.value.data.events);
    }
  }

  return dedupe(
    all
      .filter(e =>
        (e.type === 'festival' || e.type === 'concert') &&
        e.minPrice >= 60 && // grand festival = billet cher
        (
          e.title.toLowerCase().includes('festival') ||
          e.category?.toLowerCase().includes('festival') ||
          e.title.toLowerCase().includes('fest') ||
          e.title.toLowerCase().includes('open air') ||
          e.title.toLowerCase().includes('summer') ||
          e.title.toLowerCase().includes('rock am') ||
          e.title.toLowerCase().includes('lollapalooza') ||
          e.title.toLowerCase().includes('primavera') ||
          e.title.toLowerCase().includes('coachella') ||
          e.title.toLowerCase().includes('tomorrowland')
        )
      )
      .sort((a, b) => scoreEvent(b) - scoreEvent(a)),
    size
  );
}

// ─── Recherche standard (avec filtre + score) pour les recherches manuelles ───
async function searchMultiCountry(params: {
  keyword?: string;
  segmentId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
}) {
  const { keyword, segmentId, dateFrom, dateTo, page, size } = params;
  const perCountry = Math.ceil(size / 4);

  const [frRes, esRes, itRes, deRes] = await Promise.allSettled([
    searchEvents({ keyword, countryCode: 'FR', segmentId, dateFrom, dateTo, page, size: perCountry, sort: 'relevance,desc' }),
    searchEvents({ keyword, countryCode: 'ES', segmentId, dateFrom, dateTo, page, size: perCountry, sort: 'relevance,desc' }),
    searchEvents({ keyword, countryCode: 'IT', segmentId, dateFrom, dateTo, page, size: perCountry, sort: 'relevance,desc' }),
    searchEvents({ keyword, countryCode: 'DE', segmentId, dateFrom, dateTo, page, size: perCountry, sort: 'relevance,desc' }),
  ]);

  const all: Event[] = [];
  for (const r of [frRes, esRes, itRes, deRes]) {
    if (r.status === 'fulfilled' && r.value.success && r.value.data?.events) {
      all.push(...r.value.data.events);
    }
  }

  return dedupe(
    all
      .filter(e => ['concert', 'festival', 'sport'].includes(e.type) && e.minPrice > 25)
      .sort((a, b) => scoreEvent(b) - scoreEvent(a)),
    size
  );
}

// ─── Handler principal ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  const q        = sp.get('q')        || '';
  const city     = sp.get('city')     || undefined;
  const country  = sp.get('country')  || undefined;
  const lat      = sp.get('lat');
  const lng      = sp.get('lng');
  const radius   = parseInt(sp.get('radius') || '50');
  const type     = sp.get('type')     || undefined;
  const dateFrom = sp.get('dateFrom') || undefined;
  const dateTo   = sp.get('dateTo')   || undefined;
  const page     = parseInt(sp.get('page') || '0');
  const size     = Math.min(parseInt(sp.get('size') || '20'), 50);

  // Fallback si pas de clé API
  if (!process.env.TICKETMASTER_API_KEY) {
    const mockResults = filterMockEvents(q, city, country, type, size);
    return NextResponse.json({ success: true, events: mockResults, total: mockResults.length, page: 0, size, totalPages: 1, source: 'mock' });
  }

  const segmentMap: Record<string, string> = {
    music: TM_SEGMENTS.music, sports: TM_SEGMENTS.sports, arts: TM_SEGMENTS.arts,
  };
  const segmentId = type ? segmentMap[type] : undefined;

  try {
    // ── Recherche géolocalisée ───────────────────────────────────────────────
    if (lat && lng) {
      const result = await searchEvents({
        keyword: q || undefined, geoPoint: `${lat},${lng}`, radius,
        segmentId, dateFrom, dateTo, page, size, sort: 'date,asc',
      });
      if (result.success && result.data?.events?.length) {
        return NextResponse.json(
          { success: true, events: result.data.events, total: result.data.total, page: result.data.page, size: result.data.size, totalPages: result.data.totalPages, source: 'ticketmaster' },
          { headers: { 'Cache-Control': 'public, s-maxage=300' } }
        );
      }
    }

    // ── Recherche dans un pays ou une ville précise ──────────────────────────
    if (country || city) {
      const result = await searchEvents({
        keyword: q || undefined, city, countryCode: country,
        segmentId, dateFrom, dateTo, page, size, sort: 'relevance,desc',
      });
      if (result.success && result.data?.events?.length) {
        return NextResponse.json(
          { success: true, events: result.data.events, total: result.data.total, page: result.data.page, size: result.data.size, totalPages: result.data.totalPages, source: 'ticketmaster' },
          { headers: { 'Cache-Control': 'public, s-maxage=300' } }
        );
      }
    }

    // ── Homepage : TOP événements par catégorie ──────────────────────────────
    if (!q && !country && !city) {
      const [concerts, sports, festivals] = await Promise.allSettled([
        fetchTopConcerts(20),
        fetchTopSports(20),
        fetchTopFestivals(20),
      ]);

      const topConcerts  = concerts.status  === 'fulfilled' ? concerts.value  : [];
      const topSports    = sports.status    === 'fulfilled' ? sports.value    : [];
      const topFestivals = festivals.status === 'fulfilled' ? festivals.value : [];

      // Mélange : d'abord les sports, puis concerts, puis festivals (ordre éditorial)
      const allTop = [...topSports, ...topConcerts, ...topFestivals];

      if (allTop.length > 0) {
        return NextResponse.json(
          { success: true, events: allTop, total: allTop.length, page: 0, size: allTop.length, totalPages: 1, source: 'ticketmaster', categories: { concerts: topConcerts.length, sports: topSports.length, festivals: topFestivals.length } },
          { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' } }
        );
      }
    }

    // ── Recherche par mot-clé ────────────────────────────────────────────────
    if (q) {
      const multiEvents = await searchMultiCountry({ keyword: q, segmentId, dateFrom, dateTo, page, size });
      if (multiEvents.length > 0) {
        return NextResponse.json(
          { success: true, events: multiEvents, total: multiEvents.length, page: 0, size, totalPages: 1, source: 'ticketmaster' },
          { headers: { 'Cache-Control': 'public, s-maxage=180' } }
        );
      }
    }

    // Fallback mock
    const mockResults = filterMockEvents(q, city, country, type, size);
    return NextResponse.json(
      { success: true, events: mockResults, total: mockResults.length, page: 0, size, totalPages: 1, source: 'mock_empty' },
      { headers: { 'Cache-Control': 'public, s-maxage=60' } }
    );

  } catch (error) {
    console.error('[/api/events] Error:', error);
    const mockResults = filterMockEvents(q, city, country, type, size);
    return NextResponse.json({ success: true, events: mockResults, total: mockResults.length, page: 0, size, totalPages: 1, source: 'mock_error' });
  }
}
