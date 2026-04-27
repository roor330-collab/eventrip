"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Calendar, DollarSign, Music, Zap, Loader2 } from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";
import { Button } from "@/components/ui/Button";

interface Filters {
  type: string;
  priceMin: number;
  priceMax: number;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ type: "", priceMin: 0, priceMax: 2000 });
  const [expandedFilters, setExpandedFilters] = useState<string[]>(["type"]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const q = searchParams.get("artist") || searchParams.get("eventName") || searchParams.get("city") || "";
    const city = searchParams.get("city") || undefined;

    const params = new URLSearchParams({ size: "20", dateFrom: today, sort: "date,asc" });
    if (q) params.set("q", q);
    if (city) params.set("city", city);
    if (filters.type) params.set("type", filters.type);

    setLoading(true);
    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.events) setEvents(data.events);
        else setEvents([]);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [searchParams, filters.type]);

  const filteredEvents = events.filter(
    (e) => e.minPrice <= filters.priceMax && e.maxPrice >= filters.priceMin
  );

  const toggleSection = (s: string) =>
    setExpandedFilters((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const eventTypes = [
    { label: "Concerts", value: "music" },
    { label: "Sport", value: "sports" },
    { label: "Arts", value: "arts" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche sticky */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <SearchBar compact={true} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6 sticky top-32 shadow-sm">
              <h3 className="font-bold text-lg text-gray-900">Filtres</h3>

              {/* Type */}
              <div className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => toggleSection("type")}
                  className="flex items-center justify-between w-full font-semibold text-sm text-gray-700 hover:text-blue-600 transition-smooth"
                >
                  <span className="flex items-center gap-2"><Music className="w-4 h-4" />Type</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.includes("type") ? "rotate-180" : ""}`} />
                </button>
                {expandedFilters.includes("type") && (
                  <div className="mt-3 space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        checked={filters.type === ""}
                        onChange={() => setFilters((p) => ({ ...p, type: "" }))}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">Tous</span>
                    </label>
                    {eventTypes.map((t) => (
                      <label key={t.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          checked={filters.type === t.value}
                          onChange={() => setFilters((p) => ({ ...p, type: t.value }))}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{t.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Budget */}
              <div className="border-b border-gray-100 pb-4">
                <button
                  onClick={() => toggleSection("price")}
                  className="flex items-center justify-between w-full font-semibold text-sm text-gray-700 hover:text-blue-600 transition-smooth"
                >
                  <span className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget max</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedFilters.includes("price") ? "rotate-180" : ""}`} />
                </button>
                {expandedFilters.includes("price") && (
                  <div className="mt-3 space-y-3">
                    <label className="text-xs text-gray-500 block">Max : {filters.priceMax}€</label>
                    <input
                      type="range" min="0" max="2000" step="50"
                      value={filters.priceMax}
                      onChange={(e) => setFilters((p) => ({ ...p, priceMax: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}
              </div>

              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => setFilters({ type: "", priceMin: 0, priceMax: 2000 })}
              >
                Réinitialiser
              </Button>
            </div>
          </motion.div>

          {/* Résultats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? "Chargement..." : `${filteredEvents.length} événements à venir`}
              </h2>
              <select className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700">
                <option>Date proche</option>
                <option>Prix croissant</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <EventCard event={event} index={idx} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement trouvé</h3>
                <p className="text-gray-500 mb-6">Essayez d'ajuster vos filtres</p>
                <Button variant="primary" onClick={() => setFilters({ type: "", priceMin: 0, priceMax: 2000 })}>
                  Réinitialiser les filtres
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
