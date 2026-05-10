"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Calendar, Ticket, Plane, Hotel as HotelIcon,
  Star, ChevronDown, Shield, Loader2,
  Users, Clock, Plus, Minus, ArrowLeft, CheckCircle, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Event, Hotel, Flight, PackageItem } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

// ─── PackCalculator component ────────────────────────────────────────────────
function PackCalculator({ items, event, onBook }) {
  const total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const fees = Math.round(total * 0.05);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
      <h3 className="font-bold text-xl text-gray-900 mb-4">Votre Pack</h3>
      {items.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">
          Sélectionnez billets, hôtel ou transport pour composer votre pack.
        </p>
      ) : (
        <div className="space-y-3 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 capitalize flex items-center gap-1.5">
                {item.type === "ticket" && <Ticket className="w-3.5 h-3.5 text-blue-500" />}
                {item.type === "hotel" && <HotelIcon className="w-3.5 h-3.5 text-blue-500" />}
                {item.type === "flight" && <Plane className="w-3.5 h-3.5 text-blue-500" />}
                {item.details?.name || item.details?.category || item.type}
                {(item.quantity || 1) > 1 && ` ×${item.quantity}`}
              </span>
              <span className="font-semibold text-gray-900">{formatPrice(item.price * (item.quantity || 1))}</span>
            </div>
          ))}
          <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span>Frais de service (5%)</span><span>{formatPrice(fees)}</span>
          </div>
        </div>
      )}
      {items.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-gray-900">Total</span>
            <span className="text-2xl font-bold text-blue-600">{formatPrice(total + fees)}</span>
          </div>
        </div>
      )}
      <Button variant="primary" size="lg" className="w-full" disabled={items.length === 0} onClick={onBook}>
        <CheckCircle className="w-5 h-5 mr-2" />Réserver ce Pack
      </Button>
      <div className="mt-4 space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /> Paiement 100% sécurisé</div>
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Annulation gratuite sous 24h</div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = params;

  const [event, setEvent] = useState<Event | null>(null);
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

  // Fetch event
  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setEvent(data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-search vols si ville de départ fournie dans l'URL
  useEffect(() => {
    if (event && departureCity.trim() && !autoSearched) {
      setAutoSearched(true);
      setExpandedStep("transport");
      fetchFlights();
    }
  }, [event, departureCity, autoSearched]);

  // Fetch hotels when event is loaded
  useEffect(() => {
    if (!event?.latitude || !event?.longitude || !event?.date) return;
    setHotelsLoading(true);
    fetch(`/api/hotels?lat=${event.latitude}&lng=${event.longitude}&checkIn=${event.date}&nights=${nights}&adults=2`)
      .then(r => r.json())
      .then(data => { if (data.success && data.data?.length) setHotels(data.data); else setHotels([]); })
      .catch(() => setHotels([]))
      .finally(() => setHotelsLoading(false));
  }, [event, nights]);

  // Fetch flights — nom de ville directement (duffel.ts mappe via AIRPORT_IATA)
  const fetchFlights = useCallback(() => {
    if (!event?.city || !event?.date || !departureCity.trim()) return;
    setFlightsLoading(true);
    fetch(`/api/flights?from=${encodeURIComponent(departureCity)}&to=${encodeURIComponent(event.city)}&date=${event.date}&adults=${ticketQty}`)
      .then(r => r.json())
      .then(data => {
        const flightList = data.flights?.length ? data.flights : data.data || [];
        setFlights(flightList);
        if (flightList.length > 0) setExpandedStep("transport");
      })
      .catch(() => setFlights([]))
      .finally(() => setFlightsLoading(false));
  }, [event, departureCity, ticketQty]);

  const ticketTiers = event ? [
    { id: "standard", name: "Standard", price: Math.round(event.minPrice || 50), desc: "Accès standard" },
    { id: "premium",  name: "Premium",  price: Math.round(((event.minPrice || 50) + (event.maxPrice || 200)) / 2), desc: "Places numérotées" },
    { id: "vip",      name: "VIP",      price: Math.round(event.maxPrice || 200), desc: "Accès prioritaire + lounge" },
  ] : [];

  const selectedTicket = selectedItems.find(i => i.type === "ticket");
  const selectedHotel  = selectedItems.find(i => i.type === "hotel");
  const selectedFlight = selectedItems.find(i => i.type === "flight");

  const selectTicket = (tier) => setSelectedItems(prev => [
    ...prev.filter(i => i.type !== "ticket"),
    { type: "ticket", id: tier.id, price: tier.price * ticketQty, quantity: ticketQty, details: { category: tier.name } }
  ]);
  const selectHotel = (hotel) => setSelectedItems(prev => [
    ...prev.filter(i => i.type !== "hotel"),
    { type: "hotel", id: hotel.id, price: hotel.price * nights, quantity: nights, details: { name: hotel.name, stars: hotel.stars } }
  ]);
  const selectFlight = (flight) => setSelectedItems(prev => [
    ...prev.filter(i => i.type !== "flight"),
    { type: "flight", id: flight.id, price: flight.price * ticketQty, quantity: ticketQty, details: { airline: flight.airline, departure: flight.departureTime } }
  ]);

  const handleBook = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push(`/auth?redirect=/checkout`); return; }
    const packData = { eventId: event?.id, eventTitle: event?.title, eventDate: event?.date, eventCity: event?.city, items: selectedItems };
    if (typeof window !== "undefined") sessionStorage.setItem("eventrip_pack", JSON.stringify(packData));
    router.push("/checkout");
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-16">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-gray-500">Chargement de l'événement...</p>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-white flex items-center justify-center pt-16">
      <div className="text-center">
        <Zap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Événement introuvable</h1>
        <p className="text-gray-500 mb-6">Cet événement n'existe pas ou n'est plus disponible.</p>
        <Link href="/search"><Button variant="primary">Voir tous les événements</Button></Link>
      </div>
    </div>
  );

  const steps = [
    {
      id: "tickets", title: "Billets", icon: Ticket, selected: !!selectedTicket,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-gray-700">Nombre de personnes :</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setTicketQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="font-bold text-lg w-8 text-center">{ticketQty}</span>
              <button onClick={() => setTicketQty(q => Math.min(10, q + 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ticketTiers.map(tier => {
              const isSelected = selectedTicket?.id === tier.id;
              return (
                <button key={tier.id} onClick={() => selectTicket(tier)}
                  className={`p-5 rounded-xl border-2 text-left transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
                >
                  <div className="font-bold text-gray-900 mb-1">{tier.name}</div>
                  <div className="text-sm text-gray-500 mb-3">{tier.desc}</div>
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(tier.price)}</div>
                  <div className="text-xs text-gray-400 mt-1">× {ticketQty} = {formatPrice(tier.price * ticketQty)}</div>
                  {isSelected && <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Sélectionné</div>}
                </button>
              );
            })}
          </div>
        </div>
      ),
    },
    {
      id: "hotel", title: "Hébergement", icon: HotelIcon, selected: !!selectedHotel,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-semibold text-gray-700">Nuits :</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setNights(n => Math.max(1, n - 1))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="font-bold text-lg w-6 text-center">{nights}</span>
              <button onClick={() => setNights(n => n + 1)} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          {hotelsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hotels.slice(0, 4).map(hotel => {
                const isSelected = selectedHotel?.id === hotel.id;
                return (
                  <button key={hotel.id} onClick={() => selectHotel(hotel)}
                    className={`rounded-xl border-2 text-left overflow-hidden transition-all ${isSelected ? "border-blue-500" : "border-gray-200 hover:border-blue-300"}`}
                  >
                    {hotel.image && (
                      <div className="relative h-28 overflow-hidden bg-gray-100">
                        <Image src={hotel.image} alt={hotel.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{hotel.name}</div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                        {hotel.rating && <span className="text-xs text-gray-500 ml-1">{hotel.rating}</span>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2"><MapPin className="w-3 h-3" />{hotel.distance?.toFixed(1)} km</div>
                      <div className="font-bold text-blue-600">{formatPrice(hotel.price)}<span className="text-xs text-gray-400 font-normal">/nuit</span></div>
                      <div className="text-xs text-gray-500">× {nights} nuits = {formatPrice(hotel.price * nights)}</div>
                      {isSelected && <div className="mt-2 text-xs font-semibold text-blue-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Sélectionné</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <HotelIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Hôtels à proximité bientôt disponibles.</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "transport", title: "Transport", icon: Plane, selected: !!selectedFlight,
      content: (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input type="text"
              placeholder="Votre ville de départ (ex: Lyon, Bordeaux, Marseille…)"
              value={departureCity}
              onChange={e => setDepartureCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchFlights()}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Button variant="outline" size="md" onClick={fetchFlights} disabled={flightsLoading}>
              {flightsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Chercher"}
            </Button>
          </div>
          {flightsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          ) : flights.length > 0 ? (
            <div className="space-y-3">
              {flights.slice(0, 5).map(flight => {
                const isSelected = selectedFlight?.id === flight.id;
                const depTime = flight.departureTime?.slice(11, 16);
                const arrTime = flight.arrivalTime?.slice(11, 16);
                return (
                  <button key={flight.id} onClick={() => selectFlight(flight)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all flex items-center justify-between gap-4 ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{flight.airline} {flight.flightNumber && <span className="text-xs text-gray-400 ml-1">{flight.flightNumber}</span>}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span className="font-medium">{flight.departureAirport}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{flight.arrivalAirport}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                        {depTime && arrTime && <span><Clock className="w-3 h-3 inline mr-1" />{depTime} → {arrTime}</span>}
                        <span>{flight.stops === 0 ? "Direct" : `${flight.stops} escale(s)`}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-blue-600 text-lg">{formatPrice(flight.price * ticketQty)}</div>
                      <div className="text-xs text-gray-400">pour {ticketQty} pers.</div>
                      {isSelected && <div className="mt-1 text-xs font-semibold text-blue-600 flex items-center gap-1 justify-end"><CheckCircle className="w-3.5 h-3.5" /> Sélectionné</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Plane className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Entrez votre ville de départ et cliquez "Chercher".</p>
              <p className="text-xs mt-1">Vols disponibles depuis toutes les grandes villes françaises.</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-64 md:h-96 overflow-hidden bg-gray-100">
        {event.image ? <Image src={event.image} alt={event.title} fill className="object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-400" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 pt-16">
          <Link href="/search" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg uppercase mb-3">{event.type}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{event.venue}, {event.city}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(event.date)}{event.startTime && ` à ${event.startTime.slice(0,5)}`}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{event.ticketsAvailable > 0 ? `${event.ticketsAvailable} places` : "Places limitées"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {event.artists && event.artists.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {event.artists.map(a => <span key={a} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">{a}</span>)}
          </div>
        )}
        {event.description && <p className="text-gray-600 mb-8 max-w-3xl leading-relaxed">{event.description}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isExpanded = expandedStep === step.id;
              return (
                <motion.div key={step.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button onClick={() => setExpandedStep(isExpanded ? "" : step.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.selected ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                        {step.selected ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-gray-900">{step.title}</span>
                        {step.selected && <span className="ml-2 text-xs text-blue-600 font-medium">✓ Ajouté</span>}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="border-t border-gray-100">
                        <div className="p-6">{step.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          <div className="lg:col-span-1">
            <PackCalculator items={selectedItems} event={event} onBook={handleBook} />
          </div>
        </div>
      </div>
    </div>
  );
}