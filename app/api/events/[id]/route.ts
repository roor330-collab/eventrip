/**
 * GET /api/events/[id]
 * Retourne les détails complets d'un événement par son ID.
 * 1. Si id commence par "mock-" → lookup direct dans les mocks
 * 2. Sinon → appel Ticketmaster getEventById
 * 3. Fallback sur le 1er mock (ne jamais retourner 404 en démo)
 * Garantit minPrice > 0 et injecte des ticketCategories enrichies.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventById } from '@/lib/api/ticketmaster';
import { Event } from '@/types';

// ─── Même mock que /api/events, avec descriptions longues ────────────────────
const MOCK_EVENTS: Event[] = [
  {
    id: 'mock-cold-paris-26',
    title: 'Coldplay – Music of the Spheres World Tour',
    description: 'La tournée mondiale la plus ambitieuse de Coldplay arrive à Paris pour une soirée inoubliable. Effets visuels époustouflants, bracelets LED synchronisés et setlist de 3 heures.',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80',
    venue: 'Stade de France', city: 'Paris', country: 'France',
    date: '2026-06-15', startTime: '20:00:00', type: 'concert', category: 'Rock',
    artists: ['Coldplay'], ticketsAvailable: 312, minPrice: 65, maxPrice: 220,
    latitude: 48.9244, longitude: 2.3601, source: 'ticketmaster',
  },
  {
    id: 'mock-rolgar-paris-26',
    title: 'Roland-Garros 2026 – Finale Messieurs',
    description: 'La finale de Roland-Garros sur le mythique Court Philippe-Chatrier. Deux semaines de compétition intense se concluent par le match ultime sur la terre battue parisienne.',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80',
    venue: 'Stade Roland-Garros', city: 'Paris', country: 'France',
    date: '2026-06-07', startTime: '15:00:00', type: 'sport', category: 'Tennis',
    artists: [], ticketsAvailable: 83, minPrice: 120, maxPrice: 600,
    latitude: 48.8472, longitude: 2.2484, source: 'ticketmaster',
  },
  {
    id: 'mock-lolla-paris-26',
    title: 'Lollapalooza Paris 2026',
    description: 'Lollapalooza à Paris au Hippodrome de Longchamp — 3 jours de musique avec les plus grandes stars de la scène internationale. 8 scènes simultanées, plus de 100 artistes.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    venue: 'Hippodrome de Longchamp', city: 'Paris', country: 'France',
    date: '2026-07-17', startTime: '12:00:00', type: 'festival', category: 'Festival',
    artists: ['The Weeknd', 'Kendrick Lamar', 'Billie Eilish'],
    ticketsAvailable: 418, minPrice: 110, maxPrice: 250,
    latitude: 48.8548, longitude: 2.2383, source: 'ticketmaster',
  },
  {
    id: 'mock-barca-concert-26',
    title: 'Bad Bunny – Most Wanted Tour',
    description: 'El Conejo Malo débarque à Barcelone pour un show explosif mêlant reggaeton, trap latin et performance scénique de niveau mondial.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    venue: 'Estadi Olímpic Lluís Companys', city: 'Barcelone', country: 'Espagne',
    date: '2026-07-10', startTime: '21:00:00', type: 'concert', category: 'Latin',
    artists: ['Bad Bunny'], ticketsAvailable: 214, minPrice: 75, maxPrice: 300,
    latitude: 41.3649, longitude: 2.1558, source: 'ticketmaster',
  },
  {
    id: 'mock-liga-madrid-26',
    title: 'Real Madrid vs FC Barcelona – El Clásico',
    description: 'Le match le plus regardé au monde. Deux des plus grands clubs s\'affrontent au légendaire Santiago Bernabéu dans une atmosphère électrique.',
    image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80',
    venue: 'Santiago Bernabéu', city: 'Madrid', country: 'Espagne',
    date: '2026-05-23', startTime: '21:00:00', type: 'sport', category: 'Football',
    artists: [], ticketsAvailable: 62, minPrice: 150, maxPrice: 800,
    latitude: 40.4531, longitude: -3.6883, source: 'ticketmaster',
  },
  {
    id: 'mock-primavera-bcn-26',
    title: 'Primavera Sound Barcelona 2026',
    description: 'Le festival Primavera Sound revient avec une programmation internationale de rêve au bord de la mer. 4 jours, plus de 200 artistes.',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80',
    venue: 'Parc del Fòrum', city: 'Barcelone', country: 'Espagne',
    date: '2026-05-28', startTime: '16:00:00', type: 'festival', category: 'Festival',
    artists: ['Radiohead', 'Charli XCX', 'FKA twigs'],
    ticketsAvailable: 523, minPrice: 195, maxPrice: 280,
    latitude: 41.4097, longitude: 2.2234, source: 'ticketmaster',
  },
  {
    id: 'mock-rome-concert-26',
    title: 'Måneskin – Rush! Tour Roma',
    description: 'Les Måneskin en concert dans leur ville natale au mythique Circo Massimo. Un retour aux sources pour le groupe qui a conquis le monde depuis sa victoire à l\'Eurovision.',
    image: 'https://images.unsplash.com/photo-1478147427282-58a87a433b2a?w=1200&q=80',
    venue: 'Circo Massimo', city: 'Rome', country: 'Italie',
    date: '2026-07-04', startTime: '21:00:00', type: 'concert', category: 'Rock',
    artists: ['Måneskin'], ticketsAvailable: 347, minPrice: 55, maxPrice: 180,
    latitude: 41.8858, longitude: 12.4854, source: 'ticketmaster',
  },
  {
    id: 'mock-milan-f1-26',
    title: 'Grand Prix d\'Italie F1 2026 – Monza',
    description: 'La cathédrale de la vitesse. Le Grand Prix d\'Italie à Monza offre l\'une des expériences les plus intenses du calendrier F1.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
    venue: 'Autodromo Nazionale di Monza', city: 'Milan', country: 'Italie',
    date: '2026-09-06', startTime: '15:00:00', type: 'sport', category: 'Motorsport',
    artists: [], ticketsAvailable: 128, minPrice: 89, maxPrice: 450,
    latitude: 45.6156, longitude: 9.2811, source: 'ticketmaster',
  },
  {
    id: 'mock-milan-concert-26',
    title: 'Taylor Swift – The Eras Tour Milano',
    description: 'Le show le plus spectaculaire de la décennie. Taylor Swift revisite 17 ans de carrière en 3h30 de spectacle total : décors géants, costumes à couper le souffle, setlist de 44 titres.',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
    venue: 'Stadio San Siro', city: 'Milan', country: 'Italie',
    date: '2026-07-13', startTime: '19:30:00', type: 'concert', category: 'Pop',
    artists: ['Taylor Swift'], ticketsAvailable: 152, minPrice: 95, maxPrice: 320,
    latitude: 45.4781, longitude: 9.1239, source: 'ticketmaster',
  },
  {
    id: 'mock-rammstein-berlin-26',
    title: 'Rammstein – Zeit Tour',
    description: 'Rammstein déploie son show pyrotechnique spectaculaire à l\'Olympiastadion de Berlin. Flammes, explosions, machines de guerre industrielles — le concert le plus extrême d\'Europe.',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    venue: 'Olympiastadion Berlin', city: 'Berlin', country: 'Allemagne',
    date: '2026-06-20', startTime: '20:00:00', type: 'concert', category: 'Metal',
    artists: ['Rammstein'], ticketsAvailable: 287, minPrice: 75, maxPrice: 250,
    latitude: 52.5147, longitude: 13.2395, source: 'ticketmaster',
  },
  {
    id: 'mock-rockamring-26',
    title: 'Rock am Ring 2026',
    description: 'Le plus grand festival rock d\'Allemagne au Nürburgring. 3 jours, 90 000 personnes par jour, 85 artistes sur 4 scènes.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
    venue: 'Nürburgring', city: 'Nürburg', country: 'Allemagne',
    date: '2026-06-05', startTime: '12:00:00', type: 'festival', category: 'Festival',
    artists: ['Metallica', 'Billie Eilish', 'Twenty One Pilots'],
    ticketsAvailable: 612, minPrice: 180, maxPrice: 299,
    latitude: 50.3358, longitude: 6.9475, source: 'ticketmaster',
  },
  {
    id: 'mock-bvb-munich-26',
    title: 'Borussia Dortmund vs Bayern Munich – Der Klassiker',
    description: 'Le choc au sommet de la Bundesliga dans l\'atmosphère incandescente du Signal Iduna Park. Le Mur Jaune crée l\'ambiance la plus intense du football européen.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
    venue: 'Signal Iduna Park', city: 'Dortmund', country: 'Allemagne',
    date: '2026-11-07', startTime: '18:30:00', type: 'sport', category: 'Football',
    artists: [], ticketsAvailable: 94, minPrice: 45, maxPrice: 350,
    latitude: 51.4926, longitude: 7.4517, source: 'ticketmaster',
  },
];

// ─── Infos pratiques par venue ───────────────────────────────────────────────
const VENUE_INFO: Record<string, { type: string; location: string; transport: string[]; parking: string }> = {
  'mock-cold-paris-26':    { type: 'Stade extérieur · 80 000 places', location: 'Saint-Denis, 10 km au nord de Paris', transport: ['RER B & D (Stade de France)', 'Metro 13 (Basilique de Saint-Denis)'], parking: 'Parkings P1–P7 sur site (réservation conseillée)' },
  'mock-rolgar-paris-26':  { type: 'Stade semi-couvert · 15 000 places', location: 'Boulogne-Billancourt, 8 km à l\'ouest de Paris', transport: ['Metro 9 (Exelmans)', 'Bus 72 & 126'], parking: 'Aucun parking sur site — accès en transport recommandé' },
  'mock-lolla-paris-26':   { type: 'Site en plein air · 60 000 pers./jour', location: 'Bois de Boulogne, 10 km à l\'ouest de Paris', transport: ['RER C (Boulainvilliers)', 'Bus 244 & navettes festival'], parking: 'Parking Longchamp disponible (payant, capacité limitée)' },
  'mock-barca-concert-26': { type: 'Stade extérieur · 56 000 places', location: 'Montjuïc, 3 km du centre de Barcelone', transport: ['Bus 150 (Montjuïc)', 'Funiculaire depuis Paral·lel'], parking: 'Parking limité — accès en transport fortement conseillé' },
  'mock-liga-madrid-26':   { type: 'Stade couvert · 83 000 places', location: 'Quartier Castellana, centre-ville de Madrid', transport: ['Metro 10 (Santiago Bernabéu)', 'Bus 43, 120, 147'], parking: 'Parking souterrain sur site (5 000 places, accès Paseo de la Castellana)' },
  'mock-primavera-bcn-26': { type: 'Site en plein air · 50 000 pers.', location: 'Bord de mer (Sant Adrià), 8 km du centre', transport: ['Metro L4 (El Maresme / Fòrum)', 'Tramway T4'], parking: 'Aucun parking sur site — accès en transport uniquement' },
  'mock-rome-concert-26':  { type: 'Site archéologique en plein air · 250 000 pers.', location: 'Centre historique de Rome (Circus Maximus)', transport: ['Metro B (Circo Massimo)', 'Tram 3 & Bus 81'], parking: 'Très limité — accès en transport ou à pied recommandé' },
  'mock-milan-f1-26':      { type: 'Circuit automobile extérieur', location: 'Monza, 15 km au nord de Milan', transport: ['Train Intercity Milan–Monza (20 min)', 'Navettes depuis Milan Centrale'], parking: 'Grands parkings autour du circuit (réservation obligatoire pour les GP)' },
  'mock-milan-concert-26': { type: 'Stade extérieur · 80 000 places', location: '7 km au nord-ouest du centre de Milan', transport: ['Metro M5 (San Siro Stadio)', 'Tram 16 depuis Duomo'], parking: 'Parking San Siro disponible (payant, accès Via Harar)' },
  'mock-rammstein-berlin-26': { type: 'Stade extérieur · 74 000 places', location: '7 km à l\'ouest du centre de Berlin', transport: ['Metro U2 (Olympia-Stadion)', 'S-Bahn S5 & S75'], parking: 'Parking Olympiastadion disponible (payant, accès Olympischer Platz)' },
  'mock-rockamring-26':    { type: 'Circuit en zone rurale · 90 000 pers./jour', location: 'Nürburg, 80 km au sud de Cologne (zone rurale)', transport: ['Navettes officielles depuis Cologne, Francfort, Bonn', 'Pas de transport régulier'], parking: 'Immenses parkings gratuits sur site (camping car & voiture)' },
  'mock-bvb-munich-26':    { type: 'Stade extérieur · 81 365 places', location: '3 km au sud du centre de Dortmund', transport: ['Metro U45 & U46 (Stadion)', 'S-Bahn S1 (Dortmund Bf)'], parking: 'Parkings P1–P5 autour du stade (réservation recommandée les jours de match)' },
};

// ─── Catégories de billets — liste complète triée du plus cher au moins cher ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getTicketCategories(event: Event & { priceRanges?: any[] }, soldOut: boolean) {
  const base = event.minPrice > 0 ? event.minPrice : 45;
  const top  = event.maxPrice > 0 ? event.maxPrice : base * 4;
  const avail = (n: number) => soldOut ? 0 : Math.max(10, 400 - n * 35);

  // Si TM renvoie plusieurs plages de prix, on les exploite directement (triées par prix desc)
  if (event.priceRanges && event.priceRanges.length >= 2) {
    return [...event.priceRanges]
      .sort((a, b) => (b.min ?? 0) - (a.min ?? 0))
      .map((range, idx) => ({
        id: `tier-${idx}`,
        name: (range.name || range.type || `CATEGORIE ${idx + 1}`).toUpperCase(),
        price: Math.round(range.min ?? base),
        desc: '',
        available: avail(idx),
        badge: idx === 0 ? 'VIP' : '',
      }));
  }

  // Interpolation linéaire sur toute la plage
  const p = (n: number, total: number) =>
    Math.round(top - ((top - base) / (total - 1)) * n);

  if (event.type === 'sport') {
    const cats = [
      'LOS VECINOS', 'CARRE OR ALLEE', 'CARRE OR',
      'PELOUSE OR DROITE', 'PELOUSE OR GAUCHE', 'PIT A', 'PIT B',
      'CATEGORIE 1 ALLEE', 'CATEGORIE 2 ALLEE',
      'CATEGORIE 1', 'CATEGORIE 1 COTE SCENE', 'CATEGORIE 1 VISIBILITE REDUITE',
      'CATEGORIE 2', 'CATEGORIE 2 COTE SCENE', 'CATEGORIE 2 VISIBILITE REDUITE',
      'PELOUSE', 'CATEGORIE 3', 'CATEGORIE 3 COTE SCENE', 'CATEGORIE 3 VISIBILITE REDUITE',
    ];
    return cats.map((name, idx) => ({
      id: `s${idx}`, name, price: p(idx, cats.length),
      desc: '', available: avail(idx),
      badge: idx === 0 ? 'VIP' : idx === 9 ? 'Populaire' : '',
    }));
  }

  if (event.type === 'festival') {
    const cats = [
      'VIP PREMIUM 3 JOURS', 'VIP WEEKEND', 'EARLY BIRD VIP',
      'PASS 3 JOURS', 'PASS WEEKEND', 'PASS 2 JOURS',
      '1 JOUR VENDREDI', '1 JOUR SAMEDI', '1 JOUR DIMANCHE',
    ];
    return cats.map((name, idx) => ({
      id: `f${idx}`, name, price: p(idx, cats.length),
      desc: '', available: avail(idx),
      badge: idx === 0 ? 'VIP' : idx === 3 ? 'Populaire' : '',
    }));
  }

  // concert (default)
  const cats = [
    'CARRE OR VIP', 'FOSSE OR', 'CARRE OR STANDING', 'CARRE OR',
    'FOSSE NUMEROTEE', 'CATEGORIE 1', 'CATEGORIE 1 COTE SCENE',
    'CATEGORIE 1 VISIBILITE REDUITE', 'CATEGORIE 2', 'CATEGORIE 2 COTE SCENE',
    'CATEGORIE 2 VISIBILITE REDUITE', 'FOSSE STANDING', 'CATEGORIE 3',
  ];
  return cats.map((name, idx) => ({
    id: `c${idx}`, name, price: p(idx, cats.length),
    desc: '', available: avail(idx),
    badge: idx === 0 ? 'VIP' : idx === 5 ? 'Populaire' : '',
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichEvent(event: Event & { priceRanges?: any[]; ticketUrl?: string; status?: string }) {
  const minPrice = event.minPrice > 0 ? event.minPrice : 45;
  const maxPrice = event.maxPrice > 0 ? event.maxPrice : minPrice * 3;
  const enriched = { ...event, minPrice, maxPrice };

  // Sold-out : TM status "offsale" | "cancelled" | "postponed" ou ticketsAvailable === 0
  const tmStatus = (event.status || '').toLowerCase();
  const soldOut  = tmStatus === 'offsale' || tmStatus === 'cancelled' || event.ticketsAvailable === 0;

  return {
    ...enriched,
    soldOut,
    ticketCategories: getTicketCategories(enriched, soldOut),
    ticketUrl:   event.ticketUrl || null,
    seatMapUrl:  (event as any).seatMap || null,
    venueInfo:   VENUE_INFO[event.id] || null,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // 1. IDs mock → lookup direct (toujours fonctionnel)
  if (id.startsWith('mock-')) {
    const mock = MOCK_EVENTS.find(e => e.id === id);
    if (mock) {
      return NextResponse.json({ success: true, data: enrichEvent(mock) });
    }
  }

  // 2. ID Ticketmaster réel
  if (process.env.TICKETMASTER_API_KEY) {
    try {
      const result = await getEventById(id);
      if (result.success && result.data) {
        return NextResponse.json(
          { success: true, data: enrichEvent(result.data) },
          { headers: { 'Cache-Control': 'public, s-maxage=900' } }
        );
      }
    } catch (err) {
      console.error('[/api/events/[id]] TM error:', err);
    }
  }

  // 3. Fallback fuzzy sur mocks
  const lc = id.toLowerCase();
  const fuzzy = MOCK_EVENTS.find(e =>
    e.title.toLowerCase().includes(lc) || e.id.includes(lc)
  );
  if (fuzzy) {
    return NextResponse.json({ success: true, data: enrichEvent(fuzzy) });
  }

  // 4. Dernier recours : 1er mock (ne jamais afficher "introuvable" en démo)
  return NextResponse.json({ success: true, data: enrichEvent(MOCK_EVENTS[0]) });
}
