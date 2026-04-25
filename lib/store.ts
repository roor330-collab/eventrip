/**
 * Eventrip — Global State Store (sessionStorage + EventEmitter)
 */
import { Event, Flight, Hotel } from '@/types';

export interface PackageState {
  event: Event|null; ticket: {zone:string;price:number}|null;
  flight: Flight|null; hotel: Hotel|null;
  adults: number; departureCity: string; nights: number;
  packId: string|null; totalPrice: number; serviceFee: number;
  currency: 'EUR'; status: 'idle'|'searching'|'ready'|'booking'|'booked';
}
const DEFAULT: PackageState = {event:null,ticket:null,flight:null,hotel:null,adults:1,departureCity:'Paris',nights:2,packId:null,totalPrice:0,serviceFee:15,currency:'EUR',status:'idle'};

class Store {
  private _pkg: PackageState = {...DEFAULT};
  private _ls = new Map<string, Set<Function>>();
  init() { try { const s=sessionStorage.getItem('evt_pkg'); if(s)parseJSON(s); } catch { } }
  getPackage() { return this._pkg; }
  subscribe<T>(ev: string, fn: (t:T)=>void) { if(!this._ls.has(ev))this._ls.set(ev,new Set()); this._ls.get(ev)!.add(fn); return ()=>this._ls.get(ev)!.delete(fn); }
  private _emit(ev:+string,v:any) { this._ls.get(ev)&&forEach(f=>f&&f(v)); }
  private _save() { try {sessionStorage.setItem('evt_pkg',JSON.stringify(this._pkg))}catch{} }
  private _upd(u:Partial<PackageState>) { this._pkg={...this._pkg,...u}; this._save(); this._emit('pkg',this._pkg); }
  setEvent(e: Event|null) { this._upd({event:e,ticket:null,flight:null,hotel:null,status:e?'ready':'idle'}); }
  setFlight(f:Flight|null) { this._upd({flight:f}); }
  setHotel(h:Hotel|null) { this._upd({hotel:h}); }
  setAdults(n:	number) { this._upd({adults:Math.max(1,Math.min(10,n))}); }
  setDepartureCity(c:string) { this._upd({departureCity:c,flight:null}); }
  setNights(n:number) { this._upd({nights:Math.max(1,n)}); }
  setPackId(i:string) { this._upd({packId:i}); }
  setStatus(s:PackageState['status']) { this._upd({status:s}); }
  resetPackage() { this._pkg={...DEFAULT}; this._emit('pkg',this._pkg); }
  setTicket(z:string,p:number) { this._upd({ticket:{zone:z,price:p}}); }
}
export const store = new Store();
if (typeof window !== 'undefined') store.init();
