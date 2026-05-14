"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Ticket, Hotel, Plane, Train, User, Mail, Phone,
  CheckCircle, ArrowRight, Loader2, Package, Calendar, MapPin, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase, savePackage } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

interface PackItem {
  type: string;
  label: string;
  price: number;
  quantity: number;
}

interface PackData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventCity: string;
  eventVenue: string;
  items: PackItem[];
  totalPrice: number;
  currency: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [pack, setPack] = useState<PackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [error, setError] = useState("");

  // Passenger info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const init = async () => {
      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth?redirect=/checkout");
        return;
      }

      // Pre-fill email
      setEmail(session.user.email || "");

      // Read pack from sessionStorage
      const raw = sessionStorage.getItem("eventrip_pack");
      if (!raw) {
        router.replace("/search");
        return;
      }

      try {
        const data = JSON.parse(raw) as PackData;
        setPack(data);
      } catch {
        router.replace("/search");
        return;
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pack) return;
    setError("");
    setSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non connecté");

      const ref = await savePackage({
        user_id: session.user.id,
        event_id: pack.eventId,
        event_title: pack.eventTitle,
        event_date: pack.eventDate,
        event_city: pack.eventCity,
        event_venue: pack.eventVenue,
        items: pack.items,
        total_price: pack.totalPrice,
        currency: pack.currency || "EUR",
        passenger_name: `${firstName} ${lastName}`.trim(),
        passenger_email: email,
        passenger_phone: phone,
        status: "confirmed",
      });

      sessionStorage.removeItem("eventrip_pack");
      setBookingRef(ref);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!pack) return null;

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full text-center"
        >
          <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-sm">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Réservation confirmée !</h1>
            <p className="text-gray-500 mb-6">
              Votre pack événement a été réservé avec succès. Un email de confirmation vous sera envoyé.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Événement</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%]">{pack.eventTitle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Référence</span>
                <span className="font-mono font-bold text-blue-600">{bookingRef}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatPrice(pack.totalPrice)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="primary" size="lg" className="w-full" onClick={() => router.push("/profile")}>
                Voir mes réservations
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="ghost" size="md" className="w-full" onClick={() => router.push("/search")}>
                Réserver un autre événement
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const fees = Math.round(pack.totalPrice * 0.05);
  const grandTotal = pack.totalPrice + fees;

  const itemIcons: Record<string, React.ElementType> = {
    ticket: Ticket,
    hotel: Hotel,
    flight: Plane,
    train: Train,
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Finaliser la réservation</h1>
          <p className="text-gray-500">Plus qu&apos;une étape avant votre aventure !</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left — Passenger form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Passenger info card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Informations voyageur
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prénom *</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom *</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-500" />Email *</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.com"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-500" />Téléphone</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 00 00 00 00"
                  />
                </div>
              </div>

              {/* Payment notice */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                  Paiement sécurisé
                </h2>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">🔒 Mode simulation — MVP Eventrip</p>
                  <p className="text-blue-600">
                    Aucune information bancaire n&apos;est requise pour cette démo. La réservation sera confirmée immédiatement et visible dans votre profil.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Confirmation en cours…
                  </>
                ) : (
                  <>
                    Confirmer ma réservation — {formatPrice(grandTotal)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400">
                En confirmant, vous acceptez les conditions générales de vente d&apos;Eventrip.
              </p>
            </form>
          </motion.div>

          {/* Right — Pack summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-5 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Récapitulatif
              </h2>

              {/* Event info */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 text-white mb-5">
                <h3 className="font-bold text-base leading-snug mb-2">{pack.eventTitle}</h3>
                <div className="flex items-center gap-1.5 text-blue-100 text-sm mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {pack.eventDate
                      ? new Date(pack.eventDate).toLocaleDateString("fr-FR", {
                          weekday: "short", day: "numeric", month: "long", year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-100 text-sm">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{pack.eventVenue}, {pack.eventCity}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3 mb-5">
                {pack.items.map((item, i) => {
                  const Icon = itemIcons[item.type] || Ticket;
                  return (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="capitalize">{item.label}</span>
                        {item.quantity > 1 && <span className="text-gray-400">×{item.quantity}</span>}
                      </div>
                      <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(pack.totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Frais de service (5%)</span>
                  <span>{formatPrice(fees)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>Réservation sécurisée et annulation gratuite sous 24h</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
