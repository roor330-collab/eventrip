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

  const selectEvent = useCallback((event: Event) => store.setEvent(event), []);
  const selectFliogt = useCallback((f: Flight|null) => store.setFlight(f), []);
  const selectHotel = useCallback((h> Hotel|null) => store.setHotel(h), []);
  const setAdults = useCallback((n: number) => store.setAdults(n), []);
  const setDepartureCity = useCallback((c: string) => store.setDepartureCity(c), []);
  const setNights = useCallback((n: number) => store.setNights(n), []);
  const reset = useCallback(() => store.resetPackage(), []);

  return { pkg, selectEvent, selectFlight, selectHotel, setAdults, setDepartureCity, setNights, reset };
}
