"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, X, Ticket, User, LogOut, LogIn,
  ChevronDown, Music2, Trophy, Tent, MessageSquare,
} from "lucide-react";
import { Button } from "./Button";
import { supabase } from "@/lib/supabase";
import type { User as SBUser } from "@supabase/supabase-js";

// ─── Structure des menus déroulants ──────────────────────────────────────────
const NAV_MENUS = [
  {
    id: "concerts",
    label: "Concerts",
    icon: Music2,
    href: "/search?type=concert",
    items: [
      { label: "Tous les concerts", href: "/search?type=concert",             emoji: "🎵" },
      { label: "Rock",              href: "/search?type=concert&genre=Rock",  emoji: "🎸" },
      { label: "Pop",               href: "/search?type=concert&genre=Pop",   emoji: "🎤" },
      { label: "Electronic",        href: "/search?type=concert&genre=Electronic", emoji: "🎧" },
      { label: "Hip-Hop / Rap",     href: "/search?type=concert&genre=Hip-Hop",   emoji: "🎤" },
      { label: "Jazz & Blues",      href: "/search?type=concert&genre=Jazz",       emoji: "🎷" },
      { label: "Latin",             href: "/search?type=concert&genre=Latin",      emoji: "💃" },
      { label: "Métal",             href: "/search?type=concert&genre=Metal",      emoji: "🤘" },
      { label: "Classique",         href: "/search?type=concert&genre=Classical",  emoji: "🎻" },
      { label: "R&B / Soul",        href: "/search?type=concert&genre=R%26B",      emoji: "🎙️" },
    ],
  },
  {
    id: "sport",
    label: "Sport",
    icon: Trophy,
    href: "/search?type=sport",
    items: [
      { label: "Tous les sports",   href: "/search?type=sport",                      emoji: "🏆" },
      { label: "Football",          href: "/search?type=sport&genre=Football",        emoji: "⚽" },
      { label: "Tennis",            href: "/search?type=sport&genre=Tennis",          emoji: "🎾" },
      { label: "Basketball",        href: "/search?type=sport&genre=Basketball",      emoji: "🏀" },
      { label: "Formule 1",         href: "/search?type=sport&genre=Motorsport",      emoji: "🏎️" },
      { label: "Rugby",             href: "/search?type=sport&genre=Rugby",           emoji: "🏉" },
      { label: "Cyclisme",          href: "/search?type=sport&genre=Cycling",         emoji: "🚴" },
      { label: "Athlétisme",        href: "/search?type=sport&genre=Athletics",       emoji: "🏃" },
    ],
  },
  {
    id: "festivals",
    label: "Festivals",
    icon: Tent,
    href: "/search?type=festival",
    items: [
      { label: "Tous les festivals", href: "/search?type=festival",                      emoji: "🎪" },
      { label: "Musique",            href: "/search?type=festival&genre=Music",           emoji: "🎵" },
      { label: "Électronique",       href: "/search?type=festival&genre=Electronic",      emoji: "🎧" },
      { label: "Culturel",           href: "/search?type=festival&genre=Culture",         emoji: "🎭" },
      { label: "Gastronomique",      href: "/search?type=festival&genre=Food",            emoji: "🍽️" },
      { label: "Art & Design",       href: "/search?type=festival&genre=Art",             emoji: "🎨" },
    ],
  },
];

export function Navbar() {
  const [isOpen,       setIsOpen]       = useState(false);
  const [openMenu,     setOpenMenu]     = useState<string | null>(null);
  const [user,         setUser]         = useState<SBUser | null>(null);
  const router                          = useRouter();
  const navRef                          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Fermer dropdown en cliquant hors de la nav
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setIsOpen(false);
  };

  const toggle = (id: string) => setOpenMenu(prev => prev === id ? null : id);

  return (
    <nav ref={navRef} className="fixed top-0 w-full z-50 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white flex-shrink-0">
            <Ticket className="w-6 h-6 text-blue-400" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Eventrip</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-1 items-center">

            {/* Menus déroulants */}
            {NAV_MENUS.map(menu => {
              const Icon = menu.icon;
              const isActive = openMenu === menu.id;
              return (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => toggle(menu.id)}
                    onMouseEnter={() => setOpenMenu(menu.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {menu.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </button>

                  {isActive && (
                    <div
                      onMouseLeave={() => setOpenMenu(null)}
                      className="absolute top-full left-0 mt-1 w-52 bg-[#12121e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {menu.items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => setOpenMenu(null)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 hover:text-white ${
                            i === 0
                              ? "text-white font-semibold border-b border-white/5"
                              : "text-white/60"
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Forum */}
            <Link
              href="/forum"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Forum
            </Link>
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Mon Profil
                  </Button>
                </Link>
                <button onClick={handleSignOut} className="text-white/30 hover:text-red-400 transition-colors" title="Se déconnecter">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" /> Connexion
                  </Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button variant="primary" size="sm">S'inscrire</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-white/60">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-white/5 pt-4 space-y-1">
            {NAV_MENUS.map(menu => {
              const Icon = menu.icon;
              const isActive = openMenu === menu.id;
              return (
                <div key={menu.id}>
                  <button
                    onClick={() => toggle(menu.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium text-sm"><Icon className="w-4 h-4" />{menu.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </button>
                  {isActive && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/5 pl-3">
                      {menu.items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => { setIsOpen(false); setOpenMenu(null); }}
                          className="flex items-center gap-2 px-2 py-2 text-sm text-white/50 hover:text-white transition-colors"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/forum" onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors">
              <MessageSquare className="w-4 h-4" /> Forum
            </Link>

            <div className="pt-3 border-t border-white/5 flex flex-col gap-2 mt-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="md" className="w-full flex items-center gap-2">
                      <User className="w-4 h-4" /> Mon Profil
                    </Button>
                  </Link>
                  <Button variant="ghost" size="md" className="w-full text-red-400" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="md" className="w-full">Connexion</Button>
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" size="md" className="w-full">S'inscrire</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
