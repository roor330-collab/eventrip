/**
 * useEvents — Recherche d'événements avec cache et pagination
 */

'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Event } from '@/types';

const clientCache = new Map<string, { data: any; ts: number; ttl: number }>();
function cacheGet<T>(key: string): T | null { const e = clientCache.get(key); if (!e || Date.now() - e.ts > e.ttl*1000) return null; return e.data as T; }
function cacheSet<T>(key: string, data: T, ttl = 300): void { clientCache.set(key, { data, ts: Date.now(), ttl }); }

export interface EventSearchParams { q?: string; city?: string; country?: string; type?: string; dateFrom?: string; dateTo?: string; page?: number; size?: number; lat?: number; lng?: number; }
export interface EventsResult { events: Event[]; total: number; page: number; totalPages: number; }

export function useEvents(params: EventSearchParams) {
  const [data, setData] = useState<EventsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const abortRef = useRef<AbortController|null>(null);
  const buildUrl = (p: EventSearchParams) => {
    if (!p.q && !p.city && !p.type && !p.lat) return null;
    const sp = new URLSearchParams();
    if (p.q) sp.set('q', p.q); if (p.city) sp.set('city', p.city);
    if (p.country) sp.set('country', p.country); if (p.type) sp.set('type', p.type);
    if (p.page) sp.set('page', String(p.page)); if (p.size) sp.set('size', String(p.size));
    if (p.lat) sp.set('lat', String(p.lat)); if (p.lng) sp.set('lng', String(p.lng));
    return `/api/events?${sp.toString()}`;
  };
  const url = buildUrl(params);
  const fetchData = useCallback(async () => {
    if (!url) return;
    const cached = cacheGet<EventsResult>(url); if (cached) { setData(cached); return; }
    setLoading(true); setError(null);
    abortRef.current?.abort(); abortRef.current = new AbortController();
    try {
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json(); const result = json.data ?? json;
      cacheSet(url, result, 300); setData(result);
    } catch (err: any) { if (err.name !== 'AbortError') setError(err.message); }
    finally { setLoading(false); }
  }, [url]);
  useEffect(() => { fetchData(); return () => abortRef.current?.abort(); }, [fetchData]);
  return { data, loading, error, refetch: fetchData };
}

export function useEventDetail(id: string|null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/events/${id}`).then(r=>r.json()).then(j=>{setData(j.data??j);setLoading(false);}).catch(()=>setLoading(false));
  }, [id]);
  return { data, loading };
}

export interface Suggestion { id: string; name: string; genre: string; image: string; source: string; }
export function useSuggestions(query: string, debounceMs = 280) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<any>(null);
  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}&size=6`);
        const json = await res.json();
        setSuggestions(json.data || []);
      } finally { setLoading(false); }
    }, debounceMs);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [query, debounceMs]);
  return { suggestions, loading };
}
