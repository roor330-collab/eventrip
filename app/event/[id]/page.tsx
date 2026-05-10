"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Ticket, Plane, Hotel as HotelIcon,
  Star, ChevronDown, Shield, Loader2, Train,
  Users, Clock, Plus, Minus, ArrowLeft, CheckCircle, Zap,
  ExternalLink, Flame,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Event, Hotel, Flight, PackageItem } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface TicketCategory {
  id: string; name: string; price: number; desc: string; available: number; badge?: string;
}

function PackSidebar({ items, onBook }: { items: PackageItem[]; onBook: () => void }) {
  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const fees  = Math.round(total * 0.05);
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
      <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-blue-400" /> Votre Pack
      </h3>
      {items.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-6">Sélectionnez vos billets, hôtel et transport pour composer votre pack.</p>
      ) : (
        <div className="space-y-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-white/60 capitalize flex items-center gap-1.5">
                {item.type === "ticket" && <Ticket className="w-3.5 h-3.5 text-blue-400" />}
                {item.type === "hotel"  && <HotelIcon className="w-3.5 h-3.5 text-blue-400" />}
                {item.type === "flight" && <Plane className="w-3.5 h-3.5 text-blue-400" />}
                {item.type === "train"  && <Train className="w-3.5 h-3.5 text-blue-400" />}
                <span className="truncate max-w-[130px]">{item.details?.name || item.details?.category || item.details?.airline || item.type}</span>
                {(item.quantity || 1) > 1 && <span className="text-white/30">x{item.quantity}</span>}
              </span>
              <span className="font-semibold text-white">{formatPrice(item.price * (item.quantity || 1))}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-white/30 pt-2 border-t border-white/5">
            <span>Frais de service (5%)</span><span>{formatPrice(fees)}</span>
          </div>
        </div>
      )}
      {items.length > 0 && (
        <div className="border-t border-white/10 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Total</span>
            <span className="text-2xl font-bold text-blue-400">{formatPrice(total + fees)}</span>
          </div>
        </div>
      )}
      <Button variant="primary" size="lg" className="w-full" disabled={items.length === 0} onClick={onBook}>
        <CheckCircle className="w-5 h-5 mr-2" />
        {items.length === 0 ? "Composez votre pack" : "Réserver ce Pack"}
      </Button>
      <div className="mt-4 space-y-2 text-xs text-white/30">
        <div className="flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-green-500" /> Paiement 100% sécurisé</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Annulation gratuite sous 24h</div>
      </div>
    </div>
  );
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter(); const searchParams = useSearchParams(); const { id } = params;
  const [event, setEvent] = useState<(Event & { ticketCategories?: TicketCategory[] }) | null>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<PackageItem[]>([]);
  const [expandedStep, setExpandedStep] = useState<string>("tickets");
  const [ticketQty, setTicketQty] = useState(2);
  const [departureCity, setDepartureCity] = useState(searchParams.get("from") || "");
  const [nights, setNights] = useState(2);
  const [autoSearched, setAutoSearched] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`).then(r => r.json()).then(data => { if (data.success && data.data) setEvent(data.data); }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!event?.latitude || !event?.longitude || !event?.date) return;
    setHotelsLoading(true);
    const p = new URLSearchParams({ lat: String(event.latitude), lng: String(event.longitude), checkIn: event.date, nights: String(nights), adults: String(ticketQty) });
    fetch(`/api/hotels?${p}`).then(r => r.json()).then(data => setHotels(data.success && data.data?.length ? data.data : [])).catch(() => setHotels([])).finally(() => setHotelsLoading(false));
  }, [event, nights, ticketQty]);

  const fetchFlights = useCallback(() => {
    if (!event?.city || !event?.date || !departureCity.trim()) return;
    setFlightsLoading(true);
    const p = new URLSearchParams({ from: departureCity, to: event.city, date: event.date, adults: String(ticketQty) });
    fetch(`/api/flights?${p}`).then(r => r.json()).then(data => {
      const list = data.flights?.length ? data.flights : (data.data || []);
      setFlights(list); if (list.length > 0) setExpandedStep("transport");
    }).catch(() => setFlights([])).finally(() => setFlightsLoading(false));
  }, [event, departureCity, ticketQty]);

  useEffect(() => { if (event && departureCity.trim() && !autoSearched) { setAutoSearched(true); fetchFlights(); } }, [event, departureCity, autoSearched, fetchFlights]);

  const selectTicket = (cat: TicketCategory) => setSelectedItems(prev => [...prev.filter(i => i.type !== "ticket"), { type: "ticket", id: cat.id, price: cat.price, quantity: ticketQty, details: { category: cat.name } }]);
  const selectHotel = (hotel: Hotel) => setSelectedItems(prev => [...prev.filter(i => i.type !== "hotel"), { type: "hotel", id: hotel.id, price: hotel.price, quantity: nights, details: { name: hotel.name, stars: hotel.stars } }]);
  const selectFlight = (flight: Flight) => setSelectedItems(prev => [...prev.filter(i => i.type !== "flight"), { type: "flight", id: flight.id, price: flight.price, quantity: ticketQty, details: { airline: flight.airline, departure: flight.departureTime } }]);

  const handleBook = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(`/auth?redirect=/checkout`); return; }
    if (typeof window !== "undefined") sessionStorage.setItem("eventrip_pack", JSON.stringify({ eventId: event?.id, eventTitle: event?.title, eventDate: event?.date, eventCity: event?.city, items: selectedItems }));
    router.push("/checkout");
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
  if (!event) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-center"><Zap className="w-16 h-16 text-white/10 mx-auto mb-4" /><h1 className="text-2xl font-bold text-white mb-2">Événement introuvable</h1><Link href="/search"><Button variant="primary">Voir tous les événements</Button></Link></div></div>;

  const cats: TicketCategory[] = event.ticketCategories?.length ? event.ticketCategories : [
    { id: "standard", name: "Standard", price: event.minPrice || 45, desc: "Accès standard", available: 180, badge: "" },
    { id: "premium", name: "Premium", price: Math.round(((event.minPrice || 45) + (event.maxPrice || 180)) / 2), desc: "Places numérotées", available: 95, badge: "Populaire" },
    { id: "vip", name: "VIP", price: event.maxPrice || 180, desc: "Accès prioritaire + extras", available: 22, badge: "VIP" },
  ];

  const selectedTicket = selectedItems.find(i => i.type === "ticket");
  const selectedHotel = selectedItems.find(i => i.type === "hotel");
  const selectedFlight = selectedItems.find(i => i.type === "flight");
  const typeBadge: Record<string, string> = { concert: "bg-purple-600/80", sport: "bg-green-600/80", festival: "bg-orange-600/80", theatre: "bg-blue-600/80" };
  const typeLabel: Record<string, string> = { concert: "Concert", sport: "Sport", festival: "Festival", theatre: "Théâtre" };
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";

  const steps = [
    {
      id: "tickets", title: "1. Billets", icon: Ticket, selected: !!selectedTicket,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-semibold text-white/60">Personnes :</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setTicketQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="font-bold text-white w-6 text-center">{ticketQty}</span>
              <button onClick={() => setTicketQty(q => Math.min(10, q + 1))} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cats.map(cat => {
              const isSelected = selectedTicket?.id === cat.id;
              return (
                <button key={cat.id} onClick={() => selectTicket(cat)} className={`p-4 rounded-xl border-2 text-left transition-all relative ${isSelected ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"}`}>
                  {cat.badge && <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cat.badge === "VIP" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"}`}>{cat.badge}</span>}
                  <div className="font-bold text-white mb-1">{cat.name}</div>
                  <div className="text-xs text-white/40 mb-3">{cat.desc}</div>
                  <div className="text-xl font-bold text-blue-400">{formatPrice(cat.price)}<span className="text-xs text-white/30 font-normal">/pers.</span></div>
                  <div className="text-xs text-white/30 mt-0.5">x {ticketQty} = {formatPrice(cat.price * ticketQty)}</div>
                  <div className="text-xs text-white/20 mt-1">{cat.available} places restantes</div>
                  {isSelected && <div className="mt-2 text-xs font-semibold text-blue-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Sélectionné</div>}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "hotel", title: "2. Hébergement", icon: HotelIcon, selected: !!selectedHotel,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-semibold text-white/60">Nuits :</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setNights(n => Math.max(1, n - 1))} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="font-bold text-white w-6 text-center">{nights}</span>
              <button onClick={() => setNights(n => n + 1)} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/60 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          {hotelsLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hotels.slice(0, 4).map(hotel => {
                const isSelected = selectedHotel?.id === hotel.id;
                return (
                  <button key={hotel.id} onClick={() => selectHotel(hotel)} className={`rounded-xl border-2 text-left overflow-hidden transition-all ${isSelected ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30"}`}>
                    {hotel.image && <div className="h-28 overflow-hidden bg-white/5"><img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover opacity-80" /></div>}
                    <div className="p-4">
                      <div className="font-bold text-white text-sm mb-1 line-clamp-1">{hotel.name}</div>
                      <div className="flex items-center gap-1 mb-1">{Array.from({ length: hotel.stars || 3 }).map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                      <div className="flex items-center gap-1 text-xs text-white/30 mb-2"><MapPin className="w-3 h-3" />{hotel.distance?.toFixed(1) || "?"} km du lieu</div>
                      <div className="font-bold text-blue-400">{formatPrice(hotel.price)}<span className="text-xs text-white/30 font-normal">/nuit</span></div>
                      <div className="text-xs text-white/20">x {nights} nuits = {formatPrice(hotel.price * nights)}</div>
                      {isSelected && <div className="mt-2 text-xs font-semibold text-blue-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Sélectionné</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : <div className="text-center py-10 text-white/20"><HotelIcon className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Hôtels à proximité de {event.venue} en cours de chargement…</p></div>}
        </div>
      ),
    },
    {
      id: "transport", title: "3. Transport", icon: Plane, selected: !!selectedFlight,
      content: (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input type="text" placeholder="Votre ville de départ (ex: Lyon, Bordeaux, Bruxelles…)" value={departureCity} onChange={e => setDepartureCity(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchFlights()} className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm" />
            <Button variant="primary" size="md" onClick={fetchFlights} disabled={flightsLoading || !departureCity.trim()}>{flightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Chercher"}</Button>
          </div>
          {flightsLoading ? <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          : flights.length > 0 ? (
            <div className="space-y-2">
              {flights.slice(0, 5).map(flight => {
                const isSelected = selectedFlight?.id === flight.id;
                const depTime = flight.departureTime?.slice(11, 16); const arrTime = flight.arrivalTime?.slice(11, 16);
                return (
                  <button key={flight.id} onClick={() => selectFlight(flight)} className={`w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between gap-4 ${isSelected ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/5"}`}>
                    <div className="flex-1">
                      <div className="font-semibold text-white text-sm">{flight.airline}</div>
                      <div className="flex items-center gap-2 text-sm text-white/60 mt-0.5"><span className="font-medium">{flight.departureAirport}</span><span className="text-white/20">→</span><span className="font-medium">{flight.arrivalAirport}</span></div>
                      <div className="text-xs text-white/30 mt-0.5 flex items-center gap-3">
                        {depTime && arrTime && <span><Clock className="w-3 h-3 inline mr-1" />{depTime} → {arrTime}</span>}
                        <span className={flight.stops === 0 ? "text-green-400" : "text-white/30"}>{flight.stops === 0 ? "✈ Direct" : `${flight.stops} escale(s)`}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-blue-400 text-lg">{formatPrice(flight.price * ticketQty)}</div>
                      <div className="text-xs text-white/20">pour {ticketQty} pers.</div>
                      {isSelected && <div className="mt-1 text-xs font-semibold text-blue-400 flex items-center gap-1 justify-end"><CheckCircle className="w-3.5 h-3.5" /> Sélectionné</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : <div className="text-center py-10 text-white/20"><Plane className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Entrez votre ville et cliquez "Chercher"</p></div>}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="relative h-72 md:h-[420px] overflow-hidden bg-[#0d0d15]">
        {event.image ? <img src={event.image} alt={event.title} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
        <div className="absolute top-6 left-4 md:left-8"><Link href="/search" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm transition-colors"><ArrowLeft className="w-4 h-4" /> Retour</Link></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 ${typeBadge[event.type] || "bg-blue-600/80"} backdrop-blur-sm text-white text-xs font-bold rounded-lg uppercase`}>{typeLabel[event.type] || event.type}</span>
              {event.ticketsAvailable <= 50 && event.ticketsAvailable > 0 && <span className="px-2.5 py-1 bg-red-600/80 backdrop-blur-sm text-white text-xs font-bold rounded-lg flex items-center gap-1"><Flame className="w-3 h-3" /> {event.ticketsAvailable} places restantes</span>}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-400" />{event.venue}, {event.city}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-400" />{fmt(event.date)}{event.startTime && ` · ${event.startTime.slice(0,5)}`}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-blue-400" />{event.ticketsAvailable > 0 ? `${event.ticketsAvailable} places dispo` : "Places limitées"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {event.artists && event.artists.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{event.artists.map(a => <span key={a} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-sm font-medium">{a}</span>)}</div>}
        {event.description && <p className="text-white/50 mb-8 max-w-3xl leading-relaxed text-sm">{event.description}</p>}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"><Ticket className="w-5 h-5 text-blue-400 mx-auto mb-1" /><p className="text-xs text-white/40 mb-0.5">Billets dès</p><p className="text-lg font-bold text-white">{formatPrice(event.minPrice > 0 ? event.minPrice : 45)}</p></div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"><HotelIcon className="w-5 h-5 text-purple-400 mx-auto mb-1" /><p className="text-xs text-white/40 mb-0.5">Hôtel dès</p><p className="text-lg font-bold text-white">{hotels.length > 0 ? formatPrice(Math.min(...hotels.map(h => h.price))) : "~89€"}<span className="text-xs text-white/30">/nuit</span></p></div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"><Plane className="w-5 h-5 text-green-400 mx-auto mb-1" /><p className="text-xs text-white/40 mb-0.5">Vol depuis</p><p className="text-lg font-bold text-white">{flights.length > 0 ? formatPrice(Math.min(...flights.map(f => f.price))) : "~49€"}</p></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon; const isExpanded = expandedStep === step.id;
              return (
                <motion.div key={step.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button onClick={() => setExpandedStep(isExpanded ? "" : step.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${step.selected ? "bg-blue-600 text-white" : "bg-white/5 text-blue-400"}`}>{step.selected ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}</div>
                      <div className="text-left"><span className="font-bold text-white">{step.title}</span>{step.selected && <span className="ml-2 text-xs text-blue-400 font-medium">✓ Ajouté au pack</span>}</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-white/5">
                        <div className="p-6">{step.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <div className="lg:col-span-1"><PackSidebar items={selectedItems} onBook={handleBook} /></div>
        </div>
      </div>
    </div>
  );
}
