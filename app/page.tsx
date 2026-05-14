"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Ticket, ChevronRight, Music2, Trophy, Tent, ShieldCheck, BadgeCheck, Lock, Headphones, Search, Plane, CreditCard } from "lucide-react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { EventCard } from "@/components/ui/EventCard";
import { Event } from "@/types";

// Apple design tokens
// bg: #ffffff / #f5f5f7
// text primary: #1d1d1f
// text secondary: #6e6e73
// CTA blue: #0071e3

const CATEGORIES = [
  { label: "Concerts",  icon: Music2,  desc: "Pop, Rock, Hip-Hop, Électronique", type: "music",    href: "/search?type=concert" },
  { label: "Sport",     icon: Trophy,  desc: "Football, Tennis, F1, Basketball", type: "sport",    href: "/search?type=sport" },
  { label: "Festivals", icon: Tent,    desc: "Lollapalooza, Primavera, Rock am Ring", type: "festival", href: "/search?type=festival" },
];

const COUNTRIES = [
  { code: "FR", name: "France" },
  { code: "ES", name: "Espagne" },
  { code: "IT", name: "Italie" },
  { code: "DE", name: "Allemagne" },
];

const HOW_IT_WORKS = [
  { step: "1", icon: Search,     title: "Trouvez votre événement", desc: "Concerts, matchs et festivals en France, Espagne, Italie ou Allemagne." },
  { step: "2", icon: Plane,      title: "Composez votre séjour",   desc: "Sélectionnez vos billets, votre vol et votre hôtel en quelques clics." },
  { step: "3", icon: CreditCard, title: "Un seul paiement",        desc: "Tout est confirmé instantanément. Il ne reste plus qu'à partir." },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: "Billets officiels",     desc: "Chaque billet provient de billetteries agréées." },
  { icon: BadgeCheck,  title: "Partenaires certifiés", desc: "Ticketmaster, Fnac Spectacles, See Tickets." },
  { icon: Lock,        title: "Paiement sécurisé",     desc: "Chiffrement SSL et protection de l'acheteur." },
  { icon: Headphones,  title: "Assistance dédiée",     desc: "Notre équipe vous accompagne à chaque étape." },
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
    <div className="min-h-screen" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center items-center pt-[44px] bg-black overflow-hidden">
        {/* Subtle radial glow — Apple product page style */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 20%, rgba(0,113,227,0.12) 0%, transparent 70%)"
        }} />

        <div className="relative z-10 w-full max-w-[980px] mx-auto px-5 sm:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-[15px] font-medium mb-5"
            style={{ color: "#0071e3" }}
          >
            Concerts · Sport · Festivals
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[56px] md:text-[80px] font-bold tracking-tight leading-[1.05] text-white mb-5"
          >
            Voyagez pour<br />la passion.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[19px] md:text-[21px] leading-relaxed max-w-[600px] mx-auto mb-10"
            style={{ color: "#86868b" }}
          >
            Billets officiels, vol et hôtel — réservez votre séjour événementiel en un seul paiement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10"
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
                className="px-4 py-1.5 rounded-full text-sm transition-all"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {c.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))" }} />
      </section>

      {/* ── PARTENAIRES ───────────────────────────────────────────────────── */}
      <div style={{ background: "#f5f5f7", borderBottom: "1px solid rgba(0,0,0,0.06)" }} className="py-5 px-5">
        <div className="max-w-[980px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12">
          <span className="text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap" style={{ color: "#86868b" }}>
            Billets officiels via
          </span>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {["Ticketmaster", "Fnac Spectacles", "See Tickets", "Viagogo"].map(p => (
              <span key={p} className="font-semibold text-sm" style={{ color: "#6e6e73" }}>{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── CATÉGORIES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8" style={{ background: "#f5f5f7" }}>
        <div className="max-w-[980px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-tight mb-3" style={{ color: "#1d1d1f" }}>
              Que souhaitez-vous vivre ?
            </h2>
            <p className="text-[17px]" style={{ color: "#6e6e73" }}>
              Sélectionnez une catégorie pour découvrir les événements disponibles.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
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
                  className="text-left p-7 rounded-2xl transition-all duration-200"
                  style={{
                    background: "#ffffff",
                    border: isActive ? "2px solid #0071e3" : "2px solid transparent",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <Icon className="w-8 h-8 mb-4" style={{ color: "#0071e3" }} />
                  <h3 className="text-[19px] font-semibold mb-1" style={{ color: "#1d1d1f" }}>{cat.label}</h3>
                  <p className="text-[14px]" style={{ color: "#6e6e73" }}>{cat.desc}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Grille événements */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#6e6e73" }} />
            </div>
          ) : events.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event, idx) => (
                  <EventCard key={event.id} event={event} index={idx} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1.5 text-[17px] font-medium transition-colors"
                  style={{ color: "#0071e3" }}
                >
                  Voir tous les événements <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Ticket className="w-10 h-10 mx-auto mb-3" style={{ color: "#d2d2d7" }} />
              <p className="text-[15px]" style={{ color: "#6e6e73" }}>Aucun événement dans cette catégorie pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CONFIANCE ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8" style={{ background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-[980px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-3" style={{ color: "#1d1d1f" }}>
              Pourquoi choisir Eventrip ?
            </h2>
            <p className="text-[17px]" style={{ color: "#6e6e73" }}>
              Des billets authentiques, des partenaires reconnus.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="p-6 rounded-2xl"
                  style={{ background: "#f5f5f7" }}
                >
                  <Icon className="w-6 h-6 mb-4" style={{ color: "#0071e3" }} />
                  <h3 className="font-semibold text-[15px] mb-1" style={{ color: "#1d1d1f" }}>{item.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#6e6e73" }}>{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ─────────────────────────────────────────────── */}
      <section className="py-20 px-5 sm:px-8" style={{ background: "#f5f5f7", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-[760px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-bold tracking-tight mb-3" style={{ color: "#1d1d1f" }}>
              Comment ça marche ?
            </h2>
            <p className="text-[17px]" style={{ color: "#6e6e73" }}>3 étapes. Un seul paiement.</p>
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
                  className="relative text-center"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mx-auto mb-5"
                    style={{ background: "#0071e3" }}>
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-[17px] mb-2" style={{ color: "#1d1d1f" }}>{item.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: "#6e6e73" }}>{item.desc}</p>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden md:block absolute top-4 -right-5" style={{ color: "#d2d2d7" }}>
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
      <section className="py-24 px-5 sm:px-8 text-center" style={{ background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 className="text-[32px] md:text-[48px] font-bold tracking-tight mb-4" style={{ color: "#1d1d1f" }}>
            Prêt pour votre prochain séjour ?
          </h2>
          <p className="text-[17px] mb-8 max-w-xl mx-auto" style={{ color: "#6e6e73" }}>
            Des milliers de voyageurs ont déjà réservé leur prochaine expérience événementielle.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white text-[17px] font-medium transition-colors"
            style={{ background: "#0071e3" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#0077ed")}
            onMouseLeave={e => (e.currentTarget.style.background = "#0071e3")}
          >
            Explorer les événements <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-5 sm:px-8" style={{ background: "#f5f5f7", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-[980px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[12px]" style={{ color: "#86868b" }}>© 2026 Eventrip. Tous droits réservés.</span>
          <div className="flex gap-6">
            {["Conditions générales", "Confidentialité", "Contact"].map(l => (
              <a key={l} href="/" className="text-[12px] transition-colors" style={{ color: "#86868b" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1d1d1f")}
                onMouseLeave={e => (e.currentTarget.style.color = "#86868b")}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
