"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu, X, Ticket, User, LogOut, LogIn,
  ChevronDown, Music2, Trophy, Tent, MessageSquare,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SBUser } from "@supabase/supabase-js";

const NAV_MENUS = [
  {
    id: "concerts", label: "Concerts", icon: Music2, href: "/search?type=concert",
    items: [
      { label: "Tous les concerts", href: "/search?type=concert",                  featured: true },
      { label: "Rock",              href: "/search?type=concert&genre=Rock" },
      { label: "Pop",               href: "/search?type=concert&genre=Pop" },
      { label: "Électronique",      href: "/search?type=concert&genre=Electronic" },
      { label: "Hip-Hop / Rap",     href: "/search?type=concert&genre=Hip-Hop" },
      { label: "Jazz & Blues",      href: "/search?type=concert&genre=Jazz" },
      { label: "Latin",             href: "/search?type=concert&genre=Latin" },
      { label: "Métal",             href: "/search?type=concert&genre=Metal" },
      { label: "Classique",         href: "/search?type=concert&genre=Classical" },
      { label: "R&B / Soul",        href: "/search?type=concert&genre=R%26B" },
    ],
  },
  {
    id: "sport", label: "Sport", icon: Trophy, href: "/search?type=sport",
    items: [
      { label: "Tous les sports",    href: "/search?type=sport",               featured: true },
      { label: "Football",           href: "/search?type=sport&genre=Football" },
      { label: "Tennis",             href: "/search?type=sport&genre=Tennis" },
      { label: "Basketball",         href: "/search?type=sport&genre=Basketball" },
      { label: "Formule 1",          href: "/search?type=sport&genre=Motorsport" },
      { label: "Rugby",              href: "/search?type=sport&genre=Rugby" },
      { label: "Cyclisme",           href: "/search?type=sport&genre=Cycling" },
      { label: "Athlétisme",         href: "/search?type=sport&genre=Athletics" },
    ],
  },
  {
    id: "festivals", label: "Festivals", icon: Tent, href: "/search?type=festival",
    items: [
      { label: "Tous les festivals", href: "/search?type=festival",              featured: true },
      { label: "Musique",            href: "/search?type=festival&genre=Music" },
      { label: "Électronique",       href: "/search?type=festival&genre=Electronic" },
      { label: "Culturel",           href: "/search?type=festival&genre=Culture" },
      { label: "Gastronomique",      href: "/search?type=festival&genre=Food" },
      { label: "Art & Design",       href: "/search?type=festival&genre=Art" },
    ],
  },
];

export function Navbar() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [user,     setUser]     = useState<SBUser | null>(null);
  const router                  = useRouter();
  const navRef                  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
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
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 border-b border-black/[0.06]"
      style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "saturate(180%) blur(20px)" }}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center h-[44px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <Ticket className="w-4 h-4 text-[#0071e3]" />
            <span className="font-semibold text-[15px] text-[#1d1d1f]">Eventrip</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-0.5 items-center">
            {NAV_MENUS.map(menu => {
              const Icon = menu.icon;
              const isActive = openMenu === menu.id;
              return (
                <div key={menu.id} className="relative">
                  <button
                    onClick={() => toggle(menu.id)}
                    onMouseEnter={() => setOpenMenu(menu.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] transition-colors ${
                      isActive
                        ? "text-[#1d1d1f]"
                        : "text-[#1d1d1f]/60 hover:text-[#1d1d1f]"
                    }`}
                  >
                    {menu.label}
                    <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </button>

                  {isActive && (
                    <div
                      onMouseLeave={() => setOpenMenu(null)}
                      className="absolute top-full left-0 mt-1 w-52 rounded-2xl overflow-hidden shadow-xl border border-black/[0.06]"
                      style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "saturate(180%) blur(20px)" }}
                    >
                      {menu.items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => setOpenMenu(null)}
                          className={`flex items-center px-4 py-2.5 text-[13px] transition-colors hover:bg-black/[0.04] ${
                            item.featured
                              ? "text-[#1d1d1f] font-semibold border-b border-black/[0.06]"
                              : "text-[#1d1d1f]/60 hover:text-[#1d1d1f]"
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

            <Link
              href="/forum"
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors"
            >
              Forum
            </Link>
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-1.5 text-[13px] text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors">
                  <User className="w-3.5 h-3.5" /> Mon profil
                </Link>
                <button onClick={handleSignOut} className="text-[#1d1d1f]/40 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth" className="text-[13px] text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors">
                  Connexion
                </Link>
                <Link
                  href="/auth?mode=signup"
                  className="text-[13px] font-medium text-white px-4 py-1.5 rounded-full transition-colors"
                  style={{ backgroundColor: "#0071e3" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0077ed")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0071e3")}
                >
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>

          {/* Burger */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-1.5 text-[#1d1d1f]/60">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-black/[0.06] pt-3 space-y-0.5">
            {NAV_MENUS.map(menu => {
              const isActive = openMenu === menu.id;
              return (
                <div key={menu.id}>
                  <button
                    onClick={() => toggle(menu.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#1d1d1f]/70 hover:bg-black/[0.04] transition-colors"
                  >
                    <span className="font-medium text-sm">{menu.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isActive ? "rotate-180" : ""}`} />
                  </button>
                  {isActive && (
                    <div className="ml-4 mt-1 border-l border-black/[0.06] pl-3 space-y-0.5">
                      {menu.items.map((item, i) => (
                        <Link
                          key={i}
                          href={item.href}
                          onClick={() => { setIsOpen(false); setOpenMenu(null); }}
                          className="block px-2 py-1.5 text-sm text-[#1d1d1f]/60 hover:text-[#1d1d1f] transition-colors"
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
              className="block px-3 py-2 rounded-lg text-sm text-[#1d1d1f]/70 hover:bg-black/[0.04] transition-colors">
              Forum
            </Link>
            <div className="pt-3 border-t border-black/[0.06] flex flex-col gap-2 mt-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[#1d1d1f]/70">
                    <User className="w-4 h-4" /> Mon profil
                  </Link>
                  <button onClick={handleSignOut} className="px-3 py-2 text-sm text-red-500 text-left">
                    Se déconnecter
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth" onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm text-center text-[#1d1d1f] border border-black/20 rounded-full">
                    Connexion
                  </Link>
                  <Link href="/auth?mode=signup" onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm text-center text-white rounded-full font-medium"
                    style={{ backgroundColor: "#0071e3" }}>
                    S&apos;inscrire
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
