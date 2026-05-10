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

const MOCK_EVENTS: Event[] = [
  { id: 'mock-cold-paris-26', title: 'Coldplay – Music of the Spheres World Tour', description: 'La tournée mondiale la plus ambitieuse de Coldplay arrive à Paris pour une soirée inoubliable. Effets visuels époustouflants, bracelets LED synchronisés et setlist de 3 heures.', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&q=80', venue: 'Stade de France', city: 'Paris', country: 'France', date: '2026-06-15', startTime: '20:00:00', type: 'concert', category: 'Rock', artists: ['Coldplay'], ticketsAvailable: 312, minPrice: 65, maxPrice: 220, latitude: 48.9244, longitude: 2.3601, source: 'ticketmaster' },
  { id: 'mock-rolgar-paris-26', title: 'Roland-Garros 2026 – Finale Messieurs', description: 'La finale de Roland-Garros sur le mythique Court Philippe-Chatrier. Deux semaines de compétition intense.', image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80', venue: 'Stade Roland-Garros', city: 'Paris', country: 'France', date: '2026-06-07', startTime: '15:00:00', type: 'sport', category: 'Tennis', artists: [], ticketsAvailable: 83, minPrice: 120, maxPrice: 600, latitude: 48.8472, longitude: 2.2484, source: 'ticketmaster' },
  { id: 'mock-lolla-paris-26', title: 'Lollapalooza Paris 2026', description: 'Lollapalooza à Paris au Hippodrome de Longchamp — 3 jours de musique avec les plus grandes stars.', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80', venue: 'Hippodrome de Longchamp', city: 'Paris', country: 'France', date: '2026-07-17', startTime: '12:00:00', type: 'festival', category: 'Festival', artists: ['The Weeknd', 'Kendrick Lamar', 'Billie Eilish'], ticketsAvailable: 418, minPrice: 110, maxPrice: 250, latitude: 48.8548, longitude: 2.2383, source: 'ticketmaster' },
  { id: 'mock-barca-concert-26', title: 'Bad Bunny – Most Wanted Tour', description: 'El Conejo Malo débarque à Barcelone pour un show explosif mêlant reggaeton, trap latin et performance scénique.', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80', venue: 'Estadi Olímpic Lluís Companys', city: 'Barcelone', country: 'Espagne', date: '2026-07-10', startTime: '21:00:00', type: 'concert', category: 'Latin', artists: ['Bad Bunny'], ticketsAvailable: 214, minPrice: 75, maxPrice: 300, latitude: 41.3649, longitude: 2.1558, source: 'ticketmaster' },
  { id: 'mock-liga-madrid-26', title: 'Real Madrid vs FC Barcelona – El Clásico', description: 'Le match le plus regardé au monde. Deux des plus grands clubs au légendaire Santiago Bernabéu.', image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?w=1200&q=80', venue: 'Santiago Bernabéu', city: 'Madrid', country: 'Espagne', date: '2026-05-23', startTime: '21:00:00', type: 'sport', category: 'Football', artists: [], ticketsAvailable: 62, minPrice: 150, maxPrice: 800, latitude: 40.4531, longitude: -3.6883, source: 'ticketmaster' },
  { id: 'mock-primavera-bcn-26', title: 'Primavera Sound Barcelona 2026', description: 'Le festival Primavera Sound revient avec une programmation internationale de rêve au bord de la mer.', image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&q=80', venue: 'Parc del Fòrum', city: 'Barcelone', country: 'Espagne', date: '2026-05-28', startTime: '16:00:00', type: 'festival', category: 'Festival', artists: ['Radiohead', 'Charli XCX', 'FKA twigs'], ticketsAvailable: 523, minPrice: 195, maxPrice: 280, latitude: 41.4097, longitude: 2.2234, source: 'ticketmaster' },
  { id: 'mock-rome-concert-26', title: 'Måneskin – Rush! Tour Roma', description: 'Les Måneskin en concert dans leur ville natale au mythique Circo Massimo.', image: 'https://images.unsplash.com/photo-1478147427282-58a87a433b2a?w=1200&q=80', venue: 'Circo Massimo', city: 'Rome', country: 'Italie', date: '2026-07-04', startTime: '21:00:00', type: 'concert', category: 'Rock', artists: ['Måneskin'], ticketsAvailable: 347, minPrice: 55, maxPrice: 180, latitude: 41.8858, longitude: 12.4854, source: 'ticketmaster' },
  { id: 'mock-milan-f1-26', title: "Grand Prix d'Italie F1 2026 – Monza", description: "La cathédrale de la vitesse. Le Grand Prix d'Italie à Monza.", image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80', venue: 'Autodromo Nazionale di Monza', city: 'Milan', country: 'Italie', date: '2026-09-06', startTime: '15:00:00', type: 'sport', category: 'Motorsport', artists: [], ticketsAvailable: 128, minPrice: 89, maxPrice: 450, latitude: 45.6156, longitude: 9.2811, source: 'ticketmaster' },
  { id: 'mock-milan-concert-26', title: 'Taylor Swift – The Eras Tour Milano', description: 'Le show le plus spectaculaire de la décennie. Taylor Swift revisite 17 ans de carrière en 3h30.', image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80', venue: 'Stadio San Siro', city: 'Milan', country: 'Italie', date: '2026-07-13', startTime: '19:30:00', type: 'concert', category: 'Pop', artists: ['Taylor Swift'], ticketsAvailable: 152, minPrice: 95, maxPrice: 320, latitude: 45.4781, longitude: 9.1239, source: 'ticketmaster' },
  { id: 'mock-rammstein-berlin-26', title: 'Rammstein – Zeit Tour', description: "Rammstein déploie son show pyrotechnique à l'Olympiastadion de Berlin. Flammes, explosions, machines industrielles.", image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80', venue: 'Olympiastadion Berlin', city: 'Berlin', country: 'Allemagne', date: '2026-06-20', startTime: '20:00:00', type: 'concert', category: 'Metal', artists: ['Rammstein'], ticketsAvailable: 287, minPrice: 75, maxPrice: 250, latitude: 52.5147, longitude: 13.2395, source: 'ticketmaster' },
  { id: 'mock-rockamring-26', title: 'Rock am Ring 2026', description: "Le plus grand festival rock d'Allemagne au Nürburgring. 3 jours, 90 000 personnes par jour.", image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80', venue: 'Nürburgring', city: 'Nürburg', country: 'Allemagne', date: '2026-06-05', startTime: '12:00:00', type: 'festival', category: 'Festival', artists: ['Metallica', 'Billie Eilish', 'Twenty One Pilots'], ticketsAvailable: 612, minPrice: 180, maxPrice: 299, latitude: 50.3358, longitude: 6.9475, source: 'ticketmaster' },
  { id: 'mock-bvb-munich-26', title: 'Borussia Dortmund vs Bayern Munich – Der Klassiker', description: "Le choc au sommet de la Bundesliga dans l'atmosphère incandescente du Signal Iduna Park.", image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80', venue: 'Signal Iduna Park', city: 'Dortmund', country: 'Allemagne', date: '2026-04-25', startTime: '18:30:00', type: 'sport', category: 'Football', artists: [], ticketsAvailable: 94, minPrice: 45, maxPrice: 350, latitude: 51.4926, longitude: 7.4517, source: 'ticketmaster' },
];

function getTicketCategories(event) {
  const base = event.minPrice > 0 ? event.minPrice : 45;
  const top  = event.maxPrice > 0 ? event.maxPrice : base * 4;
  const mid  = Math.round((base + top) / 2);
  if (event.type === 'sport') return [
    { id: 'virages', name: 'Virages', price: base, desc: 'Tribune latérale, ambiance garantie', available: 120, badge: '' },
    { id: 'tribune', name: 'Tribune', price: mid, desc: 'Vue centrale, places assises', available: 64, badge: 'Populaire' },
    { id: 'prestige', name: 'Prestige', price: top, desc: 'Loge VIP, accès hospitality inclus', available: 18, badge: 'VIP' },
  ];
  if (event.type === 'festival') return [
    { id: 'pass1j', name: '1 Jour', price: base, desc: 'Accès 1 journée au choix', available: 350, badge: '' },
    { id: 'pass3j', name: '3 Jours', price: Math.round(base * 2.2), desc: 'Pass 3 jours complet', available: 200, badge: 'Populaire' },
    { id: 'passvip', name: 'VIP Pass', price: top, desc: 'VIP lounge & open bar inclus', available: 45, badge: 'VIP' },
  ];
  return [
    { id: 'fosse', name: 'Fosse', price: base, desc: 'Accès fosse debout, proche scène', available: 180, badge: '' },
    { id: 'tribune', name: 'Tribune', price: mid, desc: 'Places assises numérotées', available: 95, badge: 'Populaire' },
    { id: 'vip', name: 'VIP', price: top, desc: 'Backstage + rencontre artiste', available: 22, badge: 'VIP' },
  ];
}

function enrichEvent(event) {
  const minPrice = event.minPrice > 0 ? event.minPrice : 45;
  const maxPrice = event.maxPrice > 0 ? event.maxPrice : minPrice * 3;
  const enriched = { ...event, minPrice, maxPrice };
  return { ...enriched, ticketCategories: getTicketCategories(enriched) };
}

export async function GET(_req, { params }) {
  const { id } = params;
  if (id.startsWith('mock-')) {
    const mock = MOCK_EVENTS.find(e => e.id === id);
    if (mock) return NextResponse.json({ success: true, data: enrichEvent(mock) });
  }
  if (process.env.TICKETMASTER_API_KEY) {
    try {
      const result = await getEventById(id);
      if (result.success && result.data) {
        return NextResponse.json({ success: true, data: enrichEvent(result.data) }, { headers: { 'Cache-Control': 'public, s-maxage=900' } });
      }
    } catch (err) { console.error('[/api/events/[id]] TM error:', err); }
  }
  const lc = id.toLowerCase();
  const fuzzy = MOCK_EVENTS.find(e => e.title.toLowerCase().includes(lc) || e.id.includes(lc));
  if (fuzzy) return NextResponse.json({ success: true, data: enrichEvent(fuzzy) });
  return NextResponse.json({ success: true, data: enrichEvent(MOCK_EVENTS[0]) });
}
