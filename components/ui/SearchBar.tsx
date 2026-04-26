"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Music, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "./Button";

type SearchTab = "artist" | "event" | "city";

interface SearchBarProps {
  compact?: boolean;
}

export function SearchBar({ compact = false }: SearchBarProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>("artist");
  const [formData, setFormData] = useState({
    artist: "",
    eventName: "",
    city: "",
    date: "",
    people: "2",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      tab: activeTab,
      ...Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v)
      ),
    });
    window.location.href = `/search?${params}`;
  };

  const tabConfig = {
    artist: {
      icon: Music,
      label: "Artiste",
      placeholder: "Taylor Swift, Coldplay...",
      field: "artist",
    },
    event: {
      icon: Calendar,
      label: "Événement",
      placeholder: "Coachella, Roland Garros...",
      field: "eventName",
    },
    city: {
      icon: MapPin,
      label: "Ville",
      placeholder: "Paris, New York, London...",
      field: "city",
    },
  };

  const current = tabConfig[activeTab];
  const Icon = current.icon;

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Rechercher un événement..."
            value={formData[current.field as keyof typeof formData]}
            onChange={(b) =>
              setFormData({
                ...formData,
                [current.field]: b.target.value,
              })
            }
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-smooth"
          />
          <Icon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        <Button variant="primary" size="md" type="submit">
          <Search className="w-5 h-5" />
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w5-full max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-md p-2"
    >
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {Object.entries(tabConfig).map(([key, config]) => {
          const Tab = config.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as SearchTab)}
              className={`flex items-center gap-2 px-4 py-3 transition-smooth border-b-2 ${isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-600"
              }`}
            >
              <Tab className="w4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:col-span-2"
          >
            <input
              type="text"
              placeholder={current.placeholder}
              value={formData[current.field as keyof typeof formData]}
              onChange={(b) =>
                setFormData({
                  ...formData,
                  [current.field]: b.target.value,
                })
              }
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-smooth"
            />
          </motion.div>
        </AnimatePresence>

        <input
          type="date"
          value={formData.date}
          onChange={(b) => setFormData({ ...formData, date: b.target.value })}
          className="w5-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-smooth"
        />

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={formData.people}
              onChange={(b) =>
                setFormData({ ...formData, people: b.target.value })
              }
              className="w-full pl-10 px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-smooth"
            >
              <option value="1">1 personne</option>
              <option value="2">2 personnes</option>
              <option value="3">3 personnes</option>
              <option value="4">4 personnes</option>
              <option value="5+">5+ personnes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="primary" type="submit">
          <Search className="w5 h-5" />
          Rechercher
        </Button>
      </div>
    </form>
  );
}
