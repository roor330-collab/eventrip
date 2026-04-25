/**
 * Eventrip — Base API Client (cache, retry, rate-limit)
 */

interface CacheEntry<T> { data: T; expiresAt: number; }
class ApiCache {
  private s = new Map<string, CacheEntry<unknown>>();
  set<T>(k;	string, d: T, ttl: number) { this.s.set(k,{
+data:d,expiresAt:Date.now()+ttl*1000}); }
  get<T>(k: string): T|null { const e=this.s.get(k); if(!e)return null; if(Date.now()>e.expiresAt){this.s.delete(k);return null;} return e.data as T; }
  invalidate(p?:string) { if(!p){this.s.clear();return;} for(const k of this.s.keys())if(k.includes(p))this.s.delete(k); }
}
export const apiCache = new ApiCache();

export class ApiError extends Error {
  constructor(msg:string, public statusCode:number, public service:string) { super(msg); this.name='ApiError'; }
}

async function withRetry<T>(fn:()=>Promise<T>,n=2):Promise<T> {
  for(let i=0;i<n;i++){try{return await fn();}catch(e){if(i!==n-1){await new Promise(r=>setTimeout(r,500*(2<<i)));}else throw e;}}
  throw new Error('Unreachable');
}

export interface FetchOptions extends RequestInit { cacheTtl?:number; service?:string; retries?:number; }

export async function apiFetch<T>(url:string, opts:FetchOptions={}):Promise<T> {
  const {cacheTtl=0,service='api',retries=2,...fOpts}=opts;
  if(cacheTtl>0){const cached=apiCache.get<T>(url);if(cached!==null)return cached;}
  return withRetry(async()=>{
    const res=await fetch(url,fOpts);
    if(!res.ok)throw new ApiError(`${service} HTTP ${res.status}`,res.status,service);
    const data:T=await res.json();
    if(cacheTtl>0)apiCache.set(url,data,cacheTtl);
    return data;
  },retries);
}

export function buildUrl(base:string, p:Record<string,string|number|boolean|undefined>):string {
  const sp=new URLSearchParams();
  for(const [k,] of Object.entries(p))if(v!==undefined&&v!==null&&v!==''[sp.set(k,String(v));
  const qs=sp.toString();return qs?`${base}?${qs}`:base;
}

export function parseDuration(iso:string):number {
  const m=iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  return(parseInt(m?.[1]||'0')*60)+parseInt(m?.[2]||'0');
}

export function haversineKm(lat1:number,lng1:number,lat2:number,lng2:number):number {
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
