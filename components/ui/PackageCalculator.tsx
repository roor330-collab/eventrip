"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, Plane, Hotel, Ticket } from "lucide-react";
import { PackageItem } from "@/types";
import { formatPrice } from "@/lib/utils";

interface PackageCalculatorProps {
  items: PackageItem[];
  onRemove?: (id: string) => void;
}

export function PackageCalculator({ items, onRemove }: PackageCalculatorProps) {
  const total = items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "flight":
        return <Plane className="w-4 h-4 text-primary-400" />;
      case "hotel":
        return <Hotel className="w-4 h-4 text-accent-400" />;
      default:
        return <Ticket className="w-4 h-4 text-secondary-400" />;
    }
  };

  const getLabel = (item: PackageItem) => {
    if (item.type === "flight" && item.details?.airline)
      return `Vol ${item.details.airline}`;
    if (item.type === "hotel" && item.details?.hotel)
      return `${item.details.hotel}`;
    if (item.type === "ticket" && item.details?.category)
      return `Billet ${item.details.category}`;
    return item.type;
  };

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-5 h-5 text-primary-400" />
        <h3 className="font-bold text-lg">Votre Pack</h3>
        {items.length > 0 && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-primary-600 text-white text-xs font-bold">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          Aucun élément sélectionné.<br />
          <span className="text-xs">Choisissez des billets, vols et hôtels.</span>
        </p>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {items.map((item) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="mt-0.5">{getIcon(item.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{getLabel(item)}</p>
                  {item.quantity && item.quantity > 1 && (
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatPrice(item.price)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-sm font-bold gradient-text">
                    {formatPrice(item.price * (item.quantity || 1))}
                  </p>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-gray-600 hover:text-red-400 transition-smooth"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {items.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-gray-400">Total pack</p>
            <p className="text-2xl font-bold gradient-text">{formatPrice(total)}</p>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Prix par personne, taxes incluses
          </p>
        </div>
      )}
    </div>
  );
}
