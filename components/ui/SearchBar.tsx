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
            onChange={(e) =>
              setFormData({
                ...formData,
                [current.field]: e.target.value,
              })
            }
            className="w-full"
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
      className="w-full max-w-4xl mx-auto glass p-2"
    >
      <div className="flex gap-2 mb-4 border-b border-white/10">
        {Object.entries(tabConfig).map(([key, config]) => {
          const Tab = config.icon;
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as SearchTab)}
              className={`flex items-center gap-2 px-4 py-3 transition-smooth border-b-2 ${
                isActive
                  ? "border-primary-500 text-primary-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Tab className="w-4 h-4" />
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [current.field]: e.target.value,
                })
              }
            />
          </motion.div>
        </AnimatePresence>

        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <select
              value={formData.people}
              onChange={(e) =>
                setFormData({ ...formData, people: e.target.value })
              }
              className="pl-10"
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
          <Search className="w-5 h-5" />
          Rechercher
        </Button>
      </div>
    </form>
  );
}
