/**
 * useLiveUpdate — Polling toutes les 30s pour vérifier la dispo d'un événement.
 * Affiche une alerte si le statut change pendant la navigation.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface LiveAlert {
  id:      string;
  type:    'warning' | 'error' | 'info';
  message: string;
  ts:      number;
}

export function useLiveUpdate(eventId: string | null, packId?: string | null) {
  const [alerts,    setAlerts]    = useState<LiveAlert[]>([]);
  const [available, setAvailable] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStatus  = useRef<string>('');

  const check = useCallback(async () => {
    if (!eventId) return;

    try {
      const params = new URLSearchParams({ eventId });
      if (packId) params.set('packId', packId);

      const res  = await fetch(`/api/live-check?${params.toString()}`);
      if (!res.ok) return;

      const json = await res.json();
      const { event, alerts: newAlerts } = json.data || {};

      setAvailable(event?.available ?? null);

      if (event?.status && event.status !== lastStatus.current) {
        lastStatus.current = event.status;

        if (newAlerts?.length) {
          const mapped: LiveAlert[] = newAlerts.map((msg: string) => ({
            id:      `${Date.now()}-${Math.random()}`,
            type:    event.available ? 'info' : 'warning',
            message: msg,
            ts:      Date.now(),
          }));
          setAlerts(prev => [...prev, ...mapped]);
        }
      }
    } catch { /* silencieux */ }
  }, [eventId, packId]);

  useEffect(() => {
    if (!eventId) return;
    check();
    intervalRef.current = setInterval(check, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [eventId, check]);

  const dismissAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const dismissAll = () => setAlerts([]);

  return { alerts, available, dismissAlert, dismissAll };
}
