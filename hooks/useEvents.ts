/**
 * useEvents — Recherche d'événements avec cache et pagination
 * useEventDetail — Détail d'un événement unique
 * useSuggestions — Autocomplete artistes (debounced)
 *
 * Aucune dépendance externe (pas de React Query/SWR nécessaire).
 * Implémente fetch + cache + deduplication par clé.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Event } from '@/types';

// ─── Cache simple côté client ─────────────────────────────────────────────────
const clientCache = new Map<string, { data: any; ts: number; ttl: number }>();

function cacheGet<T>(key: string): T | null {
  const entry = clientCache.get(key);
  if (!entry || Date.now() - entry.ts > entry.ttl * 1000) return null;
  return entry.data as T;
}

function cacheSet<T>(key: string, data: T, ttl = 300): void {
  clientCache.set(key, { data, ts: Date.now(), ttl });
}

// ─── Hook générique fetch avec cache ─────────────────────────────────────────
interface FetchState<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

function useCachedFetch<T>(url: string | null, ttl = 300): FetchState<T> {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    // Cache hit
    const cached = cacheGet<T>(url);
    if (cached) { setData(cached); return; }

    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const result = json.data ?? json;
      cacheSet<T>(url, result, ttl);
      setData(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Erreur réseau');
      }
    } finally {
      setLoading(false);
    }
  }, [url, ttl]);

  useEffect(() => {
    fetchData();
    return () => abortRef.current?.abort();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ─── useEvents ────────────────────────────────────────────────────────────────
export interface EventSearchParams {
  q?:        string;
  city?:     string;
  country?:  string;
  type?:     string;
  dateFrom?: string;
  dateTo?:   string;
  page?:     number;
  size?:     number;
  lat?:      number;
  lng?:      number;
}

export interface EventsResult {
  events:     Event[];
  total:      number;
  page:       number;
  totalPages: number;
}

export function useEvents(params: EventSearchParams) {
  const buildUrl = (p: EventSearchParams): string | null => {
    if (!p.q && !p.city && !p.type && !p.lat) return null;
    const sp = new URLSearchParams();
    if (p.q)        sp.set('q',       p.q);
    if (p.city)     sp.set('city',    p.city);
    if (p.country)  sp.set('country', p.country);
    if (p.type)     sp.set('type',    p.type);
    if (p.dateFrom) sp.set('dateFrom',p.dateFrom);
    if (p.dateTo)   sp.set('dateTo',  p.dateTo);
    if (p.page)     sp.set('page',    String(p.page));
    if (p.size)     sp.set('size',    String(p.size));
    if (p.lat)      sp.set('lat',     String(p.lat));
    if (p.lng)      sp.set('lng',     String(p.lng));
    return `/api/events?${sp.toString()}`;
  };

  const url = buildUrl(params);
  return useCachedFetch<EventsResult>(url, 300);
}

// ─── useEventDetail ───────────────────────────────────────────────────────────
export function useEventDetail(id: string | null) {
  const url = id ? `/api/events/${id}` : null;
  return useCachedFetch<Event & { availability: any }>(url, 900);
}

// ─── useSuggestions (autocomplete debounced) ──────────────────────────────────
export interface Suggestion {
  id:             string;
  name:           string;
  genre:          string;
  country?:       string;
  disambiguation?: string;
  image:          string;
  source:         'ticketmaster' | 'musicbrainz';
}

export function useSuggestions(query: string, debounceMs = 280) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading]         = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }

    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      // Cache
      const cacheKey = `/api/suggestions?q=${query}`;
      const cached = cacheGet<Suggestion[]>(cacheKey);
      if (cached) { setSuggestions(cached); return; }

      setLoading(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(
          `/api/suggestions?q=${encodeURIComponent(query)}&size=6`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        const items = json.data || [];
        cacheSet<Suggestion[]>(cacheKey, items, 120);
        setSuggestions(items);
      } catch (err: any) {
        if (err.name !== 'AbortError') setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [query, debounceMs]);

  return { suggestions, loading };
}
