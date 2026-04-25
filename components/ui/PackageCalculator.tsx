"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PackageItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: "ticket" | "flight" | "train" | "hotel";
}

interface PackageCalculatorProps {
  items?: PackageItem[];
  onTotalChange?: (total: number) => void;
}

export function PackageCalculator({
  items = [],
  onTotalChange,
}: PackageCalculatorProps) {
  const [packageItems, setPackageItems] = useState<PackageItem[]>(items);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = packageItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    setTotal(newTotal);
    onTotalChange?.(newTotal);
  }, [packageItems, onTotalChange]);

  const updateQuantity = (id: string, delta: number) => {
    setPackageItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setPackageItems((prev) => prev.filter((item) => item.id !== id));
  };

  const groupedByCategory = packageItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, PackageItem[]>
  );

  const categoryLabels = {
    ticket: "Billets",
    flight: "Vol",
    train: "Train",
    hotel: "Hébergement",
  };

  return (
    <div className="glass p-6 space-y-6">
      <h3 className="text-xl font-bold">Votre Pack</h3>

      {packageItems.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Aucun article ajouté au pack
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="space-y-2 pb-4 border-b border-white/10">
              <h4 className="text-sm font-semibold text-primary-400">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-smooth"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-dark-900 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-dark-800 rounded transition-smooth"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-dark-800 rounded transition-smooth"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-sm font-bold w-16 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </p>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-medium ml-2"
                    >
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Sous-total</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400">Frais de service</span>
          <span className="font-semibold">{formatPrice(Math.round(total * 0.05))}</span>
        </div>

        <motion.div
          layout
          className="flex justify-between items-center pt-3 border-t border-primary-500/30 bg-primary-500/5 p-3 rounded-lg"
        >
          <span className="text-lg font-bold">Total</span>
          <motion.span
            key={total}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold gradient-text"
          >
            {formatPrice(total + Math.round(total * 0.05))}
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
