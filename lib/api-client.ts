/**
 * Eventrip — Base API Client
 * Cache TTL in-memory, retry exponentiel, rate-limit guard, logging.
 * Aucune dépendance externe requise.
 */

// ─── Cache ────────────────────────────────────────────────────────────────────
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  key: string;
}

class ApiCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private maxSize = 500;

  set<T>(key: string, data: T, ttlSeconds: number): void {
    // LRU éviction si le cache est plein
    if (this.store.size >= this.maxSize) {
      const oldest = [...this.store.entries()].sort(
        (a, b) => a[1].expiresAt - b[1].expiresAt
      )[0];
      if (oldest) this.store.delete(oldest[0]);
    }
    this.store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000, key });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  invalidate(pattern?: string): void {
    if (!pattern) { this.store.clear(); return; }
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }

  size(): number { return this.store.size; }
}

export const apiCache = new ApiCache();

// ─── Rate limiter ─────────────────────────────────────────────────────────────
class RateLimiter {
  private queues = new Map<string, number[]>();

  canCall(service: string, maxPerMinute: number): boolean {
    const now = Date.now();
    const timestamps = (this.queues.get(service) || []).filter(
      t => now - t < 60_000
    );
    if (timestamps.length >= maxPerMinute) return false;
    timestamps.push(now);
    this.queues.set(service, timestamps);
    return true;
  }

  remaining(service: string, maxPerMinute: number): number {
    const now = Date.now();
    const recent = (this.queues.get(service) || []).filter(t => now - t < 60_000);
    return Math.max(0, maxPerMinute - recent.length);
  }
}

export const rateLimiter = new RateLimiter();

// ─── Retry logic ──────────────────────────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, i)));
      }
    }
  }
  throw lastError;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
export interface FetchOptions extends RequestInit {
  cacheTtl?: number;        // secondes, 0 = pas de cache
  cacheKey?: string;        // clé personnalisée
  service?: string;         // nom pour rate limit & logs
  rateLimitPerMin?: number; // défaut: 60
  retries?: number;
  timeout?: number;         // ms, défaut: 15000
}

export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    cacheTtl = 0,
    cacheKey,
    service = 'unknown',
    rateLimitPerMin = 60,
    retries = 2,
    timeout = 15_000,
    ...fetchOpts
  } = options;

  const key = cacheKey || `${service}:${url}:${JSON.stringify(fetchOpts.body || '')}`;

  // Cache hit
  if (cacheTtl > 0) {
    const cached = apiCache.get<T>(key);
    if (cached !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache HIT] ${service} — ${url.split('?')[0]}`);
      }
      return cached;
    }
  }

  // Rate limit check
  if (!rateLimiter.canCall(service, rateLimitPerMin)) {
    throw new ApiError(`Rate limit exceeded for ${service}`, 429, service);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const result = await withRetry(async () => {
    const res = await fetch(url, { ...fetchOpts, signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new ApiError(
        `${service} HTTP ${res.status}: ${res.statusText}`,
        res.status,
        service,
        body
      );
    }

    const data: T = await res.json();

    if (cacheTtl > 0) {
      apiCache.set(key, data, cacheTtl);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${service} — ${res.status} — ${url.split('?')[0]}`);
    }

    return data;
  }, retries);

  return result;
}

// ─── Custom error ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public service: string,
    public body?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  isNotFound(): boolean { return this.statusCode === 404; }
  isRateLimited(): boolean { return this.statusCode === 429; }
  isServerError(): boolean { return this.statusCode >= 500; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function buildUrl(base: string, params: Record<string, string | number | boolean | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') {
      p.set(k, String(v));
    }
  }
  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Convertit "PT2H30M" → minutes */
export function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return (parseInt(m?.[1] || '0') * 60) + parseInt(m?.[2] || '0');
}

/** Calcule la distance en km entre deux coordonnées GPS */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Date ISO → YYYY-MM-DD */
export function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Ajoute N jours à une date */
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}
