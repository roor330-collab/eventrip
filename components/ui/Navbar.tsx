"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Ticket } from "lucide-react";
import { Button } from "./Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-950/90 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Ticket className="w-6 h-6 text-primary-500" />
            <span className="gradient-text">Eventrip</span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link
              href="/events"
              className="text-gray-300 hover:text-accent-400 transition-smooth"
            >
              Événements
            </Link>
            <Link
              href="/my-trips"
              className="text-gray-300 hover:text-accent-400 transition-smooth"
            >
              Mes voyages
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-accent-400 transition-smooth"
            >
              À propos
            </Link>
            <Button variant="primary" size="md">
              Réserver un Pack
            </Button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-white"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            <Link
              href="/events"
              className="block text-gray-300 hover:text-accent-400 transition-smooth"
            >
              Événements
            </Link>
            <Link
              href="/my-trips"
              className="block text-gray-300 hover:text-accent-400 transition-smooth"
            >
              Mes voyages
            </Link>
            <Link
              href="/about"
              className="block text-gray-300 hover:text-accent-400 transition-smooth"
            >
              À propos
            </Link>
            <Button variant="primary" size="md" className="w-full">
              Réserver un Pack
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
