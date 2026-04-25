"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Plane,
  Hotel,
  Ticket,
  Star,
  ChevronDown,
  MapPinIcon,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PackageCalculator } from "@/components/ui/PackageCalculator";
import { Event, Flight, Hotel, PackageItem } from "@/types";
import { formatPrice, formatDate, getDurationString } from "@/lib/utils";

const mockEvent: Event = {
  id: "1",
  title: "Taylor Swift - Eras Tour",
  venue: "La Défense Arena",
  city: "Paris",
  country: "France",
  date: "2024-07-15",
  startTime: "20:00",
  type: "concert",
  image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600",
  ticketsAvailable: 500,
  minPrice: 150,
  maxPrice: 450,
  description:
    "The most anticipated tour of the year. Experience the magic of the Eras Tour with Taylor Swift performing all her greatest hits.",
};

const mockFlights: Flight[] = [
  {
    id: "flight-1",
    departureAirport: "CDG",
    arrivalAirport: "LHR",
    departureTime: "2024-07-14T08:00:00",
    arrivalTime: "2024-07-14T10:00:00",
    airline: "Air France",
    price: 120,
    duration: 120,
    stops: 0,
    availability: 25,
    aircraft: "B777",
  },
  {
    id: "flight-2",
    departureAirport: "CDG",
    arrivalAirport: "LHR",
    departureTime: "2024-07-14T10:30:00",
    arrivalTime: "2024-07-14T12:45:00",
    airline: "British Airways",
    price: 140,
    duration: 135,
    stops: 0,
    availability: 18,
    aircraft: "A380",
  },
  {
    id: "flight-3",
    departureAirport: "CDG",
    arrivalAirport: "LHR",
    departureTime: "2024-07-14T14:00:00",
    arrivalTime: "2024-07-14T16:30:00",
    airline: "Lufthansa",
    price: 95,
    duration: 150,
    stops: 1,
    availability: 40,
    aircraft: "A320",
  },
];

const mockHotels: Hotel[] = [
  {
    id: "hotel-1",
    name: "Hotel Le Marais Paris",
    city: "Paris",
    latitude: 48.86,
    longitude: 2.36,
    distance: 1.2,
    stars: 5,
    price: 280,
    currency: "EUR",
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300",
    amenities: ["WiFi", "Spa", "Restaurant", "Gym"],
    reviews: 450,
    rating: 4.8,
    availability: true,
  },
  {
    id: "hotel-2",
    name: "Boutique Hotel Champs Élysées",
    city: "Paris",
    latitude: 48.87,
    longitude: 2.31,
    distance: 2.5,
    stars: 4,
    price: 180,
    currency: "EUR",
    image: "https://images.unsplash.com/photo-1595909352763-b1370bb3e597?w=400&h=300",
    amenities: ["WiFi", "Restaurant", "Gym"],
    reviews: 320,
    rating: 4.6,
    availability: true,
  },
  {
    id: "hotel-3",
    name: "Hotel de Charme Seine",
    city: "Paris",
    latitude: 48.85,
    longitude: 2.35,
    distance: 3.1,
    stars: 4,
    price: 150,
    currency: "EUR",
    image: "https://images.unsplash.com/photo-1596178065887-bdb46c3c9fcc?w=400&h=300",
    amenities: ["WiFi", "Restaurant"],
    reviews: 280,
    rating: 4.4,
    availability: true,
  },
  {
    id: "hotel-4",
    name: "Hotel Montmartre Modern",
    city: "Paris",
    latitude: 48.88,
    longitude: 2.33,
    distance: 4.2,
    stars: 3,
    price: 95,
    currency: "EUR",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300",
    amenities: ["WiFi", "Breakfast"],
    reviews: 180,
    rating: 4.2,
    availability: true,
  },
];

const ticketCategories = [
  { id: "fosse", name: "Fosse VIP", price: 450, description: "Front row access" },
  {
    id: "tribune",
    name: "Tribune",
    price: 250,
    description: "Standard seating",
  },
  {
    id: "general",
    name: "Général",
    price: 150,
    description: "Standing area",
  },
];

type StepType = "tickets" | "transport" | "hotel";

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [expandedSteps, setExpandedSteps] = useState<StepType[]>(["tickets"]);
  const [selectedItems, setSelectedItems] = useState<PackageItem[]>([]);
  const [transportMode, setTransportMode] = useState<"flight" | "train">(
    "flight"
  );

  const toggleStep = (step: StepType) => {
    setExpandedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const addTicket = (category: (typeof ticketCategories)[0]) => {
    const existingTicket = selectedItems.find(
      (item) => item.id === category.id && item.type === "ticket"
    );

    if (existingTicket) {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.id === category.id && item.type === "ticket"
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          type: "ticket",
          id: category.id,
          price: category.price,
          quantity: 1,
          details: { category: category.name },
        },
      ]);
    }
  };

  const addFlight = (flight: Flight) => {
    const existingFlight = selectedItems.find(
      (item) => item.id === flight.id && item.type === "flight"
    );

    if (!existingFlight) {
      setSelectedItems((prev) => [
        ...prev,
        {
          type: "flight",
          id: flight.id,
          price: flight.price,
          quantity: 1,
          details: {
            airline: flight.airline,
            departure: flight.departureTime,
            arrival: flight.arrivalTime,
          },
        },
      ]);
    }
  };

  const addHotel = (hotel: Hotel, nights: number = 2) => {
    const existingHotel = selectedItems.find(
      (item) => item.id === hotel.id && item.type === "hotel"
    );

    if (!existingHotel) {
      setSelectedItems((prev) => [
        ...prev,
        {
          type: "hotel",
          id: hotel.id,
          price: hotel.price,
          quantity: nights,
          details: { hotel: hotel.name, distance: hotel.distance },
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <Image
          src={mockEvent.image}
          alt={mockEvent.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-4 inline-block px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold text-sm">
              {mockEvent.type.toUpperCase()}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {mockEvent.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent-400" />
                {mockEvent.venue}, {mockEvent.city}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-400" />
                {formatDate(mockEvent.date)} at {mockEvent.startTime}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-400" />
                {mockEvent.ticketsAvailable} places disponibles
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {[
              {
                id: "tickets" as StepType,
                title: "Étape 1: Billets",
                icon: Ticket,
                content: (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Choisissez votre catégorie de place
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ticketCategories.map((category) => (
                        <motion.button
                          key={category.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addTicket(category)}
                          className="glass p-6 text-left hover:border-primary-500 hover:shadow-glow transition-smooth group"
                        >
                          <h4 className="font-bold text-lg mb-2 group-hover:text-primary-400 transition-smooth">
                            {category.name}
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">
                            {category.description}
                          </p>
                          <p className="text-2xl font-bold gradient-text">
                            {formatPrice(category.price)}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                id: "transport" as StepType,
                title: "Étape 2: Transport",
                icon: Plane,
                content: (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setTransportMode("flight")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-smooth ${
                          transportMode === "flight"
                            ? "bg-primary-600 text-white"
                            : "bg-dark-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Plane className="w-4 h-4 inline mr-2" />
                        Vols
                      </button>
                      <button
                        onClick={() => setTransportMode("train")}
                        className={`px-4 py-2 rounded-lg font-semibold transition-smooth ${
                          transportMode === "train"
                            ? "bg-primary-600 text-white"
                            : "bg-dark-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Wind className="w-4 h-4 inline mr-2" />
                        Trains
                      </button>
                    </div>

                    <div className="space-y-3">
                      {mockFlights.map((flight) => (
                        <motion.div
                          key={flight.id}
                          className="glass p-4 hover:border-primary-500 transition-smooth"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-bold">{flight.airline}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="font-semibold">
                                  {flight.departureTime.split("T")[1]}
                                </span>
                                <span className="text-gray-400">
                                  {getDurationString(flight.duration)}
                                </span>
                                <span className="font-semibold">
                                  {flight.arrivalTime.split("T")[1]}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                {flight.stops === 0
                                  ? "Direct"
                                  : `${flight.stops} escale(s)`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold gradient-text">
                                {formatPrice(flight.price)}
                              </p>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => addFlight(flight)}
                                className="mt-2"
                              >
                                Ajouter
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                id: "hotel" as StepType,
                title: "Étape 3: Hébergement",
                icon: Hotel,
                content: (
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Sélectionnez un hôtel près de la venue
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockHotels.map((hotel) => (
                        <motion.div
                          key={hotel.id}
                          className="glass overflow-hidden hover:border-primary-500 hover:shadow-glow transition-smooth group"
                        >
                          <div className="relative h-32 overflow-hidden">
                            <Image
                              src={hotel.image || ""}
                              alt={hotel.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold mb-2">{hotel.name}</h4>
                            <div className="flex items-center gap-2 mb-3">
                              {Array.from({ length: hotel.stars }).map(
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="w-4 h-4 text-accent-400 fill-accent-400"
                                  />
                                )
                              )}
                              <span className="text-xs text-gray-400">
                                {hotel.rating} ({hotel.reviews} avis)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-400">
                              <MapPinIcon className="w-4 h-4" />
                              {hotel.distance} km du lieu
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-2xl font-bold gradient-text">
                                {formatPrice(hotel.price)}
                                <span className="text-xs text-gray-400">/nuit</span>
                              </p>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => addHotel(hotel)}
                              >
                                Ajouter
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((step) => {
              const Icon = step.icon;
              const isExpanded = expandedSteps.includes(step.id);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass overflow-hidden"
                >
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-primary-400" />
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-white/10 p-6"
                      >
                        {step.content}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-32 space-y-6">
              <PackageCalculator items={selectedItems} />

              <Button variant="primary" size="lg" className="w-full group">
                Réserver ce Pack
                <motion.span
                  className="inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  →
                </motion.span>
              </Button>

              <div className="glass p-6 space-y-4">
                <h4 className="font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent-400" />
                  Votre confiance, notre priorité
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex gap-2">
                    <span className="text-accent-400">✓</span>
                    Paiement sécurisé
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-400">✓</span>
                    Annulation gratuite
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent-400">✓</span>
                    Support 24/7
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
