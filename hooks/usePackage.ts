/**
 * usePackage — Hook React pour le pack builder
 * Wraps le store global, déclenche /api/search-pack,
 * et expose les handlers UI.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { store, PackageState } from '@/lib/store';
import { Event, Flight, Hotel } from '@/types';

export function usePackage() {
  const [pkg, setPkg] = useState<PackageState>(store.getPackage());

  useEffect(() => {
    store.init();
    setPkg(store.getPackage());
    const unsub = store.subscribe<PackageState>('pkg', setPkg);
    return () => unsub();
  }, []);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const selectEvent = useCallback((event: Event) => {
    store.setEvent(event);
  }, []);

  const selectTicket = useCallback((zone: string, price: number) => {
    store.setTicket(zone, price);
  }, []);

  const selectFlight = useCallback((flight: Flight | null) => {
    store.setFlight(flight);
  }, []);

  const selectHotel = useCallback((hotel: Hotel | null) => {
    store.setHotel(hotel);
  }, []);

  const setAdults = useCallback((n: number) => {
    store.setAdults(n);
  }, []);

  const setDepartureCity = useCallback((city: string) => {
    store.setDepartureCity(city);
  }, []);

  const setNights = useCallback((n: number) => {
    store.setNights(n);
  }, []);

  const reset = useCallback(() => {
    store.resetPackage();
  }, []);

  // ─── Search-pack — appelle /api/search-pack ───────────────────────────────
  const [packLoading, setPackLoading] = useState(false);
  const [packError,   setPackError]   = useState<string | null>(null);
  const [packData,    setPackData]    = useState<{
    flights: Flight[];
    hotels:  Hotel[];
    fallbacks: string[];
  } | null>(null);

  const searchPack = useCallback(async () => {
    const { event, adults, departureCity, nights } = store.getPackage();
    if (!event) return;

    setPackLoading(true);
    setPackError(null);
    store.setStatus('searching');

    try {
      const res = await fetch('/api/search-pack', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId:       event.externalId || event.id,
          eventDate:     event.date,
          venueLat:      event.latitude,
          venueLng:      event.longitude,
          venueCity:     event.city,
          departureCity,
          adults,
          nights,
          includeTransport: true,
          includeHotel:     true,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Erreur serveur');

      const { packId, flights, hotels, fallbacks } = json.data;

      store.setPackId(packId);
      store.setStatus('ready');
      setPackData({ flights, hotels, fallbacks });

      // Pré-sélectionner le premier vol et premier hôtel
      if (flights?.length)  store.setFlight(flights[0]);
      if (hotels?.length)   store.setHotel(hotels[0]);

    } catch (err: any) {
      setPackError(err.message);
      store.setStatus('idle');
    } finally {
      setPackLoading(false);
    }
  }, []);

  return {
    pkg,
    // Données pack
    packData,
    packLoading,
    packError,
    // Actions
    selectEvent,
    selectTicket,
    selectFlight,
    selectHotel,
    setAdults,
    setDepartureCity,
    setNights,
    searchPack,
    reset,
  };
}
