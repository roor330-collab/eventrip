"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Lock, CreditCard, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
}

const mockOrderSummary = {
  tickets: {
    category: "Fosse VIP",
    quantity: 2,
    price: 450,
  },
  flight: {
    airline: "Air France",
    departure: "2024-07-14 08:00",
    arrival: "2024-07-14 10:00",
    price: 120,
  },
  hotel: {
    name: "Hotel Le Marais Paris",
    nights: 2,
    price: 280,
  },
  subtotal: 1700,
  fees: 85,
  total: 1785,
};

export default function CheckoutPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVC: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-8 md:p-12 max-w-md w-full text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Réservation confirmée!</h1>
            <p className="text-gray-400">
              Votre pack événement a été réservé avec succès.
            </p>
          </div>

          <div className="bg-dark-800/50 p-4 rounded-lg space-y-2 text-left">
            <p className="text-sm text-gray-400">
              <span className="block font-semibold text-white">
                Numéro de confirmation
              </span>
              EVENTRIP-2024-001234
            </p>
            <p className="text-sm text-gray-400">
              <span className="block font-semibold text-white">
                Total payé
              </span>
              {formatPrice(mockOrderSummary.total)}
            </p>
          </div>

          <p className="text-sm text-gray-400">
            Un email de confirmation a été envoyé à{" "}
            <span className="font-semibold">{formData.email}</span>
          </p>

          <Button variant="primary" size="lg" className="w-full">
            Voir mes voyages
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Finalisez votre réservation</h1>
          <p className="text-xl text-gray-400">
            Complétez vos informations de paiement pour confirmer votre pack
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="glass p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-primary-400" />
                  Informations personnelles
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="jean@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+33 6 XX XX XX XX"
                    />
                  </div>
                </div>
              </div>

              <div className="glass p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary-400" />
                  Paiement
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      name="cardCVC"
                      value={formData.cardCVC}
                      onChange={handleInputChange}
                      required
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg flex gap-3">
                  <Lock className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">
                    Votre paiement est sécurisé. Nous utilisons SSL et les normes
                    PCI-DSS pour protéger vos données.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isProcessing}
                isLoading={isProcessing}
                className="w-full"
              >
                {isProcessing
                  ? "Traitement en cours..."
                  : "Confirmer la réservation"}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="glass p-6 sticky top-32 space-y-6">
              <h3 className="text-2xl font-bold">Résumé</h3>

              <div className="space-y-4 border-b border-white/10 pb-6">
                <div>
                  <p className="text-sm text-gray-400">Billets</p>
                  <p className="font-semibold">
                    {mockOrderSummary.tickets.category} x{" "}
                    {mockOrderSummary.tickets.quantity}
                  </p>
                  <p className="text-accent-400 font-bold">
                    {formatPrice(
                      mockOrderSummary.tickets.price *
                        mockOrderSummary.tickets.quantity
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Vol</p>
                  <p className="font-semibold">{mockOrderSummary.flight.airline}</p>
                  <p className="text-xs text-gray-400">
                    {mockOrderSummary.flight.departure} →{" "}
                    {mockOrderSummary.flight.arrival}
                  </p>
                  <p className="text-accent-400 font-bold">
                    {formatPrice(mockOrderSummary.flight.price)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Hébergement</p>
                  <p className="font-semibold">{mockOrderSummary.hotel.name}</p>
                  <p className="text-xs text-gray-400">
                    {mockOrderSummary.hotel.nights} nuits
                  </p>
                  <p className="text-accent-400 font-bold">
                    {formatPrice(
                      mockOrderSummary.hotel.price *
                        mockOrderSummary.hotel.nights
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Sous-total</span>
                  <span>{formatPrice(mockOrderSummary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Frais de service</span>
                  <span>{formatPrice(mockOrderSummary.fees)}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="text-2xl font-bold gradient-text">
                    {formatPrice(mockOrderSummary.total)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
