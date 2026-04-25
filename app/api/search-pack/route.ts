/**
 * POST /api/search-pack
 * ─────────────────────────────────────────────────────────────────────────────
 * Route principale du moteur de packaging dynamique.
 * Synchronise en parallèle les 3 requêtes : Événement + Vols + Hôtels.
 * Renvoie un pack complet avec fallbacks par composant.
 *
 * Body JSON:
 * {
 *   eventId:       string           — ID Ticketmaster de l'événement
 *   eventDate:     string           — YYYY-MM-DD
 *   venueLat:      number           — latitude du lieu
 *   venueLng:      number           — longitude du lieu
 *   venueCity:     string           — code ville Amadeus (ex: "PAR")
 *   departureCity: string           — ville de départ (ex: "Lyon")
 *   adults:        number           — nb voyageurs
 *   nights:        number           — durée séjour (défaut: 2)
 *   includeTransport: boolean       — inclure vols dans le pack
 *   includeHotel:  boolean          — inclure hôtels dans le pack
 * }
 *
 * Réponse:
 * {
 *   success: true,
 *   data: {
 *     event:     Event | null,
 *     flights:   Flight[],
 *     hotels:    Hotel[],
 *     fallbacks: string[],    // liste des composants en mode dégradé
 *     packId:    string,      // ID unique de session (pour live-check)
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getEventById, checkEventAvailability } from '@/lib/api/ticketmaster';
import { searchFlights, searchHotels, CITY_TO_IATA, CITY_CODE } from '@/lib/api/amadeus';
import { getNearestAirport } from '@/lib/api/amadeus';
import { supabase } from '@/lib/supabase';
import { addDays } from '@/lib/api-client';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: 'Body JSON invalide' }, { status: 400 }); }

  const {
    eventId,
    eventDate,
    venueLat,
    venueLng,
    venueCity,
    departureCity,
    adults = 1,
    nights = 2,
    includeTransport = true,
    includeHotel = true,
  } = body;

  if (!eventId || !eventDate) {
    return NextResponse.json({ success: false, error: 'eventId et eventDate sont requis' }, { status: 400 });
  }

  const fallbacks: string[] = [];
  const packId = randomUUID();

  // ─── Lancer les 3 requêtes en parallèle ────────────────────────────────────
  const promises: Promise<any>[] = [
    getEventById(eventId),
  ];

  // Déterminer l'IATA de destination depuis les coordonnées GPS du venue
  let destIATA = CITY_TO_IATA[venueCity] || 'CDG';
  if (venueLat && venueLng && !CITY_TO_IATA[venueCity]) {
    // Chercher l'aéroport le plus proche du venue
    promises.push(getNearestAirport(venueLat, venueLng).then(iata => {
      if (iata) destIATA = iata;
    }));
  }

  const [eventResult] = await Promise.all(promises);

  // ─── Vols ──────────────────────────────────────────────────────────────────
  let flights: any[] = [];
  if (includeTransport && departureCity && destIATA) {
    const flightResult = await searchFlights({
      originCity:      departureCity,
      destinationIATA: destIATA,
      eventDate,
      adults,
      returnDays: 1,
    });

    if (flightResult.success && flightResult.data?.length) {
      flights = flightResult.data;
    } else {
      fallbacks.push('transport');
      console.warn('[search-pack] Vols non disponibles:', flightResult.error);
    }
  }

  // ─── Hôtels ────────────────────────────────────────────────────────────────
  let hotels: any[] = [];
  if (includeHotel && venueLat && venueLng) {
    // Check-in : veille de l'événement si vol trouvé, jour J sinon
    const checkIn = flights.length ? addDays(eventDate, -1) : eventDate;
    const cityCode = CITY_CODE[venueCity] || venueCity;

    const hotelResult = await searchHotels({
      venueLat,
      venueLng,
      cityCode,
      checkIn,
      nights: nights || 2,
      adults,
      radiusKm: 5,
    });

    if (hotelResult.success && hotelResult.data?.length) {
      hotels = hotelResult.data;
    } else {
      fallbacks.push('hotel');
      console.warn('[search-pack] Hôtels non disponibles:', hotelResult.error);
    }
  }

  // ─── Disponibilité événement ────────────────────────────────────────────────
  const availability = await checkEventAvailability(eventId);
  if (!availability.available) {
    fallbacks.push('ticket');
  }

  // ─── Sauvegarder la session de recherche en Supabase ─────────────────────
  try {
    await supabase.from('search_sessions').insert({
      id:             packId,
      event_id:       eventId,
      event_date:     eventDate,
      departure_city: departureCity,
      adults,
      nights,
      flights_count:  flights.length,
      hotels_count:   hotels.length,
      fallbacks:      fallbacks,
      created_at:     new Date().toISOString(),
    });
  } catch (dbErr) {
    // Non bloquant — le pack est renvoyé même si la DB échoue
    console.error('[search-pack] Supabase insert failed:', dbErr);
  }

  return NextResponse.json({
    success: true,
    data: {
      event:     eventResult.data || null,
      flights:   flights.slice(0, 5),   // max 5 options de vol
      hotels:    hotels.slice(0, 5),    // max 5 hôtels
      fallbacks,
      packId,
      searchedAt: new Date().toISOString(),
      meta: {
        destIATA,
        departureCity,
        eventDate,
        adults,
        nights,
        availability,
      },
    },
  });
}
