"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Ticket, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";

// ─── Catégories
const CATEGORIES = [
  {
    label: "Concerts",
    emoji: "🎵",
    desc: "Pop, Rock, Hip-Hop, Électro",
    type: "music",
    gradient: "from-purple-600 to-indigo-700",
    bg: "bg-purple-600/10 hover:bg-purple-600/20",
    border: "border-purple-500/30",
    text: "text-purple-300",
  },
  {
    label: "Football",
    emoji: "⚽",
    desc: "Liga, Serie A, Bundesliga, Ligue 1",
    type: "sports",
    gradient: "from-green-600 to-emerald-700",
    bg: "bg-green-600/10 hover:bg-green-600/20",
    border: "border-green-500/30",
    text: "text-green-300",
  },
  {
    label: "Festivals",
    emoji: "🎪",
    desc: "Lollapalooza, Primavera, Rock am Ring",
    type: "festival",
    gradient: "from-orange-500 to-pink-600",
    bg: "bg-orange-600/10 hover:bg-orange-600/20",
    border: "border-orange-500/30",
    text: "text-orange-300",
  },
];

const COUNTRIES = [
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "ES", flag: "🇪🇸", name: "Espagne" },
  { code: "IT", flag: "🇮🇹", name: "Italie" },
  { code: "DE", flag: "🇩🇪", name: "Allemagne" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: "🔍", title: "Cherche ton événement", desc: "Concert, match ou festival — en France, Espagne, Italie ou Allemagne." },
  { step: "02", icon: "✈️", title: "Compose ton pack", desc: "Ajoute ton vol, ton hôtel et tes billets en quelques clics." },
  { step: "03", icon: "🎟️", title: "Réserve en 1 paiement", desc: "Tout confirmé instantanément. Tu n'as plus qu'à y aller." },
];

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const params = new URLSearchParams({ size: "9", dateFrom: today });
    if (activeCategory && activeCategory !== "festival") params.set("type", activeCategory === "music" ? "music" : "sports");

    setLoading(true);
    fetch(`/api/events?${params}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.events?.length) {
          const evts = data.events as Event[];
          // Si catégorie "festival", filtrer côté client
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
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── HERO dark ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-center items-center overflow-hidden pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-[100px]" />
        </div>

        {/* Noise overlay subtil */}
        <div className="absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml,%3Csvg viewBox%3D%220 0 200 200%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter id%3D%22n%22%3E%3CfeTurbulence type%3D%22fractalNoise%22 baseFrequency%3D%220.9%22 numOctaves%3D%224%22%2F%3E%3C%2Ffilter%3E%3Crect width%3D%22100%25%22 height%3D%22100%25%22 filter%3D%22url(%23n)%22%2F%3E%3C%2Fsvg%3E')]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            🇫🇷 🇪🇸 🇮🇹 🇩🇪 &nbsp;·&nbsp; Concerts · Foot · Festivals
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
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
            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12"
          >
            Billets · Vol · Hôtel — un seul pack, un seul paiement.
            Le <em className="text-white/70 not-italic font-medium">Gig Tripping</em> sans prise de tête.
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
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-white/70 hover:text-white"
              >
                {c.flag} {c.name}
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

      {/* ── CATÉGORIES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Que voulez-vous vivre ?</h2>
            <p className="text-white/40">Sélectionnez une catégorie pour explorer les événements</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setActiveCategory(activeCategory === cat.type ? "" : cat.type)}
                className={`relative p-6 rounded-2xl border text-left transition-all duration-300 ${cat.bg} ${cat.border} ${activeCategory === cat.type ? "ring-2 ring-white/20" : ""}`}
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-1">{cat.label}</h3>
                <p className={`text-sm ${cat.text}`}>{cat.desc}</p>
                {activeCategory === cat.type && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Events grid */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-white/30" />
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <DarkEventCard event={event} />
                  </motion.div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/search">
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-medium transition-all">
                    Voir tous les événements <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-white/30">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun événement dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Comment ça marche ?</h2>
            <p className="text-white/40">3 étapes. 1 paiement. 0 prise de tête.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="text-5xl font-bold text-white/5 mb-2">{item.step}</div>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-4 text-white/10">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="text-5xl mb-4">🎟️</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Prêt pour l'expérience ?</h2>
            <p className="text-white/40 mb-8 text-lg">Des milliers de fans ont déjà réservé leur prochain voyage événementiel.</p>
            <Link href="/search">
              <button className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg transition-all shadow-lg shadow-blue-900/30">
                Explorer les événements <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-white/20 text-sm">© 2026 Eventrip — Voyagez pour la passion.</span>
          <div className="flex gap-6 text-sm text-white/20">
            <a href="/" className="hover:text-white/50 transition-colors">Conditions</a>
            <a href="/" className="hover:text-white/50 transition-colors">Confidentialité</a>
            <a href="/" className="hover:text-white/50 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Dark EventCard (version sombre pour la homepage) ────────────────────────
function DarkEventCard({ event }: { event: Event }) {
  const typeLabel: Record<string, string> = {
    concert: "Concert", sport: "Sport", festival: "Festival", theatre: "Théâtre",
  };
  const typeBadge: Record<string, string> = {
    concert: "bg-purple-600/80", sport: "bg-green-600/80", festival: "bg-orange-600/80", theatre: "bg-blue-600/80",
  };

  const fmt = (d: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Link href={`/event/${event.id}`} className="block group">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:border-white/20 transition-all duration-300">
        {/* Image */}
        <div className="relative h-44 bg-white/5 overflow-hidden">
          {event.image ? (
            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🎵</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
          <div className={`absolute top-3 right-3 ${typeBadge[event.type] || "bg-blue-600/80"} backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold`}>
            {typeLabel[event.type] || event.type}
          </div>
          {event.country && (
            <div className="absolute top-3 left-3 text-lg">
              {event.country.toLowerCase().includes("france") ? "🇫🇷"
                : event.country.toLowerCase().includes("espagne") || event.country.toLowerCase().includes("spain") ? "🇪🇸"
                : event.country.toLowerCase().includes("italie") || event.country.toLowerCase().includes("italy") ? "🇮🇹"
                : event.country.toLowerCase().includes("allemagne") || event.country.toLowerCase().includes("germany") ? "🇩🇪"
                : ""}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors">{event.title}</h3>
          <p className="text-white/40 text-xs mb-3 truncate">📍 {event.venue}, {event.city}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/30 text-xs">{fmt(event.date)}</p>
              <p className="text-blue-400 font-bold text-base">
                dès {event.minPrice > 0 ? event.minPrice : 45}€
              </p>
            </div>
            <span className="text-xs text-white/30 group-hover:text-white/60 flex items-center gap-1 transition-colors">
              Voir le pack <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
