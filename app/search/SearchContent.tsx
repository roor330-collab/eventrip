"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Calendar,
  DollarSign,
  MapPin,
  Zap,
  Music,
} from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";
import { Button } from "@/components/ui/Button";

const mockSearchResults: Event[] = [
  {
    id: "1",
    title: "Taylor Swift - Eras Tour",
    venue: "La Défense Arena",
    city: "Paris",
    country: "France",
    date: "2024-07-15",
    type: "concert",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=400",
    ticketsAvailable: 500,
    minPrice: 150,
    maxPrice: 450,
  },
  {
    id: "2",
    title: "Beyoncé - Renaissance Tour",
    venue: "Stade de France",
    city: "Paris",
    country: "France",
    date: "2024-08-10",
    type: "concert",
    image: "https://images.unsplash.com/photo-1501386691490-d894cecf8965?w=500&h=400",
    ticketsAvailable: 600,
    minPrice: 200,
    maxPrice: 500,
  },
  {
    id: "3",
    title: "The Weeknd - After Hours Tour",
    venue: "AccorHotels Arena",
    city: "Paris",
    country: "France",
    date: "2024-09-05",
    type: "concert",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=400",
    ticketsAvailable: 450,
    minPrice: 120,
    maxPrice: 350,
  },
  {
    id: "4",
    title: "Coldplay - Moon Music Tour",
    venue: "O2 Arena",
    city: "London",
    country: "UK",
    date: "2024-08-20",
    type: "concert",
    image: "https://images.unsplash.com/photo-1504764712202-4aebb8a0d4ca?w=500&h=400",
    ticketsAvailable: 750,
    minPrice: 80,
    maxPrice: 300,
  },
  {
    id: "5",
    title: "Dua Lipa - Future Nostalgia Tour",
    venue: "O2 Arena",
    city: "London",
    country: "UK",
    date: "2024-07-30",
    type: "concert",
    image: "https://images.unsplash.com/photo-1524368535623-71a4a0f9a6f6?w=500&h=400",
    ticketsAvailable: 800,
    minPrice: 100,
    maxPrice: 280,
  },
  {
    id: "6",
    title: "Harry Styles - Love On Tour",
    venue: "Madison Square Garden",
    city: "New York",
    country: "USA",
    date: "2024-09-15",
    type: "concert",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&h=400",
    ticketsAvailable: 650,
    minPrice: 75,
    maxPrice: 250,
  },
  {
    id: "7",
    title: "Olivia Rodrigo - GUTS Tour",
    venue: "Forum",
    city: "Los Angeles",
    country: "USA",
    date: "2024-06-20",
    type: "concert",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&h=400",
    ticketsAvailable: 500,
    minPrice: 65,
    maxPrice: 220,
  },
  {
    id: "8",
    title: "Billie Eilish - Happier Than Ever Tour",
    venue: "Hollywood Bowl",
    city: "Los Angeles",
    country: "USA",
    date: "2024-07-25",
    type: "concert",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&h=400",
    ticketsAvailable: 400,
    minPrice: 55,
    maxPrice: 180,
  },
];

interface Filters {
  type: string;
  dateFrom: string;
  dateTo: string;
  priceMin: number;
  priceMax: number;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    type: "",
    dateFrom: "",
    dateTo: "",
    priceMin: 0,
    priceMax: 1000,
  });

  const [expandedFilters, setExpandedFilters] = useState<string[]>(["type"]);

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFilterSection = (section: string) => {
    setExpandedFilters((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const filteredResults = mockSearchResults.filter((event) => {
    if (filters.type && !event.type.toLowerCase().includes(filters.type.toLowerCase())) {
      return false;
    }
    if (filters.dateFrom && new Date(event.date) < new Date(filters.dateFrom)) {
      return false;
    }
    if (filters.dateTo && new Date(event.date) > new Date(filters.dateTo)) {
      return false;
    }
    if (event.minPrice > filters.priceMax || event.maxPrice < filters.priceMin) {
      return false;
    }
    return true;
  });

  const eventTypes = ["Concert", "Sport", "Festival", "Théâtre"];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="sticky top-16 z-40 bg-dark-950/95 backdrop-blur-lg border-b border-white/10 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <SearchBar compact={true} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass p-6 space-y-6 sticky top-32">
              <h3 className="font-bold text-lg">Filtres</h3>

              {[
                {
                  id: "type",
                  title: "Type d'événement",
                  icon: Music,
                  content: (
                    <div className="space-y-2">
                      {eventTypes.map((type) => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.type === type.toLowerCase()}
                            onChange={(e) =>
                              handleFilterChange("type", e.target.checked ? type.toLowerCase() : "")
                            }
                            className="w-4 h-4 rounded bg-dark-800 border border-dark-600 accent-primary-500"
                          />
                          <span className="text-sm">{type}</span>
                        </label>
                      ))}
                    </div>
                  ),
                },
                {
                  id: "date",
                  title: "Période",
                  icon: Calendar,
                  content: (
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      />
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      />
                    </div>
                  ),
                },
                {
                  id: "price",
                  title: "Budget",
                  icon: DollarSign,
                  content: (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400 block mb-2">
                          Min: {filters.priceMin}€
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={filters.priceMin}
                          onChange={(e) => handleFilterChange("priceMin", parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-2">
                          Max: {filters.priceMax}€
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={filters.priceMax}
                          onChange={(e) => handleFilterChange("priceMax", parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ),
                },
              ].map((filter) => {
                const Icon = filter.icon;
                const isExpanded = expandedFilters.includes(filter.id);

                return (
                  <div key={filter.id} className="border-b border-white/10 pb-4">
                    <button
                      onClick={() => toggleFilterSection(filter.id)}
                      className="flex items-center justify-between w-full font-semibold text-sm hover:text-primary-400 transition-smooth"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {filter.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3"
                      >
                        {filter.content}
                      </motion.div>
                    )}
                  </div>
                );
              })}

              <Button
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() =>
                  setFilters({ type: "", dateFrom: "", dateTo: "", priceMin: 0, priceMax: 1000 })
                }
              >
                Réinitialiser
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {filteredResults.length} événements trouvés
              </h2>
              <select className="px-4 py-2 rounded-lg bg-dark-800 border border-dark-700 text-sm font-medium">
                <option>Pertinence</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
                <option>Date proche</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredResults.map((event, idx) => (
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

            {filteredResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass p-12 text-center"
              >
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Aucun événement trouvé</h3>
                <p className="text-gray-400 mb-6">
                  Essayez d'ajuster vos filtres pour trouver plus d'événements
                </p>
                <Button
                  variant="primary"
                  onClick={() =>
                    setFilters({ type: "", dateFrom: "", dateTo: "", priceMin: 0, priceMax: 1000 })
                  }
                >
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
