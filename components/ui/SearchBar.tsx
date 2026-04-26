"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Calendar, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Suggestion {
  id: string;
  name: string;
  type: "event" | "artist" | "city";
  subtitle?: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/suggestions?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case "artist":
        return "Artiste";
      case "city":
        return "Ville";
      default:
        return "Événement";
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "artist":
        return "text-secondary-400";
      case "city":
        return "text-accent-400";
      default:
        return "text-primary-400";
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <motion.div
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl bg-dark-800/90 backdrop-blur-xl border transition-smooth ${
          focused ? "border-primary-500 shadow-glow" : "border-white/10"
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin flex-shrink-0" />
        ) : (
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Artiste, événement ou ville..."
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-lg"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="text-gray-500 hover:text-white transition-smooth"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleSearch()}
          className="flex-shrink-0"
        >
          Rechercher
        </Button>
      </motion.div>

      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl overflow-hidden z-50 shadow-xl"
          >
            {suggestions.map((s, i) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setQuery(s.name);
                  handleSearch(s.name);
                }}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-smooth text-left border-b border-white/5 last:border-0"
              >
                <MapPin className={`w-4 h-4 flex-shrink-0 ${typeColor(s.type)}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{s.name}</p>
                  {s.subtitle && (
                    <p className="text-xs text-gray-500 truncate">{s.subtitle}</p>
                  )}
                </div>
                <span className={`text-xs font-medium ${typeColor(s.type)}`}>
                  {typeLabel(s.type)}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
