"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Ticket, User, LogOut, LogIn } from "lucide-react";
import { Button } from "./Button";
import { supabase } from "@/lib/supabase";
import type { User as SBUser } from "@supabase/supabase-js";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SBUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span className="gradient-text">Eventrip</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link href="/search" className="text-gray-600 hover:text-blue-600 transition-smooth font-medium">
              Événements
            </Link>
            <Link href="/search?type=music" className="text-gray-600 hover:text-blue-600 transition-smooth font-medium">
              Concerts
            </Link>
            <Link href="/search?type=sports" className="text-gray-600 hover:text-blue-600 transition-smooth font-medium">
              Sport
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Mon Profil
                  </Button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-red-500 transition-smooth"
                  title="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth?mode=signup">
                  <Button variant="primary" size="sm">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-700">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-gray-100 pt-4">
            <Link href="/search" onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-blue-600 transition-smooth font-medium py-1">
              Événements
            </Link>
            <Link href="/search?type=music" onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-blue-600 transition-smooth font-medium py-1">
              Concerts
            </Link>
            <Link href="/search?type=sports" onClick={() => setIsOpen(false)}
              className="block text-gray-600 hover:text-blue-600 transition-smooth font-medium py-1">
              Sport
            </Link>
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="md" className="w-full flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Mon Profil
                    </Button>
                  </Link>
                  <Button variant="ghost" size="md" className="w-full text-red-500" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
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
