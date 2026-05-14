"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Ticket, ChevronRight, Music2, Trophy, Tent, ShieldCheck, BadgeCheck, Lock, Headphones, Search, Plane, CreditCard } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";

// ─── Catégories
const CATEGORIES = [
  {
    label: "Concerts",
    icon: Music2,
    desc: "Pop, Rock, Hip-Hop, Électro",
    type: "music",
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-200",
    text: "text-purple-700",
    iconColor: "text-purple-500",
    activering: "ring-purple-400",
  },
  {
    label: "Sport",
    icon: Trophy,
    desc: "Football, Tennis, F1, Basketball, Rugby",
    type: "sport",
    bg: "bg-green-50 hover:bg-green-100",
    border: "border-green-200",
    text: "text-green-700",
    iconColor: "text-green-500",
    activering: "ring-green-400",
  },
  {
    label: "Festivals",
    icon: Tent,
    desc: "Lollapalooza, Primavera, Rock am Ring",
    type: "festival",
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-700",
    iconColor: "text-orange-500",
    activering: "ring-orange-400",
  },
];

const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
  { code: "DE", name: "Allemagne" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Search,      title: "Cherche ton événement", desc: "Concert, match ou festival — en France, Espagne, Italie ou Allemagne." },
  { step: "02", icon: Plane,       title: "Compose ton séjour",    desc: "Ajoute ton vol, ton hôtel et tes billets en quelques clics." },
  { step: "03", icon: CreditCard,  title: "Réserve en 1 paiement", desc: "Tout confirmé instantanément. Tu n'as plus qu'à y aller." },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Billets officiels garantis", desc: "100 % issus de billetteries certifiées, jamais de revendeurs non vérifiés." },
  { icon: BadgeCheck,  title: "Partenaires de référence",   desc: "Ticketmaster, Fnac Spectacles, See Tickets et d'autres acteurs agréés." },
  { icon: Lock,        title: "Paiement sécurisé",          desc: "Chiffrement SSL et protection de l'acheteur à chaque transaction." },
  { icon: Headphones,  title: "Assistance dédiée",          desc: "Une question avant ou après réservation ? Notre équipe vous répond." },
];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const params = new URLSearchParams({ size: "9", dateFrom: today });
    if (activeCategory && activeCategory !== "festival") params.set("type", activeCategory);

    setLoading(true);
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.events?.length) {
          const evts = data.events as Event[];
          if (activeCategory === "festival") {
            setEvents(evts.filter(e => e.type === "festival").slice(0, 9));
          } else {
            setEvents(evts.slice(0, 9));
          }
        } else setEvents([]);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── HERO dark ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center items-center overflow-hidden pt-16 bg-[#0c0e1a]">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            France · Espagne · Italie · Allemagne
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
          >
            Voyagez pour{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              la passion
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-12"
          >
            Billets · Vol · Hôtel — composez votre séjour événementiel en une seule réservation, sans tracas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-8"
          >
            <SearchBar compact={false} dark />
          </motion.div>

          {/* Country pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {COUNTRIES.map(c => (
              <Link
                key={c.code}
                href={`/search?country=${c.code}`}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-white/70 hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/30">Explorer</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1"
          >
            <div className="w-1 h-2 bg-white/30 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── PARTENAIRES STRIP ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 border-b border-gray-200 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest whitespace-nowrap">
            Billets officiels via
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {["Ticketmaster", "Fnac Spectacles", "See Tickets", "Viagogo"].map(p => (
              <span key={p} className="text-gray-400 font-bold text-base">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATÉGORIES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Que voulez-vous vivre ?</h2>
            <p className="text-gray-500">Sélectionnez une catégorie pour explorer les événements</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
              <motion.button
                key={cat.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveCategory(activeCategory === cat.type ? "" : cat.type)}
                className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${cat.bg} ${cat.border} ${activeCategory === cat.type ? `ring-2 ${cat.activering}` : ""}`}
              >
                <Icon className={`w-8 h-8 mb-3 ${cat.iconColor}`} />
                <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.label}</h3>
                <p className={`text-sm ${cat.text}`}>{cat.desc}</p>
                {activeCategory === cat.type && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </motion.button>
              );
            })}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event, idx) => (
                  <EventCard key={event.id} event={event} index={idx} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/search">
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium transition-all">
                    Voir tous les événements <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun événement dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CONFIANCE / GARANTIES ─────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Des billets officiels, des partenaires de confiance
            </h2>
            <p className="text-blue-100 text-sm">
              Chaque billet vendu sur Eventrip provient directement de billetteries officielles et de partenaires agréés.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5"
              >
                <Icon className="w-6 h-6 text-white mb-3" />
                <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                <p className="text-blue-100 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500">3 étapes. 1 paiement. 0 prise de tête.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon;
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-5xl font-bold text-gray-100 mb-2">{item.step}</div>
                <Icon className="w-6 h-6 text-gray-400 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 text-gray-300">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Prêt pour l'expérience ?</h2>
            <p className="text-gray-500 mb-8 text-lg">Des milliers de voyageurs ont déjà réservé leur prochain séjour événementiel.</p>
            <Link href="/search">
              <button className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg transition-all shadow-lg shadow-blue-200">
                Explorer les événements <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-gray-400 text-sm">© 2026 Eventrip — Voyagez pour la passion.</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-gray-700 transition-colors">Conditions</a>
            <a href="/" className="hover:text-gray-700 transition-colors">Confidentialité</a>
            <a href="/" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
