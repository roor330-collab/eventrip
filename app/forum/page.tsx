"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, ArrowLeft, ThumbsUp, Eye,
  Calendar, Hotel, Plane, UtensilsCrossed,
  X, Send, Clock, Pin, ChevronRight, Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Thread {
  id: string; title: string; preview: string;
  author: string; avatar: string; date: string;
  replies: number; views: number; likes: number; pinned?: boolean;
}
interface Category {
  id: string; title: string; description: string;
  icon: React.ElementType; color: string; threads: Thread[];
}

// ─── Données ──────────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "events", title: "Événements à venir", icon: Calendar, color: "blue",
    description: "Partagez vos plans, découvrez les prochains concerts, matchs et festivals.",
    threads: [
      { id: "e1", title: "Quelqu'un va au Lollapalooza Paris 2026 ?", preview: "On cherche des conseils pour organiser le séjour sur 3 jours depuis Lyon. Transport, hébergement…", author: "Marie L.", avatar: "ML", date: "il y a 2h", replies: 24, views: 312, likes: 18, pinned: true },
      { id: "e2", title: "Coldplay Stade de France — retours d'expérience ?", preview: "Fosse ou tribune ? L'ambiance vaut le déplacement depuis Bordeaux ?", author: "Thomas R.", avatar: "TR", date: "il y a 5h", replies: 41, views: 560, likes: 35 },
      { id: "e3", title: "El Clásico Madrid 2026 — pack depuis Paris", preview: "On est 4, quelqu'un a déjà utilisé Eventrip pour ce type de déplacement ?", author: "Julien B.", avatar: "JB", date: "il y a 1j", replies: 12, views: 198, likes: 9 },
    ],
  },
  {
    id: "hotels", title: "Hébergement & Logements", icon: Hotel, color: "purple",
    description: "Conseils hôtels, AirBnb, camping — trouvez le meilleur logement près des venues.",
    threads: [
      { id: "h1", title: "Meilleurs hôtels à 10 min du Stade de France ?", preview: "Budget 80–150€/nuit, bien connecté en transport. Des recommandations ?", author: "Sophie M.", avatar: "SM", date: "il y a 3h", replies: 19, views: 287, likes: 14, pinned: true },
      { id: "h2", title: "AirBnb vs hôtel pour Primavera Sound Barcelone", preview: "4 jours, on est 3. L'AirBnb dans le Poblenou revient moins cher mais moins flexible…", author: "Lucas P.", avatar: "LP", date: "il y a 8h", replies: 33, views: 445, likes: 27 },
      { id: "h3", title: "Camping Rock am Ring — conseils pratiques", preview: "Première fois au camping festival. Zone officielle vs externe, matériel conseillé…", author: "Emma K.", avatar: "EK", date: "il y a 2j", replies: 8, views: 134, likes: 6 },
    ],
  },
  {
    id: "restaurants", title: "Restaurants & Bars", icon: UtensilsCrossed, color: "orange",
    description: "Bonnes adresses autour des stades et salles de concert en Europe.",
    threads: [
      { id: "r1", title: "Top restos près du Santiago Bernabéu à Madrid", preview: "Après El Clásico, on cherche un endroit pour fêter ça. Pas trop cher, bonne ambiance.", author: "Carlos F.", avatar: "CF", date: "il y a 4h", replies: 28, views: 390, likes: 22, pinned: true },
      { id: "r2", title: "Où manger à Barcelone avant un concert au Palau ?", preview: "Tapas dans le Barrio Gótico à 25–30€/pers, des adresses ?", author: "Inès D.", avatar: "ID", date: "il y a 1j", replies: 15, views: 223, likes: 11 },
      { id: "r3", title: "Bars et clubs à Berlin — vos adresses secrètes", preview: "Je vais au Rammstein à l'Olympiastadion, j'aimerais en profiter pour explorer la nuit berlinoise.", author: "Max W.", avatar: "MW", date: "il y a 3j", replies: 21, views: 318, likes: 19 },
    ],
  },
  {
    id: "transport", title: "Transport & Voyage", icon: Plane, color: "green",
    description: "Astuces pour trouver les meilleurs vols, trains, et se déplacer sur place.",
    threads: [
      { id: "t1", title: "Vols Paris → Madrid : quand réserver pour El Clásico ?", preview: "Les prix s'envolent. Meilleures fenêtres pour réserver à l'avance ?", author: "Alex P.", avatar: "AP", date: "il y a 6h", replies: 16, views: 267, likes: 13 },
      { id: "t2", title: "Train vs avion Lyon → Barcelone pour Primavera ?", preview: "Le TGV direct est moins cher mais plus long. Quelqu'un a comparé récemment ?", author: "Clara V.", avatar: "CV", date: "il y a 1j", replies: 29, views: 412, likes: 24 },
    ],
  },
  {
    id: "general", title: "Discussion Générale", icon: MessageSquare, color: "pink",
    description: "Partagez vos expériences de concerts, matchs et festivals.",
    threads: [
      { id: "g1", title: "Votre meilleure expérience de concert en 2025 ?", preview: "Pour moi c'était Beyoncé à Wembley. L'organisation parfaite, l'ambiance indescriptible…", author: "Camille T.", avatar: "CT", date: "il y a 30min", replies: 67, views: 892, likes: 58, pinned: true },
      { id: "g2", title: "Tips festivals : ce qu'on regrette toujours d'oublier", preview: "Après 10 ans de festival, ma liste ultime : chargeur solaire, poncho, bouchons d'oreille…", author: "Noé B.", avatar: "NB", date: "il y a 2j", replies: 44, views: 631, likes: 39 },
      { id: "g3", title: "Dynamic Packaging : vos avis sur Eventrip ?", preview: "J'ai réservé billet + hôtel + vol pour Rome en 5 min. Expérience top !", author: "Alix R.", avatar: "AR", date: "il y a 4j", replies: 18, views: 245, likes: 20 },
    ],
  },
];

const COLOR = {
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20",   dot: "bg-blue-400"   },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", dot: "bg-purple-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", dot: "bg-orange-400" },
  green:  { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20",  dot: "bg-green-400"  },
  pink:   { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/20",   dot: "bg-pink-400"   },
} as Record<string, { bg: string; text: string; border: string; dot: string }>;

// ─── Modal lecture thread ─────────────────────────────────────────────────────
function ThreadModal({ thread, onClose }: { thread: Thread; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4">
          <h3 className="font-bold text-white leading-snug">{thread.title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors flex-shrink-0"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{thread.avatar}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{thread.author}</span>
                <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />{thread.date}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{thread.preview} N'hésitez pas à partager vos astuces et retours d'expérience !</p>
              <button onClick={() => setLiked(!liked)} className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-blue-400" : "text-white/30 hover:text-white/60"}`}>
                <ThumbsUp className="w-3.5 h-3.5" /> {thread.likes + (liked ? 1 : 0)} j'aime
              </button>
            </div>
          </div>
          {[
            { av: "PD", name: "Pierre D.", text: "Super sujet ! Moi j'ai eu une très bonne expérience, je recommande vivement de réserver à l'avance surtout pour les grands événements.", time: "il y a 1h" },
            { av: "LK", name: "Laura K.", text: "Totalement d'accord. Pour les festivals notamment, les hôtels aux alentours se remplissent très vite. On s'y prend toujours 3 mois avant.", time: "il y a 45min" },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 pl-4 border-l border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/5 text-white/50 flex items-center justify-center text-xs font-bold flex-shrink-0">{r.av}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white/80 text-sm">{r.name}</span>
                  <span className="text-xs text-white/25">{r.time}</span>
                </div>
                <p className="text-white/50 text-sm">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <input type="text" value={reply} onChange={e => setReply(e.target.value)} placeholder="Votre réponse…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50" />
          <button disabled={!reply.trim()} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
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

  const currentCat = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];
  const visibleThreads = currentCat.threads.filter(t =>
    !searchQuery.trim() ||
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const lastThread = (cat: Category) => cat.threads[0];
  const totalReplies = CATEGORIES.reduce((s, c) => s + c.threads.reduce((r, t) => r + t.replies, 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#0d0d20] to-[#0a0a0f] border-b border-white/5 pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                <h1 className="text-2xl font-bold text-white">Forum Eventrip</h1>
              </div>
              <p className="text-white/40 text-sm">Échangez avec la communauté — conseils voyage, bonnes adresses, retours d'événements.</p>
              <div className="flex gap-5 mt-3 text-sm text-white/30">
                <span><strong className="text-white/50">{CATEGORIES.reduce((s, c) => s + c.threads.length, 0)}</strong> sujets</span>
                <span><strong className="text-white/50">{totalReplies}</strong> réponses</span>
                <span><strong className="text-white/50">5</strong> catégories</span>
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowNew(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouveau sujet
            </Button>
          </div>
        </div>
      </div>

      {/* ── Corps : sidebar gauche + discussion centre ───────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6 items-start">

          {/* ── Sidebar gauche : catégories ─────────────────────────────────── */}
          <aside className="w-72 flex-shrink-0 sticky top-24 space-y-1.5">
            <p className="text-[11px] font-bold text-white/25 uppercase tracking-widest px-3 mb-3">Catégories</p>
            {CATEGORIES.map(cat => {
              const Icon    = cat.icon;
              const c       = COLOR[cat.color];
              const isActive = activeCategory === cat.id;
              const last    = lastThread(cat);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left px-3 py-3 rounded-xl border transition-all ${
                    isActive
                      ? `${c.bg} ${c.border} border`
                      : "border-transparent hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                    </div>
                    <span className={`font-semibold text-sm ${isActive ? "text-white" : "text-white/60"}`}>{cat.title}</span>
                    <span className={`ml-auto text-[11px] font-bold px-1.5 py-0.5 rounded-md ${c.bg} ${c.text}`}>
                      {cat.threads.length}
                    </span>
                  </div>
                  {/* Dernier message */}
                  <div className="pl-9">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className="text-[11px] text-white/30 truncate">{last.title}</span>
                    </div>
                    <span className="text-[10px] text-white/20 pl-3">{last.author} · {last.date}</span>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* ── Centre : threads de la catégorie active ──────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* En-tête catégorie */}
            {(() => {
              const cat = currentCat;
              const Icon = cat.icon;
              const c = COLOR[cat.color];
              return (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${c.bg} ${c.border} mb-4`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg}`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{cat.title}</h2>
                    <p className="text-xs text-white/40">{cat.description}</p>
                  </div>
                  <button onClick={() => setShowNew(true)} className={`ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${c.bg} ${c.text} border ${c.border} hover:opacity-80 transition-opacity`}>
                    <Plus className="w-3.5 h-3.5" /> Créer un sujet
                  </button>
                </div>
              );
            })()}

            {/* Barre de recherche */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans cette catégorie…"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* Liste des threads */}
            <div className="bg-white/[0.02] border border-white/8 rounded-xl overflow-hidden">
              {/* En-tête colonnes */}
              <div className="grid grid-cols-[1fr_80px_70px] gap-4 px-5 py-2.5 border-b border-white/5 text-[11px] font-bold text-white/25 uppercase tracking-widest">
                <span>Sujet</span>
                <span className="text-center">Rép.</span>
                <span className="text-center">Vues</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeCategory + searchQuery} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {visibleThreads.length === 0 && (
                    <div className="px-5 py-10 text-center text-white/30 text-sm">
                      Aucun sujet ne correspond à votre recherche.
                    </div>
                  )}
                  {visibleThreads.map((thread, idx) => {
                    const c = COLOR[currentCat.color];
                    return (
                      <button
                        key={thread.id}
                        onClick={() => setActiveThread(thread)}
                        className={`w-full grid grid-cols-[1fr_80px_70px] gap-4 px-5 py-4 text-left border-t border-white/5 hover:bg-white/5 transition-colors group ${idx === 0 ? "border-t-0" : ""}`}
                      >
                        {/* Colonne sujet */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${c.bg} ${c.text}`}>
                            {thread.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              {thread.pinned && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                  <Pin className="w-2.5 h-2.5" /> Épinglé
                                </span>
                              )}
                              <span className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">
                                {thread.title}
                              </span>
                            </div>
                            <p className="text-xs text-white/35 line-clamp-1">{thread.preview}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/25">
                              <span>{thread.author}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.likes}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{thread.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Réponses */}
                        <div className="flex items-center justify-center">
                          <span className={`font-bold text-sm ${c.text}`}>{thread.replies}</span>
                        </div>

                        {/* Vues */}
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-sm text-white/40">{thread.views}</span>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              <div className="px-5 py-3 border-t border-white/5">
                <button onClick={() => setShowNew(true)} className="text-xs text-white/25 hover:text-white/50 flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Créer un nouveau sujet dans cette catégorie
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

      {/* ── Modal nouveau sujet ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNew(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">Créer un sujet</h3>
                <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => {
                      const c = COLOR[cat.color];
                      return (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${activeCategory === cat.id ? `${c.bg} ${c.text} ${c.border}` : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}>
                          {cat.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Titre du sujet</label>
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Ex : Conseils pour Lollapalooza Paris ?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Message</label>
                  <textarea rows={4} value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Décrivez votre question ou partagez vos conseils…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 resize-none" />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="ghost" size="md" onClick={() => setShowNew(false)} className="flex-1">Annuler</Button>
                  <Button variant="primary" size="md" disabled={!newTitle.trim() || !newBody.trim()} onClick={() => setShowNew(false)}
                    className="flex-1 flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Publier
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
