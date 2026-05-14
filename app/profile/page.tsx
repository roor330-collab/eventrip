"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, MapPin, Ticket, Package,
  LogOut, ArrowRight, Clock, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase, getPackages, signOut } from "@/lib/supabase";
import type { User as SBUser } from "@supabase/supabase-js";
import { formatPrice, formatDate } from "@/lib/utils";

interface Booking {
  id: string;
  event_title: string;
  event_date: string;
  event_city: string;
  total_price: number;
  currency: string;
  status: string;
  passenger_name: string;
  created_at: string;
  items: any[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SBUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth?redirect=/profile");
        return;
      }
      setUser(session.user);

      try {
        const data = await getPackages(session.user.id);
        setBookings((data || []) as Booking[]);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    confirmed: { label: "Confirmé", icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200" },
    pending:   { label: "En attente", icon: Clock, color: "text-orange-600 bg-orange-50 border-orange-200" },
    cancelled: { label: "Annulé", icon: AlertCircle, color: "text-red-600 bg-red-50 border-red-200" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Mon Profil</h1>
          <p className="text-gray-500">Gérez votre compte et vos réservations</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar — User info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h2 className="font-bold text-xl text-gray-900">
                  {user.user_metadata?.full_name || user.email?.split("@")[0] || "Voyageur"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Membre Eventrip</p>
              </div>

              {/* Info */}
              <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Package className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>{bookings.length} réservation{bookings.length !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <Link href="/search">
                  <Button variant="primary" size="md" className="w-full">
                    <Ticket className="w-4 h-4 mr-2" />
                    Réserver un pack
                  </Button>
                </Link>
                <Button variant="ghost" size="md" className="w-full text-red-500 hover:bg-red-50" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Main — Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-4"
          >
            <h3 className="font-bold text-xl text-gray-900">Mes Réservations</h3>

            {bookings.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
                <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h4 className="font-bold text-xl text-gray-900 mb-2">Aucune réservation</h4>
                <p className="text-gray-500 mb-6">Vous n'avez pas encore réservé de pack événement.</p>
                <Link href="/search">
                  <Button variant="primary" size="lg">
                    Explorer les événements
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              bookings.map((booking, idx) => {
                const status = statusConfig[booking.status] || statusConfig.confirmed;
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-smooth"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 truncate">{booking.event_title}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(booking.event_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.event_city}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status.color} whitespace-nowrap`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>

                    {/* Pack items */}
                    {booking.items && booking.items.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {booking.items.map((item: any, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium capitalize">
                            {item.type === "ticket" && <Ticket className="w-3 h-3" />}
                            {item.type} {item.quantity > 1 ? `×${item.quantity}` : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-400">Total payé</p>
                        <p className="font-bold text-xl text-blue-600">{formatPrice(booking.total_price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Référence</p>
                        <p className="text-sm font-mono text-gray-600">EVT-{booking.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
