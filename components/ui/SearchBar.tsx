"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Music, MapPin, Calendar, Users, Loader2, TrendingUp, PlaneTakeoff } from "lucide-react";
import { Button } from "./Button";

type SearchTab = "artist" | "event" | "city";

interface Suggestion {
  id: string;
  name: string;
  genre?: string;
  country?: string;
  image?: string;
  upcomingEvents?: number;
  source?: string;
}

interface SearchBarProps {
  compact?: boolean;
}

const POPULAR_SEARCHES = [
  "Coldplay", "Roland-Garros", "Primavera Sound", "Måneskin",
  "Real Madrid", "Taylor Swift", "Bad Bunny", "F1 Monza",
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchBar({ compact = false }: SearchBarProps) {
  const [activeTab, setActiveTab]         = useState("artist");
  const [formData, setFormData]           = useState({ artist: "", eventName: "", city: "", date: "", people: "2", from: "" });
  const [suggestions, setSuggestions]     = useState([]);
  const [loadingSug, setLoadingSug]       = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [highlightIdx, setHighlightIdx]   = useState(-1);
  const containerRef                       = useRef(null);
  const inputRef                           = useRef(null);

  const currentQuery =
    activeTab === "artist" ? formData.artist
    : activeTab === "event" ? formData.eventName
    : formData.city;

  const debouncedQuery = useDebounce(currentQuery, 280);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    setLoadingSug(true);
    fetch(`/api/suggestions?q=${encodeURIComponent(debouncedQuery)}&size=6`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length) { setSuggestions(data.data); setShowDropdown(true); setHighlightIdx(-1); }
        else { setSuggestions([]); setShowDropdown(false); }
      })
      .catch(() => { setSuggestions([]); setShowDropdown(false); })
      .finally(() => setLoadingSug(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navigate = useCallback((query) => {
    const params = new URLSearchParams({ tab: activeTab });
    if (activeTab === "artist") params.set("artist", query);
    else if (activeTab === "event") params.set("eventName", query);
    else params.set("city", query);
    if (formData.date) params.set("date", formData.date);
    if (formData.people !== "2") params.set("people", formData.people);
    if (formData.from) params.set("from", formData.from);
    window.location.href = `/search?${params}`;
  }, [activeTab, formData]);

  const handleSubmit = (e) => { e.preventDefault(); setShowDropdown(false); navigate(currentQuery || ""); };
  const handleSuggestionClick = (name) => { setShowDropdown(false); navigate(name); };

  const handleKeyDown = (e) => {
    if (!showDropdown || !suggestions.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter" && highlightIdx >= 0) { e.preventDefault(); handleSuggestionClick(suggestions[highlightIdx].name); }
    else if (e.key === "Escape") setShowDropdown(false);
  };

  const setField = (value) => {
    if (activeTab === "artist") setFormData(f => ({ ...f, artist: value }));
    else if (activeTab === "event") setFormData(f => ({ ...f, eventName: value }));
    else setFormData(f => ({ ...f, city: value }));
    if (value.length >= 2) setShowDropdown(true);
  };

  const tabConfig = {
    artist: { icon: Music,    label: "Artiste",    placeholder: "Coldplay, Taylor Swift, Måneskin…" },
    event:  { icon: Calendar, label: "Événement",  placeholder: "Roland-Garros, F1 Monza, Primavera Sound…" },
    city:   { icon: MapPin,   label: "Ville",      placeholder: "Paris, Barcelone, Rome, Madrid…" },
  };

  const current = tabConfig[activeTab];
  const Icon = current.icon;

  const Dropdown = () => (
    <AnimatePresence>
      {showDropdown && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-1">
            {suggestions.map((s, i) => (
              <button key={s.id} type="button"
                onMouseDown={e => { e.preventDefault(); handleSuggestionClick(s.name); }}
                onMouseEnter={() => setHighlightIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${highlightIdx === i ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-800"}`}
              >
                {s.image ? (
                  <img src={s.image} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-blue-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  {(s.genre || s.country) && <p className="text-xs text-gray-400 truncate">{[s.genre, s.country].filter(Boolean).join(" · ")}</p>}
                </div>
                {s.upcomingEvents !== undefined && s.upcomingEvents > 0 && (
                  <span className="text-xs text-blue-500 font-medium flex-shrink-0">{s.upcomingEvents} concerts</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (compact) {
    return (
      <div ref={containerRef} className="relative w-full">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <div className="flex-1 relative">
            <input ref={inputRef} type="text"
              placeholder="Rechercher artiste, événement, ville…"
              value={currentQuery} onChange={e => setField(e.target.value)}
              onKeyDown={handleKeyDown} onFocus={() => { if (suggestions.length) setShowDropdown(true); }}
              className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400"
            />
            {loadingSug ? <Loader2 className="absolute right-3 top-3.5 w-5 h-5 text-blue-400 animate-spin" />
              : <Icon className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />}
          </div>
          <div className="relative">
            <PlaneTakeoff className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Départ…" value={formData.from}
              onChange={e => setFormData({ ...formData, from: e.target.value })}
              className="pl-8 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-400 w-32"
            />
          </div>
          <Button variant="primary" size="md" type="submit"><Search className="w-5 h-5" /></Button>
        </form>
        <Dropdown />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto relative">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-gray-100 p-3">
        <div className="flex gap-1 mb-3">
          {Object.entries(tabConfig).map(([key, cfg]) => {
            const Tab = cfg.icon;
            const isActive = activeTab === key;
            return (
              <button key={key} type="button" onClick={() => { setActiveTab(key); setShowDropdown(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
              >
                <Tab className="w-4 h-4" />{cfg.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <div className="md:col-span-2 relative">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="relative">
                <input ref={inputRef} type="text" placeholder={current.placeholder} value={currentQuery}
                  onChange={e => setField(e.target.value)} onKeyDown={handleKeyDown}
                  onFocus={() => { if (suggestions.length) setShowDropdown(true); }}
                  className="w-full pl-4 pr-10 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 placeholder-gray-400 text-sm"
                />
                {loadingSug ? <Loader2 className="absolute right-3 top-4 w-4 h-4 text-blue-400 animate-spin" />
                  : <Icon className="absolute right-3 top-4 w-4 h-4 text-gray-400 pointer-events-none" />}
              </motion.div>
            </AnimatePresence>
            <Dropdown />
          </div>

          <div className="relative">
            <PlaneTakeoff className="absolute left-3 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="D'où partez-vous ?" value={formData.from}
              onChange={e => setFormData({ ...formData, from: e.target.value })}
              className="w-full pl-9 pr-3 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>

          <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="py-3.5 px-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 text-sm"
          />

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Users className="absolute left-3 top-4 w-4 h-4 text-gray-400 pointer-events-none" />
              <select value={formData.people} onChange={e => setFormData({ ...formData, people: e.target.value })}
                className="w-full pl-9 pr-3 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700 text-sm appearance-none"
              >
                <option value="1">1 pers.</option>
                <option value="2">2 pers.</option>
                <option value="3">3 pers.</option>
                <option value="4">4 pers.</option>
                <option value="5+">5+ pers.</option>
              </select>
            </div>
            <Button variant="primary" type="submit" className="px-5 rounded-xl"><Search className="w-5 h-5" /></Button>
          </div>
        </div>

        {!currentQuery && (
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Populaires :</span>
            {POPULAR_SEARCHES.map(s => (
              <button key={s} type="button" onClick={() => navigate(s)}
                className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 px-3 py-1 rounded-full transition-colors"
              >{s}</button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}