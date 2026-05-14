"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Loader2, Ticket, ChevronRight,
  Music2, Trophy, Tent,
  Search, Package2, CreditCard,
  ShieldCheck, BadgeCheck, Lock, Headphones,
} from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";

const CATEGORIES = [
  {
    label: "Concerts",
    desc: "Pop, Rock, Hip-Hop, Électronique et plus",
    type: "music",
    icon: Music2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeBorder: "border-blue-500",
  },
  {
    label: "Sport",
    desc: "Football, Tennis, Formule 1, Basketball, Rugby",
    type: "sport",
    icon: Trophy,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    activeBorder: "border-emerald-500",
  },
  {
    label: "Festivals",
    desc: "Lollapalooza, Primavera Sound, Rock am Ring",
    type: "festival",
    icon: Tent,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    activeBorder: "border-violet-500",
  },
];

const COUNTRIES = [
  { code: "FR", flag: "FR", name: "France" },
  { code: "ES", flag: "ES", name: "Espagne" },
  { code: "IT", flag: "IT", name: "Italie" },
  { code: "DE", flag: "DE", name: "Allemagne" },
];

const HOW_IT_WORKS = [
  { step: "1", icon: Search,   title: "Trouvez votre événement", desc: "Concerts, matchs, festivals en France, Espagne, Italie ou Allemagne." },
  { step: "2", icon: Package2, title: "Composez votre séjour",   desc: "Sélectionnez vos billets, votre vol et votre hôtel en quelques clics." },
  { step: "3", icon: CreditCard, title: "Un seul paiement",      desc: "Tout est confirmé instantanément. Il ne reste plus qu'à partir." },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Billets officiels garantis",  desc: "Chaque billet provient de billetteries agréées. Aucun risque de contrefaçon." },
  { icon: BadgeCheck,  title: "Partenaires certifiés",       desc: "Ticketmaster, Fnac Spectacles, See Tickets — les références du secteur." },
  { icon: Lock,        title: "Paiement sécurisé",           desc: "Chiffrement SSL et protection de l'acheteur à chaque transaction." },
  { icon: Headphones,  title: "Assistance dédiée",           desc: "Notre équipe vous accompagne avant, pendant et après votre réservation." },
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

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 bg-gradient-to-br from-blue-700 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #ffffff 0%, transparent 60%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            France · Espagne · Italie · Allemagne
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-white leading-tight mb-5"
          >
            Voyagez pour la passion
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-blue-100 max-w-xl mx-auto mb-10"
          >
            Billets officiels, vol et hôtel réunis en une seule réservation — simple, fiable, sans intermédiaire.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <SearchBar compact={false} dark />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {COUNTRIES.map(c => (
              <Link
                key={c.code}
                href={`/search?country=${c.code}`}
                className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-sm text-white/80 hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Vague de transition vers le blanc */}
        <div className="h-12 bg-gradient-to-b from-transparent to-white" />
      </section>

      {/* ── PARTENAIRES ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest whitespace-nowrap">
            Billets officiels via
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {["Ticketmaster", "Fnac Spectacles", "See Tickets", "Viagogo"].map(p => (
              <span key={p} className="text-gray-400 font-semibold text-sm tracking-wide">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÉGORIES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Que souhaitez-vous vivre ?</h2>
            <p className="text-gray-500 text-sm">Sélectionnez une catégorie pour découvrir les événements disponibles.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.type;
              return (
                <motion.button
                  key={cat.type}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setActiveCategory(isActive ? "" : cat.type)}
                  className={`text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                    isActive
                      ? `${cat.bg} ${cat.activeBorder}`
                      : `bg-white ${cat.border} hover:${cat.bg}`
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${cat.bg}`}>
                    <Icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{cat.label}</h3>
                  <p className={`text-sm ${cat.color}`}>{cat.desc}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Grille événements */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
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
                  <button className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
                    Voir tous les événements <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Ticket className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Aucun événement dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CONFIANCE ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pourquoi choisir Eventrip ?</h2>
            <p className="text-gray-500 text-sm">Des billets authentiques, des partenaires reconnus, un service pensé pour les voyageurs événementiels.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <Icon className="w-6 h-6 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comment ça marche ?</h2>
            <p className="text-gray-500 text-sm">3 étapes. Un seul paiement.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative text-center md:text-left"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm mb-4">
                    {item.step}
                  </div>
                  <Icon className="hidden md:block w-5 h-5 text-gray-300 mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-4 -right-5 text-gray-200">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Prêt pour votre prochain séjour ?</h2>
            <p className="text-blue-100 mb-8 text-base">Des milliers de voyageurs ont déjà réservé leur prochaine expérience événementielle.</p>
            <Link href="/search">
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition-colors">
                Explorer les événements <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-gray-400 text-sm">© 2026 Eventrip. Tous droits réservés.</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-gray-700 transition-colors">Conditions générales</a>
            <a href="/" className="hover:text-gray-700 transition-colors">Confidentialité</a>
            <a href="/" className="hover:text-gray-700 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
