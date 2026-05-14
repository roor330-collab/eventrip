"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Plus, ArrowLeft, ThumbsUp, Eye,
  Calendar, Hotel, Plane, UtensilsCrossed, Ticket,
  ChevronRight, X, Send, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Thread {
  id: string;
  title: string;
  preview: string;
  author: string;
  avatar: string;
  date: string;
  replies: number;
  views: number;
  likes: number;
  pinned?: boolean;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  threads: Thread[];
}

// ─── Données mock ─────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    id: "events",
    title: "Événements à venir",
    description: "Partagez vos plans, découvrez les prochains concerts, matchs et festivals.",
    icon: Calendar,
    color: "blue",
    threads: [
      {
        id: "e1",
        title: "Quelqu'un va au Lollapalooza Paris 2026 ?",
        preview: "Je prévois d'y aller avec des amis depuis Lyon. On cherche des conseils pour organiser le séjour sur 3 jours…",
        author: "Marie L.",
        avatar: "ML",
        date: "il y a 2h",
        replies: 24,
        views: 312,
        likes: 18,
        pinned: true,
      },
      {
        id: "e2",
        title: "Coldplay Stade de France — vos retours d'expérience ?",
        preview: "Ceux qui y sont allés lors des précédentes dates, c'est comment l'ambiance ? Vaut-il mieux être en fosse ou tribune ?",
        author: "Thomas R.",
        avatar: "TR",
        date: "il y a 5h",
        replies: 41,
        views: 560,
        likes: 35,
      },
      {
        id: "e3",
        title: "El Clásico Madrid 2026 — pack complet depuis Paris",
        preview: "On est 4 à vouloir faire le déplacement. Quelqu'un a déjà utilisé Eventrip pour ce type de pack sport ?",
        author: "Julien B.",
        avatar: "JB",
        date: "il y a 1j",
        replies: 12,
        views: 198,
        likes: 9,
      },
    ],
  },
  {
    id: "hotels",
    title: "Hébergement & Logements",
    description: "Conseils hôtels, AirBnb, camping — trouvez le meilleur logement près des venues.",
    icon: Hotel,
    color: "purple",
    threads: [
      {
        id: "h1",
        title: "Meilleurs hôtels à 10 min du Stade de France ?",
        preview: "Je cherche quelque chose entre 80 et 150€ la nuit, bien connecté en transport. Des recommandations ?",
        author: "Sophie M.",
        avatar: "SM",
        date: "il y a 3h",
        replies: 19,
        views: 287,
        likes: 14,
        pinned: true,
      },
      {
        id: "h2",
        title: "AirBnb vs hôtel pour Primavera Sound Barcelone",
        preview: "Le festival dure 4 jours, on est 3. Un AirBnb dans le Poblenou revient moins cher mais on perd en flexibilité…",
        author: "Lucas P.",
        avatar: "LP",
        date: "il y a 8h",
        replies: 33,
        views: 445,
        likes: 27,
      },
      {
        id: "h3",
        title: "Camping festival Rock am Ring — conseils pratiques",
        preview: "C'est notre première fois. On a des questions sur le camping officiel vs les zones externes…",
        author: "Emma K.",
        avatar: "EK",
        date: "il y a 2j",
        replies: 8,
        views: 134,
        likes: 6,
      },
    ],
  },
  {
    id: "restaurants",
    title: "Restaurants & Bars",
    description: "Bonnes adresses autour des stades et salles de concert en Europe.",
    icon: UtensilsCrossed,
    color: "orange",
    threads: [
      {
        id: "r1",
        title: "Top 5 restos près du Santiago Bernabéu à Madrid",
        preview: "Après le match El Clásico, on cherche un endroit sympa pour fêter ça. Pas trop cher, bonne ambiance.",
        author: "Carlos F.",
        avatar: "CF",
        date: "il y a 4h",
        replies: 28,
        views: 390,
        likes: 22,
        pinned: true,
      },
      {
        id: "r2",
        title: "Où manger à Barcelone avant un concert au Palau ?",
        preview: "On cherche de bons tapas dans le quartier. Budget 25-30€ par personne. Le Barrio Gótico c'est bien ?",
        author: "Inès D.",
        avatar: "ID",
        date: "il y a 1j",
        replies: 15,
        views: 223,
        likes: 11,
      },
      {
        id: "r3",
        title: "Bars concert à Berlin — vos adresses secrètes",
        preview: "Je vais au Rammstein à l'Olympiastadion et j'aimerais en profiter pour explorer la nuit berlinoise…",
        author: "Max W.",
        avatar: "MW",
        date: "il y a 3j",
        replies: 21,
        views: 318,
        likes: 19,
      },
    ],
  },
  {
    id: "transport",
    title: "Conseils Transport & Voyage",
    description: "Astuces pour trouver les meilleurs vols, trains, et se déplacer sur place.",
    icon: Plane,
    color: "green",
    threads: [
      {
        id: "t1",
        title: "Vols Paris → Madrid : quand réserver pour El Clásico ?",
        preview: "Les prix s'envolent déjà. Quelqu'un a des infos sur les meilleures fenêtres pour réserver ?",
        author: "Alex P.",
        avatar: "AP",
        date: "il y a 6h",
        replies: 16,
        views: 267,
        likes: 13,
      },
      {
        id: "t2",
        title: "Train vs avion pour Lyon → Barcelone ?",
        preview: "Le TGV direct est souvent moins cher mais plus long. Quelqu'un a comparé récemment pour Primavera ?",
        author: "Clara V.",
        avatar: "CV",
        date: "il y a 1j",
        replies: 29,
        views: 412,
        likes: 24,
      },
    ],
  },
  {
    id: "general",
    title: "Discussion Générale",
    description: "Partagez vos expériences de concerts, matchs et festivals. Coup de cœur, coup de gueule…",
    icon: MessageSquare,
    color: "pink",
    threads: [
      {
        id: "g1",
        title: "Votre meilleure expérience de concert en 2025 ?",
        preview: "Pour moi c'était Beyoncé à Wembley. L'organisation était parfaite, l'ambiance indescriptible…",
        author: "Camille T.",
        avatar: "CT",
        date: "il y a 30min",
        replies: 67,
        views: 892,
        likes: 58,
        pinned: true,
      },
      {
        id: "g2",
        title: "Tips pour les festivals : ce qu'on regrette toujours d'oublier",
        preview: "Après 10 ans de festival, voici ma liste ultime : chargeur solaire, poncho, bouchons d'oreille…",
        author: "Noé B.",
        avatar: "NB",
        date: "il y a 2j",
        replies: 44,
        views: 631,
        likes: 39,
      },
      {
        id: "g3",
        title: "Dynamic Packaging : vos avis sur Eventrip ?",
        preview: "J'ai utilisé le site pour réserver billet + hôtel + vol pour un concert à Rome. Expérience top !",
        author: "Alix R.",
        avatar: "AR",
        date: "il y a 4j",
        replies: 18,
        views: 245,
        likes: 20,
      },
    ],
  },
];

// ─── Couleurs par catégorie ────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  blue:   "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  purple: "from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400",
  orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
  green:  "from-green-500/20 to-green-600/5 border-green-500/20 text-green-400",
  pink:   "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
};
const ICON_COLOR: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-400", purple: "bg-purple-500/10 text-purple-400",
  orange: "bg-orange-500/10 text-orange-400", green: "bg-green-500/10 text-green-400",
  pink: "bg-pink-500/10 text-pink-400",
};

// ─── Composant Thread ─────────────────────────────────────────────────────────
function ThreadCard({ thread, color, onOpen }: { thread: Thread; color: string; onOpen: (t: Thread) => void }) {
  return (
    <button
      onClick={() => onOpen(thread)}
      className="w-full text-left px-5 py-4 border-t border-white/5 hover:bg-white/3 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${ICON_COLOR[color]}`}>
          {thread.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {thread.pinned && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                Épinglé
              </span>
            )}
            <h4 className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">
              {thread.title}
            </h4>
          </div>
          <p className="text-xs text-white/40 line-clamp-1">{thread.preview}</p>
          <div className="flex items-center gap-4 mt-1.5 text-[11px] text-white/25">
            <span>{thread.author} · {thread.date}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{thread.replies}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{thread.views}</span>
            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.likes}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}

// ─── Modal thread ─────────────────────────────────────────────────────────────
function ThreadModal({ thread, onClose }: { thread: Thread; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4">
          <h3 className="font-bold text-white leading-snug">{thread.title}</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* OP */}
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {thread.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">{thread.author}</span>
                <span className="text-xs text-white/30 flex items-center gap-1"><Clock className="w-3 h-3" />{thread.date}</span>
              </div>
              <p className="text-white/70 text-sm leading-relaxed">{thread.preview} C'est pourquoi je voulais avoir vos retours d'expérience sur le sujet. N'hésitez pas à partager vos astuces !</p>
              <button
                onClick={() => setLiked(!liked)}
                className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${liked ? "text-blue-400" : "text-white/30 hover:text-white/60"}`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {thread.likes + (liked ? 1 : 0)} j'aime
              </button>
            </div>
          </div>

          {/* Mock replies */}
          {[
            { avatar: "PD", name: "Pierre D.", text: "Super sujet ! Moi j'ai eu une très bonne expérience, je recommande vivement de réserver à l'avance surtout pour les grands événements.", time: "il y a 1h" },
            { avatar: "LK", name: "Laura K.", text: "Totalement d'accord. Pour les festivals notamment, les hôtels aux alentours se remplissent très vite. On s'y prend toujours 3 mois avant.", time: "il y a 45min" },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 pl-3 border-l border-white/5">
              <div className="w-8 h-8 rounded-full bg-white/5 text-white/50 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {r.avatar}
              </div>
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

        {/* Reply box */}
        <div className="px-6 py-4 border-t border-white/5 flex gap-3">
          <input
            type="text"
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Votre réponse…"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
          />
          <button
            disabled={!reply.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function ForumPage() {
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle]           = useState("");
  const [newBody, setNewBody]             = useState("");

  const totalThreads = CATEGORIES.reduce((s, c) => s + c.threads.length, 0);
  const totalReplies = CATEGORIES.reduce((s, c) => s + c.threads.reduce((r, t) => r + t.replies, 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#0d0d20] to-[#0a0a0f] border-b border-white/5 pt-24 pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Forum Eventrip</h1>
              </div>
              <p className="text-white/40 max-w-xl">
                Échangez avec la communauté — conseils voyage, retours d'événements, bonnes adresses hôtels et restaurants.
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm text-white/30">
                <span><strong className="text-white/60">{totalThreads}</strong> sujets</span>
                <span><strong className="text-white/60">{totalReplies}</strong> réponses</span>
                <span><strong className="text-white/60">5</strong> catégories</span>
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowNewThread(true)} className="flex items-center gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" /> Nouveau sujet
            </Button>
          </div>
        </div>
      </div>

      {/* ── Catégories + threads ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden"
            >
              {/* En-tête catégorie */}
              <div className={`px-5 py-4 bg-gradient-to-r ${COLOR_MAP[cat.color]} border-b border-white/5`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ICON_COLOR[cat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{cat.title}</h2>
                    <p className="text-xs text-white/40">{cat.description}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-xs text-white/30">{cat.threads.length} sujets</div>
                    <div className="text-xs text-white/20">{cat.threads.reduce((s, t) => s + t.replies, 0)} réponses</div>
                  </div>
                </div>
              </div>

              {/* Threads */}
              {cat.threads.map(thread => (
                <ThreadCard key={thread.id} thread={thread} color={cat.color} onOpen={setActiveThread} />
              ))}

              <div className="px-5 py-3 border-t border-white/5">
                <button
                  onClick={() => setShowNewThread(true)}
                  className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Créer un sujet dans cette catégorie
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Modal thread ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeThread && (
          <ThreadModal thread={activeThread} onClose={() => setActiveThread(null)} />
        )}
      </AnimatePresence>

      {/* ── Modal nouveau sujet ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNewThread && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewThread(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0f0f1a] border border-white/10 rounded-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white text-lg">Créer un sujet</h3>
                <button onClick={() => setShowNewThread(false)} className="text-white/30 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Titre du sujet</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="Ex : Conseils pour Lollapalooza Paris ?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Message</label>
                  <textarea
                    rows={4}
                    value={newBody}
                    onChange={e => setNewBody(e.target.value)}
                    placeholder="Décrivez votre question ou partagez vos conseils…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="ghost" size="md" onClick={() => setShowNewThread(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!newTitle.trim() || !newBody.trim()}
                    onClick={() => setShowNewThread(false)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
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
