"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Zap,
  Users,
  Shield,
  Globe,
  Award,
  ArrowRight,
} from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Button } from "@/components/ui/Button";
import { Event } from "@/types";

const mockPopularEvents: Event[] = [
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
    title: "Champions League Final",
    venue: "Stadion Berlin",
    city: "Berlin",
    country: "Germany",
    date: "2024-06-01",
    type: "sport",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&h=400",
    ticketsAvailable: 1200,
    minPrice: 200,
    maxPrice: 800,
  },
  {
    id: "3",
    title: "Coachella Festival",
    venue: "Empire Polo Club",
    city: "Indio",
    country: "USA",
    date: "2024-04-13",
    type: "festival",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=500&h=400",
    ticketsAvailable: 3000,
    minPrice: 299,
    maxPrice: 599,
  },
  {
    id: "4",
    title: "Roland Garros",
    venue: "Stade Roland Garros",
    city: "Paris",
    country: "France",
    date: "2024-05-26",
    type: "sport",
    image: "https://images.unsplash.com/photo-1554224311-beee415c15c9?w=500&h=400",
    ticketsAvailable: 800,
    minPrice: 100,
    maxPrice: 400,
  },
  {
    id: "5",
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
    id: "6",
    title: "Wimbledon Championships",
    venue: "All England Club",
    city: "London",
    country: "UK",
    date: "2024-06-24",
    type: "sport",
    image: "https://images.unsplash.com/photo-1483729558449-99daa93c17c1?w=500&h=400",
    ticketsAvailable: 600,
    minPrice: 120,
    maxPrice: 500,
  },
];

const steps = [
  {
    number: "01",
    title: "Choisissez l'événement",
    description:
      "Parcourez notre catalogue de 40M+ événents et trouvez celui qui vous fait rêver",
    icon: Globe,
  },
  {
    number: "02",
    title: "Personnalisez le pack",
    description:
      "Combinez billets, vols, trains et hôtels selon vos préférences et votre budget",
    icon: Zap,
  },
  {
    number: "03",
    title: "Réservez en 1 clic",
    description:
      "Finalisez la réservation et recevez les confirmations instantanément",
    icon: CheckCircle,
  },
];

const trustBadges = [
  { icon: Globe, text: "40M+ événements", subtext: "Worldwide coverage" },
  { icon: Award, text: "Prix garanti", subtext: "Best price promise" },
  { icon: Shield, text: "Support 24/7", subtext: "Always here for you" },
];

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="gradient-bg absolute inset-0 opacity-40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-950/50 to-dark-950" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-12"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block">Votre prochain grand voyage</span>
              <span className="gradient-text block text-6xl md:text-7xl lg:text-8xl">
                commence par un événement
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Découvrez et réservez des packs complets : billets + transport +
              hébergement. Le dynamic packaging pour les événements.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <SearchBar compact={false} />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center"
          >
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="glass p-6 text-center hover:shadow-glow transition-smooth"
                >
                  <Icon className="w-8 h-8 text-primary-400 mx-auto mb-3" />
                  <p className="font-bold text-lg">{badge.text}</p>
                  <p className="text-sm text-gray-400">{badge.subtext}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
             #Événements Populaires
            </h2>
            <p className="text-xl text-gray-400">
              Explorez les événements les plus attendus du moment
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {mockPopularEvents.map((event, idx) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
