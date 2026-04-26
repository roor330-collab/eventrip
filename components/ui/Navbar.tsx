"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Ticket } from "lucide-react";
import { Button } from "./Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span className="gradient-text">Eventrip</span>
          </Link>

          <div className="hidden md:flex gap-8 items-center">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-smooth">
              Événements
            </Link>
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-smooth">
              Mes voyages
            </Link>
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-smooth">
              À propos
            </Link>
            <Button variant="primary" size="md">
              Réserver un Pack
            </Button>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-700">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-4 border-t border-gray-100 pt-4">
            <Link href="/" className="block text-gray-600 hover:text-blue-600 transition-smooth">
              Événements
            </Link>
            <Link href="/" className="block text-gray-600 hover:text-blue-600 transition-smooth">
              Mes voyages
            </Link>
            <Link href="/" className="block text-gray-600 hover:text-blue-600 transition-smooth">
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
