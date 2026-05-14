"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, ArrowLeft, ThumbsUp, Eye,
  Calendar, Hotel, Plane, UtensilsCrossed,
  X, Send, Clock, Pin, Search,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Thread {
  id: string; title: string; preview: string;
  author: string; avatar: string; date: string;
  replies: number; views: number; likes: number; pinned?: boolean;
}
interface Category {
  id: string; title: string; description: string;
  icon: React.ElementType; threads: Thread[];
}

// ─── Données ──────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "events", title: "Événements à venir", icon: Calendar,
    description: "Partagez vos plans, découvrez les prochains concerts, matchs et festivals.",
    threads: [
      { id: "e1", title: "Quelqu'un va au Lollapalooza Paris 2026 ?", preview: "On cherche des conseils pour organiser le séjour sur 3 jours depuis Lyon. Transport, hébergement…", author: "Marie L.", avatar: "ML", date: "il y a 2h", replies: 24, views: 312, likes: 18, pinned: true },
      { id: "e2", title: "Coldplay Stade de France — retours d'expérience ?", preview: "Fosse ou tribune ? L'ambiance vaut le déplacement depuis Bordeaux ?", author: "Thomas R.", avatar: "TR", date: "il y a 5h", replies: 41, views: 560, likes: 35 },
      { id: "e3", title: "El Clásico Madrid 2026 — pack depuis Paris", preview: "On est 4, quelqu'un a déjà utilisé Eventrip pour ce type de déplacement ?", author: "Julien B.", avatar: "JB", date: "il y a 1j", replies: 12, views: 198, likes: 9 },
    ],
  },
  {
    id: "hotels", title: "Hébergement & Logements", icon: Hotel,
    description: "Conseils hôtels, AirBnb, camping — trouvez le meilleur logement près des venues.",
    threads: [
      { id: "h1", title: "Meilleurs hôtels à 10 min du Stade de France ?", preview: "Budget 80–150€/nuit, bien connecté en transport. Des recommandations ?", author: "Sophie M.", avatar: "SM", date: "il y a 3h", replies: 19, views: 287, likes: 14, pinned: true },
      { id: "h2", title: "AirBnb vs hôtel pour Primavera Sound Barcelone", preview: "4 jours, on est 3. L'AirBnb dans le Poblenou revient moins cher mais moins flexible…", author: "Lucas P.", avatar: "LP", date: "il y a 8h", replies: 33, views: 445, likes: 27 },
      { id: "h3", title: "Camping Rock am Ring — conseils pratiques", preview: "Première fois au camping festival. Zone officielle vs externe, matériel conseillé…", author: "Emma K.", avatar: "EK", date: "il y a 2j", replies: 8, views: 134, likes: 6 },
    ],
  },
  {
    id: "restaurants", title: "Restaurants & Bars", icon: UtensilsCrossed,
    description: "Bonnes adresses autour des stades et salles de concert en Europe.",
    threads: [
      { id: "r1", title: "Top restos près du Santiago Bernabéu à Madrid", preview: "Après El Clásico, on cherche un endroit pour fêter ça. Pas trop cher, bonne ambiance.", author: "Carlos F.", avatar: "CF", date: "il y a 4h", replies: 28, views: 390, likes: 22, pinned: true },
      { id: "r2", title: "Où manger à Barcelone avant un concert au Palau ?", preview: "Tapas dans le Barrio Gótico à 25–30€/pers, des adresses ?", author: "Inès D.", avatar: "ID", date: "il y a 1j", replies: 15, views: 223, likes: 11 },
      { id: "r3", title: "Bars et clubs à Berlin — vos adresses secrètes", preview: "Je vais au Rammstein à l'Olympiastadion, j'aimerais en profiter pour explorer la nuit berlinoise.", author: "Max W.", avatar: "MW", date: "il y a 3j", replies: 21, views: 318, likes: 19 },
    ],
  },
  {
    id: "transport", title: "Transport & Voyage", icon: Plane,
    description: "Astuces pour trouver les meilleurs vols, trains, et se déplacer sur place.",
    threads: [
      { id: "t1", title: "Vols Paris → Madrid : quand réserver pour El Clásico ?", preview: "Les prix s'envolent. Meilleures fenêtres pour réserver à l'avance ?", author: "Alex P.", avatar: "AP", date: "il y a 6h", replies: 16, views: 267, likes: 13 },
      { id: "t2", title: "Train vs avion Lyon → Barcelone pour Primavera ?", preview: "Le TGV direct est moins cher mais plus long. Quelqu'un a comparé récemment ?", author: "Clara V.", avatar: "CV", date: "il y a 1j", replies: 29, views: 412, likes: 24 },
    ],
  },
  {
    id: "general", title: "Discussion Générale", icon: MessageSquare,
    description: "Partagez vos expériences de concerts, matchs et festivals.",
    threads: [
      { id: "g1", title: "Votre meilleure expérience de concert en 2025 ?", preview: "Pour moi c'était Beyoncé à Wembley. L'organisation parfaite, l'ambiance indescriptible…", author: "Camille T.", avatar: "CT", date: "il y a 30min", replies: 67, views: 892, likes: 58, pinned: true },
      { id: "g2", title: "Tips festivals : ce qu'on regrette toujours d'oublier", preview: "Après 10 ans de festival, ma liste ultime : chargeur solaire, poncho, bouchons d'oreille…", author: "Noé B.", avatar: "NB", date: "il y a 2j", replies: 44, views: 631, likes: 39 },
      { id: "g3", title: "Dynamic Packaging : vos avis sur Eventrip ?", preview: "J'ai réservé billet + hôtel + vol pour Rome en 5 min. Expérience top !", author: "Alix R.", avatar: "AR", date: "il y a 4j", replies: 18, views: 245, likes: 20 },
    ],
  },
];

// ─── Modal thread ─────────────────────────────────────────────────────────────
function ThreadModal({ thread, onClose }: { thread: Thread; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="relative rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
      >
        <div className="px-6 py-4 flex items-start justify-between gap-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <h3 className="font-semibold text-[15px] leading-snug" style={{ color: "#1d1d1f" }}>{thread.title}</h3>
          <button onClick={onClose} className="transition-opacity hover:opacity-60 flex-shrink-0" style={{ color: "#6e6e73" }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
              style={{ background: "#f5f5f7", color: "#0071e3" }}>
              {thread.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-[13px]" style={{ color: "#1d1d1f" }}>{thread.author}</span>
                <span className="text-[12px] flex items-center gap-1" style={{ color: "#86868b" }}>
                  <Clock className="w-3 h-3" />{thread.date}
                </span>
              </div>
              <p className="text-[14px] leading-relaxed" style={{ color: "#1d1d1f" }}>
                {thread.preview} N'hésitez pas à partager vos astuces et retours d'expérience !
              </p>
              <button
                onClick={() => setLiked(!liked)}
                className="mt-3 flex items-center gap-1.5 text-[12px] transition-colors"
                style={{ color: liked ? "#0071e3" : "#86868b" }}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> {thread.likes + (liked ? 1 : 0)} j'aime
              </button>
            </div>
          </div>
          {[
            { av: "PD", name: "Pierre D.", text: "Super sujet ! Moi j'ai eu une très bonne expérience, je recommande vivement de réserver à l'avance surtout pour les grands événements.", time: "il y a 1h" },
            { av: "LK", name: "Laura K.", text: "Totalement d'accord. Pour les festivals notamment, les hôtels aux alentours se remplissent très vite. On s'y prend toujours 3 mois avant.", time: "il y a 45min" },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 pl-4" style={{ borderLeft: "2px solid rgba(0,0,0,0.06)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ background: "#f5f5f7", color: "#6e6e73" }}>
                {r.av}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-[13px]" style={{ color: "#1d1d1f" }}>{r.name}</span>
                  <span className="text-[11px]" style={{ color: "#86868b" }}>{r.time}</span>
                </div>
                <p className="text-[13px]" style={{ color: "#6e6e73" }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 flex gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <input type="text" value={reply} onChange={e => setReply(e.target.value)} placeholder="Votre réponse…"
            className="flex-1 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none transition-colors"
            style={{ background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f" }} />
          <button disabled={!reply.trim()}
            className="px-4 py-2.5 text-white rounded-xl transition-opacity disabled:opacity-30"
            style={{ background: "#0071e3" }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState<string>("events");
  const [activeThread,   setActiveThread]   = useState<Thread | null>(null);
  const [showNew,        setShowNew]         = useState(false);
  const [newTitle,       setNewTitle]        = useState("");
  const [newBody,        setNewBody]         = useState("");
  const [searchQuery,    setSearchQuery]     = useState("");

  const currentCat     = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const visibleThreads = currentCat.threads.filter(t =>
    !searchQuery.trim() ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalReplies = CATEGORIES.reduce((s, c) => s + c.threads.reduce((r, t) => r + t.replies, 0), 0);

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-[44px]" style={{ background: "#ffffff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] mb-6 transition-opacity hover:opacity-60"
            style={{ color: "#0071e3" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Retour
          </Link>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight mb-1" style={{ color: "#1d1d1f" }}>Forum</h1>
              <p className="text-[15px]" style={{ color: "#6e6e73" }}>
                Échangez avec la communauté — conseils voyage, bonnes adresses, retours d'événements.
              </p>
              <div className="flex gap-5 mt-2 text-[13px]" style={{ color: "#86868b" }}>
                <span><strong style={{ color: "#1d1d1f" }}>{CATEGORIES.reduce((s, c) => s + c.threads.length, 0)}</strong> sujets</span>
                <span><strong style={{ color: "#1d1d1f" }}>{totalReplies}</strong> réponses</span>
              </div>
            </div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-white text-[13px] font-medium transition-colors"
              style={{ background: "#0071e3" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0077ed")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0071e3")}
            >
              <Plus className="w-4 h-4" /> Nouveau sujet
            </button>
          </div>
        </div>
      </div>

      {/* ── Corps ────────────────────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8">
        <div className="flex gap-6 items-start">

          {/* ── Sidebar ──────────────────────────────────────────────────────── */}
          <aside className="w-60 flex-shrink-0 sticky top-[60px] space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: "#86868b" }}>
              Catégories
            </p>
            {CATEGORIES.map(cat => {
              const Icon     = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: isActive ? "#ffffff" : "transparent",
                    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isActive ? "rgba(0,113,227,0.1)" : "#f5f5f7" }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#0071e3" : "#86868b" }} />
                    </div>
                    <span className="font-medium text-[13px]" style={{ color: isActive ? "#1d1d1f" : "#6e6e73" }}>
                      {cat.title}
                    </span>
                    <span className="ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                      style={{ background: "#f5f5f7", color: "#6e6e73" }}>
                      {cat.threads.length}
                    </span>
                  </div>
                  <div className="pl-8">
                    <span className="text-[11px] truncate block" style={{ color: "#86868b" }}>
                      {cat.threads[0].title}
                    </span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* ── Centre ───────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* En-tête catégorie */}
            {(() => {
              const cat  = currentCat;
              const Icon = cat.icon;
              return (
                <div className="flex items-center gap-3 px-5 py-4 rounded-2xl mb-3"
                  style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(0,113,227,0.08)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#0071e3" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-[15px]" style={{ color: "#1d1d1f" }}>{cat.title}</h2>
                    <p className="text-[12px] truncate" style={{ color: "#6e6e73" }}>{cat.description}</p>
                  </div>
                  <button onClick={() => setShowNew(true)}
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                    style={{ color: "#0071e3", background: "rgba(0,113,227,0.08)", border: "1px solid rgba(0,113,227,0.2)" }}>
                    <Plus className="w-3.5 h-3.5" /> Créer un sujet
                  </button>
                </div>
              );
            })()}

            {/* Recherche */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#86868b" }} />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans cette catégorie…"
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[14px] focus:outline-none transition-colors"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f" }}
              />
            </div>

            {/* Liste threads */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="grid grid-cols-[1fr_72px_64px] gap-4 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", color: "#86868b" }}>
                <span>Sujet</span>
                <span className="text-center">Rép.</span>
                <span className="text-center">Vues</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeCategory + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {visibleThreads.length === 0 && (
                    <div className="px-5 py-10 text-center text-[14px]" style={{ color: "#86868b" }}>
                      Aucun sujet ne correspond à votre recherche.
                    </div>
                  )}
                  {visibleThreads.map((thread, idx) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThread(thread)}
                      className="w-full grid grid-cols-[1fr_72px_64px] gap-4 px-5 py-4 text-left transition-colors group"
                      style={{ borderTop: idx === 0 ? "none" : "1px solid rgba(0,0,0,0.05)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f7")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 mt-0.5"
                          style={{ background: "#f5f5f7", color: "#0071e3" }}>
                          {thread.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            {thread.pinned && (
                              <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                style={{ background: "rgba(0,113,227,0.08)", color: "#0071e3", border: "1px solid rgba(0,113,227,0.2)" }}>
                                <Pin className="w-2.5 h-2.5" /> Épinglé
                              </span>
                            )}
                            <span className="font-semibold text-[14px] truncate transition-colors"
                              style={{ color: "#1d1d1f" }}>
                              {thread.title}
                            </span>
                          </div>
                          <p className="text-[12px] line-clamp-1" style={{ color: "#6e6e73" }}>{thread.preview}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px]" style={{ color: "#86868b" }}>
                            <span>{thread.author}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.likes}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="font-semibold text-[14px]" style={{ color: "#0071e3" }}>{thread.replies}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Eye className="w-3.5 h-3.5" style={{ color: "#d2d2d7" }} />
                        <span className="text-[13px]" style={{ color: "#86868b" }}>{thread.views}</span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <button onClick={() => setShowNew(true)}
                  className="text-[12px] flex items-center gap-1.5 transition-opacity hover:opacity-70"
                  style={{ color: "#0071e3" }}>
                  <Plus className="w-3.5 h-3.5" /> Créer un nouveau sujet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal thread ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeThread && <ThreadModal thread={activeThread} onClose={() => setActiveThread(null)} />}
      </AnimatePresence>

      {/* ── Modal nouveau sujet ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowNew(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative rounded-2xl w-full max-w-lg p-6"
              style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-[17px]" style={{ color: "#1d1d1f" }}>Créer un sujet</h3>
                <button onClick={() => setShowNew(false)} className="transition-opacity hover:opacity-60" style={{ color: "#6e6e73" }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "#6e6e73" }}>Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                        className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                        style={{
                          background: activeCategory === cat.id ? "rgba(0,113,227,0.1)" : "#f5f5f7",
                          color: activeCategory === cat.id ? "#0071e3" : "#6e6e73",
                          border: activeCategory === cat.id ? "1px solid rgba(0,113,227,0.3)" : "1px solid transparent",
                        }}>
                        {cat.title}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "#6e6e73" }}>Titre du sujet</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ex : Conseils pour Lollapalooza Paris ?"
                    className="w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none"
                    style={{ background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f" }} />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block" style={{ color: "#6e6e73" }}>Message</label>
                  <textarea rows={4} value={newBody} onChange={e => setNewBody(e.target.value)}
                    placeholder="Décrivez votre question ou partagez vos conseils…"
                    className="w-full rounded-xl px-4 py-3 text-[14px] focus:outline-none resize-none"
                    style={{ background: "#f5f5f7", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f" }} />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setShowNew(false)}
                    className="flex-1 py-2.5 rounded-full text-[14px] font-medium transition-colors"
                    style={{ background: "#f5f5f7", color: "#1d1d1f" }}>
                    Annuler
                  </button>
                  <button disabled={!newTitle.trim() || !newBody.trim()} onClick={() => setShowNew(false)}
                    className="flex-1 py-2.5 rounded-full text-[14px] font-medium text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40"
                    style={{ background: "#0071e3" }}>
                    <Send className="w-4 h-4" /> Publier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
