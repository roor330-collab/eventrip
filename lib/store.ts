/**
 * Eventrip — Global State Store
 * ─────────────────────────────────────────────────────────────────────────────
 * State management sans dépendance externe.
 * Utilise sessionStorage pour persister pendant la navigation
 * et un EventEmitter léger pour notifier les composants.
 *
 * Usage:
 *   import { store } from '@/lib/store'
 *   store.setEvent(event)
 *   store.getPackage()
 *   store.subscribe('event', (event) => ...)
 */

import { Event, Flight, Hotel, Package } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PackageState {
  event:        Event | null;
  ticket:       { zone: string; price: number } | null;
  flight:       Flight | null;
  hotel:        Hotel  | null;
  adults:       number;
  departureCity:string;
  nights:       number;
  packId:       string | null;
  totalPrice:   number;
  serviceFee:   number;
  currency:     'EUR';
  status:       'idle' | 'searching' | 'ready' | 'booking' | 'booked';
}

export interface SearchState {
  query:       string;
  city:        string;
  country:     string;
  type:        string;
  dateFrom:    string;
  dateTo:      string;
  page:        number;
}

export interface AppState {
  pkg:    PackageState;
  search: SearchState;
}

// ─── Valeurs par défaut ───────────────────────────────────────────────────────
const DEFAULT_PKG: PackageState = {
  event:         null,
  ticket:        null,
  flight:        null,
  hotel:         null,
  adults:        1,
  departureCity: 'Lyon',
  nights:        2,
  packId:        null,
  totalPrice:    0,
  serviceFee:    15,
  currency:      'EUR',
  status:        'idle',
};

const DEFAULT_SEARCH: SearchState = {
  query:    '',
  city:     '',
  country:  '',
  type:     '',
  dateFrom: '',
  dateTo:   '',
  page:     0,
};

// ─── EventEmitter minimal ─────────────────────────────────────────────────────
type Listener<T> = (value: T) => void;

class EventEmitter {
  private listeners = new Map<string, Set<Listener<any>>>();

  on<T>(event: string, fn: Listener<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.off(event, fn);
  }

  off<T>(event: string, fn: Listener<T>): void {
    this.listeners.get(event)?.delete(fn);
  }

  emit<T>(event: string, value: T): void {
    this.listeners.get(event)?.forEach(fn => fn(value));
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────
class EventripsStore extends EventEmitter {
  private _pkg: PackageState    = { ...DEFAULT_PKG };
  private _search: SearchState  = { ...DEFAULT_SEARCH };
  private _initialized = false;

  // Initialisation depuis sessionStorage (client uniquement)
  init(): void {
    if (this._initialized || typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem('eventrip_pkg');
      if (saved) {
        this._pkg = { ...DEFAULT_PKG, ...JSON.parse(saved) };
        this._recalcTotal();
      }
      const savedSearch = sessionStorage.getItem('eventrip_search');
      if (savedSearch) {
        this._search = { ...DEFAULT_SEARCH, ...JSON.parse(savedSearch) };
      }
    } catch { /* ignore parse errors */ }
    this._initialized = true;
  }

  // ─── Getters ────────────────────────────────────────────────────────────
  getPackage(): PackageState   { return this._pkg; }
  getSearch():  SearchState    { return this._search; }

  // ─── Package mutations ───────────────────────────────────────────────────
  setEvent(event: Event | null): void {
    this._pkg = { ...this._pkg, event, ticket: null, flight: null, hotel: null, status: event ? 'ready' : 'idle' };
    this._save();
    this.emit('event', event);
    this.emit('pkg', this._pkg);
  }

  setTicket(zone: string, price: number): void {
    this._pkg = { ...this._pkg, ticket: { zone, price } };
    this._recalcTotal();
    this._save();
    this.emit('ticket', this._pkg.ticket);
    this.emit('pkg', this._pkg);
  }

  setFlight(flight: Flight | null): void {
    this._pkg = { ...this._pkg, flight };
    this._recalcTotal();
    this._save();
    this.emit('flight', flight);
    this.emit('pkg', this._pkg);
  }

  setHotel(hotel: Hotel | null): void {
    this._pkg = { ...this._pkg, hotel };
    this._recalcTotal();
    this._save();
    this.emit('hotel', hotel);
    this.emit('pkg', this._pkg);
  }

  setAdults(adults: number): void {
    this._pkg = { ...this._pkg, adults: Math.max(1, Math.min(10, adults)) };
    this._recalcTotal();
    this._save();
    this.emit('adults', this._pkg.adults);
    this.emit('pkg', this._pkg);
  }

  setDepartureCity(city: string): void {
    this._pkg = { ...this._pkg, departureCity: city, flight: null };
    this._recalcTotal();
    this._save();
    this.emit('departureCity', city);
    this.emit('pkg', this._pkg);
  }

  setNights(n: number): void {
    this._pkg = { ...this._pkg, nights: Math.max(1, n) };
    this._recalcTotal();
    this._save();
    this.emit('nights', n);
    this.emit('pkg', this._pkg);
  }

  setPackId(id: string): void {
    this._pkg = { ...this._pkg, packId: id };
    this._save();
  }

  setStatus(status: PackageState['status']): void {
    this._pkg = { ...this._pkg, status };
    this.emit('status', status);
    this.emit('pkg', this._pkg);
  }

  resetPackage(): void {
    this._pkg = { ...DEFAULT_PKG };
    if (typeof window !== 'undefined') sessionStorage.removeItem('eventrip_pkg');
    this.emit('pkg', this._pkg);
  }

  // ─── Search mutations ────────────────────────────────────────────────────
  setSearch(updates: Partial<SearchState>): void {
    this._search = { ...this._search, ...updates };
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('eventrip_search', JSON.stringify(this._search));
    }
    this.emit('search', this._search);
  }

  // ─── Prix total ──────────────────────────────────────────────────────────
  private _recalcTotal(): void {
    const { adults, nights, ticket, flight, hotel, serviceFee } = this._pkg;
    const ticketTotal = (ticket?.price || 0) * adults;
    const flightTotal = (flight?.price || 0) * adults;
    // Hôtel : par nuit, 1 chambre pour 2 voyageurs
    const rooms       = Math.ceil(adults / 2);
    const hotelTotal  = (hotel?.price || 0) * nights * rooms;
    this._pkg.totalPrice = ticketTotal + flightTotal + hotelTotal + serviceFee;
  }

  // ─── Persistance ─────────────────────────────────────────────────────────
  private _save(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('eventrip_pkg', JSON.stringify(this._pkg));
    } catch { /* quota exceeded → ignore */ }
  }

  // ─── Subscribe helper ────────────────────────────────────────────────────
  subscribe<T>(event: string, fn: Listener<T>): () => void {
    return this.on<T>(event, fn);
  }
}

export const store = new EventripsStore();

// Auto-init en client
if (typeof window !== 'undefined') store.init();
