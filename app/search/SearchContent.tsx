"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Zap, SlidersHorizontal } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";
import { Button } from "@/components/ui/Button";

// ─── Filtres rapides ──────────────────────────────────────────────────────────
const COUNTRY_FILTERS = [
  { code: "", label: "Tous les pays", flag: "🌍" },
  { code: "FR", label: "France", flag: "🇫🇷" },
  { code: "ES", label: "Espagne", flag: "🇪🇸" },
  { code: "IT", label: "Italie", flag: "🇮🇹" },
  { code: "DE", label: "Allemagne", flag: "🇩🇪" },
];

const TYPE_FILTERS = [
  { value: "", label: "Tous", emoji: "✨" },
  { value: "music", label: "Concerts", emoji: "🎵" },
  { value: "sports", label: "Football", emoji: "⚽" },
  { value: "festival", label: "Festivals", emoji: "🎪" },
];

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceMax, setPriceMax] = useState(2000);
  const [showFilters, setShowFilters] = useState(false);

  // Lire les filtres depuis l'URL
  const activeCountry = searchParams.get("country") || "";
  const activeType = searchParams.get("type") || "";
  const activeFrom = searchParams.get("from") || "";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/search?${params}`);
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const q = searchParams.get("artist") || searchParams.get("eventName") || searchParams.get("q") || "";
    const city = searchParams.get("city") || undefined;
    const country = searchParams.get("country") || undefined;
    const type = searchParams.get("type") || undefined;

    const params = new URLSearchParams({ size: "24", dateFrom: today });
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (country) params.set("country", country);
    // Pour les festivals, Ticketmaster n'a pas de segment dédié → on filtre après
    if (type && type !== "festival") params.set("type", type);

    setLoading(true);
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.events) {
          let evts: Event[] = data.events;
          // Filtre festival côté client
          if (type === "festival") evts = evts.filter(e => e.type === "festival");
          // Filtre prix
          evts = evts.filter(e => e.minPrice <= priceMax);
          setEvents(evts);
        } else setEvents([]);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [searchParams, priceMax]);

  // Construire le titre de la recherche
  const searchQuery = searchParams.get("artist") || searchParams.get("eventName") || searchParams.get("q") || searchParams.get("city") || "";

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── SearchBar sticky ─────────────────────────────────────────────── */}
      <div className="sticky top-16 z-40 bg-[#0d0d15]/95 backdrop-blur-lg border-b border-white/5 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SearchBar compact={true} dark />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Filtres rapides (pills) ─────────────────────────────────────── */}
        <div className="mb-8 space-y-4">
          {/* Pays */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-white/30 text-xs font-medium mr-1">Pays :</span>
            {COUNTRY_FILTERS.map(c => (
              <button
                key={c.code}
                onClick={() => setFilter("country", c.code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  activeCountry === c.code
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {c.flag} {c.label}
              </button>
            ))}
          </div>

          {/* Type */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-white/30 text-xs font-medium mr-1">Catégorie :</span>
            {TYPE_FILTERS.map(t => (
              <button
                key={t.value}
                onClick={() => setFilter("type", t.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  activeType === t.value
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}

            {/* Budget toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all ml-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Budget
            </button>
          </div>

          {/* Budget slider (expandable) */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Budget maximum</span>
                <span className="text-white font-bold">{priceMax}€</span>
              </div>
              <input
                type="range" min="0" max="2000" step="50"
                value={priceMax}
                onChange={e => setPriceMax(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </motion.div>
          )}
        </div>

        {/* ── Contexte de la recherche ────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {loading ? (
                <span className="text-white/40">Recherche en cours…</span>
              ) : (
                <>
                  <span className="text-blue-400">{events.length}</span>
                  <span className="text-white/70"> événement{events.length !== 1 ? "s" : ""}</span>
                  {searchQuery && <span className="text-white/40 font-normal text-base"> pour « {searchQuery} »</span>}
                  {activeCountry && <span className="text-white/40 font-normal text-base"> en {COUNTRY_FILTERS.find(c => c.code === activeCountry)?.label}</span>}
                </>
              )}
            </h2>
          </div>
          {activeFrom && (
            <span className="text-sm text-white/40 flex items-center gap-1">
              ✈️ Départ depuis <span className="text-white/70 font-medium ml-1">{activeFrom}</span>
            </span>
          )}
        </div>

        {/* ── Grille résultats ────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-white/20" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                {/* EventCard adapté au dark mode */}
                <DarkSearchCard event={event} from={activeFrom} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <Zap className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucun événement trouvé</h3>
            <p className="text-white/40 mb-6">Essayez d'autres filtres ou une recherche différente.</p>
            <Button variant="primary" onClick={() => router.push("/search")}>
              Réinitialiser
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Card sombre pour la page recherche ──────────────────────────────────────
function DarkSearchCard({ event, from }: { event: Event; from: string }) {
  const typeLabel: Record<string, string> = { concert: "Concert", sport: "Football", festival: "Festival", theatre: "Théâtre" };
  const typeBadge: Record<string, string> = {
    concert: "bg-purple-600/70", sport: "bg-green-600/70", festival: "bg-orange-600/70", theatre: "bg-blue-600/70",
  };
  const countryFlag = (c: string) => {
    const lc = c.toLowerCase();
    if (lc.includes("france")) return "🇫🇷";
    if (lc.includes("espagne") || lc.includes("spain")) return "🇪🇸";
    if (lc.includes("italie") || lc.includes("italy")) return "🇮🇹";
    if (lc.includes("allemagne") || lc.includes("germany")) return "🇩🇪";
    return "";
  };
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";
  const href = from ? `/event/${event.id}?from=${encodeURIComponent(from)}` : `/event/${event.id}`;

  return (
    <a href={href} className="block group">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300 h-full flex flex-col">
        <div className="relative h-44 bg-white/5 overflow-hidden flex-shrink-0">
          {event.image ? (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-blue-900/30 to-purple-900/30">🎵</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <div className={`absolute top-3 right-3 ${typeBadge[event.type] || "bg-blue-600/70"} backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold`}>
            {typeLabel[event.type] || event.type}
          </div>
          {event.country && <div className="absolute top-3 left-3 text-lg">{countryFlag(event.country)}</div>}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">{event.title}</h3>
          <p className="text-white/40 text-xs mb-auto truncate">📍 {event.venue}, {event.city}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
            <div>
              <p className="text-white/30 text-xs">{fmt(event.date)}{event.startTime && ` · ${event.startTime.slice(0,5)}`}</p>
              <p className="text-blue-400 font-bold">{event.minPrice > 0 ? `dès ${event.minPrice}€` : "Prix TBD"}</p>
            </div>
            <span className="text-xs font-medium text-white/20 group-hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg border border-white/10 group-hover:border-blue-500/40">
              Voir pack →
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}
