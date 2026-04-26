"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Zap,
  Users,
  Shield,
  Globe,
  Award,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Button } from "@/components/ui/Button";
import { Event } from "@/types";

const steps = [
  {
    number: "01",
    title: "Choisissez l'événement",
    description: "Parcourez notre catalogue d'événements et trouvez celui qui vous fait rêver",
    icon: Globe,
  },
  {
    number: "02",
    title: "Personnalisez votre pack",
    description: "Combinez billets, vols, trains et hôtels selon vos préférences et votre budget",
    icon: Zap,
  },
  {
    number: "03",
    title: "Réservez en 1 clic",
    description: "Finalisez votre réservation et recevez vos confirmations instantanément",
    icon: CheckCircle,
  },
];

const trustBadges = [
  { icon: Globe, text: "40M+ événements", subtext: "Couverture mondiale" },
  { icon: Award, text: "Prix garanti", subtext: "Meilleur tarif" },
  { icon: Shield, text: "Support 24/7", subtext: "Toujours disponible" },
];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    fetch(`/api/events?q=&size=6&dateFrom=${today}&sort=date,asc`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.events?.length) {
          setEvents(data.events.slice(0, 6));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6 mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Concerts · Sport · Festivals 2026
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900">
              <span className="block">Votre prochain grand voyage</span>
              <span className="gradient-text block">commence par un événement</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto">
              Découvrez et réservez des packs complets : billets + transport + hébergement.
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
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {trustBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-smooth"
                >
                  <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="font-bold text-lg text-gray-900">{badge.text}</p>
                  <p className="text-sm text-gray-500">{badge.subtext}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Événements à venir — Ticketmaster live */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Événements à venir
            </h2>
            <p className="text-xl text-gray-500">
              Catalogue officiel Ticketmaster — dates 2026 en temps réel
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
          ) : events.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event, idx) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <EventCard event={event} index={idx} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              Aucun événement disponible pour le moment.
            </div>
          )}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-500">3 étapes simples pour vos packs événements</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div key={idx} variants={itemVariants} className="relative">
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 h-full hover:shadow-md hover:border-blue-200 transition-smooth">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 mb-6">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-5xl font-bold text-blue-100 mb-2">{step.number}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-blue-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Prêt à vivre l'expérience ?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Explorez des milliers d'événements et créez votre pack idéal dès maintenant.
            </p>
            <a href="/">
              <Button variant="secondary" size="lg" className="group bg-white text-blue-600 hover:bg-blue-50 border-white">
                Découvrir les événements
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {[
              { title: "À propos", links: ["Notre histoire", "Carrières", "Blog"] },
              { title: "Support", links: ["Contact", "FAQ", "Conditions"] },
              { title: "Légal", links: ["Confidentialité", "CGU", "Cookies"] },
              { title: "Suivez-nous", links: ["Twitter", "Instagram", "LinkedIn"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-gray-900 mb-4">{col.title}</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="/" className="hover:text-blue-600 transition-smooth">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-400 text-sm">
              © 2026 Eventrip. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
